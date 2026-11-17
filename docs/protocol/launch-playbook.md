---
id: launch-playbook
title: "Launch Timeline: From a Curve Pool to a Lending Market"
sidebar_label: Launch Timeline
description: How long each step of launching a token on Curve takes, from pool and gauge deployment to the 7-day Curve DAO votes for CRV emissions and a Llamalend borrow cap, and the weekly gauge weight cycle.
---

This page lists the steps for taking a token from no liquidity to a Curve pool with incentives and a lending market, with how long each one takes. Later steps are optional: a pool works without a gauge, and a gauge works without CRV emissions or a lending market.

## Timeline

| Step | Who acts | Time |
| --- | --- | --- |
| Deploy the pool and seed liquidity | You | One transaction each |
| Deploy the pool's gauge | You | One transaction |
| Pay direct gauge rewards | You, as gauge manager | Live from the next deposit; each deposit streams over 3 days to 48 weeks |
| Post a forum proposal for CRV emissions or a lending market | You | Before the vote; recommended |
| Curve DAO vote to whitelist the gauge or set a borrow cap | veCRV holders | 7 days, then anyone can execute it |
| Gauge receives CRV | veCRV holders, through gauge weight votes | From the next Thursday 00:00 UTC update after votes are cast |
| CRV reaches a gauge on another chain | Automatic, through the root gauge | About one more week |

The diagram shows a common incentive sequence after the gauge exists.

![A common launch sequence: direct gauge rewards or a Merkl campaign from day 0, the 7-day DAO gauge whitelist vote on Ethereum, votes cast for the gauge (Convex and StakeDAO vote every 2 weeks), then CRV on Ethereum from the Thursday 00:00 UTC weight update after that vote round, and on other chains one week later through the root gauge.](/img/protocol/gauge/incentive-timeline.png)

## Steps

### 1. Choose a Pool Type

Use Stableswap for assets that hold the same peg, such as two USD stablecoins or an LST against ETH. Use Cryptoswap when the Curve pool will be a main market for a volatile token. Use FXSwap for pairs priced on a deeper external market, such as EUR against USD. [Curve Pool Types](./pool/overview.md) compares them, and [Pool Parameter Presets](./pool/presets.md) lists starting parameters.

### 2. Deploy the Pool and Seed It

Deploy the pool in the Curve app or onchain. It needs no approval and costs only gas. A pool can't trade until it holds liquidity, so make the first deposit in balanced amounts. See the guide for [Stableswap](./pool/guides/deploy-stableswap.md), [Cryptoswap](./pool/guides/deploy-cryptoswap.md) or [FXSwap](./pool/guides/deploy-fxswap.md), then [After Deploying a Curve Pool](./pool/post-deployment.md).

### 3. Deploy the Gauge

Deploy it from the Curve app's gauge deployment page or onchain. The factory allows one gauge per pool, and the wallet that deploys it becomes the gauge manager. Only the manager can register reward tokens, so deploy your pool's gauge yourself. See [Curve Gauges and Incentives](./gauge/overview.md).

### 4. Fund Incentives

Direct gauge rewards in your own token start as soon as you deposit them. CRV emissions take longer. The gauge needs a Curve DAO ownership vote to be whitelisted, then veCRV gauge weight votes. The vote runs for 7 days. [Governance Proposals](/user/dao/proposals) explains who can create one and what it needs to pass. [Incentivizing a Curve Pool](./gauge/incentive-routes.md) compares every route, and [Incentive Costs](./gauge/incentive-costs.md) explains what each one costs.

### 5. Launch a Lending Market

Propose the market, have it reviewed by yRisk, the Curve DAO's elected risk manager, and deploy it. A 7-day Curve DAO ownership vote raises its borrow cap from zero. See [Launch a Lending Market](./lending/launch-isolated-lending-market.md).

### 6. Monitor the Pool and Market

Watch pool balances, fee income, lending utilization and incentive spend. The Curve DAO can change pool and market parameters by vote. See [Troubleshooting Curve Pools](./pool/troubleshooting.md) and [Running a Llamalend Market](./lending/running-a-market.md).

The 7-day vote period was read onchain from the Curve DAO's ownership voting contract on 17 November 2026.
