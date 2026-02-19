# dx ps

List running containers, optionally scoped to a module.

## Usage

```bash
dx ps                       # All running containers
dx ps <module>              # Containers for a specific module
```

Delegates to `docker compose ps`.

## Examples

```bash
dx ps                       # All running containers
dx ps reader                # Containers in the reader module
```
