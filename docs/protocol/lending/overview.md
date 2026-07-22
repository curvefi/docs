---
id: overview
title: LlamaLend v2 Overview
sidebar_label: Overview
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

**LlamaLend v2** is Curve's infrastructure for isolated, one-way lending markets. Each market connects one borrowed token with one collateral token, so its liquidity, debt, oracle, interest-rate policy, and risk parameters are separate from every other market.

Protocols can build with LlamaLend v2 in two main ways:

- **Create a market** for a supported token pair and coordinate its risk configuration, liquidity, and distribution.
- **Integrate an existing market** through its ERC-4626 Vault, borrower-facing Controller, and read-only market data.

:::info[About LlamaLend v1]

LlamaLend v1 (LL1) is deprecated. New markets and integrations should use LlamaLend v2 (LL2).

:::

<GuideCardGrid guideKeys={['LendingOraclesAndParameters', 'deployLendingMarket']} />

## Who Participates in a Market?

- **Lenders** deposit the borrowed token into an ERC-4626 Vault. They receive transferable vault shares whose value reflects interest earned from borrowers.
- **Borrowers** deposit the collateral token through the Controller and borrow assets supplied to the Vault.
- **Liquidators and arbitrageurs** help keep positions and the market's LLAMMA aligned with the oracle price.
- **Integrators** can compose with vault shares, build lender or borrower interfaces, monitor positions, route LLAMMA trades, or use market data in other protocols.

## Market Architecture

The `LendFactory` deploys three contracts for every market:

| Contract | Purpose |
| --- | --- |
| **Vault** | ERC-4626 entry point for lenders. It accepts the borrowed token and issues vault shares. |
| **LendController** | Entry point for borrowers and liquidators. It manages loans, debt, collateral, caps, and health. |
| **AMM (LLAMMA)** | Holds borrower collateral in price bands and gradually exchanges it during liquidation protection. |

The market also depends on a **price oracle** and a **monetary policy**. A `LendControllerView` provides read-only position previews, while the permissioned `Configurator` controls settings such as the borrow cap, discounts, monetary policy, oracle, and AMM fee.

### Liquidation Protection (Soft Liquidation)

Borrower collateral is distributed across LLAMMA price bands. As the oracle price moves through a position's bands, LLAMMA gradually converts collateral into the borrowed token. This avoids liquidation at one specific price and can give a borrower more time to react.

The conversions are not lossless. Arbitrage and AMM fees erode collateral value and health each time assets are exchanged, including while the price is recovering. Repeated movement through the bands can therefore end in hard liquidation even when part of the conversion reverses.

:::warning[Do not treat liquidation protection as passive safety]

Most borrowers should close or reset a position after it enters liquidation protection. LlamaLend v2 adds a repay-and-shrink path that can cut the converted part and reset the position; otherwise, staying in the bands should be reserved for borrowers who understand LLAMMA, monitor health continuously, and accept the risk of further losses and hard liquidation.

:::

## From Deployment to a Live Market

Creating a market and activating borrowing are separate steps:

1. Anyone can call the chain's LlamaLend v2 `LendFactory.create()` with a valid token pair, oracle, monetary policy, risk parameters, and supply limit.
2. The factory deploys and registers the market's Vault, Controller, and AMM.
3. The Controller starts with a **borrow cap of zero**, so no new debt can be created yet.
4. The market team prepares a Curve DAO ownership vote calling `Configurator.set_borrow_cap()`. The vote may instead assign a controller-specific administrator, which can then set the reviewed cap.
5. After the vote passes and executes, confirm the new cap onchain and seed or attract borrowed-token liquidity.
6. Monitor liquidity, utilization, oracle behavior, borrower health, and risk before and after launch.

The deployed Ethereum and Optimism Configurators use Curve DAO ownership agents as their default administrators. The address that deploys a market does **not** automatically become its administrator, so plan the governance proposal and ongoing administration process before deploying.

## Choose Your Path

### Deploy a Market

Start with [Oracles & Parameters](./oracles-and-parameters.md), then follow the [Deployment Guide](./guides/deploy-lending-market.md). These guides explain the inputs, permissions, and activation sequence without requiring readers to work directly from contract source.

For help reviewing an oracle, parameter set, deployment, or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).

### Integrate Existing Markets

Use [Post-Deployment & Integration](./post-deployment.md) for market discovery, ERC-4626 lender integrations, borrower integrations, monitoring, and incentives. Low-level interfaces are documented in the [LlamaLend v2 developer reference](/developer/llamalend-v2/overview).

## Growing a Market

A useful market needs both lender liquidity and borrower demand. A protocol can seed the Vault, integrate borrowing into its product, and deploy a gauge for vault shares. Gauges can distribute external incentives immediately; receiving CRV emissions additionally requires Curve DAO approval and gauge weight.

See [Gauges & Incentive Mechanics](/protocol/gauge/overview) for the complete incentive flow.
