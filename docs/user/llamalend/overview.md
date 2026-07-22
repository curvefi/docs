---
id: overview
title: Llamalend
sidebar_label: Overview
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';
import BadgeGrid from '@site/src/components/BadgeGrid'
import ThemedImage from '@theme/ThemedImage';
import GhostPosts from '@site/src/components/GhostPosts';

:::info[Version note]

This user guide currently describes **LlamaLend v1** markets. V1 markets are being phased out and **no new v1 markets will be deployed**. V1 markets require crvUSD as either the borrow or collateral token. [LlamaLend v2](/developer/llamalend-v2/overview) supports any ERC-20 pair and is required for all new markets.

:::

LlamaLend v1 is Curve's non-custodial lending infrastructure allowing users to borrow crvUSD against their crypto assets or lend crvUSD to markets. Each v1 market contains crvUSD as either the borrow token or the collateral token.

There are two distinct ways to use Llamalend:

<BadgeGrid
  cards={[
    {
      title: "Borrowing",
      description: "Borrow crvUSD or other assets by providing collateral. Available in both mint markets and lending markets, allowing you to access liquidity while maintaining exposure to your crypto assets.",
      href: "borrowing"
    },
    {
      title: "Supplying",
      description: "Supply assets to earn yield by lending them to borrowers. Only available in lending markets - mint markets don't offer supply opportunities since crvUSD is minted rather than borrowed from existing liquidity.",
      href: "supplying"
    },
  ]}
/>

Llamalend combines several key features:

- **Liquidation Protection:** By borrowing on Curve, users benefit from built-in liquidation protection, giving users more peace of mind when borrowing and potentially more time to repay loans when markets crash.
- **Highest LTV across DeFi:** Allows borrowing up to 91% LTV against BTC and ETH and up to 98% against yield-bearing and low-volatility tokens like sDAI or sUSDe. Perfect for looping.
- **Isolated Markets:** All markets are isolated, one-way markets where each market only has one collateral token and one borrowable token. This design eliminates risk of contamination through depegged assets, keeps risk contained within each market, and makes it easier to understand your exposure. Unlike some other protocols where risks can spread across multiple assets, Llamalend's isolation ensures that problems in one market don't affect others. Collateral is not re-hypothecated.
- **Permissionless Markets**: No gatekeeping. Everyone can deploy lending markets.

## Interesting Reads

This is a collection of articles, news, and explainers about Llamalend covering the latest updates, features, and insights.

<GhostPosts tag="Llamalend" limit={3} sectionTitle="Llamalend Articles" compact={true} enablePagination={true} />

## Different Market Types

From a user interface and usage perspective, both products function identically. The primary difference is in how borrow rates are calculated between mint markets and lending markets. More here: [Borrowing: Borrow Rates](./borrowing.md#borrow-rates).


<BadgeGrid
  cards={[
    {
      title: "Mint Markets",
      description: "Mint Markets enable users to mint crvUSD directly against specific collateral types approved by the DAO. This is a direct minting process where new crvUSD tokens are created against deposited collateral.",
    },
    {
      title: "Lending Markets",
      description: "Lending Markets operate like traditional DeFi lending protocols, where users borrow existing funds from vaults. No new tokens are minted - users borrow from the supply provided by other participants in the market.",
    },
  ]}
/>
