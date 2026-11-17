---
id: overview
title: Integrate With Curve
sidebar_label: Integrate
description: How DeFi protocols, aggregators, wallets and data providers integrate Curve pools, LP tokens, price oracles, Llamalend vaults and APIs, with links into the developer reference.
---

Curve's pools, LP tokens, price oracles and Llamalend markets are open contracts. Protocols, aggregators, wallets and data providers can build on them without permission. This page lists what you can integrate and where the developer reference covers it.

## What You Can Build On

Every Curve LP position is a plain ERC-20 token with a defined value. A protocol can hold it, wrap it, lend against it or accept it as collateral. LP tokens of 2-coin Stableswap-NG pools can also be collateral in a [Llamalend](../lending/launch-isolated-lending-market.md) market.

Every pool records an EMA price oracle onchain. crvUSD and Llamalend use Curve pool oracles, and your contracts can read them. Read the EMA, never a pool's balances or a withdrawal simulation, which can be manipulated within one transaction.

Llamalend lender positions are ERC-4626 vault shares. Borrowing goes through each market's Controller.

crvUSD is Curve's stablecoin, governed by the Curve DAO. It is the borrowed asset in the live Llamalend markets on Ethereum.


## Case Studies

- [Resupply: A Curve Ecosystem Success Story](https://news.curve.finance/resupply-success-story/)
- [YieldBasis on Curve: What's Happened So Far](https://news.curve.finance/yieldbasis-on-curve-whats-happened-so-far/)

## Quickstarts

- [Read pool and lending market data](./quickstart-prices-api.md) from the Curve Prices API.
- [Deploy a Stableswap pool and its gauge](./quickstart-deploy-pool.md) from code.
- [Deposit into a Llamalend vault](./quickstart-lend.md) from code.

## Where to Start

| You want to | Start here |
| --- | --- |
| Find every Curve contract on a chain | [Address Provider](/developer/integration/address-provider) |
| List pools and their coins | [Meta Registry](/developer/integration/meta-registry) |
| Route trades across pools | [Router NG](/developer/amm/router/curve-router-ng) |
| Integrate a specific pool type | [Integration overview](/developer/integration/overview) |
| Integrate Llamalend vaults and loans | [Llamalend integration guide](/developer/llamalend-v2/integration-guide) |
| Read onchain prices | [Pool oracles](../pool/understanding-stableswap.md#oracles) |
| Look up contract addresses | [Deployments](/developer/deployments) |

## APIs

The [Curve Prices API](../api/curve-prices.md) serves data on pools, lending markets, tokens and chains, including TVL, volume and rates.

The [Curve API](../api/curve-api.md) at `api.curve.finance` serves pool lists and pool data. Use the Prices API for new integrations.

## Related

- [Use Cases](../use-cases/overview.md)
- [Developer documentation](/developer/documentation-overview)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
