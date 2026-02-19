import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  runDockerCommand: vi.fn(),
  buildComposeCommand: vi.fn()
}));

vi.mock('../utils/modules.js', () => ({
  getModule: vi.fn(),
  listModules: vi.fn(() => ['reader', 'tester'])
}));

describe('logs command', () => {
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();
    runDockerCommand = (await import('../utils/docker.js')).runDockerCommand;
    // Reset process.argv to a clean state
    process.argv = ['node', 'dx.js'];
  });

  describe('help()', () => {
    it('should return a string mentioning logs', async () => {
      const cmd = await import('../commands/logs.js');
      expect(cmd.help().toLowerCase()).toContain('log');
    });
  });

  describe('main()', () => {
    it('uses full app when no module given', async () => {
      process.argv = ['node', 'dx.js', '-f'];
      const cmd = await import('../commands/logs.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'logs', ['-f']);
    });

    it('extracts module name from args and leaves flags', async () => {
      process.argv = ['node', 'dx.js', 'reader', '-f'];
      const cmd = await import('../commands/logs.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith('reader', 'logs', ['-f']);
    });

    it('extracts module even when flags appear before it', async () => {
      process.argv = ['node', 'dx.js', '-t', '20', 'reader'];
      const cmd = await import('../commands/logs.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith('reader', 'logs', ['-t', '20']);
    });

    it('passes all args as log options when no module given', async () => {
      process.argv = ['node', 'dx.js', '-t', '50'];
      const cmd = await import('../commands/logs.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'logs', ['-t', '50']);
    });
  });
});
