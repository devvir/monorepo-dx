# dx install

Install service dependencies. Follows the same logic and filtering as [`dx build`](build.md), substituting `install.sh` for `build.sh` and `pnpm install` for `pnpm build`.

## Usage

```bash
dx install                      # Install all services
dx install <service>            # Install a specific service
dx install <module>             # Install all services in a module
dx install <name> -- <args>     # Pass extra args to the install script or pnpm
```

When no filter is given, all discovered services are installed.

## Resolution

For each service, `dx` checks in order:

1. **`install.sh`** — if present, it is executed. This takes precedence even for Node.js services, allowing you to run additional setup steps alongside or instead of `pnpm install`.
2. **`package.json`** — if present (and no `install.sh`), delegates to `pnpm install --filter="<service>"`.
3. **Nothing** — when installing all services or a module, services with no install steps are silently skipped. When targeting a specific service by name, it is treated as an error.

## Module vs Service

If the given name matches both a module and a service, the module takes precedence.

## Examples

```bash
dx install                          # Install all services
dx install feed                     # Install the feed service
dx install reader                   # Install all services in the reader module
dx install feed -- --frozen-lockfile # Pass --frozen-lockfile to pnpm
```
