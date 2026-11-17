---
id: chains
title: Curve for Chains and L2s
sidebar_label: Chains & L2s
description: How chain and L2 teams bring Curve to their network with Curve Lite, which deploys Stableswap and Cryptoswap pool factories, a router, gauges and Curve DAO ownership, and how CRV emissions reach the chain.
---

Chain and L2 teams use Curve Lite to give their network stable and volatile swapping from day one. The deployment is owned by the Curve DAO, and its gauges can receive CRV emissions once the DAO adds them by vote.

## What Curve Lite Deploys

Curve Lite deploys the Stableswap-NG, Twocrypto-NG and Tricrypto-NG pool factories. Anyone on your chain can then create pools for stable or volatile assets.

A router handles trades across several pools. Zaps let users deposit and stake in one transaction, and registries list every pool.

The Curve DAO governs the deployment from Ethereum through a cross-chain agent and relayer, and pool fees go to a Curve DAO vault.

Gauges pay rewards in tokens that projects choose. They can also receive CRV emissions after the Curve DAO adds them by vote. That CRV arrives through a root gauge on Ethereum, about a week after it is allocated. See [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s).

Your network, its pools and swaps appear in the Curve app.

The deployment scripts are open source in [curvefi/curve-core](https://github.com/curvefi/curve-core). Llamalend is not part of Curve Lite and runs on Ethereum and Optimism.

## What Your Ecosystem Gets

Every project on your chain can deploy pools on the same terms, with no listing approval. Traders get low-slippage swaps for pegged assets, and liquidity providers earn fees without managing ranges.

## How to Bring Curve to Your Chain

Contact the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85) before you deploy. This keeps the deployment under Curve DAO governance and gets it listed in the app.

A Curve Lite deployment needs:

- an EVM chain with Multicall3 deployed;
- a wrapped native token;
- CRV and crvUSD bridged to the chain through native bridges;
- an OP Stack, Arbitrum Orbit, Polygon CDK, Taiko or non-rollup chain. zkSync-based chains are not fully supported.

## Case Studies

As of 17 November 2026, Curve's API lists Curve Lite deployments on Sonic, Taiko, Unichain, Ink and HyperEVM, among others. [Why Curve](../why-curve.md#which-chains-does-curve-run-on) shows the full list.

On HyperEVM, deploying pools and gauges requires large blocks. See [Enabling Big Blocks on HyperEVM](../pool/guides/enable-big-blocks-hyperevm.md).

## FAQ

### What is Curve Lite?

A Curve deployment for new chains with the core pool factories, a router, registries and gauges, owned by the Curve DAO.

### Who owns a Curve Lite deployment?

The Curve DAO, which governs it from Ethereum through a cross-chain agent and relayer.

### Can pools on my chain receive CRV emissions?

Yes, once the Curve DAO adds their gauges by vote. Each gauge then receives CRV in proportion to its veCRV gauge weight votes.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [curvefi/curve-core](https://github.com/curvefi/curve-core)
- [Supported Chains & Assets](/user/cross-chain/supported-chains)
- [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s)
