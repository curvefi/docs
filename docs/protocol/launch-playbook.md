---
id: launch-playbook
title: "Launch Playbook: Liquidity and Lending for Your Token on Curve"
sidebar_label: Launch Playbook
description: A step-by-step checklist for launching a token on Curve, from choosing and deploying a pool to gauges, incentives, a Llamalend lending market, integrations and monitoring.
---

This checklist takes your token from no liquidity to a Curve pool with incentives and a lending market. Each step links to the guide that covers it. You can stop after any step: a pool works without a gauge, and a gauge works without a lending market.

:::note[Draft]

This page is a skeleton. Each step will get a short explanation of what you decide and what it costs.

:::

## 1. Choose a Pool Type

Pick Stableswap for pegged assets, Cryptoswap for volatile pairs, or FXSwap for low-volatility pairs priced elsewhere. See [Pool Types](./pool/overview.md).

## 2. Deploy the Pool

Pool deployment is permissionless and has no fee beyond gas. Follow the guide for your pool type: [Stableswap](./pool/guides/deploy-stableswap.md), [Cryptoswap](./pool/guides/deploy-cryptoswap.md) or [FXSwap](./pool/guides/deploy-fxswap.md).

## 3. Seed Liquidity and Get Listed

Add initial liquidity in balanced amounts, submit your token logo and check that aggregators pick up the pool. See [Post Deployment](./pool/post-deployment.md).

## 4. Deploy a Gauge

Anyone can deploy a gauge for a pool. It can pay your own token rewards as soon as it exists. See [Gauges & Incentives](./gauge/overview.md).

## 5. Fund Incentives

Choose how to fund LP yield: direct gauge rewards, CRV emissions after a DAO vote, vote incentives, or Merkl campaigns. See [Incentivizing a Pool](./gauge/incentive-routes.md) and [Whitelisting a Gauge](./gauge/whitelisting-gauge.md).

## 6. Launch a Lending Market

Let holders borrow against your token, or let lenders supply it, through an isolated Llamalend market. See [Launch a Lending Market](./lending/launch-isolated-lending-market.md).

## 7. Integrate and Monitor

Watch pool balance, parameters, lending utilization and incentive spend after launch. See [Pool Parameters](./pool/pool-parameters.md) and [Llamalend Post-Deployment](./lending/post-deployment.md).
