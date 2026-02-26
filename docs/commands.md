# Command Reference

Complete documentation for all dx commands. Run `dx <command> --help` for quick inline help.

---

## Docker Compose Commands

These commands wrap `docker compose` with module awareness. Any unknown flags are passed through to Docker Compose.

### up

Start services, optionally installing dependencies and building first.

```bash
dx up                       # Start all modules
dx up <module>              # Start a specific module
dx up <module> -d           # Start detached
dx up -i <module>           # Install, build, then start
dx up -i <module> --build   # Install, build source, rebuild images, start
```

| Flag | Description |
|------|-------------|
| `-i, --install` | Run `dx install` and `dx build` for the target before starting |

All other flags (e.g. `-d`, `--build`, `--force-recreate`) are forwarded to `docker compose up`.

### down

Stop services.

```bash
dx down                     # Stop all modules
dx down <module>            # Stop a specific module
dx down <module> -v         # Stop and remove volumes
```

### logs

View service logs. Module name can appear anywhere in the arguments.

```bash
dx logs <module>            # View module logs
dx logs <module> -f         # Follow (tail) logs
dx logs -f <module>         # Same (module detected anywhere)
```

### ps

List running services.

```bash
dx ps                       # All running containers
dx ps <module>              # Containers for a specific module
```

### config

Show the resolved Docker Compose configuration.

```bash
dx config                   # Full resolved config
dx config <module>          # Resolved config for a module
```

---

## Service Commands

These commands run against individual services, resolving what to do based on the service type.

### build

Build a service, all services in a module, or all services.

```bash
dx build                        # Build all services
dx build <service>              # Build a specific service
dx build <module>               # Build all services in a module
dx build <name> -- <args>       # Pass extra args to the build script or pnpm
```

**Resolution order** per service:
1. `build.sh` — If present, executed via bash (takes precedence, even for Node services)
2. `package.json` — Delegates to `pnpm build --filter="<package-name>"`
3. Nothing — Silently skipped (or error if targeting a specific service by name)

Module name takes precedence over service name if both exist.

### install

Install dependencies. Same logic as `build`, substituting `install.sh` and `pnpm install`.

```bash
dx install                      # Install all services
dx install <service>            # Install a specific service
dx install <module>             # Install all services in a module
dx install <name> -- <args>     # Pass extra args
```

**Resolution order** per service:
1. `install.sh` — If present, executed via bash
2. `package.json` — Delegates to `pnpm install --filter="<package-name>"`
3. Nothing — Silently skipped (or error if targeting specifically)

### test

Run tests for services that define an npm `test` script.

```bash
dx test                     # Run tests for all services with a test script
dx test <service>           # Run tests for a specific service
dx test -m <module>         # Run tests for all services in a module
```

| Flag | Description |
|------|-------------|
| `-m, --module <name>` | Scope tests to services in a module |

Services without a `test` script in their `package.json` are silently skipped.

### dev

Convenience shortcut: install, build, and start in one step.

```bash
dx dev                      # Full startup for all modules
dx dev <module>             # Full startup for a specific module
dx dev <module> -d          # Same, detached
```

Runs `dx install` → `dx build` → `dx up` in sequence. Docker Compose flags are forwarded to the `up` step.

---

## Discovery Commands

### services

List all discovered services.

```bash
dx services                 # List services
dx services -v              # Verbose: include port and image
```

### service

Show detailed information about a specific service.

```bash
dx service <name>           # Service details (description, image, port, type, path)
dx service <name> -v        # Include additional metadata
```

### modules

List all discovered modules.

```bash
dx modules                  # List modules
dx modules -v               # Verbose: include path and compose file
```

### module

Show detailed information about a module, including its services and README.

```bash
dx module <name>            # Module details
```
