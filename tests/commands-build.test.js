import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({
  default: { existsSync: vi.fn(), readFileSync: vi.fn() }
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

describe('build command', () => {
  let execSync;
  let fs;
  let logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    execSync = (await import('node:child_process')).execSync;
    fs = (await import('node:fs')).default;
    logger = await import('../utils/logger.js');

    // Default: no build.sh, has package.json
    fs.existsSync.mockImplementation((p) => p.endsWith('package.json'));
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/build.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const cmd = await import('../commands/build.js');
      expect(typeof cmd.action).toBe('function');
    });

    describe('no target - builds all services', () => {
      it('runs pnpm for node services', async () => {
        const cmd = await import('../commands/build.js');
        cmd.action(undefined);
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" build'), expect.any(Object));
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app2" build'), expect.any(Object));
      });

      it('skips services with no build steps (non-strict)', async () => {
        fs.existsSync.mockImplementation((p) => {
          if (p.includes('infra1')) return false;
          return p.endsWith('package.json');
        });
        const cmd = await import('../commands/build.js');
        cmd.action(undefined);
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('infra1'));
        expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('infra1'), expect.any(Object));
      });
    });

    describe('module name', () => {
      it('builds all services in the module', async () => {
        const cmd = await import('../commands/build.js');
        cmd.action('testmod');
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" build'), expect.any(Object));
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app2" build'), expect.any(Object));
      });

      it('skips module services with no build steps (non-strict)', async () => {
        fs.existsSync.mockReturnValue(false);
        const cmd = await import('../commands/build.js');
        cmd.action('inframod');
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('infra1'));
        expect(execSync).not.toHaveBeenCalled();
      });
    });

    describe('service name', () => {
      it('runs pnpm for a node service', async () => {
        const cmd = await import('../commands/build.js');
        cmd.action('app1');
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('pnpm --filter="app1" build'), expect.any(Object));
      });

      it('runs build.sh when present (takes precedence over pnpm)', async () => {
        fs.existsSync.mockReturnValue(true); // both build.sh and package.json exist
        const cmd = await import('../commands/build.js');
        cmd.action('app1');
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('bash build.sh'), expect.any(Object));
        expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('pnpm'), expect.any(Object));
      });

      it('fails (strict) when no build steps found', async () => {
        fs.existsSync.mockReturnValue(false);
        const cmd = await import('../commands/build.js');
        expect(() => cmd.action('app1')).toThrow();
      });
    });

    describe('extra args', () => {
      it('passes extra args to pnpm build', async () => {
        const cmd = await import('../commands/build.js');
        cmd.action('app1', ['--verbose']);
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('-- --verbose'), expect.any(Object));
      });

      it('passes extra args to build.sh', async () => {
        fs.existsSync.mockImplementation((p) => p.endsWith('build.sh'));
        const cmd = await import('../commands/build.js');
        cmd.action('app1', ['--verbose']);
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('bash build.sh --verbose'), expect.any(Object));
      });
    });

    describe('unknown name', () => {
      it('calls logger.fatal for unknown service or module', async () => {
        const cmd = await import('../commands/build.js');
        expect(() => cmd.action('nonexistent')).toThrow('Fatal');
        expect(logger.fatal).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
      });
    });

    describe('module takes precedence over service with same name', () => {
      it('treats name as module when both exist', async () => {
        const { listModules, getModuleServices } = await import('../utils/modules.js');
        listModules.mockReturnValue(['testmod', 'app1']); // app1 also exists as module
        getModuleServices.mockImplementation((name) => {
          if (name === 'app1') return ['app2'];
          return ['app1', 'app2'];
        });

        const cmd = await import('../commands/build.js');
        cmd.action('app1');

        expect(getModuleServices).toHaveBeenCalledWith('app1');
      });
    });
  });
});
