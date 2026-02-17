# DX - Infrastructure Orchestration

Node.js CLI for managing services and modules. Entry point:

```bash
pnpm run dx <command> [args]
```

Or use the shell wrapper (see how to set it up in [USAGE.md](./USAGE.md)):

```bash
./[entrypoint] <command> [args]
```

## Design Principles

- **Single entry point**: all commands route through `dx.js`
- **Self-documenting**: commands export `help()` function, dynamically loaded
- **Low-maintenance**: no hardcoded script lists, output based on discovery
- **Separation of concerns**: commands handle UX, `utils/` provides utilities

## Recommended Setup
- See [USAGE.md](./USAGE.md) for instructions on how to make the most of this tool

## Adding Commands

Create `commands/mycommand.js` with two required exports:

```javascript
export function help() {
  return `pnpm run dx mycommand [OPTIONS]
  Description of what this does

  Examples:
    pnpm run dx mycommand option1    # Example usage`;
}

export async function main() {
  try {
    // Command logic here
    logger.success('Done');
  } catch (err) {
    logger.fatal(err.message);
  }
}
```

**Required exports:**
- `help()` - Returns help text string (auto-discovered and displayed by `pnpm run dx help`)
- `main()` - Async function executed when command is invoked (can be async or sync)

**Pattern:**
- Follow existing commands for consistency.