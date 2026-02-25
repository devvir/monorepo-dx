# dx logs

View logs for a module's services using Docker Compose.

## Usage

```bash
dx logs <module>            # View logs for a module
dx logs <module> [options]  # With Docker Compose options
```

Any options after the module name are forwarded directly to `docker compose logs`.

## Examples

```bash
dx logs mymodule            # View mymodule module logs
dx logs mymodule -f         # Follow (tail) mymodule logs
dx logs -- -t 20            # Last 20 lines of all services
```
