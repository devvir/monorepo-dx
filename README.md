# dx

A lightweight CLI for Docker-based monorepo development. It wraps Docker Compose with awareness of your project's **services** and **modules**, and normalizes common development tasks (install, build, test) across different service types.

## Why

Docker Compose is great for running services, but it knows nothing about your project structure. Monorepo tools like pnpm know your packages, but nothing about Docker. `dx` bridges the two—service and module discovery, consistent commands regardless of service type, and Docker orchestration all in one place.

## Core Concepts

### Services

A service is any runnable unit in your `services/` directory. It can be a Node.js app, a Python service, a database, a message queue—anything. `dx` identifies services by directory name and inspects them to understand how to install, build, and test them.

### Modules

A module is a named composition of services defined by a `compose.yml` in `modules/`. Modules are the unit of deployment: you bring up a module, not individual services. A module can include any number of services, including infrastructure services shared across modules.

Most commands accept an optional module name. When omitted, the command runs against all discovered modules (e.g. `dx up` starts all modules, `dx down` stops all). Place a `.dxskip` file in a module directory to exclude it from these unfiltered runs — it remains reachable by name.

```
monorepo/
├── services/          # Individual services (any type)
│   ├── api/
│   ├── worker/
│   └── mongodb/
└── modules/           # Deployable compositions
    ├── app/           # e.g. api + worker + mongodb
    └── dev/           # e.g. api + worker + mongodb + local tooling
```

## Quick Start

```bash
# Install and build all services
dx install && dx build

# Start a module
dx up app -d

# View logs
dx logs app -f

# Run tests for all services in a module
dx test -m app
```

## Commands

| Command | Description |
|---------|-------------|
| `dx up [options]` | Start a module (`-i` to install + build first) |
| `dx down` | Stop a module |
| `dx ps` | List running services |
| `dx logs` | View service logs |
| `dx build [target]` | Build services |
| `dx install [target]` | Install service dependencies |
| `dx test [service]` | Run service tests (`-m <module>` for module) |
| `dx dev` | Install, build, and start in one step |
| `dx config` | Show resolved Docker Compose config |
| `dx services` | List all discovered services |
| `dx modules` | List all discovered modules |
| `dx service <name>` | Show details about a service |
| `dx module <name>` | Show details about a module |

Run `dx --help` or `dx <command> --help` for full usage details. See [docs/commands.md](./docs/commands.md) for the complete reference.

## Setup

See [USAGE.md](./USAGE.md) for full setup instructions, directory structure requirements, and environment configuration.

## Extending

Add a file to `commands/` with `register(program)` and `action(...)` exports, then import and register it in `dx.js`. See [USAGE.md](./USAGE.md) for details.
