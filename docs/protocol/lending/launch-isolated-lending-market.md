---
id: launch-isolated-lending-market
title: Launch an Isolated Lending Market for Your Token
sidebar_label: Launch a Market
description: Llamalend lets anyone deploy a permissionless, isolated lending market for any ERC-20 pair, with one collateral token and one borrowed token.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

Llamalend lets anyone deploy an isolated, one-way lending market for any ERC-20 pair on Ethereum and Optimism. Each market has one collateral token and one borrowed token, so its risk stays inside that market. Borrowers get liquidation protection from LLAMMA, which converts collateral gradually across a price range instead of liquidating it at a single price.

:::info[About Llamalend v1]

Llamalend v1 is deprecated. New markets and integrations should use the v2 contracts described here.

:::

<GuideCardGrid guideKeys={['LendingOraclesAndParameters', 'deployLendingMarket']} />

## Is Llamalend Right for Your Token?

A market works when three things are in place:

- **A reliable oracle** that prices your collateral in the borrowed token and resists manipulation and stale data.
- **Deep collateral liquidity**, so liquidators and arbitrageurs can sell collateral when prices fall.
- **Borrow demand**, so lenders earn interest and the market grows.

## Launch Steps

1. **Deploy the market.** Call `LendFactory.create()` with your token pair, oracle, monetary policy, and risk parameters. Follow the [Deploy a Market](./guides/deploy-lending-market.md) guide.
2. **Wait for the borrow cap.** Every new market starts with a borrow cap of zero, so nobody can borrow yet. A Curve DAO vote must raise the cap. Treat this vote as a review step: plan the proposal before you deploy. Deploying a market does not make you its administrator.
3. **Seed lender liquidity.** Deposit the borrowed token into the market's Vault so borrowers have something to borrow.
4. **Add incentives (optional).** Deploy a gauge to pay rewards to lenders. See [Gauges & Incentive Mechanics](/protocol/gauge/overview).

The factory deploys three contracts for each market:

| Contract | Role |
| --- | --- |
| **Vault** | ERC-4626 vault where lenders deposit the borrowed token. |
| **LendController** | Entry point for borrowers and liquidators. Holds the borrow cap. |
| **AMM (LLAMMA)** | Holds collateral in price bands and runs liquidation protection. |

For oracle and parameter choices, read [Oracles & Parameters](./oracles-and-parameters.md). For contract interfaces, see the [developer reference](/developer/llamalend-v2/overview). After launch, use [Post-Deployment & Integration](./post-deployment.md) to monitor and grow the market.

:::warning[Liquidation protection is not free]

Each conversion in LLAMMA loses a little value to fees and arbitrage, even when the price recovers. A position that stays in its bands for a long time can still reach hard liquidation. Most borrowers should close or reset a position once protection starts.

:::

## Live Examples

| Market | Supplied | Borrowed | Borrow APR |
| --- | --- | --- | --- |
| [sDOLA / crvUSD](https://www.curve.finance/lend/ethereum/markets/0xC77d97cF01737EB7aCE46cAb7cd9F60eC51a40c0) on Ethereum | 11.29M crvUSD | 9.01M crvUSD | 4.64% |

Figures as of 2026-11-17, from the [Curve Prices API](https://prices.curve.finance/v1/lending/markets/ethereum). Open the market for current values.

## How It Compares

- **Llamalend:** anyone deploys the market; a Curve DAO vote opens borrowing; LLAMMA protects borrowers from instant liquidation.
- **Morpho:** anyone creates a market with no vote; curated vaults allocate lender funds across markets.
- **Euler:** anyone deploys a vault; its governor sets collateral and LTVs; liquidations use a reverse Dutch auction.

See [Llamalend vs Morpho vs Euler](./llamalend-vs-morpho-vs-euler.md) for the full comparison.

## Get Help

For help reviewing an oracle, parameter set, deployment, or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
