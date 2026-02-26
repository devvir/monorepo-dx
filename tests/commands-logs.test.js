import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  runDockerCommand: vi.fn()
}));

vi.mock('../utils/modules.js', () => ({
  getModule: vi.fn(),
  listModules: vi.fn(() => ['mymodule', 'tester'])
}));

describe('logs command', () => {
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();
    runDockerCommand = (await import('../utils/docker.js')).runDockerCommand;
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/logs.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('uses null module when no module given', async () => {
      const cmd = await import('../commands/logs.js');
      cmd.action(['-f']);
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'logs', ['-f']);
    });

    it('extracts module name from args and leaves flags', async () => {
      const cmd = await import('../commands/logs.js');
      cmd.action(['mymodule', '-f']);
      expect(runDockerCommand).toHaveBeenCalledWith('mymodule', 'logs', ['-f']);
    });

    it('extracts module even when flags appear before it', async () => {
      const cmd = await import('../commands/logs.js');
      cmd.action(['-t', '20', 'mymodule']);
      expect(runDockerCommand).toHaveBeenCalledWith('mymodule', 'logs', ['-t', '20']);
    });

    it('passes all args as log options when no module given', async () => {
      const cmd = await import('../commands/logs.js');
      cmd.action(['-t', '50']);
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'logs', ['-t', '50']);
    });
  });
});
