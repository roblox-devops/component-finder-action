# Component Finder

GitHub Action that finds component definition files in a project and returns
their paths as a JSON map.

## Usage

```yaml
name: Find components

on: [push]

jobs:
  find-components:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Find components
        id: components
        uses: roblox-devops/component-finder-action@v1
        with:
          components: alpha:1.2.3, beta
          component-search-directories: components, shared/components

      - name: Use component paths
        env:
          COMPONENTS: ${{ steps.components.outputs.components }}
        run: echo "$COMPONENTS"
```

Both inputs are optional:

| Input                          | Description                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`                   | Comma-separated component names or keys to find. A name without a version resolves to `:latest`. When omitted, all components are returned.           |
| `component-search-directories` | Comma-separated directories to search. When omitted, the repository directory is searched. Relative paths are resolved from the repository directory. |

Component definitions must use a supported component filename and contain a
top-level `component` field. For example:

```yaml
component: alpha
```

The `components` output is a JSON object mapping component keys to absolute file
paths:

```json
{
  "alpha:1.2.3": "/home/runner/work/project/components/alpha/.component.yml",
  "beta:latest": "/home/runner/work/project/components/beta/.component.yml"
}
```

Missing requested components produce a warning but do not fail the action.
Missing search directories are also reported as warnings.

## Development

Install dependencies with pnpm, then run the checks and package the action:

```bash
pnpm install
pnpm run all
```

`pnpm run all` formats, lints, tests, updates the coverage badge, and bundles
the distributable action in `dist/`.

To test the action locally, create a `.env` file with the inputs expected by
`@github/local-action`, then run:

```bash
pnpm run local-action
```

The committed `dist/` bundle is the entrypoint used by GitHub Actions. Run
`pnpm run package` after changing the TypeScript source.

## License

MIT
