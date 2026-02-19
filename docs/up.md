# dx up

Start a module's services using Docker Compose.

## Usage

```bash
dx up                       # Start all modules
dx up <module>              # Start a specific module
dx up <module> [options]    # Start with Docker Compose options
```

Any options after the module name are forwarded directly to `docker compose up`.

When no module is given, all discovered modules are started in sequence. Modules with a `.dxskip` file in their directory are excluded.

## Examples

```bash
dx up                       # Start all modules
dx up reader                # Start the reader module
dx up reader -d             # Start detached
dx up reader --build        # Force rebuild images before starting
```
