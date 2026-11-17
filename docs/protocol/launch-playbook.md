---
id: launch-playbook
title: "Launch Playbook: Liquidity and Lending for Your Token on Curve"
sidebar_label: Launch Playbook
description: The order of steps for launching a token on Curve, from choosing and deploying a pool to gauges, incentives, a Llamalend lending market and monitoring.
---

This page lists the steps for taking a token from no liquidity to a Curve pool with incentives and a lending market. Each step links to the guide that covers it. Later steps are optional: a pool works without a gauge, and a gauge works without a lending market.

## 1. Choose a Pool Type

Use Stableswap for assets that hold the same peg, such as two USD stablecoins or an LST against ETH. Use Cryptoswap when the Curve pool will be a main market for a volatile token. Use FXSwap for pairs whose price is set on a deeper external market, such as EUR against USD. [Pool Types](./pool/overview.md) compares them.

## 2. Deploy the Pool

You deploy the pool yourself in the Curve app or onchain. Deployment needs no approval and costs only gas. Follow the guide for your pool type: [Stableswap](./pool/guides/deploy-stableswap.md), [Cryptoswap](./pool/guides/deploy-cryptoswap.md) or [FXSwap](./pool/guides/deploy-fxswap.md).

## 3. Seed Liquidity and Submit Your Logo

A pool can't process trades until it holds liquidity, so add the first deposit in balanced amounts. Then submit your token logo so the pool displays correctly. See [Post Deployment](./pool/post-deployment.md).

## 4. Deploy a Gauge

The factory allows one gauge per pool, and the wallet that deploys it becomes the gauge manager. Only the manager can register reward tokens, so deploy your pool's gauge yourself. See [Gauges & Incentives](./gauge/overview.md).

## 5. Fund Incentives

Direct gauge rewards in your own token can start right away. CRV emissions need a Curve DAO whitelisting vote, then veCRV gauge weight votes. Vote incentives and Merkl campaigns are other routes. [Incentivizing a Pool](./gauge/incentive-routes.md) compares what each route needs.

## 6. Launch a Lending Market

A Llamalend market lets holders borrow against your token, or lets lenders supply it. You deploy the market, and a Curve DAO vote raises its borrow cap from zero before anyone can borrow. See [Launch a Lending Market](./lending/launch-isolated-lending-market.md).

## 7. Monitor the Pool and Market

Watch pool balances, fee income, lending utilization and incentive spend. The Curve DAO can change pool and market parameters by vote. See [Pool Parameters](./pool/pool-parameters.md) and [Llamalend Post-Deployment](./lending/post-deployment.md).

Next, find the setup for your token type in [Use Cases](./use-cases/overview.md).
