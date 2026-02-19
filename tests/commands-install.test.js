import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({
  default: { existsSync: vi.fn() }
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

vi.mock('../utils/logger.js', () => ({
  log: vi.fn(),
  info: vi.fn(),
  section: vi.fn(),
  fatal: vi.fn(() => { throw new Error('Fatal'); })
}));

vi.mock('../utils/modules.js', () => ({
  getService: vi.fn((name) => {
    const services = {
      app1: { path: '/repo/services/app1' },
      app2: { path: '/repo/services/app2' },
      infra1: { path: '/repo/services/infra1' }
    };
    if (! services[name]) throw new Error(`Unknown service: ${name}`);
    return services[name];
  }),
  getModuleServices: vi.fn((name) => {
    const modules = {
      testmod: ['app1', 'app2'],
      inframod: ['infra1']
    };
    if (! modules[name]) throw new Error(`Unknown module: ${name}`);
    return modules[name];
  }),
  listServices: vi.fn(() => ['app1', 'app2', 'infra1']),
  listModules: vi.fn(() => ['testmod', 'inframod'])
}));

describe('install command', () => {
  let execSync;
  let fs;
  let logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    execSync = (await import('node:child_process')).execSync;
    fs = (await import('node:fs')).default;
    logger = await import('../utils/logger.js');

    // Default: no install.sh, has package.json
    fs.existsSync.mockImplementation((p) => p.endsWith('package.json'));
  });

  const runWithArgs = (args) => {
    process.argv = ['node', 'dx.js', ...args];
  };

  describe('help()', () => {
    it('should export a help function', async () => {
      const cmd = await import('../commands/install.js');
      expect(typeof cmd.help).toBe('function');
    });

    it('should return a string mentioning install', async () => {
      const cmd = await import('../commands/install.js');
      expect(cmd.help().toLowerCase()).toContain('install');
    });
  });

  describe('main()', () => {
    it('should export a main function', async () => {
      const cmd = await import('../commands/install.js');
      expect(typeof cmd.main).toBe('function');
    });

    describe('no args - installs all services', () => {
      it('runs pnpm install for node services', async () => {
        runWithArgs([]);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" install'), expect.any(Object));
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app2" install'), expect.any(Object));
      });

      it('skips services with no install steps (non-strict)', async () => {
        fs.existsSync.mockImplementation((p) => {
          if (p.includes('infra1')) return false;
          return p.endsWith('package.json');
        });
        runWithArgs([]);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('infra1'));
        expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('infra1'), expect.any(Object));
      });
    });

    describe('module name', () => {
      it('installs all services in the module', async () => {
        runWithArgs(['testmod']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" install'), expect.any(Object));
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app2" install'), expect.any(Object));
      });

      it('skips module services with no install steps (non-strict)', async () => {
        fs.existsSync.mockReturnValue(false);
        runWithArgs(['inframod']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('infra1'));
        expect(execSync).not.toHaveBeenCalled();
      });
    });

    describe('service name', () => {
      it('runs pnpm install for a node service', async () => {
        runWithArgs(['app1']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" install'), expect.any(Object));
      });

      it('runs install.sh when present (takes precedence over pnpm)', async () => {
        fs.existsSync.mockReturnValue(true); // both install.sh and package.json exist
        runWithArgs(['app1']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('bash install.sh'), expect.any(Object));
        expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('pnpm'), expect.any(Object));
      });

      it('fails (strict) when no install steps found', async () => {
        fs.existsSync.mockReturnValue(false);
        runWithArgs(['app1']);
        const cmd = await import('../commands/install.js');
        expect(() => cmd.main()).toThrow();
      });
    });

    describe('extra args after --', () => {
      it('passes extra args to pnpm install', async () => {
        runWithArgs(['app1', '--', '--frozen-lockfile']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('-- --frozen-lockfile'), expect.any(Object));
      });

      it('passes extra args to install.sh', async () => {
        fs.existsSync.mockImplementation((p) => p.endsWith('install.sh'));
        runWithArgs(['app1', '--', '--frozen-lockfile']);
        const cmd = await import('../commands/install.js');
        cmd.main();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('bash install.sh --frozen-lockfile'), expect.any(Object));
      });
    });

    describe('unknown name', () => {
      it('calls logger.fatal for unknown service or module', async () => {
        runWithArgs(['nonexistent']);
        const cmd = await import('../commands/install.js');
        expect(() => cmd.main()).toThrow('Fatal');
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
      });
    });
  });
});
