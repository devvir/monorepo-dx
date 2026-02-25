# dx dev

Install, build, and start a module in one step. Convenience shortcut for the full development startup workflow.

## Usage

```bash
dx dev                      # Install, build, and start all modules
dx dev <module>             # Install, build, and start a specific module
dx dev <module> [options]   # With Docker Compose options forwarded to up
```

When no module is given, install and build run across all services, then all modules are started. Modules with a `.dxskip` file in their directory are excluded from the `up` step.

## Examples

```bash
dx dev                      # Full startup for all modules
dx dev mymodule             # Full startup for the mymodule module
dx dev mymodule -d          # Same, detached
```
