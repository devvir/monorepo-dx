# DX - Infrastructure Orchestration

**Recommended Setup**
- Include this repo as a submodule of your monorepo, e.g. in ./dx/
- Copy entrypoint to the root of your monorepo and make sure it's executable
- Optionally, rename the entrypoint copy to something meaninful for your project
- Update the path to this submodule if different from ./dx
- If needed, update the paths to the modules and services folders
- Tip: fork the repo if you'd rather add your own commands to the mix
- Tip: add the dx folder to your monorepo workspaces

After taking these steps, you may use the command right from the root of your project (replace [entrypoint] with the name you gave to the entrypoint copy in the root of your monorepo):

- `[entrypoint] up <module>`
- `[entrypoint] config`
- `[entrypoint] services`
- ...

## Directory Structure Assumptions

DX makes specific assumptions about your monorepo structure. These must be in place for DX to work correctly.

### Top-level Structure

```
/<your-monorepo>/
├── dx/                           # DX framework (this folder)
├── entrypoint                    # Optional: shell wrapper for convenience, the name is up to you
├── services/                     # Directory for all microservices (default location)
├── modules/                      # Directory for deployable module groups (default location)
└── ...
```

### Customizing Directories

By default, DX looks for services in `./services` and modules in `./modules` (relative to project root). You can override these locations via environment variables:

- `DX_SERVICES_DIR` - Path to services directory (defaults to `./services`)
- `DX_MODULES_DIR` - Path to modules directory (defaults to `./modules`)

**Usage:**

```bash
# Using the shell entrypoint, uncomment in the entrypoint file:
export DX_SERVICES_DIR="$(dirname "$0")/my-services"
export DX_MODULES_DIR="$(dirname "$0")/my-modules"

# Or set them on the command line:
DX_SERVICES_DIR=/path/to/services DX_MODULES_DIR=/path/to/modules dx services

# Or in npm scripts:
DX_SERVICES_DIR=./services DX_MODULES_DIR=./modules npm run dx -- services
```

### Services Directory Structure

Any service goes in `services/`. The only requirement is a `docker/` directory with Docker configuration.

```
services/<service-name>/
├── docker/
│   └── compose.yml              # Service Docker config (parsed by DX)
├── README.md                    # Optional: service description
└── ... (any additional files the service may need)
```

**Examples:**
- Node.js service: `services/feed/` with `package.json`, `src/`, `docker/compose.yml`
- Python service: `services/analytics/` with `pyproject.toml`, `src/`, `docker/Dockerfile`
- Database: `services/mongodb/` with `docker/mongodb.yml`
- Queue: `services/rabbitmq/` with `docker/rabbitmq.yml`

### Modules Directory Structure

Modules are logical groupings of services that may be deployed together (as independent apps), while services may be atomic reusable pieces that don't necessarily provide value on their own. A module may, however, be composed of a single service if sufficient.

```
modules/<module-name>/
├── compose.yml                   # REQUIRED: Docker Compose config
├── README.md                     # Optional: Module description (first paragraph used as summary)
├── .env                          # Optional: Module env vars (merged with root .env)
├── .env.production               # Optional: Production-specific overrides
├── .env.staging                  # Optional: Staging-specific overrides
└── ...
```

The module's `compose.yml` file uses **include directives** to reference services:

```yaml
# Example: modules/reader/compose.yml
include:
  - ../../services/feed/docker/compose.yml
  - ../../services/archivist/docker/compose.yml

# ... module-specific configuration
```

Notice that a module compose.yml may simply consist of include directives. This is not required, but it's highly recommended. The benefit is that each service handles its own configuration (customized via env vars), while a module just composes different services that collaborate loosely.

**Important:** Module compose files must use relative paths with the pattern `../../services/<service-name>/docker/compose.yml` (or `../../services/<service-name>/<name>.yml` for infrastructure). DX parses these paths to identify service dependencies.

### Required Files & Metadata

- **Services**: Identified by directory name in `services/`
  - Must be a direct subdirectory of `services/`
  - Cannot start with `.` (hidden directories ignored)

- **Modules**: Identified by directory name in `modules/`
  - Must be a direct subdirectory of `modules/`
  - Cannot start with `.` (hidden directories ignored)

- **Descriptions**: Read from (in order of priority):
  1. First paragraph of `README.md` (non-heading, non-empty text)
  2. `package.json` (if present), `description` field
  3. Auto-generated fallback: `"{name} service"` or `"{name} module"`

- **Docker Config (Services)**: Expected at `docker/compose.yml` relative to service directory
  - Parsed to extract image name and port information
  - DX looks for `image:` field and port defaults in `ports:` with syntax `${PORT:-<default>}`

### Service Dependencies (Module-Level)

Modules declare which services they depend on by including their compose files:

```yaml
# modules/analysis/compose.yml
include:
  - ../../services/feed/docker/compose.yml
  - ../../services/mongodb/docker/mongodb.yml
```

DX parses these include directives to:
- Extract service names from paths matching `/services/<service-name>/`
- Build dependency trees for the module
- Display service relationships in module info

## Environment Configuration

DX supports hierarchical environment configuration via `.env` files. This allows you to centralize common configuration while allowing modules to customize for their specific needs.

### Environment File Locations

```
/<your-monorepo>/
├── .env                          # Root project environment (optional but recommended)
├── modules/
│   └── <module-name>/
│       ├── .env                  # Module-specific environment (optional)
│       ├── .env.production       # Environment-specific overrides (optional)
│       ├── .env.staging
│       └── .env.development
```

### Environment Resolution Order

When a module is deployed, DX loads and merges environment variables in this order (later values override earlier ones):

1. **Root `.env`** (if exists) - Base configuration for the entire project
2. **Module `.env`** (if exists) - Module-specific configuration, overrides root values
3. **Module `.env.<APP_ENV>`** (if `APP_ENV` is set in root `.env` AND file exists) - Environment-specific overrides

All files are merged together. Docker Compose receives all three files via `--env-file` flags in order.

### How It Works

**Step 1: Load root `.env`**

```bash
# .env (root)
DB_HOST=localhost
REDIS_HOST=localhost
APP_ENV=production
LOG_LEVEL=info
```

**Step 2: Apply module `.env` (if present)**

The module's `.env` overrides values from the root:

```bash
# modules/reader/.env
REDIS_HOST=redis-reader  # Override root value
READER_TIMEOUT=30        # Add module-specific var
```

Result passed to Docker Compose: `DB_HOST=localhost`, `REDIS_HOST=redis-reader`, `APP_ENV=production`, `LOG_LEVEL=info`, `READER_TIMEOUT=30`

**Step 3: Additionally apply environment-specific file (if `APP_ENV` is set)**

If `APP_ENV=production` is defined in the root `.env`, DX will additionally load `modules/reader/.env.production` if it exists:

```bash
# modules/reader/.env.production
LOG_LEVEL=warn              # Production-specific override
REDIS_HOST=redis-prod       # Production-specific config
```

Final result passed to Docker Compose: `DB_HOST=localhost`, `REDIS_HOST=redis-prod`, `APP_ENV=production`, `LOG_LEVEL=warn`, `READER_TIMEOUT=30`

**Note:** The module's base `.env` is still loaded. Environment-specific files are merged on top, allowing you to keep common module config in `.env` and only override what changes per environment.

### Use Cases

**Global Secrets & Common Config**

```bash
# .env (root)
DB_USER=admin
DB_PASSWORD=secret123      # Shared database credentials
REDIS_HOST=localhost
APP_ENV=development
```

**Module-Specific Customization**

```bash
# modules/reader/.env
READER_TIMEOUT=30          # Module tweaks service timeout
READER_WORKERS=4           # Module tweaks concurrency
```

**Environment-Specific Configuration**

```bash
# modules/api/.env
API_PORT=3000
WORKERS=4

# modules/api/.env.production
API_PORT=8080              # Different port in production
WORKERS=16                 # More workers in production
```

When `APP_ENV=production` is set, the production overrides are automatically applied.

### Best Practices

- Store **secrets and shared config** in root `.env` (API keys, database credentials, common timeouts)
- Store **module-specific values** in module `.env` (service ports and credentials for inter-service discovery and communication, feature flags, customization)
- Use **environment-specific files** (`.env.production`, `.env.staging`) for deployment-specific tuning (worker counts, timeouts, logging levels)
- **Never commit `.env` files** to version control — use `.env.example` instead for a template/guide
- Make `.env` files **optional** — all services should have sensible defaults in their configuration code