---
id: incentive-costs
title: What Curve Incentives Cost
sidebar_label: Incentive Costs
description: What sets the cost of each way to fund liquidity on a Curve pool, including direct rewards, veCRV and vlCVX locks, vote incentives on Votemarket and Votium, and Merkl campaigns, and which platform fees apply.
---

No route has a fixed price. What you pay depends on the route, the going price of votes and how much liquidity you want. This page explains what sets each cost so you can compare them before you commit a budget. [Incentivizing a Curve Pool](./incentive-routes.md) explains how each route works.

## Cost by Route

| Route | What you pay | What sets the amount | Platform fee |
| --- | --- | --- | --- |
| Direct rewards | Your reward budget, streamed to staked liquidity providers (LPs) | You choose the amount and the period, from 3 days to 48 weeks | None |
| Holding veCRV (CRV locked for voting power) | The CRV you buy and lock, for up to four years | How many votes you need against the total veCRV voting for [gauges](./overview.md) | None |
| Holding vlCVX (CVX locked for Convex voting power) | The CVX you buy and lock, for 16 weeks | Your share of Convex's veCRV votes | None |
| Vote incentives (bribes) | Payments to veCRV or vlCVX holders who vote for your gauge | The going price per vote, which changes every round | Charged by Votemarket and Votium; check before funding |
| Merkl campaigns | Your reward budget | You choose the amount and the rules | 3% for standard campaigns at the time of writing ([fee model](https://docs.merkl.xyz/distribute-with-merkl/fee-model)) |

## How to Compare Routes

Direct rewards and Merkl campaigns cost exactly the budget you spend, plus any fee. LPs receive that budget and nothing more.

Vote incentives buy votes, and votes direct CRV emissions. LPs then receive CRV, whose value depends on the CRV price and on how many votes your budget bought. When the CRV directed to your gauge is worth more than your budget, LPs receive more than you paid. The price per vote changes each round, so compare the two before each one.

Holding veCRV or vlCVX turns a recurring cost into capital tied up in a lock. The emissions you direct cost nothing further while the lock lasts, but veCRV voting power decays as the lock runs down, and the locked tokens carry price risk.

Every route except direct rewards and Merkl needs a whitelisted gauge first, which takes a 7-day Curve DAO vote. See [Whitelisting a Gauge](./whitelisting-gauge.md).

## Where to Check Current Prices

- [Votemarket](https://www.votemarket.org/curve) shows current vote incentive campaigns for Curve gauges.
- [Votium](https://votium.app/curve) shows incentives offered to vlCVX holders each round.
- The [Curve voting interface](https://www.curve.finance/dao/ethereum/gauges) shows current gauge weights and CRV emissions.

## Related

- [Incentivizing a Curve Pool](./incentive-routes.md)
- [Getting CRV Emissions](./guides/getting-crv-emissions.md)
- [Launch Timeline](../launch-playbook.md)
