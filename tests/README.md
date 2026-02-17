# DX Command Tests

This directory contains tests for the dx command suite. The tests verify **command behavior and side effects**, not the side effects of external binaries.

## Testing Philosophy

**Key Principle**: Test what dx does, not what docker/npm/bash do.

- **Mock external commands**: Use vi.mock for `execSync` to verify correct commands are generated
- **Real fixtures for discovery**: Create actual compose.yml files in `fixtures/` for testing parsing/filtering logic
- **Test side effects**: Verify argument parsing, service filtering, command generation, error handling
- **Self-contained**: Tests use fixtures, not the actual parent repo structure

## Command Categories & Testing Strategies

### 1. Docker Commands (up, down, ps, logs)
**Mock**: `execSync` from `node:child_process`
**Test**:
- Verify correct docker-compose commands are built
- Module argument parsing (module name, ".", invalid modules)
- Flag/option passing to docker-compose
- Service filtering (all vs specific services)

**Example**:
```javascript
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

// Test that "tb up reader -d rabbitmq" generates the correct command
```

### 2. Build/npm Commands (build, install, test)
**Mock**: `execSync` from `node:child_process`
**Test**:
- Verify correct npm/bash commands are executed
- Correct working directory (cwd) is used
- Service filtering (all, by module, specific service)
- Script detection (hasNpmScript, build.sh existence)
- Argument parsing (-m flag, service names)

### 3. Discovery Commands (services, service, modules, module, config)
**Fixtures**: Real compose.yml and .env files in `fixtures/services/` and `fixtures/modules/`
**Test**:
- Compose file parsing
- Service/module discovery and filtering
- Metadata extraction (description, ports, images)
- Error handling (invalid service/module names)
- Output content (not formatting, just that key info is present)

**No mocking** of file system - use real test files to verify parsing logic.

### 4. Help Command
**Test**: Interface only (current tests are adequate)

## Fixtures Structure

```
tests/
├── fixtures/
│   ├── services/
│   │   ├── testapp/
│   │   │   ├── compose.yml
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   └── testinfra/
│   │       └── compose.yml
│   └── modules/
│       └── testmod/
│           └── compose.yml
├── commands-*.test.js
├── fixtures.js (mock factories)
└── README.md
```

## Running Tests

```bash
npm test              # Run all tests
pnpm run test:watch    # Run tests in watch mode
pnpm run test:ui       # Run tests with UI dashboard
```

## What NOT to Test

❌ Actual docker execution
❌ Actual npm package installation
❌ External command exit codes and output
❌ Terminal output formatting/colors
❌ Internal utility function implementation details

## What to Test

✅ Command argument parsing
✅ Service/module filtering logic
✅ Command string generation (for docker/npm commands)
✅ Working directory selection
✅ Script detection logic
✅ Error handling for invalid inputs
✅ Compose file parsing
✅ Module composition (extends/includes)
