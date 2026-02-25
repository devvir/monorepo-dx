# dx down

Stop a module's services using Docker Compose.

## Usage

```bash
dx down                     # Stop all modules
dx down <module>            # Stop a specific module
dx down <module> [options]  # Stop with Docker Compose options
```

Any options after the module name are forwarded directly to `docker compose down`.

When no module is given, all discovered modules are stopped in sequence. Modules with a `.dxskip` file in their directory are excluded.

## Examples

```bash
dx down                     # Stop all modules
dx down mymodule            # Stop the mymodule module
dx down mymodule -v         # Stop and remove volumes
```
