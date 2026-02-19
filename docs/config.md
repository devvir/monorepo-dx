# dx config

Show the resolved Docker Compose configuration for a module. Useful for inspecting how environment variables, includes, and overrides are merged.

## Usage

```bash
dx config                   # Full app config
dx config <module>          # Resolved config for a module
```

Delegates to `docker compose config`.

## Examples

```bash
dx config                   # Full resolved config
dx config reader            # Resolved config for the reader module
```
