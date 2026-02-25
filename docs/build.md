# dx build

Build services. Works with any service type—Node.js, shell scripts, or anything else.

## Usage

```bash
dx build                        # Build all services
dx build <service>              # Build a specific service
dx build <module>               # Build all services in a module
dx build <name> -- <args>       # Pass extra args to the build script or pnpm
```

When no filter is given, all discovered services are built.

## Resolution

For each service, `dx` checks in order:

1. **`build.sh`** — if present, it is executed. This takes precedence even for Node.js services, allowing you to wrap or extend `pnpm build` with additional steps.
2. **`package.json`** — if present (and no `build.sh`), delegates to `pnpm build --filter="<service>"`.
3. **Nothing** — when building all services or a module, services with no build steps are silently skipped. When targeting a specific service by name, it is treated as an error.

## Module vs Service

If the given name matches both a module and a service, the module takes precedence.

## Examples

```bash
dx build                          # Build all services
dx build myservice                # Build the myservice service
dx build mymodule                 # Build all services in the mymodule module
dx build myservice -- --verbose   # Pass --verbose to myservice's build.sh or pnpm
```
