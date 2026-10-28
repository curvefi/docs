---
id: getting-crv-emissions
title: Getting CRV Emissions
sidebar_label: Getting CRV Emissions
---

import GaugeWeightDistribution from '@site/src/components/Charts/GaugeWeightDistribution';

A whitelisted gauge receives CRV only when veCRV holders vote for it. Each week, Curve splits its CRV inflation across whitelisted gauges in proportion to their share of gauge weight votes. A gauge with 0% of the votes receives no CRV.

## How Gauge Weight Voting Works

veCRV holders vote in the [Curve voting interface](https://www.curve.finance/dao/ethereum/gauges). They can split their voting power across several gauges or put it all on one.

- Votes are relative: a gauge with 10% of all votes receives 10% of that week's CRV inflation.
- Votes stay in place until the voter changes them, and their weight decays as the voter's veCRV lock runs down.
- A voter can change their vote on a gauge once every 10 days.

## Weekly Update Cycle

Gauge weights, and with them CRV emissions, update every Thursday at 00:00 UTC. Votes cast before that time count from that update. Gauges on other chains receive their CRV about a week later, after it accumulates in the root gauge on Ethereum and is bridged.

## Attracting Votes

To get votes, you can hold veCRV or vlCVX yourself or pay voters through vote incentives. [Incentivizing a Pool](../incentive-routes.md) compares the options.

## Where to Track Emissions

Live and past gauge weights are on [curve.finance/dao/ethereum/gauges](https://www.curve.finance/dao/ethereum/gauges).

<GaugeWeightDistribution />
