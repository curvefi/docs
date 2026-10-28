---
id: getting-crv-emissions
title: Getting CRV Emissions
sidebar_label: Getting CRV Emissions
---

Once your gauge has been whitelisted by the Curve DAO, it becomes eligible to receive CRV emissions — but this does **not** happen automatically. Emissions are distributed based on **gauge weight voting**, a weekly process where veCRV holders decide how Curve’s inflation is allocated across pools.

## CRV Emissions Depend on Gauge Weight Voting

Every week, the Curve DAO distributes newly minted CRV tokens across all **whitelisted gauges**. The distribution is **proportional** to how much voting weight each gauge receives from veCRV holders.

- veCRV holders vote for the gauges they want to support
- The more voting weight your gauge receives, the larger the share of CRV emissions it gets
- If your gauge receives **0% weight**, it receives **0 CRV** — even if it's whitelisted

## How Gauge Weight Voting Works

All veCRV holders can vote on gauges using the <a href="https://www.curve.finance/dao/ethereum/gauges" target="_blank" rel="noopener noreferrer">Curve voting interface</a>. They can split their weight across multiple gauges or concentrate it on a single one.

- Votes are **relative**: if your gauge receives 10% of all votes, it will receive 10% of that week's CRV inflation
- You can vote at any time, but votes are **locked in** at the weekly update
- Votes stay in place until the voter changes them, and their weight decays as the voter's veCRV lock runs down
- A voter can change their vote on a gauge once every 10 days ([`WEIGHT_VOTE_DELAY`](/developer/gauges/gauge-controller))

## Weekly Update Cycle

Gauge weights — and therefore CRV emissions — are updated **every Thursday at 00:00 UTC**.

- Any votes submitted before that time are included in the next cycle
- The system automatically recalculates weights and distributes emissions accordingly
- Historical and live weights can be viewed at: <a href="https://www.curve.finance/dao/ethereum/gauges/" target="_blank" rel="noopener noreferrer">curve.finance/dao/ethereum/gauges</a>

## How to Attract Gauge Weight

Being whitelisted is only the beginning. You still need to get veCRV holders to vote for your gauge. This can be done by:

- **Engaging with the Curve community**
- **Offering vote incentives** using platforms like Votium
- **Aligning incentives** with veCRV holders (e.g. providing value to Curve’s ecosystem)

## Where to Track Emissions

You can track gauge weights here: <a href="https://www.curve.finance/dao/ethereum/gauges" target="_blank" rel="noopener noreferrer">Gauge Weights</a>
