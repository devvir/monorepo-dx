# dx test

Run tests for services that define a test script. Filters by module or specific service.

## Usage

```bash
dx test                     # Run tests for all services with a test script
dx test -m <module>         # Run tests for all services in a module
dx test <service>           # Run tests for a specific service
```

Services without a test script are silently skipped.

## Examples

```bash
dx test                     # All services with tests
dx test -m reader           # All testable services in the reader module
dx test archivist           # Tests for the archivist service only
```
