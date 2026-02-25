import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

describe('ps command', () => {
  let parseCommandArgs;
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();
    const dockerUtils = await import('../utils/docker.js');
    parseCommandArgs = dockerUtils.parseCommandArgs;
    runDockerCommand = dockerUtils.runDockerCommand;

    parseCommandArgs.mockReturnValue({
      module: null,
      composeArgs: [],
      moduleConfig: { description: 'Full app', services: [] }
    });
  });

  describe('help()', () => {
    it('should return a string mentioning ps', async () => {
      const cmd = await import('../commands/ps.js');
      expect(cmd.help().toLowerCase()).toContain('ps');
    });
  });

  describe('main()', () => {
    it('calls runDockerCommand with ps and the module', async () => {
      const cmd = await import('../commands/ps.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'ps', []);
    });

    it('calls runDockerCommand with specific module when provided', async () => {
      parseCommandArgs.mockReturnValue({
        module: 'mymodule',
        composeArgs: [],
        moduleConfig: { description: 'MyModule', services: [] }
      });
      const cmd = await import('../commands/ps.js');
      cmd.main();
      expect(runDockerCommand).toHaveBeenCalledWith('mymodule', 'ps', []);
    });
  });
});
