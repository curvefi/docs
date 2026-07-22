import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
const remarkLogos = require('./remark-logos');

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const SITE_DOMAIN = 'docs.curve.finance';

// Shared doc plugin options (used by both user and protocol sections)
const sharedDocOptions = {
  remarkPlugins: [remarkMath, remarkLogos],
  rehypePlugins: [rehypeKatex],
  admonitions: {
    keywords: ['note', 'tip', 'tip-green', 'info', 'caution', 'warning', 'danger', 'example', 'description', 'deploy', 'github', 'vyper', 'colab', 'guard', 'telegram', 'notebook', 'solidity', 'bug', 'pdf', 'abstract'],
  },
};

const config: Config = {
  title: 'Curve Knowledge Hub',
  tagline: 'Everything you need to know about Curve',
  favicon: 'img/favicon.png',

  headTags: [
      {
        tagName: 'meta',
        attributes: {
          name: 'algolia-site-verification',
          content: '7413F5538D3EDA81',
        },
      },
    ],

  // Set the production url of your site here
  url: `https://${SITE_DOMAIN}`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'curvefi', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid'],

  themeConfig: {
    algolia: {
      appId: '0JUF43T81Z',
      apiKey: '924b8a275700d8f67826ed2ed67671bb',
      indexName: 'curve-docs',
      contextualSearch: false,
      searchParameters: {
        optionalFilters: ['NOT hierarchy.lvl0:Risk Disclaimers<score=3>'],
      },
      searchPagePath: 'search',
    },
    navbar: {
      hideOnScroll: false,
      logo: {
        alt: 'Curve Logo',
        src: 'img/logo.png'
      },
      items: [
        {
          to: 'user/introduction',
          label: 'Users',
          activeBasePath: '/user',
        },
        {
          to: 'developer/documentation-overview',
          label: 'Developers',
          activeBasePath: '/developer',
        },
        {
          to: 'protocol/why-curve',
          label: 'Build On Curve',
          activeBasePath: '/protocol',
        },
        {
          to: 'fee-architecture',
          label: 'Visualizations',
          activeBasePath: '/fee-architecture',
        },
        {
          href: 'https://github.com/curvefi',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          label: 'Blog',
          position: 'right',
          href: 'https://news.curve.finance/',
        },
        {
          type: 'dropdown',
          label: 'Links',
          position: 'right',
          items: [
            {
              label: 'Curve',
              href: 'https://curve.finance',
              className: 'dropdown-item-with-icon',
              'data-icon': 'dapp',
            },
            {
              label: 'Discord',
              href: 'https://discord.com/invite/twUngQYz85',
              className: 'dropdown-item-with-icon',
              'data-icon': 'discord',
            },
            {
              label: 'Telegram',
              href: 'https://t.me/curvefi',
              className: 'dropdown-item-with-icon',
              'data-icon': 'telegram',
            },
            {
              label: 'Twitter',
              href: 'https://x.com/curvefinance',
              className: 'dropdown-item-with-icon',
              'data-icon': 'twitter',
            },
            {
              label: 'Governance Forum',
              href: 'https://gov.curve.finance',
              className: 'dropdown-item-with-icon',
              'data-icon': 'forum',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'solidity'],
    },
  } satisfies Preset.ThemeConfig,

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs/user',
          routeBasePath: 'user',
          sidebarPath: './sidebars/sidebarUser.js',
          sidebarCollapsed: true,
          breadcrumbs: false,
          ...sharedDocOptions,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function plausibleAnalytics() {
      return {
        name: 'plausible-analytics',
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: 'script',
                attributes: {
                  defer: 'true',
                  'data-domain': SITE_DOMAIN,
                  src: 'https://plausible.io/js/script.js',
                },
              },
              {
                tagName: 'script',
                innerHTML: 'window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }',
              },
            ],
          };
        },
      };
    },
    function latestAnnouncement() {
      return {
        name: 'latest-announcement-client-module',
        getClientModules() {
          return [require.resolve('./src/clientModules/latestPopup.js')];
        },
      };
    },
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'protocol',
        path: 'docs/protocol',
        routeBasePath: 'protocol',
        includeCurrentVersion: true,
        sidebarPath: './sidebars/sidebarProtocol.js',
        sidebarCollapsed: true,
        breadcrumbs: false,
        ...sharedDocOptions,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developer',
        path: 'docs/developer',
        routeBasePath: 'developer',
        sidebarPath: './sidebars/sidebarDeveloper.js',
        sidebarCollapsed: true,
        breadcrumbs: false,
        ...sharedDocOptions,
      },
    ],
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: false,
        generateLLMsFullTxt: true,
        generateMarkdownFiles: true,
        docsDir: 'docs',
        excludeImports: true,
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // --- Directory renames ---
          // curve_dao → curve-dao
          { from: '/developer/curve_dao/crv-token', to: '/developer/curve-dao/crv-token' },
          // voting-escrow/voting-escrow redirect removed: Docusaurus resolves same-name-as-parent docs differently
          { from: '/developer/curve_dao/voting-escrow/admin-controls', to: '/developer/curve-dao/voting-escrow' },
          { from: '/developer/curve_dao/voting-escrow/smartwalletchecker', to: '/developer/curve-dao/voting-escrow' },
          // Merged admin-controls and smart-wallet-checker into voting-escrow
          { from: '/developer/curve-dao/voting-escrow/admin-controls', to: '/developer/curve-dao/voting-escrow' },
          { from: '/developer/curve-dao/voting-escrow/smart-wallet-checker', to: '/developer/curve-dao/voting-escrow' },
          // crvUSD → crvusd (file renames only; pure case-change redirects removed — they
          // conflict on case-insensitive filesystems and should be handled via server config)
          { from: '/developer/crvUSD/monetarypolicy', to: '/developer/crvusd/monetary-policy' },
          { from: '/developer/crvUSD/flashlender', to: '/developer/crvusd/flash-lender' },
          { from: '/developer/crvUSD/priceaggregator', to: '/developer/crvusd/oracles/price-aggregator' },
          { from: '/developer/crvUSD/priceaggregator_old', to: '/developer/crvusd/oracles/price-aggregator-old' },
          // crvUSD subfolder restructure — old flat paths → new subfolder paths
          { from: '/developer/crvusd/oracle', to: '/developer/crvusd/oracles/overview' },
          { from: '/developer/crvusd/price-aggregator', to: '/developer/crvusd/oracles/price-aggregator' },
          { from: '/developer/crvusd/price-aggregator-old', to: '/developer/crvusd/oracles/price-aggregator-old' },
          { from: '/developer/crvusd/crypto-from-pool-vault-w-agg', to: '/developer/crvusd/oracles/crypto-from-pool-vault-w-agg' },
          { from: '/developer/crvusd/crypto-from-pools-rate-w-agg', to: '/developer/crvusd/oracles/crypto-from-pools-rate-w-agg' },
          // monetary-policy/monetary-policy.md resolves to /developer/crvusd/monetary-policy (same-name-as-parent)
          { from: '/developer/crvUSD/factory/factory_full', to: '/developer/crvusd/factory' },
          { from: '/developer/crvusd/factory/overview', to: '/developer/crvusd/factory' },
          { from: '/developer/crvusd/factory/deployer-api', to: '/developer/crvusd/factory' },
          // factory deployer-api merges (updated to amm/ paths)
          { from: '/developer/factory/stableswap-ng/deployer-api', to: '/developer/amm/factory/stableswap-ng/overview' },
          { from: '/developer/factory/twocrypto-ng/deployer-api', to: '/developer/amm/factory/twocrypto-ng/overview' },
          { from: '/developer/factory/tricrypto-ng/deployer-api', to: '/developer/amm/factory/tricrypto-ng/overview' },
          { from: '/developer/crvusd/factory/admin-controls', to: '/developer/crvusd/factory' },
          { from: '/developer/crvUSD/pegkeepers/PegKeeperV1', to: '/developer/crvusd/pegkeepers/peg-keeper-v1' },
          { from: '/developer/crvUSD/pegkeepers/PegKeeperV2', to: '/developer/crvusd/pegkeepers/peg-keeper-v2' },
          { from: '/developer/crvUSD/pegkeepers/PegKeeperRegulator', to: '/developer/crvusd/pegkeepers/peg-keeper-regulator' },
          { from: '/developer/crvUSD/leverage/LeverageZap', to: '/developer/crvusd/leverage/leverage-zap' },
          { from: '/developer/crvUSD/leverage/LeverageZap1inch', to: '/developer/crvusd/leverage/leverage-zap-1inch' },
          { from: '/developer/crvUSD/leverage/LlamaLendOdosLeverageZap', to: '/developer/crvusd/leverage/llamalend-odos-leverage-zap' },
          // scrvusd file renames
          { from: '/developer/scrvusd/RewardsHandler', to: '/developer/scrvusd/rewards-handler' },
          { from: '/developer/scrvusd/StablecoinLens', to: '/developer/scrvusd/stablecoin-lens' },
          { from: '/developer/scrvusd/crosschain/oracle-v0/oracle', to: '/developer/scrvusd/crosschain/oracle-v0' },
          // stableswap-exchange flatten (updated to amm/legacy/ paths)
          { from: '/developer/stableswap-exchange/overview', to: '/developer/amm/legacy/stableswap-overview' },
          { from: '/developer/stableswap-exchange/stableswap/overview', to: '/developer/amm/legacy/stableswap/overview' },
          { from: '/developer/stableswap-exchange/stableswap/pools/overview', to: '/developer/amm/legacy/stableswap/pools/overview' },
          { from: '/developer/stableswap-exchange/stableswap/pools/plain_pools', to: '/developer/amm/legacy/stableswap/pools/plain-pools' },
          { from: '/developer/stableswap-exchange/stableswap/pools/lending_pools', to: '/developer/amm/legacy/stableswap/pools/lending-pools' },
          { from: '/developer/stableswap-exchange/stableswap/pools/metapools', to: '/developer/amm/legacy/stableswap/pools/metapools' },
          { from: '/developer/stableswap-exchange/stableswap/pools/admin_pool_settings', to: '/developer/amm/legacy/stableswap/pools/admin-pool-settings' },
          { from: '/developer/stableswap-exchange/stableswap/lp_tokens/overview', to: '/developer/amm/legacy/stableswap/lp-tokens/overview' },
          { from: '/developer/stableswap-exchange/stableswap/lp_tokens/curve_token_v1', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v1' },
          { from: '/developer/stableswap-exchange/stableswap/lp_tokens/curve_token_v2', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v2' },
          { from: '/developer/stableswap-exchange/stableswap/lp_tokens/curve_token_v3', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v3' },
          { from: '/developer/stableswap-exchange/stableswap/deposit_contracts/overview', to: '/developer/amm/legacy/stableswap/deposit-contracts/overview' },
          { from: '/developer/stableswap-exchange/stableswap/deposit_contracts/lending_pool_deposits', to: '/developer/amm/legacy/stableswap/deposit-contracts/lending-pool-deposits' },
          { from: '/developer/stableswap-exchange/stableswap/deposit_contracts/metapool_deposits', to: '/developer/amm/legacy/stableswap/deposit-contracts/metapool-deposits' },
          { from: '/developer/stableswap-exchange/stableswap/cross_asset_swaps/overview', to: '/developer/amm/legacy/stableswap/cross-asset-swaps/overview' },
          { from: '/developer/stableswap-exchange/stableswap/cross_asset_swaps/synthswap_exchange', to: '/developer/amm/legacy/stableswap/cross-asset-swaps/synthswap-exchange' },
          { from: '/developer/stableswap-exchange/stableswap-ng/overview', to: '/developer/amm/stableswap-ng/overview' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/overview', to: '/developer/amm/stableswap-ng/overview' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/plainpool', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/metapool', to: '/developer/amm/stableswap-ng/pools/metapool' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/oracles', to: '/developer/amm/stableswap-ng/pools/oracles' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/admin_controls', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          { from: '/developer/stableswap-exchange/stableswap-ng/pools/lp_token', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          // Merged pages redirects (updated to amm/ paths)
          { from: '/developer/stableswap-ng/pools/overview', to: '/developer/amm/stableswap-ng/overview' },
          { from: '/developer/stableswap-ng/pools/admin-controls', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          { from: '/developer/stableswap-ng/pools/lp-token', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          { from: '/developer/stableswap-exchange/stableswap-ng/utility_contracts/views', to: '/developer/amm/stableswap-ng/utility-contracts/views' },
          { from: '/developer/stableswap-exchange/stableswap-ng/utility_contracts/math', to: '/developer/amm/stableswap-ng/utility-contracts/math' },
          { from: '/developer/stableswap-exchange/stableswap-ng/implementations/custom1', to: '/developer/amm/stableswap-ng/implementations/custom1' },
          // cryptoswap-exchange flatten (updated to amm/ paths)
          { from: '/developer/cryptoswap-exchange/overview', to: '/developer/amm/legacy/cryptoswap-overview' },
          { from: '/developer/cryptoswap-exchange/cryptoswap/pools/crypto-pool', to: '/developer/amm/legacy/cryptoswap/pools/crypto-pool' },
          { from: '/developer/cryptoswap-exchange/cryptoswap/pools/admin-controls', to: '/developer/amm/legacy/cryptoswap/pools/admin-controls' },
          { from: '/developer/cryptoswap-exchange/cryptoswap/lp_tokens/overview', to: '/developer/amm/legacy/cryptoswap/lp-tokens/overview' },
          { from: '/developer/cryptoswap-exchange/cryptoswap/lp_tokens/lp-token-V5', to: '/developer/amm/legacy/cryptoswap/lp-tokens/lp-token-v5' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/overview', to: '/developer/amm/twocrypto-ng/overview' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/pools/overview', to: '/developer/amm/twocrypto-ng/overview' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/pools/twocrypto', to: '/developer/amm/twocrypto-ng/pools/twocrypto' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/pools/oracles', to: '/developer/amm/twocrypto-ng/pools/oracles' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/pools/admin-controls', to: '/developer/amm/twocrypto-ng/pools/twocrypto' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/utility-contracts/views', to: '/developer/amm/twocrypto-ng/utility-contracts/views' },
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/utility-contracts/math', to: '/developer/amm/twocrypto-ng/utility-contracts/math' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/overview', to: '/developer/amm/tricrypto-ng/overview' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/pools/tricrypto', to: '/developer/amm/tricrypto-ng/pools/tricrypto' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/pools/oracles', to: '/developer/amm/tricrypto-ng/pools/oracles' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/pools/admin-controls', to: '/developer/amm/tricrypto-ng/pools/tricrypto' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/utility-contracts/views', to: '/developer/amm/tricrypto-ng/utility-contracts/views' },
          { from: '/developer/cryptoswap-exchange/tricrypto-ng/utility-contracts/math', to: '/developer/amm/tricrypto-ng/utility-contracts/math' },
          // liquidity-gauges-and-minting-crv → gauges
          { from: '/developer/liquidity-gauges-and-minting-crv/overview', to: '/developer/gauges/overview' },
          { from: '/developer/liquidity-gauges-and-minting-crv/gauges/overview', to: '/developer/gauges/gauges/overview' },
          { from: '/developer/liquidity-gauges-and-minting-crv/gauges/LiquidityGaugeV6', to: '/developer/gauges/gauges/liquidity-gauge-v6' },
          { from: '/developer/gauges/gauge-controller/gauge-controller', to: '/developer/gauges/gauge-controller' },
          { from: '/developer/gauges/minter/minter', to: '/developer/gauges/minter' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/overview', to: '/developer/gauges/xchain-gauges/overview' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/RootGauge', to: '/developer/gauges/xchain-gauges/root-gauge' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/RootGaugeFactory', to: '/developer/gauges/xchain-gauges/root-gauge-factory' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/ChildGauge', to: '/developer/gauges/xchain-gauges/child-gauge' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/ChildGaugeFactory', to: '/developer/gauges/xchain-gauges/child-gauge-factory' },
          { from: '/developer/liquidity-gauges-and-minting-crv/xchain-gauges/Bridgers', to: '/developer/gauges/xchain-gauges/bridgers' },
          { from: '/developer/liquidity-gauges-and-minting-crv/boosting-sidechains/L2VotingEscrowOracle', to: '/developer/curve-dao/voting-escrow/crosschain/vecrv-oracle' },
          { from: '/developer/gauges/boosting-sidechains/l2-voting-escrow-oracle', to: '/developer/curve-dao/voting-escrow/crosschain/vecrv-oracle' },
          { from: '/developer/liquidity-gauges-and-minting-crv/boosting-sidechains/Updater', to: '/developer/gauges/boosting-sidechains/updater' },
          // curve-api → integration/api
          { from: '/developer/curve-api/curve-api', to: '/developer/integration/api/curve-api' },
          { from: '/developer/curve-api/curve-prices', to: '/developer/integration/api/curve-prices' },
          // fees file renames
          { from: '/developer/fees/FeeCollector', to: '/developer/fees/fee-collector' },
          { from: '/developer/fees/FeeDistributor', to: '/developer/fees/fee-distributor' },
          { from: '/developer/fees/FeeSplitter', to: '/developer/fees/fee-splitter' },
          { from: '/developer/fees/CowSwapBurner', to: '/developer/fees/cow-swap-burner' },
          // Hooker → hooker removed: case-only change conflicts on case-insensitive filesystems
          // router file renames (updated to amm/ paths)
          { from: '/developer/router/CurveRouterNG', to: '/developer/amm/router/curve-router-ng' },
          { from: '/developer/router/CurveRegistryExchange', to: '/developer/amm/router/curve-registry-exchange' },
          // registry file renames
          { from: '/developer/registry/MetaRegistryAPI', to: '/developer/integration/meta-registry' },
          // integration file renames
          { from: '/developer/integration/metaregistry', to: '/developer/integration/meta-registry' },
          // governance file renames
          { from: '/developer/governance/curve-dao', to: '/developer/curve-dao/governance/voting-library' },
          // lending file renames
          { from: '/developer/lending/contracts/cryptofrompool', to: '/developer/lending/contracts/crypto-from-pool' },
          { from: '/developer/lending/contracts/cryptofrompoolvault', to: '/developer/lending/contracts/crypto-from-pool-vault' },
          { from: '/developer/lending/contracts/cryptofrompoolsrate', to: '/developer/lending/contracts/crypto-from-pools-rate' },
          // deployments consolidation — 8 subcategory pages + legacy page → single page
          { from: '/developer/deployments/contract-deployments', to: '/developer/deployments' },
          { from: '/developer/deployments/amm', to: '/developer/deployments' },
          { from: '/developer/deployments/crvusd', to: '/developer/deployments' },
          { from: '/developer/deployments/lending', to: '/developer/deployments' },
          { from: '/developer/deployments/dao', to: '/developer/deployments' },
          { from: '/developer/deployments/integration', to: '/developer/deployments' },
          { from: '/developer/deployments/crosschain', to: '/developer/deployments' },
          { from: '/developer/deployments/router-zaps', to: '/developer/deployments' },
          { from: '/developer/references/deployed-contracts', to: '/developer/deployments' },
          // audits page merged into security
          { from: '/developer/references/audits', to: '/developer/security/' },
          // cryptoswap in-depth redirect (updated to amm/ path)
          { from: '/developer/cryptoswap-exchange/in-depth', to: '/developer/amm/cryptoswap-in-depth' },
          // block-oracle redirects (new section, old mkdocs paths)
          { from: '/developer/block-oracle/BlockOracle', to: '/developer/block-oracle/' },
          { from: '/developer/block-oracle/HeaderVerifier', to: '/developer/block-oracle/header-verifier' },
          { from: '/developer/block-oracle/LZBlockRelay', to: '/developer/block-oracle/lz-block-relay' },
          { from: '/developer/block-oracle/MainnetBlockView', to: '/developer/block-oracle/mainnet-block-view' },
          // fast-bridge redirects (new section, old mkdocs paths)
          { from: '/developer/fast-bridge/FastBridgeL2', to: '/developer/fast-bridge/fast-bridge-l2' },
          { from: '/developer/fast-bridge/FastBridgeVault', to: '/developer/fast-bridge/fast-bridge-vault' },
          { from: '/developer/fast-bridge/L2MessengerLZ', to: '/developer/fast-bridge/l2-messenger-lz' },
          { from: '/developer/fast-bridge/VaultMessengerLZ', to: '/developer/fast-bridge/vault-messenger-lz' },
          // veCRV crosschain redirects
          { from: '/developer/curve_dao/voting-escrow/crosschain/vecrv-delegation', to: '/developer/curve-dao/voting-escrow/crosschain/vecrv-delegation' },
          { from: '/developer/curve_dao/voting-escrow/crosschain/vecrv-oracle', to: '/developer/curve-dao/voting-escrow/crosschain/vecrv-oracle' },
          { from: '/developer/curve_dao/voting-escrow/crosschain/vecrv-verifiers', to: '/developer/curve-dao/voting-escrow/crosschain/vecrv-verifiers' },
          // Merged twocrypto-ng/tricrypto-ng pages (updated to amm/ paths)
          { from: '/developer/twocrypto-ng/pools/overview', to: '/developer/amm/twocrypto-ng/overview' },
          { from: '/developer/twocrypto-ng/pools/admin-controls', to: '/developer/amm/twocrypto-ng/pools/twocrypto' },
          { from: '/developer/tricrypto-ng/pools/admin-controls', to: '/developer/amm/tricrypto-ng/pools/tricrypto' },
          // twocrypto-ng FXSwap (formerly refuel) redirects (updated to amm/ paths)
          { from: '/developer/cryptoswap-exchange/twocrypto-ng/implementations/refuel', to: '/developer/amm/twocrypto-ng/implementations/fxswap' },
          { from: '/developer/twocrypto-ng/implementations/refuel', to: '/developer/amm/twocrypto-ng/implementations/fxswap' },
          // --- AMM restructure: old top-level paths → new amm/ paths ---
          // Top-level overviews
          { from: '/developer/curve-amm-overview', to: '/developer/amm/curve-amm-overview' },
          { from: '/developer/cryptoswap-in-depth', to: '/developer/amm/cryptoswap-in-depth' },
          { from: '/developer/stableswap-overview', to: '/developer/amm/legacy/stableswap-overview' },
          { from: '/developer/cryptoswap-overview', to: '/developer/amm/legacy/cryptoswap-overview' },
          // Stableswap-NG
          { from: '/developer/stableswap-ng/overview', to: '/developer/amm/stableswap-ng/overview' },
          { from: '/developer/stableswap-ng/pools/plainpool', to: '/developer/amm/stableswap-ng/pools/plainpool' },
          { from: '/developer/stableswap-ng/pools/metapool', to: '/developer/amm/stableswap-ng/pools/metapool' },
          { from: '/developer/stableswap-ng/pools/oracles', to: '/developer/amm/stableswap-ng/pools/oracles' },
          { from: '/developer/stableswap-ng/utility-contracts/views', to: '/developer/amm/stableswap-ng/utility-contracts/views' },
          { from: '/developer/stableswap-ng/utility-contracts/math', to: '/developer/amm/stableswap-ng/utility-contracts/math' },
          { from: '/developer/stableswap-ng/implementations/custom1', to: '/developer/amm/stableswap-ng/implementations/custom1' },
          // Twocrypto-NG
          { from: '/developer/twocrypto-ng/overview', to: '/developer/amm/twocrypto-ng/overview' },
          { from: '/developer/twocrypto-ng/pools/twocrypto', to: '/developer/amm/twocrypto-ng/pools/twocrypto' },
          { from: '/developer/twocrypto-ng/pools/oracles', to: '/developer/amm/twocrypto-ng/pools/oracles' },
          { from: '/developer/twocrypto-ng/utility-contracts/views', to: '/developer/amm/twocrypto-ng/utility-contracts/views' },
          { from: '/developer/twocrypto-ng/utility-contracts/math', to: '/developer/amm/twocrypto-ng/utility-contracts/math' },
          { from: '/developer/twocrypto-ng/implementations/fxswap', to: '/developer/amm/twocrypto-ng/implementations/fxswap' },
          // Tricrypto-NG
          { from: '/developer/tricrypto-ng/overview', to: '/developer/amm/tricrypto-ng/overview' },
          { from: '/developer/tricrypto-ng/pools/tricrypto', to: '/developer/amm/tricrypto-ng/pools/tricrypto' },
          { from: '/developer/tricrypto-ng/pools/oracles', to: '/developer/amm/tricrypto-ng/pools/oracles' },
          { from: '/developer/tricrypto-ng/utility-contracts/views', to: '/developer/amm/tricrypto-ng/utility-contracts/views' },
          { from: '/developer/tricrypto-ng/utility-contracts/math', to: '/developer/amm/tricrypto-ng/utility-contracts/math' },
          // NG Factory
          { from: '/developer/factory/overview', to: '/developer/amm/factory/overview' },
          { from: '/developer/factory/stableswap-ng/overview', to: '/developer/amm/factory/stableswap-ng/overview' },
          { from: '/developer/factory/twocrypto-ng/overview', to: '/developer/amm/factory/twocrypto-ng/overview' },
          { from: '/developer/factory/tricrypto-ng/overview', to: '/developer/amm/factory/tricrypto-ng/overview' },
          // Router
          { from: '/developer/router/curve-router-ng', to: '/developer/amm/router/curve-router-ng' },
          { from: '/developer/router/curve-registry-exchange', to: '/developer/amm/router/curve-registry-exchange' },
          // Legacy Stableswap
          { from: '/developer/stableswap/overview', to: '/developer/amm/legacy/stableswap/overview' },
          { from: '/developer/stableswap/pools/overview', to: '/developer/amm/legacy/stableswap/pools/overview' },
          { from: '/developer/stableswap/pools/plain-pools', to: '/developer/amm/legacy/stableswap/pools/plain-pools' },
          { from: '/developer/stableswap/pools/lending-pools', to: '/developer/amm/legacy/stableswap/pools/lending-pools' },
          { from: '/developer/stableswap/pools/metapools', to: '/developer/amm/legacy/stableswap/pools/metapools' },
          { from: '/developer/stableswap/pools/admin-pool-settings', to: '/developer/amm/legacy/stableswap/pools/admin-pool-settings' },
          { from: '/developer/stableswap/lp-tokens/overview', to: '/developer/amm/legacy/stableswap/lp-tokens/overview' },
          { from: '/developer/stableswap/lp-tokens/curve-token-v1', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v1' },
          { from: '/developer/stableswap/lp-tokens/curve-token-v2', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v2' },
          { from: '/developer/stableswap/lp-tokens/curve-token-v3', to: '/developer/amm/legacy/stableswap/lp-tokens/curve-token-v3' },
          { from: '/developer/stableswap/deposit-contracts/overview', to: '/developer/amm/legacy/stableswap/deposit-contracts/overview' },
          { from: '/developer/stableswap/deposit-contracts/lending-pool-deposits', to: '/developer/amm/legacy/stableswap/deposit-contracts/lending-pool-deposits' },
          { from: '/developer/stableswap/deposit-contracts/metapool-deposits', to: '/developer/amm/legacy/stableswap/deposit-contracts/metapool-deposits' },
          { from: '/developer/stableswap/cross-asset-swaps/overview', to: '/developer/amm/legacy/stableswap/cross-asset-swaps/overview' },
          { from: '/developer/stableswap/cross-asset-swaps/synthswap-exchange', to: '/developer/amm/legacy/stableswap/cross-asset-swaps/synthswap-exchange' },
          // Legacy CryptoSwap
          { from: '/developer/cryptoswap/pools/crypto-pool', to: '/developer/amm/legacy/cryptoswap/pools/crypto-pool' },
          { from: '/developer/cryptoswap/pools/admin-controls', to: '/developer/amm/legacy/cryptoswap/pools/admin-controls' },
          { from: '/developer/cryptoswap/lp-tokens/overview', to: '/developer/amm/legacy/cryptoswap/lp-tokens/overview' },
          { from: '/developer/cryptoswap/lp-tokens/lp-token-v5', to: '/developer/amm/legacy/cryptoswap/lp-tokens/lp-token-v5' },
          // --- Directory cleanup: governance/ → curve-dao/governance/ ---
          { from: '/developer/governance/overview', to: '/developer/curve-dao/governance/overview' },
          { from: '/developer/governance/voting-library', to: '/developer/curve-dao/governance/voting-library' },
          { from: '/developer/governance/x-gov/overview', to: '/developer/curve-dao/governance/x-gov/overview' },
          { from: '/developer/governance/x-gov/broadcaster', to: '/developer/curve-dao/governance/x-gov/broadcaster' },
          { from: '/developer/governance/x-gov/relayer', to: '/developer/curve-dao/governance/x-gov/relayer' },
          { from: '/developer/governance/x-gov/agents', to: '/developer/curve-dao/governance/x-gov/agents' },
          { from: '/developer/governance/x-gov/vault', to: '/developer/curve-dao/governance/x-gov/vault' },
          // --- Directory cleanup: registry/ → integration/registry/, api/ → integration/api/ ---
          { from: '/developer/registry/overview', to: '/developer/integration/overview' },
          { from: '/developer/registry/meta-registry-api', to: '/developer/integration/meta-registry' },
          { from: '/developer/api/curve-api', to: '/developer/integration/api/curve-api' },
          { from: '/developer/api/curve-prices', to: '/developer/integration/api/curve-prices' },
          // --- Directory cleanup: references/ → resources/ ---
          { from: '/developer/references/whitepaper', to: '/developer/resources/whitepaper' },
          { from: '/developer/references/derivations', to: '/developer/resources/derivations' },
          { from: '/developer/references/notebooks', to: '/developer/resources/notebooks' },
          { from: '/developer/references/curve-practices', to: '/developer/resources/curve-practices' },
          { from: '/developer/references/useful', to: '/developer/resources/useful' },
          // Legacy Factory
          { from: '/developer/factory/stableswap/overview', to: '/developer/amm/legacy/factory/stableswap/overview' },
          { from: '/developer/factory/stableswap/deployer-api', to: '/developer/amm/legacy/factory/stableswap/deployer-api' },
          { from: '/developer/factory/stableswap/implementations', to: '/developer/amm/legacy/factory/stableswap/implementations' },
          { from: '/developer/factory/cryptoswap/overview', to: '/developer/amm/legacy/factory/cryptoswap/overview' },
          { from: '/developer/factory/cryptoswap/deployer-api', to: '/developer/amm/legacy/factory/cryptoswap/deployer-api' },
          { from: '/developer/factory/cryptoswap/implementations', to: '/developer/amm/legacy/factory/cryptoswap/implementations' },
        ],
      },
    ],
  ],

  scripts: [
    {
      src: '/js/chad-theme.js',
      async: false,
    },
  ],

  stylesheets: [
    {
      href: '/katex/katex.min.css',
      type: 'text/css',
    },
    {
      href: '/fonts/fonts.css',
      type: 'text/css',
    },
  ],
};

export default config;
