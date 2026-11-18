---
id: chains
title: Curve for Chains and L2s
sidebar_label: Chains & L2s
description: How chain and L2 teams bring Curve to their network with Curve Lite, which deploys Stableswap and Cryptoswap pool factories, a router, gauges and Curve DAO ownership, and how CRV emissions reach the chain.
---

Give your chain Curve's stable and volatile swapping from day one with Curve Lite. It takes a chain that meets the curve-core requirements and a conversation with the Curve team before you deploy.

The deployment is owned by the Curve DAO, and its gauges (the contracts that pay incentives to liquidity providers, or LPs) can receive CRV emissions once a Curve DAO vote whitelists them.

## What Curve Lite Deploys

Curve Lite deploys the Stableswap-NG, Twocrypto-NG and Tricrypto-NG pool factories. Anyone on your chain can then deploy pools for stable or volatile assets.

A router handles trades across several pools. Zaps let users deposit and stake in one transaction, and registries list every pool.

The Curve DAO governs the deployment from Ethereum through a cross-chain agent and relayer, and pool fees go to a Curve DAO fee receiver.

Gauges pay direct rewards in tokens that issuers choose. They can also receive CRV emissions after a DAO vote whitelists them. That CRV arrives through a root gauge on Ethereum, about a week after it is allocated. See [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s).

Your network, its pools and swaps appear in the Curve app.

The deployment scripts are open source in [curvefi/curve-core](https://github.com/curvefi/curve-core). Llamalend is not part of Curve Lite and runs on Ethereum and Optimism.

## What Projects on Your Chain Get

Anyone on your chain can deploy pools on the same terms, with no listing approval. Traders get low-slippage swaps (little price movement per trade) for pegged assets (tokens that track a reference price, such as $1), and LPs earn fees without managing ranges.

## How to Bring Curve to Your Chain

Contact the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85) before you deploy. This keeps the deployment under Curve DAO governance and gets it listed in the app.

A Curve Lite deployment needs:

- an EVM chain with Multicall3 deployed;
- a wrapped native token;
- CRV and crvUSD bridged to the chain through native bridges;
- an OP Stack, Arbitrum Orbit, Polygon CDK, Taiko or non-rollup chain. zkSync-based chains are not fully supported.

The [curve-core README](https://github.com/curvefi/curve-core) has the full requirements. On HyperEVM, deploying pools and gauges requires large blocks; see [Enabling Big Blocks on HyperEVM](../pool/guides/enable-big-blocks-hyperevm.md).

## Case Studies

- [Taiko Launches Curve-Lite](https://news.curve.finance/curve-taiko-launch/)
- [Curve-Lite Now Available on Corn](https://news.curve.finance/curve-lite-now-available-on-corn/)
- [Curve Launches on Sonic](https://news.curve.finance/curve-sonic-launch/)
- [Curve Live on Hyperliquid](https://news.curve.finance/curve-live-on-hyperliquid/)

[Why Curve](../why-curve.md#chains) shows every chain Curve runs on.

## FAQ

### What is Curve Lite?

A Curve deployment for new chains with the core pool factories, a router, registries and gauges, owned by the Curve DAO.

### Who owns a Curve Lite deployment?

The Curve DAO, which governs it from Ethereum through a cross-chain agent and relayer.

### Can pools on my chain receive CRV emissions?

Yes, once a DAO vote whitelists their gauges. Each gauge then receives CRV in proportion to its gauge weight votes from veCRV (CRV locked for voting power).

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Timeline](../launch-playbook.md)
- [curvefi/curve-core](https://github.com/curvefi/curve-core)
- [Supported Chains & Assets](/user/cross-chain/supported-chains)
- [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s)
