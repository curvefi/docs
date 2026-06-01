# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start          # Start local dev server (hot reload)
yarn build          # Build static site to build/
yarn serve          # Serve the built site locally
yarn clear          # Clear Docusaurus cache
yarn typecheck      # TypeScript type checking
```

No test suite exists in this repo. Use `yarn build` to validate changes (catches broken links, bad imports, MDX errors). The build config uses `onBrokenLinks: 'warn'` and `onBrokenMarkdownLinks: 'warn'`, so broken links show as warnings rather than build failures.

Requires Node >= 18.

## Architecture

This is a **Docusaurus 3** documentation site for Curve Finance (`docs.curve.finance`). It uses TypeScript, React, MDX, KaTeX (math rendering), and Mermaid (diagrams).

### Three Doc Sections (Separate Plugins)

The site serves three distinct documentation trees:

| Section | Source Dir | Route Base | Sidebar |
|---|---|---|---|
| **Users** (preset) | `docs/user/` | `/user/` | `sidebars/sidebarUser.js` |
| **Developer** (plugin) | `docs/developer/` | `/developer/` | `sidebars/sidebarDeveloper.js` |
| **Protocol/Build On Curve** (plugin) | `docs/protocol/` | `/protocol/` | `sidebars/sidebarProtocol.js` |

Sidebars are manually defined in the `sidebars/` directory — not auto-generated. When adding a new doc, you must also add it to the relevant sidebar file.

Doc files are `.md` (not `.mdx`), but MDX features (JSX, imports) are still supported since Docusaurus processes all markdown through MDX.

### Key Config Files

- `docusaurus.config.ts` — main site config, plugins, navbar, Algolia search
- `sidebars/sidebarUser.js` — sidebar for the user-facing docs
- `sidebars/sidebarDeveloper.js` — sidebar for the developer/technical docs
- `sidebars/sidebarProtocol.js` — sidebar for the protocol/builder docs
- `src/config/ghost.ts` — Ghost CMS integration config (blog posts shown on homepage)

### Deployments Data

`static/deployments.json` is the **source of truth** for contract addresses. Edit it directly, then validate JSON and run `yarn build`. The user and developer deployment pages both render this file through `src/components/DeploymentFilter`.

### Markdown Features

- **Math**: Use KaTeX syntax — inline `$...$` and display `$$...$$` blocks (via `remark-math` + `rehype-katex`). Important KaTeX rules: use `\cdot` or `\times` for multiplication (not `*`), use `\min`/`\max` for function names (not bare `min`/`max`), escape underscores inside `\text{}` as `\text{last\_tvl}` (unescaped `_` becomes a subscript), and never use `%` inside math blocks (KaTeX treats it as a comment)
- **Diagrams**: Use Mermaid code blocks (``` ```mermaid ```) — rendered by `@docusaurus/theme-mermaid`
- **Logo shortcodes**: Write `:logos-<name>:` in markdown to render an inline SVG from `static/img/logos/<name>.svg` (handled by the `remark-logos.js` plugin)
- **Custom admonitions**: Beyond standard Docusaurus admonitions (`note`, `tip`, `info`, `warning`, `caution`, `danger`), many site-specific keywords are configured: `tip-green`, `example`, `description`, `deploy`, `github`, `vyper`, `solidity`, `colab`, `guard`, `telegram`, `notebook`, `bug`, `pdf`, `abstract`. Developer reference pages heavily use `::::description` (function docs), `:::vyper`/`:::solidity` (contract info header), and `:::guard` (access-controlled methods).

### Syntax Highlighting

Custom Prism languages are registered in `src/theme/prism-include-languages.js`. Beyond the built-in languages, **Vyper** and **Solidity** are available for code blocks. Vyper extends Python's grammar with Vyper-specific keywords.

### URL Redirects

`docusaurus.config.ts` contains an extensive redirect map in the `@docusaurus/plugin-client-redirects` config. When renaming or moving developer docs, add redirects from old paths to new ones to avoid breaking external links.

### Custom React Components

Developer reference pages use these components embedded in markdown (imported via MDX):

- `<SourceCode>` — collapsible block wrapping Vyper/Solidity source code snippets
- `<Example>` — collapsible block wrapping usage examples (shell snippets or `<ContractCall>`)
- `<ContractABI>` — collapsible block wrapping the JSON ABI
- `<ContractCall>` — live on-chain data fetcher (Ethereum mainnet only, via `https://ethereum-rpc.publicnode.com/`). Auto-fetches for zero-arg view functions; renders input fields when `args`/`labels` props are provided. Uses multicall3 batching for efficiency. Cannot be used for L2 contracts.

Live supply/balance components are in `src/components/LiveComponents/`. Chart components (Chart.js-based) live in `src/components/Charts/`.

The `src/utils/formatters.js` utility provides `formatNumber()` for formatting large numbers with k/M/B suffixes.

### Integrations & Plugins

- **Algolia** — site search with AI assistant (`askAi` config in `docusaurus.config.ts`)
- **Ghost CMS** — blog posts fetched for the homepage; configured in `src/config/ghost.ts`
- **Plausible** — analytics via `docusaurus-plugin-plausible`
- **Formspree** — feedback endpoint injected at build time
- **Swagger UI** — `swagger-ui-react` available for API reference pages
- **Client modules** — `src/clientModules/latestPopup.js` runs client-side (announcement popup)

### Custom CSS

CSS is modular and imported in `src/css/custom.css`:
- `design-tokens.css` + `theme-tokens.css` — design system variables
- `admonitions.css` — custom admonition types (`tip-green`, `example`, etc.)
- Other partials for homepage, navigation, guide cards

### Moved Pages

`src/pages/moved.tsx` renders a redirect notice for users coming from the old `resources.curve.finance` URL.

## Developer Reference Page Structure

Developer reference pages document smart contracts. Every page follows a consistent structure. Source code must match the verified on-chain deployment (fetch from Etherscan if uncertain).

### Page Header

Each page starts with a `# Title`, a brief intro paragraph, then a `:::vyper` or `:::solidity` admonition block containing:

1. Source code link to GitHub
2. Vyper/Solidity version
3. Deployment address(es) with chain logo shortcodes and block explorer links
4. The contract's JSON ABI in a `<ContractABI>` block — the JSON must be **minified on a single line** (not pretty-printed), with a blank line between `<ContractABI>` and the code fence, and between the code fence and `</ContractABI>`

```markdown
# ContractName

Brief description of what the contract does and its role in the system.

:::vyper[`ContractName.vy`]

The source code for the `ContractName.vy` contract can be found on [GitHub](https://github.com/curvefi/...). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.0`.

The contract is deployed on :logos-ethereum: Ethereum at [`0x...`](https://etherscan.io/address/0x...).

<ContractABI>


```json
[{"name":"functionName","inputs":[],"outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
```

</ContractABI>

:::
```

For multiple deployments, use a bulleted list:

```markdown
- :logos-ethereum: Ethereum: [`0x...`](https://etherscan.io/address/0x...)
- :logos-arbitrum: Arbitrum: [`0x...`](https://arbiscan.io/address/0x...)
```

### Function Documentation

Functions are grouped under `## Section` headings (e.g., "Delegation", "Allowances and Approvals", "Contract Ownership", "Other Methods"). Each function follows this structure inside a `::::description` block:

The content inside each `::::description` block must follow this exact order:

1. Guard admonition (if access-controlled)
2. Description text (what the function does)
3. Input table (if the function has parameters)
4. Returns line (if the function returns a value)
5. Emits line (if the function emits events)
6. `<SourceCode>` block
7. `<Example>` block

```markdown
### `function_name`
::::description[`ContractName.function_name(param: type, ...) -> returnType: view`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the contract.
:::

Brief description of what the function does.

| Input   | Type      | Description              |
| ------- | --------- | ------------------------ |
| `param` | `uint256` | Description of the param |

Returns: description (`type`).

Emits: `EventName`

<SourceCode>

```vyper
@external
def function_name(param: uint256):
    ...
```

</SourceCode>

<Example>

```shell
>>> ContractName.function_name(123)
```

</Example>

::::
```

### Signature Format Rules

- **Format**: `ContractName.method(param: type, ...) -> returnType: visibility`
- **View functions**: end with `: view`
- **State-changing functions**: omit the visibility suffix
- **Parameter names**: must match the source code exactly
- **Return types**: must match the source code exactly

### Returns / Emits Lines

- **Returns format**: `Returns: description (`type`).` — ends with a period, type in backtick-wrapped parens
- **Emits format**: `Emits: `EventName` event.` — backticks around event name, word "event", ends with period

### Guard Admonitions

- Snekmate-guarded: `:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]`
- Other guarded: `:::guard[Guarded Method]` with description of who can call it
- Place immediately after the `::::description` opening, before the description text
- **Always describe who can call the function and what entity controls access.** For example: "This function is only callable by the `admin` of the contract. The `admin` in this case is the Curve DAO." Include context about what this means in practice (e.g., "So, adding a gauge to the `GaugeController` is in the hands of the DAO.").

### Source Code Blocks

- Wrap in `<SourceCode>` component
- Use `vyper` or `solidity` code fence language
- Code must match verified on-chain source
- Include **all relevant code**: if the function calls an internal helper, references a module, or depends on another function in the same contract, include that code too. For a single contract, just add the called functions below the main function in the same code block.
- If a function calls into an **external contract** (via an interface) and you don't have access to that contract's source code, **ask the user for the contract address** of the referenced contract so the source can be fetched.

**IMPORTANT — `<Tabs>` for module code**: If a function references an external module (e.g., Snekmate `ownable`, `access_control`, LayerZero `OApp`), the `<SourceCode>` block **MUST** use `<Tabs>` + `<TabItem>` to show the module code in a separate tab. Always check if the source code calls module functions (look for patterns like `ownable._check_owner()`, `access_control._check_role()`, `OApp._setPeer()`, etc.). If it does, include the relevant module function(s) in a tab.

- First tab: the main contract function code (label: `ContractName.vy`)
- Second tab: the module code (label: `ownable.vy (Snekmate 🐍)` or `access_control.vy (Snekmate 🐍)` etc.)
- Only include the specific module functions that are actually called, not the entire module
- To get the module source code, fetch the verified contract source from Etherscan (`getsourcecode` API) — it includes all imported modules

```markdown
<SourceCode>

<Tabs>
<TabItem value="ContractName.vy" label="ContractName.vy">

```vyper
@external
def transfer_ownership(new_owner: address):
    ownable._check_owner()
    ownable._transfer_ownership(new_owner)
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
@internal
def _check_owner():
    assert msg.sender == self.owner, "ownable: caller is not the owner"

@internal
def _transfer_ownership(new_owner: address):
    old_owner: address = self.owner
    self.owner = new_owner
    log OwnershipTransferred(old_owner, new_owner)
```

</TabItem>
</Tabs>

</SourceCode>
```

When a function does NOT reference any external module, use a simple `<SourceCode>` block without `<Tabs>`:

```markdown
<SourceCode>

```vyper
@external
def some_function():
    ...
```

</SourceCode>
```

### Example Blocks

Every function must have an `<Example>` block:

- **View functions (0 params, mainnet)**: prefer `<ContractCall>` for live on-chain fetching
- **View functions (with params, mainnet)**: prefer `<ContractCall>` with `args` and `labels` props
- **State-changing functions**: use static `shell` code blocks (`>>> ContractName.method(...)`)
- **L2-only contracts**: cannot use `<ContractCall>` — use static shell examples

`<ContractCall>` usage:

```markdown
<ContractCall
  address="0x..."
  abi={["function method() view returns (uint256)"]}
  method="method"
  contractName="ContractName"
/>

<!-- With input fields: -->
<ContractCall
  address="0x..."
  abi={["function method(uint256, address) view returns (bool)"]}
  method="method"
  args={["42", "0x..."]}
  labels={["_param1", "_param2"]}
  contractName="ContractName"
/>
```

### Standard Sections

Most contract pages include these sections at the bottom:

- **Contract Ownership** — `owner()` and `transfer_ownership()` (often via Snekmate `ownable` module)
- **Other Methods** — simple getters like `version()`, `name()`, `symbol()`, `decimals()`

### Completeness

- All public/external functions in the ABI should be documented
- The ABI JSON block should match the actual contract ABI
- Cross-reference `static/deployments.json` for deployment addresses
