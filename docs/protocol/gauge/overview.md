---
id: overview
title: Gauges & Incentives Overview
sidebar_label: Overview
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

:::info
Before diving in, make sure to fully understand how CRV inflation based on gauge weights works. 

Learn more here: [Gauge Weights](/user/dao/gauge-weights).
:::

A **gauge** is a smart contract that distributes rewards to liquidity providers (LPs) in Curve pools or lending vaults. Pools and lending vaults work perfectly fine without having a gauge; it's simply an additional contract on top that measures the provided liquidity of users.

When rewards (such as CRV emissions or direct gauge rewards) are *active* on a gauge, **users must stake their LP or vault tokens into the gauge contract** to be eligible for those rewards.

Protocols and asset issuers can use gauges to grow liquidity — by offering incentives to LPs through **CRV emissions**, **direct gauge rewards**, or both.

To get started quickly, check these out:

<GuideCardGrid guideKeys={['HowToGetAGauge', 'IncentivizingAPool']} />

## Why Use a Gauge?

Gauges enable protocols to reward users for providing liquidity in Curve pools — either with **CRV emissions**, **direct gauge rewards**, or both. These incentives create a yield opportunity for LPs, which in turn attracts deposits. The more rewards a pool offers, the more attractive it becomes to liquidity providers. As more users deposit into the pool to earn yield, the total value locked (TVL) increases. Higher TVL leads to deeper liquidity, reduced slippage, and a better trading experience for the token — ultimately making it more usable and integrated across DeFi.

Gauges also align incentives between protocols, LPs, and Curve governance:

- **Protocols** benefit from deep liquidity
- **LPs** earn yield from CRV and/or direct gauge rewards
- **veCRV holders** can vote on gauge weights and are (partly) incentivized through vote incentives

## Types of Rewards Through a Gauge

For every route and when it fits, see [Incentivizing a Pool](./incentive-routes.md).

### CRV Emissions (Gauge Weight Voting)

- Distributed weekly from Curve DAO’s CRV inflation schedule
- Allocated based on veCRV **gauge weight voting**
- Requires DAO approval to whitelist the gauge

### Direct Gauge Rewards

- Rewards are standard ERC-20 tokens, at most 8 per gauge, and a token can't be removed once added (rebasing tokens lose their rebases inside the gauge)
- Useful to bootstrap liquidity or reward LPs using the protocol's own token
- Requires no governance or approval

## Deploying Gauges and Receiving CRV Emissions

Deploying a gauge is fully permissionless — **anyone can create a gauge** for a Curve pool or lending vaults. Once deployed, the gauge can immediately begin distributing **direct gauge rewards**, such as your project’s native token or other ERC-20 rewards.

However, if a gauge should be eligible to receive **CRV emissions**, it must first be **approved and whitelisted by the Curve DAO** through a governance vote. Only DAO-approved gauges are eligible to receive a share of Curve's weekly CRV inflation — and emissions are not fixed: they are determined by [veCRV gauge weight voting](/user/dao/gauge-weights), which takes place on a weekly basis. A gauge on another chain gets CRV through a root gauge on Ethereum, which is what the DAO whitelists and veCRV votes on. See [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s).

> - Gauges can always and instantly after deployment distribute direct gauge rewards.
> - CRV emissions (via gauge weights) require DAO approval **and** veCRV weight. More here: [Gauge Weights](/user/dao/gauge-weights).
