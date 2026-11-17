---
id: overview
title: Curve Use Cases by Builder Type
sidebar_label: Use Cases
description: Where stablecoin, LST, wrapped BTC, RWA and project token issuers, DeFi protocols, DAO treasuries, chains and integrators start in the Curve docs.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

Pick the card that matches what you are building. Stablecoins, RWAs and chains have their own pages because their setup differs. The other cards lead straight to the job you will do.

<GuideCardGrid guideKeys={['StartStablecoinIssuers', 'StartLstBtcIssuers', 'StartRwaIssuers', 'StartTokenProjects', 'StartDefiProtocols', 'StartChains', 'StartIntegrators']} />

| You are | Start with | Then |
| --- | --- | --- |
| Stablecoin issuer, including yield-bearing and FX stablecoins | [Curve for Stablecoin Issuers](./stablecoin-issuers.md) | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| LST, LRT or wrapped BTC issuer | [Pool Types](../pool/overview.md), Stableswap with the oracle or rebasing asset type | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| RWA or tokenized-asset issuer | [Curve for RWA Issuers](./rwa-issuers.md) | [Whitelisting a Gauge](../gauge/whitelisting-gauge.md) for token requirements |
| Project or governance token team | [Deploy a Cryptoswap Pool](../pool/guides/deploy-cryptoswap.md) | [Incentivizing a Curve Pool](../gauge/incentive-routes.md) |
| DeFi protocol | [Integrate With Curve](../integrate/overview.md) | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) for your LP or token |
| DAO treasury or incentive buyer | [Incentivizing a Curve Pool](../gauge/incentive-routes.md) | [Getting CRV Emissions](../gauge/guides/getting-crv-emissions.md) |
| Chain or L2 team | [Curve for Chains and L2s](./chains.md) | [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s) |
| Aggregator, wallet or data provider | [Integrate With Curve](../integrate/overview.md) | [Curve Prices API](../api/curve-prices.md) |

Keepers, liquidators and risk reviewers also work with Curve. Liquidators and arbitrageurs keep Llamalend markets solvent, anyone can execute due FXSwap refuel streams for a bounty, and risk reviewers such as SwissStake help teams prepare lending market parameters.
