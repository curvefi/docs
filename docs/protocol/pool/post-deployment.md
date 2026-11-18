---
id: post-deployment
title: After Deploying a Curve Pool
sidebar_label: Post Deployment
description: "What to do after deploying a Curve pool: seed initial liquidity, check integrations, submit the token logo, deploy a gauge, add refuels and plan incentives."
---

When you finish, your pool holds liquidity, shows your token's logo, has a gauge for rewards and has a plan for incentives.

Most steps take one transaction or one pull request. CRV emissions, if you want them, add a 7-day Curve DAO vote.

## Before You Start

You need the pool's address and the wallet that will manage its gauge.

It costs gas, the tokens you deposit as initial liquidity and whatever you spend on incentives.

It takes a few transactions and one pull request for the logo.

Nobody approves the steps on this page. CRV emissions need a Curve DAO vote, covered in [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).

## Seed the Pool {#seed-initial-liquidity}

1. Open the pool's page on curve.finance and select the **Seed pool** tab.
2. Deposit in balanced amounts: 50/50 for a two-token pool, a third each for three tokens.

The pool list hides pools with no liquidity, so the pool appears there once it is seeded.

## Check Routing {#integrations}

You don't need to request a listing. Aggregators such as [0x](https://docs.0x.org/evm/need-help/faq), 1inch, [CoW Swap](https://docs.cow.fi/cow-protocol), [KyberSwap](https://docs.kyberswap.com/getting-started/supported-exchanges-and-networks), Odos and ParaSwap route swaps through Curve pools and pick up new ones on their own.

## Submit Your Token Logo {#token-logo-submission}

1. Open a pull request to the [curve-assets repository](https://github.com/curvefi/curve-assets?tab=readme-ov-file#adding-a-token-icon) with your token's icon.
2. Until it is merged, the Curve app shows a default logo for the token.

## Deploy the Gauge

1. Open [Deploy Gauge](https://www.curve.finance/dex/ethereum/deploy-gauge) in the Curve app with the wallet that will manage rewards.
2. Enter the **Pool Address** and deploy. On a sidechain, the app walks you through two steps: deploy the sidechain gauge, then a mirror gauge on Ethereum, using the same wallet for both.

The factory allows one gauge per pool, and the wallet that deploys it becomes the gauge manager. See [Curve Gauges and Incentives](../gauge/overview.md).

## Add Refuels to an FXSwap Pool {#add-refuels-fxswap-pools}

Skip this section for Stableswap and Cryptoswap pools.

1. Open the pool's **Manage pool** page from its Advanced Details.
2. Fund a refuel in **Refuel setup**, or schedule refuels with [Automating FXSwap Refuels](./guides/donation-streamer.md).

[Understanding FXSwap](./understanding-fxswap.md#refuels) explains how refuels are spent.

## Monitor the Pool {#monitor-performance-and-update-parameters}

Watch volume, TVL and token balances. Heavily skewed balances can mean a parameter is off, such as an amplification factor that is too high. Compare your pool with [Pool Parameter Presets](./presets.md), and use [Troubleshooting Curve Pools](./troubleshooting.md) for skewed or stale pools. Parameter changes need a Curve DAO vote.

## Check It Worked

- The pool appears in the Curve app's pool list with your token's logo.
- Connected with the gauge manager's wallet, the pool page shows a **Gauge** tab with **Add Reward**.
- The Curve Prices API returns the pool at `https://prices.curve.finance/v1/pools/<network>/<pool address>`.

## Next Step {#grow-liquidity-using-incentives}

[Incentivizing a Curve Pool](../gauge/incentive-routes.md) compares every way to fund liquidity, from rewards in your own token to CRV emissions.

Questions go to the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
