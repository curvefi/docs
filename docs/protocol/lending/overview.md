---
id: overview
title: Lending Overview
sidebar_label: Overview
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

Curve's lending infrastructure, **LlamaLend v2**, is a decentralized, permissionless lending system that enables protocols and asset issuers to create isolated markets for any ERC-20 token pair. It facilitates lending and borrowing between users while providing powerful tools for asset proliferation and ecosystem growth.

**Borrowers** can use LlamaLend v2 for yield farming, leverage trading, or obtaining working capital without selling collateral. **Lenders** earn interest while contributing to market liquidity across diverse asset pairs with different risk profiles.

To get started quickly, check these out:

<GuideCardGrid guideKeys={['LendingOraclesAndParameters', 'deployLendingMarket']} />

## Core Architecture

Llamalend operates on an **isolated market** model where each lending market has a single collateral token and a single borrowable token. All lending markets are completely independent from each other, preventing cross-contamination and allowing for precise risk management per asset pair.

LlamaLend v2 markets can use **any ERC-20 pair**. For example, a market can use ETH as collateral and USDC as the borrowed asset. This preserves market isolation without requiring crvUSD in the pair.

- **Gauges for Vaults** - Lending vaults are fully compatible with Curve's gauge system, meaning lending vaults can receive gauge weights and therefore future CRV emissions to attract more supply to the market
- **Fully Permissionless** - Deploy lending markets instantly without DAO approvals
- **Isolated Markets** - Each market operates independently with its own risk parameters, preventing cross-contamination
- **Flexible pairs** - Any ERC-20 asset can be collateral or the borrowed asset
- **Customizable Risk Management** - Tailored liquidation thresholds and interest rate models per asset pair

## How Markets are Deployed

Deploying LlamaLend v2 markets is permissionless through the `LendFactory`. Anyone can create an isolated lending market for any ERC-20 pair, subject to the factory's parameter validation and the market's initial borrow cap of zero. An authorized Configurator must raise that cap before borrowing can begin.

:::info[Versioned deployment guides]

The linked deployment and oracle guides below are retained as historical **LlamaLend v1** documentation. V1 markets are being phased out and **no new v1 markets will be deployed**. Any new market must use the [LlamaLend v2 LendFactory reference](/developer/llamalend-v2/lend-factory) and [Configurator reference](/developer/llamalend-v2/configurator).

:::

## How It Works

Users deposit collateral tokens to borrow against them, maintaining health factors above liquidation thresholds. Interest accrues on borrowed amounts and is paid to lenders providing market liquidity. Automated liquidation mechanisms help reduce the risk of bad debt, but extreme market conditions can still result in shortfalls.

## Incentives & Liquidity Growth

Lending vaults are fully compatible with Curve's gauge system, enabling multiple strategies to attract and retain liquidity:

- **CRV Emissions** - Put lending vaults up for DAO vote to receive CRV emissions, incentivizing long-term liquidity provision
- **Permissionless Rewards** - Add custom token incentives directly to lending markets to boost initial liquidity
- **Vote Incentives** - Provide rewards to veCRV holders who vote for your lending vault gauge

These mechanisms help bootstrap initial liquidity and create sustainable demand for lending markets, making them more attractive to both borrowers and lenders.

For detailed deployment instructions and parameter optimization, see the [Deployment Guide](./guides/deploy-lending-market.md) and [Oracles & Parameters](./oracles-and-parameters.md) documentation.
