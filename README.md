# Curve Docs

This repository contains the Docusaurus site for Curve documentation.

## Setup

```bash
yarn
yarn start
```

The local dev server hot reloads most documentation and component changes.

## Validation

```bash
yarn typecheck
yarn build
```

There is no separate test suite. Use `yarn build` before opening a PR; Docusaurus reports broken links, bad imports, and MDX errors during the build.

## Contract Deployments

The contract deployments pages in the user and developer docs both render data from:

```text
static/deployments.json
```

To add or update a deployment:

1. Open `static/deployments.json`.
2. Find the target chain key, such as `ethereum`, `arbitrum`, or `base`.
3. Add the address under the relevant category path, such as `tokens`, `dao`, `fees`, `integrations`, `amm.stableswap`, `amm.twocrypto`, or `lending`.
4. If the chain is new, add its block explorer URL to `_explorers`. The deployment UI uses this value to build address links.
5. Validate the JSON and build the site.

Example:

```json
{
  "base": {
    "amm": {
      "stableswap": {
        "factory": "0x..."
      }
    }
  }
}
```

Validation commands:

```bash
node -e "JSON.parse(require('fs').readFileSync('static/deployments.json', 'utf8'))"
yarn build
```

Do not edit `build/deployments.json`; `build/` is generated output.

## Docs Structure

- `docs/user` serves `/user`
- `docs/developer` serves `/developer`
- `docs/protocol` serves `/protocol`
- `sidebars/` contains the manually maintained sidebars
- `src/components` contains React components used by pages and MDX docs
- `src/partials` contains shared MDX fragments
- `static` contains public assets copied into the generated site

When adding a new documentation page, add it to the relevant sidebar file.
