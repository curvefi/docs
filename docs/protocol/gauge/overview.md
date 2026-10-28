---
id: overview
title: Gauges & Incentives Overview
sidebar_label: Overview
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

A **gauge** is a contract that pays rewards to LPs who stake their LP or vault tokens in it. A pool or lending vault works without one. LPs who don't stake in the gauge earn trading fees or interest, but not the gauge's rewards.

Rewards reach a gauge in two ways:

- **CRV emissions:** a share of Curve's weekly CRV inflation, set by veCRV [gauge weight](/user/dao/gauge-weights) votes. The gauge must first be whitelisted by the Curve DAO.
- **Direct gauge rewards:** tokens you deposit into the gauge yourself. No vote is needed.

For every way to fund LP yield, including vote incentives and Merkl, and when each fits, see [Incentivizing a Pool](./incentive-routes.md).

<GuideCardGrid guideKeys={['IncentivizingAPool', 'HowToGetAGauge']} />

## Why Use a Gauge

Rewards give LPs a reason to deposit. More liquidity means lower slippage for anyone trading your token.

Gauges also connect three groups:

- Protocols get deeper liquidity for their token.
- LPs earn CRV, direct gauge rewards or both.
- veCRV holders decide where CRV goes and can earn vote incentives for it.

## Types of Rewards Through a Gauge

### CRV Emissions

- Paid from the Curve DAO's CRV inflation schedule and updated every week.
- Split between gauges by veCRV gauge weight votes.
- Need a gauge that the DAO has whitelisted.

### Direct Gauge Rewards

- Paid in a token you choose, from a budget you fund.
- Need no governance vote, so they can start right after the gauge is deployed.
- Rewards are standard ERC-20 tokens, at most 8 per gauge, and a token can't be removed once added.

## Deploying Gauges and Receiving CRV Emissions

Anyone can deploy a gauge for a Curve pool or lending vault. Once deployed, it can pay direct gauge rewards, such as your project's token or a stablecoin.

To receive CRV emissions, the gauge must first be whitelisted by a Curve DAO vote. After that, its share of CRV depends on [veCRV gauge weight votes](/user/dao/gauge-weights), which update weekly. A gauge on another chain gets CRV through a root gauge on Ethereum, which is what the DAO whitelists and veCRV votes on. CRV reaches LPs there about a week later, after it accumulates in the root gauge and is bridged. See [Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s).
