/**
 * Mock fixtures for dx command tests
 * These are self-contained fixtures that don't depend on the actual repo
 */

export const mockServices = {
  app1: {
    path: '/mock-repo/services/app1',
    description: 'Test application 1',
    infrastructure: false,
    hasPackageJson: true,
    hasCompose: true
  },
  app2: {
    path: '/mock-repo/services/app2',
    description: 'Test application 2',
    infrastructure: false,
    hasPackageJson: true,
    hasCompose: true
  },
  infra1: {
    path: '/mock-repo/services/infra1',
    description: 'Test infrastructure',
    infrastructure: true,
    hasPackageJson: false,
    hasCompose: true,
    image: 'postgres:latest',
    port: 5432
  }
};

export const mockModules = {
  testmod: {
    path: '/mock-repo/modules/testmod',
    description: 'Test module',
    hasCompose: true,
    services: ['app1', 'app2']
  },
  infra: {
    path: '/mock-repo/modules/infra',
    description: 'Infrastructure module',
    hasCompose: true,
    services: ['infra1']
  }
};

/**
 * Create a mock for package.json checking
 */
export function createMockHasNpmScript(serviceScripts = {}) {
  return (service, scriptName) => {
    // Map service names to scripts they have
    const defaultScripts = {
      app1: { test: true, build: true, start: true },
      app2: { test: false, build: true },
      infra1: {}
    };

    const scripts = { ...defaultScripts, ...serviceScripts };
    return Boolean(scripts[service.path?.split('/').pop()]?.[scriptName]);
  };
}

/**
 * Create a mock for getServices
 */
export function createMockGetServices(services = mockServices) {
  return () => services;
}

/**
 * Create a mock for getService
 */
export function createMockGetService(services = mockServices) {
  return (name) => {
    const service = services[name];
    if (! service) {
      const available = Object.keys(services);
      throw new Error(`Unknown service: ${name}\nAvailable: ${available.join(', ')}`);
    }
    return service;
  };
}

/**
 * Create a mock for getModuleServices
 */
export function createMockGetModuleServices(modules = mockModules) {
  return (moduleName) => {
    const module = modules[moduleName];
    if (! module) {
      const available = Object.keys(modules);
      throw new Error(`Unknown module: ${moduleName}\nAvailable: ${available.join(', ')}`);
    }
    return module.services;
  };
}
