---
id: launch-playbook
title: "Launch Timeline: From a Curve Pool to a Lending Market"
sidebar_label: Launch Timeline
description: How long each step of launching a token on Curve takes, from pool and gauge deployment to the 7-day Curve DAO votes for CRV emissions and a Llamalend borrow cap, and the weekly gauge weight cycle.
---

This page lists the steps for taking a token from no liquidity to a Curve pool with incentives and a lending market, with how long each one takes. Later steps are optional: a pool works without a [gauge](/protocol/glossary#gauge) (the contract that pays incentives to the pool's liquidity providers, or LPs), and a gauge works without CRV emissions or a lending market.

## Timeline

| Step | Who acts | Time |
| --- | --- | --- |
| Deploy the pool and seed liquidity | You | One transaction each |
| Deploy the pool's gauge | You | One transaction |
| Pay direct rewards | You, as gauge manager | Live from the next deposit; each deposit streams over 3 days to 48 weeks |
| Post a forum proposal for CRV emissions or a lending market | You | Before the vote; recommended |
| Curve DAO vote to whitelist the gauge (make it eligible for CRV emissions) or set a borrow cap | Holders of [veCRV](/protocol/glossary#vecrv) (CRV locked for voting power) | 7 days, then anyone can execute it |
| Gauge receives CRV | veCRV holders, through gauge weight votes | From the next Thursday 00:00 UTC update after votes are cast |
| CRV reaches a gauge on another chain | Automatic, through the root gauge | About one more week |

The diagram shows a common incentive sequence after the gauge exists.

![A common launch sequence: direct rewards or a Merkl campaign from day 0, the 7-day DAO gauge whitelist vote on Ethereum, votes cast for the gauge (Convex and StakeDAO vote every 2 weeks), then CRV on Ethereum from the Thursday 00:00 UTC weight update after that vote round, and on other chains one week later through the root gauge.](/img/protocol/gauge/incentive-timeline.png)

## Steps

Each step has its own guide.

1. Choose a pool type. [Which Pool Type?](./pool/overview.md#which-pool-type) matches your asset pair to Stableswap, Cryptoswap or FXSwap.
2. Deploy and seed the pool with the guide for [Stableswap](./pool/guides/deploy-stableswap.md), [Cryptoswap](./pool/guides/deploy-cryptoswap.md) or [FXSwap](./pool/guides/deploy-fxswap.md).
3. Deploy the gauge and submit your logo with [After Deploying a Pool](./pool/post-deployment.md).
4. Fund incentives, starting with [Add Direct Gauge Rewards](./gauge/guides/adding-direct-gauge-rewards.md). For CRV emissions, follow [Whitelist a Gauge](./gauge/whitelisting-gauge.md), then [Get CRV Emissions](./gauge/guides/getting-crv-emissions.md). [Incentive Costs](./gauge/incentive-costs.md) compares what each route costs.
5. Deploy a lending market. Read [Deploy and Run a Lending Market](./lending/launch-isolated-lending-market.md), then follow [Deploy a Lending Market](./lending/guides/deploy-lending-market.md). To pay lenders or borrowers, see [Incentivize a Lending Market](./gauge/incentive-routes.md#incentivize-a-lending-market).
6. Monitor the pool and market with [Troubleshooting Curve Pools](./pool/troubleshooting.md) and [Run a Lending Market](./lending/running-a-market.md).

The 7-day vote period was read onchain from the Curve DAO's ownership voting contract on 17 November 2026.
