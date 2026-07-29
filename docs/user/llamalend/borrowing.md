---
id: borrowing
title: Borrowing
sidebar_label: Borrowing
---

import LendingRateChart from '@site/src/components/LendingRateChart';
import ThemedImage from '@theme/ThemedImage';
import GuideCardGrid from '@site/src/components/GuideCardGrid';

## Why Borrow on Llamalend?

Borrowing on Llamalend allows users to access liquidity while maintaining exposure to their crypto assets. Instead of selling their holdings, users can use them as collateral to borrow crvUSD or other assets. Users borrowing on Llamalend benefit from:

- **Liquidation Protection**: LLAMMA gradually converts collateral instead of liquidating at one specific price, which can give users more time to react. Each conversion can reduce collateral value and health, so it does not guarantee protection from full liquidation
- **Maintain Exposure**: Keep crypto positions while accessing liquidity. Users don't have to sell their assets to get cash, preserving their potential upside
- **Leverage**: Use borrowed funds to increase market exposure or invest in additional opportunities
- **No Opening/Closing Fees**: Users just pay the interest rate while the loan remains open
- **No Minimum Loan Amounts**: Users can open a loan for any amount, there's no minimum

:::info
Liquidation protection is integral to understand before using Llamalend. Most users should treat entry into the range as a signal to close or reset their position rather than remain there. For detailed information about losses and loan health monitoring, see [Liquidation Protection & Loan Health](/user/llamalend/guides/borrow/liquidation).
:::

<GuideCardGrid guideKeys={['howToOpenAndCloseLoan', 'howToManageLoan', 'whatToDoIfLoanInLiquidation']} />


## Borrow Rates

When users borrow crvUSD, they pay interest on their loan based on the current **borrow rate**. These dynamic interest rates help maintain the stability of crvUSD.

<!-- could add a chart of crvusd price here -->

This borrow rate on Llamalend is **dynamic** and adjusts based on different market conditions, with interest charged every second. Users don't need to make manual interest payments—instead, the loan's debt automatically grows over time to account for the accrued interest. There are two types of markets in Llamalend, each with a different interest rate model:

### Mint Markets

The borrow rate in mint markets is influenced by two main factors: the price of crvUSD and the size of the Peg Stabilization Reserve (PSR). The rate mechanism is designed to help maintain crvUSD's $1.00 peg through economic incentives.

- **When crvUSD trades above \$1.00**: The borrow rate goes **down** to incentivize more users to borrow crvUSD. Users can then sell the borrowed crvUSD for other stablecoins or use it for leveraging positions. This creates sell pressure on crvUSD, pushing the price back down toward $1.00.

- **When crvUSD trades below \$1.00**: The borrow rate goes **up**, making it more expensive to maintain open loans. This encourages users to repay their debt, often requiring them to buy crvUSD (since they may have sold or used the borrowed crvUSD for other purposes). This creates buy pressure on crvUSD, pushing the price back up toward $1.00.

:::info
The PSR is another tool that helps keep crvUSD stabilized at \$1.00. When crvUSD trades above \$1.00, it creates more crvUSD to bring the price down. When crvUSD trades below $1.00, it removes crvUSD from circulation to bring the price up. The size of the reserve affects the borrow rate - a bigger reserve generally results in a lower borrow rate, while a smaller reserve means higher rates.
:::

### Lend Market Rates

In lending markets, the rate depends only on market utilization — the percentage of supplied crvUSD that is being borrowed. Unlike mint markets, the price of crvUSD does not influence the borrow rate. Each market has a minimum and maximum rate range. The higher the utilization, the higher the borrow rate.

Market utilization is calculated as: 

$$
\text{utilization} = \frac{\text{amount borrowed}}{total supplied} \times 100
$$

When utilization is low, the rate stays close to the minimum and there's plenty of crvUSD available to borrow. As utilization increases, the rate increases toward the maximum and less crvUSD becomes available. At full utilization (100%), the rate reaches the maximum and there's no crvUSD left to borrow.
