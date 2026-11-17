---
id: chains
title: Curve for Chains and L2s
sidebar_label: Chains & L2s
description: How chain and L2 teams bring Curve to their network, from Curve Lite with Stableswap and Cryptoswap pool factories, a router and DAO ownership on day one, to full deployments with CRV emissions and Llamalend.
---

Curve gives a new chain or L2 production-grade swapping from day one. Curve Lite deploys Curve's core DEX contracts on your network under Curve DAO ownership, and full deployments add CRV emissions and, on selected networks, Llamalend lending.

## What You Get

- **A DEX for stable and volatile assets.** Curve Lite deploys the Stableswap-NG, Twocrypto-NG and Tricrypto-NG pool factories, so anyone on your chain can create pools.
- **Routing and helpers.** A router for multi-pool trades, zaps for depositing and staking in one transaction, and registries that list every pool.
- **Curve DAO ownership.** Your deployment is governed from Ethereum by the Curve DAO through a cross-chain agent and relayer, and pool fees go to a Curve DAO vault.
- **Gauges for incentives.** Curve Lite includes gauges that pay rewards in tokens that projects choose.
- **Frontend support.** Your network, its pools and swaps appear in the Curve app.
- **A neutral venue for your ecosystem.** Every project on your chain can deploy pools on the same terms, with no listing approval.

## What Your Users Get

- **Projects** on your chain can launch stablecoin, LST and token liquidity on day one.
- **Traders** get low-slippage swaps for pegged assets and liquidity for volatile pairs.
- **Liquidity providers** earn fees without managing ranges.

## Curve Lite and Full Deployments

| | Curve Lite | Full deployment |
| --- | --- | --- |
| Stableswap and Cryptoswap pool factories | Yes | Yes |
| Router, zaps and registries | Yes | Yes |
| Curve DAO ownership and fee collection | Yes | Yes |
| Gauges with your own rewards | Yes | Yes |
| CRV emissions | Ask the Curve team | Yes, after a DAO whitelisting vote, through a root gauge on Ethereum |
| Llamalend lending | No | On selected networks |

CRV for a gauge on another chain comes through a root gauge on Ethereum, about a week after the vote. See [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s).

## Case Studies

As of 17 November 2026, Curve's API lists Curve Lite deployments on networks including Sonic, Taiko, Unichain, Ink and HyperEVM. See the full list in [Why Curve](../why-curve.md#curves-chain-presence).

On HyperEVM, deploying pools and gauges needs large blocks. See [Enabling Big Blocks on HyperEVM](../pool/guides/enable-big-blocks-hyperevm.md).

## Requirements and Limits

The Curve Lite deployment scripts are open source in [curvefi/curve-core](https://github.com/curvefi/curve-core). A deployment needs:

- an EVM chain with Multicall3 deployed;
- a wrapped native token;
- CRV and crvUSD bridged to the chain through native bridges;
- a supported chain type: OP Stack, Arbitrum Orbit, Polygon CDK, Taiko or a non-rollup chain. zkSync-based chains are not fully supported.

Contact the Curve team before you deploy, so the deployment can be governed by the DAO and listed in the Curve app.

## FAQ

**What is Curve Lite?**
A minimal Curve deployment with the core pool factories, a router, registries, gauges and Curve DAO ownership, built for new chains.

**Who owns a Curve Lite deployment?**
The Curve DAO, which governs it from Ethereum through a cross-chain agent and relayer.

**Can pools on my chain receive CRV emissions?**
On full deployments, yes, after a DAO whitelisting vote and through veCRV gauge weight votes. For Curve Lite, ask the Curve team.

## Next Steps

- Read the [curve-core repository](https://github.com/curvefi/curve-core).
- See which networks Curve runs on in [Supported Chains & Assets](/user/cross-chain/supported-chains).
- Contact the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
