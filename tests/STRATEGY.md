# DX Testing Strategy Review

## Current Status

✅ **13 test files, 60 tests passing**
- 52 basic interface tests (help + main exports)
- 8 behavioral tests (test command + up command)

## Analysis: What Works & What Needs Improvement

### ✅ What's Good

1. **Test infrastructure is solid**
   - Vitest configured correctly for ESM
   - Test fixtures directory created
   - No unicode escape errors

2. **Two exemplar tests demonstrate proper behavioral testing**
   - `commands-test.test.js`: Tests npm command with mocking of execSync
   - `commands-up.test.js`: Tests docker command with mocking of docker utils

### ⚠️ What Needs Work

**Most tests are too shallow** - 11 out of 13 test files only verify:
- Functions exist
- Help text contains expected keywords
- No actual behavior is tested

## Recommended Testing Strategy by Command Type

### Type 1: Docker Commands (5 commands)
**Commands**: up, down, ps, logs, build (docker-related)

**Mock**:
- `execSync` from `node:child_process` ❌ (better approach below)
- `runDockerCommand` from `../utils/docker.js` ✅
- `parseCommandArgs` from `../utils/docker.js` ✅

**Test**:
- Module argument parsing
- Flag/option forwarding
- Service filtering
- Error handling for invalid modules

**Status**: ✅ `up` done, ⏳ 4 remaining

---

### Type 2: npm/Shell Commands (2 commands)
**Commands**: test, install

**Mock**:
- `execSync` from `node:child_process` ✅
- utility functions (getServices, hasNpmScript, etc.) ✅

**Test**:
- Argument parsing (-m flag, service names)
- Service filtering (all/module/specific)
- Script detection logic
- Correct working directory (cwd)
- Verify npm commands are built correctly

**Status**: ✅ `test` done, ⏳ install remaining

---

### Type 3: Discovery Commands (5 commands)
**Commands**: services, service, modules, module, config

**Strategy**: Use **real fixtures**, not mocks
- Create actual `compose.yml` files in `tests/fixtures/services/`
- Create actual module compose files in `tests/fixtures/modules/`
- Test the actual parsing logic

**Test**:
- Compose file parsing
- Service/module metadata extraction
- Filtering logic
- Error handling (invalid names)
- Output content (key info is present)

**Status**: ✅ Fixtures created, ⏳ All 5 tests need implementation

---

### Type 4: Meta Commands (1 command)
**Commands**: help

**Strategy**: Current tests are adequate
- Just returns help text, no complex behavior

**Status**: ✅ Done

---

## Key Insight: Testing Principle

**Test what dx does, not what external tools do**

❌ **Don't test**:
- Docker's ability to start containers
- npm's ability to install packages
- Child process execution itself

✅ **Do test**:
- That dx builds the correct docker command
- That dx calls npm with correct cwd and args
- That dx parses compose files correctly
- That dx filters services/modules correctly
- That dx handles errors appropriately

## Mocking Strategy Validation

Your suggestions were spot-on:

### ✅ "For docker commands, mock exec functions and verify parameters"
**Status**: Implemented for `up` command
- Mock `runDockerCommand`
- Verify module name and args passed correctly
- Tests don't execute docker

### ✅ "For discovery commands, create test services/modules folders"
**Status**: Fixtures created
- `tests/fixtures/services/testapp/` with compose.yml + package.json
- `tests/fixtures/services/testinfra/` with compose.yml
- `tests/fixtures/modules/testmod/` with compose.yml
- Ready for discovery command tests

### ✅ "Don't over-mock, it renders tests useless"
**Status**: Balanced approach
- Discovery commands will use real files (no mocking)
- Docker/npm commands mock only external calls
- Business logic (parsing, filtering) runs for real

## Next Steps (Priority Order)

### High Priority (Complete Type 1 & 2)
1. ⏳ **down, ps, logs** - Clone `up` test pattern
2. ⏳ **build** - Similar to `test` (finds build.sh, runs in service dir)
3. ⏳ **install** - Similar to `test` (finds services, runs npm install)

### Medium Priority (Type 3 - Discovery)
4. ⏳ **services** - Point discovery at `tests/fixtures/`, verify parsing
5. ⏳ **service** - Test single service metadata extraction
6. ⏳ **modules** - Test module listing
7. ⏳ **module** - Test module detail parsing (includes/extends)
8. ⏳ **config** - Test .env file discovery and display

## Implementation Notes

### For Docker Commands (down, ps, logs)
```javascript
vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

// Test that down command passes 'down' to runDockerCommand
expect(runDockerCommand).toHaveBeenCalledWith('module', 'down', args);
```

### For Discovery Commands (services, modules, etc.)
```javascript
// Set up environment to point to test fixtures
process.env.PROJECT_ROOT = path.join(__dirname, 'fixtures');

// Import command (which will discover test fixtures)
const servicesCommand = await import('../commands/services.js');

// Run command - it will discover testapp and testinfra
servicesCommand.main();

// Verify output contains expected services
// (May need to capture console output or check return value)
```

### For npm Commands (install, build)
```javascript
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

// Verify npm install is called in correct directory
expect(execSync).toHaveBeenCalledWith(
  'npm install',
  expect.objectContaining({ cwd: '/path/to/service' })
);
```

## Estimated Remaining Work

- **5 docker/npm commands**: ~2-3 hours (very similar to existing examples)
- **5 discovery commands**: ~3-4 hours (need to figure out output capture strategy)
- **Total**: ~5-7 hours for complete test coverage

## Conclusion

**Your instinct was correct** - the original mocking strategy didn't test actual behavior. The new approach:

1. ✅ Mocks external calls (docker, npm, shell)
2. ✅ Uses real fixtures for discovery (actual compose files)
3. ✅ Tests dx's actual logic (parsing, filtering, command generation)
4. ✅ Maintains fast execution (no docker/npm actually runs)

Two exemplar tests now demonstrate the pattern. Remaining work is largely mechanical duplication of these patterns across the other 9 commands.
