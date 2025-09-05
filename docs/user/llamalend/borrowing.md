---
id: borrowing
title: Borrowing
sidebar_label: Borrowing
---

import LendingRateChart from '@site/src/components/LendingRateChart';
import ThemedImage from '@theme/ThemedImage';
import GuideCardGrid from '@site/src/components/GuideCardGrid';


## Why Borrow on Llamalend?

Borrowing on Llamalend allows you to access liquidity while maintaining exposure to your crypto assets. Instead of selling your holdings, you can use them as collateral to borrow crvUSD or other assets.

**Key Benefits:**
- **Liquidation Protection**: Llamalend's unique LLAMMA system provides more gradual liquidations compared to traditional protocols, reducing the risk of cascading liquidations during market stress
- **Maintain Exposure**: Keep your crypto positions while accessing liquidity. You don't have to sell your assets to get cash, preserving your potential upside
- **Leverage**: Use borrowed funds to increase your market exposure or invest in additional opportunities
- **Flexible Terms**: Choose between different market types and collateral options based on your specific needs and risk tolerance

## Getting Started with Guides
Ready to start borrowing? Check out our step-by-step guides:

<GuideCardGrid guideKeys={['howToOpenAndCloseLoan', 'howToManageLoan', 'whatToDoIfLoanInLiquidation']} />


## What Llamalend Offers Borrowers

Llamalend offers **isolated markets**, meaning each market only has one collateral token and one borrowable token. This design **keeps risk contained within each market**.

**Key Features:**
- **No Borrow Fees**: Users only pay the interest rate for borrowing the token
- **Dual Market Types**: Both mint markets (mint crvUSD against approved collateral) and lending markets (traditional lending with existing liquidity)
- **LLAMMA Protection**: All markets use Curve's **LLAMMA (Linear Liquidation AMM Algorithm)** for liquidation protection and more predictable liquidation processes

For detailed information about liquidation protection and loan health monitoring, see [Liquidation Protection & Loan Health](./liquidations.md).


## Borrow Rates

When you borrow crvUSD, you pay interest on your loan's debt based on the current **borrow rate**. This rate is dynamic based on different conditions (see more below) and charged every second. Users don't manually need to make interest payments - the loan's debt grows over time to account for the interest.

There are two types of markets in Llamalend, and each has a different interest rate model:

<figure>
<ThemedImage
    alt="Mint and Lend Markets"
    sources={{
        light: require('@site/static/img/user/llamalend/markets_light.png').default,
        dark: require('@site/static/img/user/llamalend/markets_dark.png').default,
    }}
    style={{ width: '800px', display: 'block', margin: '0 auto' }}
/>
</figure>

In the interface, you'll see markets labeled as either **"Mint"** or **"Lend"** to distinguish between the two types.


### Mint Market Rates
The borrow rate in mint markets is influenced by two main factors: the price of crvUSD and the size of the Peg Stabilization Reserve (PSR). The rate mechanism is designed to help maintain crvUSD's $1.00 peg through economic incentives.

- **When crvUSD trades above \$1.00**: The borrow rate goes **down** to incentivize more users to borrow crvUSD. Users can then sell the borrowed crvUSD for other stablecoins or use it for leveraging positions. This creates sell pressure on crvUSD, pushing the price back down toward $1.00.

- **When crvUSD trades below \$1.00**: The borrow rate goes **up**, making it more expensive to maintain open loans. This encourages users to repay their debt, often requiring them to buy crvUSD (since they may have sold or used the borrowed crvUSD for other purposes). This creates buy pressure on crvUSD, pushing the price back up toward $1.00.

**Peg Stabilization Reserve (PSR)**

The PSR is another tool that helps keep crvUSD stabilized at \$1.00. When crvUSD trades above \$1.00, it creates more crvUSD to bring the price down. When crvUSD trades below $1.00, it removes crvUSD from circulation to bring the price up. The size of the reserve affects your rate - a bigger reserve generally results in a lower borrow rate, while a smaller reserve means higher rates.


### Lend Market Rates
In lending markets, the rate depends only on how much of the supplied crvUSD is being borrowed. Unlike mint markets, the price of crvUSD does not influence the borrow rate. Each market has a minimum and maximum rate range, and the higher the utilization, the higher the borrow rate.

The markets utilization is calculated as: 

$\text{utilization} = \frac{\text{amount borrowed}}{total supplied} \times 100$

When utilization is low, the rate stays close to the minimum and there's plenty of crvUSD available to borrow. As utilization increases (around 80%), the rate increases toward the maximum and there's less crvUSD available. At very high utilization (around 95%), the rate reaches the maximum and there's very little crvUSD left to borrow.


<LendingRateChart />

---

## Frontend Markets Overview

The Llamalend Markets interface provides a comprehensive view of all available borrowing opportunities. The interface displays two main types of markets: **Mint Markets** that allow you to mint crvUSD against approved collateral types (voted in by the DAO), and **Lend Markets** which are traditional lending markets where you borrow existing funds from vaults. Both together form Llamalend.

Each market displays key information including **borrow rates**, **supply yields** (for lend markets), utilization, and available liquidity to help users make informed borrowing decisions.

<figure>
<ThemedImage
    alt="Llamalend Markets interface showing mint and lend markets with filtering options"
    sources={{
        light: require('@site/static/img/user/llamalend/market_overview_light.png').default,
        dark: require('@site/static/img/user/llamalend/market_overview_dark.png').default,
    }}
    style={{ width: '800px', display: 'block', margin: '0 auto' }}
/>
</figure>

The UI lets you filter for several criteria such as:

- **Mint vs Lend markets**: Switch between mint markets (where you mint crvUSD against collateral) and lend markets (where you borrow existing liquidity from vaults)
- **Chain**: Filter by specific blockchain networks like Ethereum, Arbitrum, or other supported chains
- **Collateral and Debt Tokens**: Filter by the assets you can use as collateral or the tokens you want to borrow
- **Available Liquidity and Utilization**: Filter markets based on liquidity ranges and utilization percentages to find markets with sufficient funds or optimal conditions

Additionally, the UI allows you to save markets as favourites so one can mark them and filter for favourite markets. If you have active positions in any markets, you can also filter for "My Markets" to quickly view and manage your current positions across all supported chains and market types.
