# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### AI documentation

Each production build generates `/llms.txt`, section indexes, canonical `.md` pages, `/llms-full.txt`, and bundles limited to 512 KiB. The exporter uses published Docusaurus metadata and rendered content, including deployment tables, audit reports, tabs, code, and math. `/llms-manifest.json` records canonical URLs, aliases, hashes, and bundle membership. Discovery follows the [llms.txt proposal](https://llmstxt.org/).

- Run `npm run test:ai-docs` and `npm run build` before publishing. Build validation checks sitemap coverage, local links, aliases, code, addresses, and audit reports.
- Give pages useful titles and descriptions. Use Docusaurus links and bundled images instead of guessed output paths.
- Components that contain documentation must render useful content without JavaScript. Provide static references for live data and interactive API tools.
- Mark UI-only controls with `data-ai-ignore`. Keep examples, warnings, alternate tabs, and contract data in the rendered article.

Vercel applies HTTP redirects for renamed routes and Markdown response headers from `vercel.json`. After deployment, verify the indexes, representative Markdown pages, and redirects over HTTP.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.


---


- Introduction: single page which welcomes a user, explains what curve is and what it stands for; mention the three key products: DEX, Lending and DAO; what makes Curve different; 

- Curve Ecosystem Tokens:
  - CRV: curve-tokens/crv.md
  - veCRV: curve-tokens/vecrv.md
  - crvUSD: curve-tokens/crvusd.md
  - scrvUSD: curve-tokens/scrvusd.md
  - FAQ: curve-tokens/faq.md

- Using the Curve DEX:
  - Primitives: dex/primitives.md  # <– high-level intro
  - Swap Tokens on Curve: dex/swap.md
  - Provide & Withdraw Liquidity: dex/liquidity.md
  - Understanding Yield & Returns: dex/earning-yield.md
  - Differences Between Pool Types (Optional): dex/stableswap-vs-cryptoswap.md
  - FAQ: dex/faq.md

- Lending & crvUSD:
  - Overview: lending/primitives.md  # what this used to be
  - Liquidations: lending/liquidations.md
  - Loan Health: lending/loan-health.md
  - Borrow Rate: lending/borrow-rate.md
  - FAQ: lending/faq.md
  - Guides:
      - Beginner Guides:
          - Open & Close Loan: lending/guides/beginner/open-close.md
          - Manage Loan: lending/guides/beginner/manage.md
          - Loan in Liquidation: lending/guides/beginner/liquidation.md
      - Intermediate Guides:
          - Custom Bands: lending/guides/intermediate/custom-bands.md

- veCRV & Boosting Rewards:
    - What is veCRV?: vecrv/what-is-vecrv.md
    - How to Lock CRV: vecrv/how-to-lock.md
    - Boosting Pool Rewards: vecrv/boosting.md
    - Claiming Revenue Share: vecrv/revenue.md
    - veCRV FAQ: vecrv/faq.md

- Governance:
    - What is the Curve DAO?: dao/overview.md
    - Voting & Gauge Weights: dao/voting-gauges.md
    - How to Vote: dao/how-to-vote.md
    - Submitting a Proposal: dao/proposals.md
    - Community Fund & Treasury: dao/community-fund.md
    - Governance FAQ: dao/faq.md

- Cross-Chain Curve:
  - Overview: cross-chain/overview.md  # Why Curve is multi-chain, what’s available where
  - Supported Chains & Features: cross-chain/supported-chains.md
  - Using Curve on L2s: cross-chain/using-on-l2s.md
  - Bridging Curve Tokens: cross-chain/bridging-tokens.md
  - Curve DAO & Voting on L2s (Optional): cross-chain/dao-on-l2.md
  - Cross-Chain FAQ: cross-chain/faq.md

- Risks & Security:
    - Overview: risks/overview.md  # Why risk awareness matters, how to think about risk in DeFi
    - Liquidity Pool Risks: risks/pools.md
    - Lending & crvUSD Risks: risks/lending.md
    - scrvUSD Risks: risks/scrvusd.md
    - Security Practices & Audits: risks/audits.md

- Glossary: glossary.md
 
- Branding & Icons: branding.md

- Useful Links: links.md
