---
id: getting-crv-emissions
title: "Get CRV Emissions"
sidebar_label: "Get CRV Emissions"
description: How a whitelisted Curve gauge receives CRV through weekly veCRV gauge weight votes, and how to attract votes.
---

import GaugeWeightDistribution from '@site/src/components/Charts/GaugeWeightDistribution';

When you finish, your whitelisted gauge holds gauge weight votes from [veCRV](/protocol/glossary#vecrv) (CRV locked for voting power) and streams CRV to its stakers.

Gauge weights update every Thursday at 00:00 UTC, and CRV reaches gauges on other chains about a week later.

[Gauge Weights](/user/dao/gauge-weights) explains how votes turn into CRV.

## Before You Start

You need a gauge that a Curve DAO vote has whitelisted, which makes it eligible for CRV emissions.

Receiving CRV costs nothing, and winning votes costs whatever your chosen route costs.

Votes cast before Thursday 00:00 UTC count from that update.

veCRV holders decide each time they vote.

## Vote With Your Own veCRV

Skip this section if you hold no veCRV.

1. Open the [Gauges page](https://www.curve.finance/dao/ethereum/gauges) of the Curve DAO and connect the wallet that holds your veCRV.
2. Open the **Voting** tab.
3. Under **Vote for new gauge**, pick your gauge.
4. Enter the share of your voting power to give it.
5. Select **Vote** and confirm the transaction.

A vote stays in place until you change it. [Voting for Gauge Weight](/user/dao/gauge-weights#voting-for-gauge-weight) covers updates.

## Attract Other Voters

1. Choose a route, such as holding [vlCVX](/protocol/glossary#vlcvx) (CVX locked for Convex voting power) or paying voters through [vote incentives](/protocol/glossary#vote-incentives) (bribes). [Incentivize a Curve Pool](../incentive-routes.md) compares them.
2. Check what that route costs in [What Curve Incentives Cost](../incentive-costs.md).
3. Fund the route early enough that the votes land before Thursday 00:00 UTC.

## Check It Worked

- Your gauge's page, reached from [curve.finance/dao/ethereum/gauges](https://www.curve.finance/dao/ethereum/gauges), shows a nonzero **Relative Weight** after the next Thursday update.
- The **Emissions (CRV)** figure on that page shows the CRV your gauge receives.
- On Etherscan, `gauge_relative_weight(<gauge address>)` on the `GaugeController` returns a nonzero value.

<GaugeWeightDistribution />

## Next Step

[Add Direct Gauge Rewards](./adding-direct-gauge-rewards.md) pays stakers in your own token alongside CRV.
