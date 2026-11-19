---
id: post-deployment
title: "After Deploying a Lending Market"
sidebar_label: "After Deploying a Lending Market"
description: "What a Llamalend market needs after deployment: activation, lender liquidity, ERC-4626 and borrower integrations, monitoring and incentives."
---

When you finish, your market holds lender liquidity, shows correctly on curve.finance and has monitoring with an owner for each alert.

Seeding and monitoring start as soon as you set them up. CRV emissions for lenders add a 7-day Curve DAO vote after you deploy a gauge.

## Before You Start

You need the market's Vault and Controller addresses and a wallet holding the borrowed token.

It costs gas and the borrowed tokens you deposit as the first lender liquidity.

It takes a few transactions, plus a 7-day DAO vote if you want CRV emissions.

Nobody approves the deposit or the monitoring. The borrow cap and CRV emissions each need a DAO vote.

## Confirm the Market Is Active {#activation-checklist}

1. Read `borrow_cap()` on the Controller and confirm it is above zero. [Deploy a Lending Market](./guides/deploy-lending-market.md#activate-the-market) covers the vote that raises it.
2. Test a deposit, a withdrawal and a loan on a fork before you announce the market.

## Seed Lender Liquidity

1. Approve the Vault to spend the borrowed token.
2. Call `Vault.deposit(assets, receiver)` with the first deposit. Borrowers can only borrow what the Vault holds.

## Add the Token Icons {#frontend-and-token-metadata}

1. Open the market page at `https://www.curve.finance/lend/<network>/markets/<controller>` and check both token icons.
2. If one is missing, open a pull request to the [curve-assets repository](https://github.com/curvefi/curve-assets#adding-a-token-icon).

## Monitor the Market {#monitor-the-market}

1. Set alerts on these values:
   - Vault total assets, available liquidity, supply cap and lender [APR](/protocol/glossary#apr) (annual percentage rate)
   - total debt, borrow cap, utilization and borrow APR
   - price oracle freshness, deviation, dependencies and failed updates
   - borrower health and positions in [soft liquidation](/protocol/glossary#soft-liquidation) (collateral converting gradually as the price falls, instead of being sold at one price)
   - collateral trading liquidity depth, liquidation profitability and bad-debt risk
   - admin percentage, accrued fees and fee receiver
   - Configurator, factory-owner and Emergency DAO changes
2. Name an owner who responds to each alert before you raise the borrow cap.

## Add Lender Incentives {#grow-lender-liquidity}

1. Deploy a gauge for the Vault's shares. [Incentivize Liquidity](/protocol/gauge/overview) explains how.
2. Deposit your own ERC-20 rewards into the gauge. Lenders earn them by staking their Vault shares in it.
3. For CRV emissions, propose a DAO vote to whitelist the gauge, which makes it eligible for CRV emissions. CRV then follows the gauge weight that [veCRV](/protocol/glossary#vecrv) (CRV locked for voting power) holders vote for it.

To pay borrowers too, see [Incentivize a Lending Market](/protocol/gauge/incentive-routes#incentivize-a-lending-market).

## Point Integrators to the Docs {#integrate-the-lender-side}

Lenders, aggregators and borrower tools integrate through the Vault and the LendController. Send them to [Quickstart: Lend](../integrate/quickstart-lend.md) and the [Vault Integration Guide](/developer/llamalend-v2/integration-guide).

## Check It Worked

- `Vault.totalAssets()` includes your deposit.
- The market page on curve.finance shows the supplied amount and both token icons.
- The Curve Prices API returns the market's supply and rates at `https://prices.curve.finance/v1/lending/markets/<network>`.

## Next Step

[Run a Lending Market](./running-a-market.md) covers parameter changes, wind-down and emergencies.

For help with a deployment or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
