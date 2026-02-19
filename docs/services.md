# dx services

List all discovered services.

## Usage

```bash
dx services                 # List services with brief description
dx services -v              # Verbose: include port and image
```

Services are discovered from the `services/` directory (or `DX_SERVICES_DIR` if set).

## Examples

```bash
dx services                 # All services
dx services -v              # With port and image details
```
