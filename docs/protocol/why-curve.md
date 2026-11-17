---
id: why-curve
title: The Backbone of DeFi
sidebar_label: Why Curve
description: Curve is a permissionless DEX and lending protocol where asset issuers and protocols deploy liquidity pools, Llamalend lending markets and gauge incentives for their tokens.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid'
import ProtocolCardGrid from '@site/src/components/ProtocolCardGrid'
import ThemedImage from '@theme/ThemedImage'
import ChainPresence from '@site/src/components/ChainPresence'
import GhostPosts from '@site/src/components/GhostPosts';

Curve is a permissionless decentralized exchange (DEX) and lending protocol. Anyone can deploy a liquidity pool, a Llamalend lending market and gauge incentives for any ERC-20 token, without asking a central team. Your token gets a place to trade, a place to borrow and lend, and one incentive system for both, all governed by the Curve DAO.

<GhostPosts tag="why-curve" limit={3} sectionTitle="Llamalend Articles" compact={true} enablePagination={true} />


Protocols and asset issuers that build on Curve include:

<ProtocolCardGrid protocols={[
  {
    name: "Convex, Yearn & StakeDAO",
    logo: "ll_united.svg"
  },
  {
    name: "Lido",
    logo: "lido.svg"
  },
  {
    name: "Resupply",
    logo: "resupply.svg"
  },
  {
    name: "YieldBasis",
    logo: "yieldbasis.svg"
  },
  {
    name: "more",
    logo: "100+"
  }
]} />

## What Each Participant Gets

**Asset issuers and protocols**
- A deep, passive liquidity pool for your token, with a built-in price oracle.
- A lending market where holders borrow against your token instead of selling it.
- CRV emissions, your own rewards and vote incentives through one gauge system.

**Liquidity providers**
- Liquidity that is always in range, with no rebalancing.
- Trading fees, plus CRV and token rewards through gauges.
- The option to borrow against Curve LP tokens in a Llamalend market and keep earning fees.

**Borrowers**
- Loans against volatile assets, yield-bearing tokens and Curve LP tokens.
- LLAMMA liquidation protection that sells collateral gradually instead of all at once.
- High LTV on correlated pairs and one-transaction leverage.

**Lenders**
- ERC-4626 vaults that earn interest from borrowers.
- Isolated markets, so a loss in one market does not spread to others.

**Integrators and builders**
- Pools that aggregators route through from day one.
- Onchain oracles, ERC-4626 vault shares and open contracts to compose with.

## Liquidity and Lending in One Place

A Curve pool and a Llamalend market work best together. The pool gives your token a price oracle and the liquidity that liquidations need. The market gives holders and liquidity providers a reason to keep their tokens and borrow against them. Both use the same gauges to direct incentives. See [How Llamalend Works With the Curve DEX](/protocol/lending/launch-isolated-lending-market#how-llamalend-works-with-the-curve-dex).

## Curve's Chain Presence

Curve runs on **multiple networks** to meet users and builders where they are. Full DEX deployments deliver the complete Curve experience (gauges, CRV emissions, and full frontend support). **Curve Lite** exists so new rollups have the possibility to launch with production‑grade swapping from day one. It rolls out Curve’s core DEX stack (permissionless Stableswap/Cryptoswap factories), direct frontend integration, and CurveDAO ownership/fees/CRV emissions.

<ChainPresence />

## Three Core Pillars, One Unified Platform

Curve is built on three core pillars that work together seamlessly:

### Curve DEX
Curve started as a DEX. Its **Stableswap algorithm**, launched in 2020, trades stable-like assets with low slippage. The **Cryptoswap algorithm** for volatile pairs followed in 2021.

Curve pools provide:

- **Passive Liquidity Provision** - no range-setting, rebalancing, or manual upkeep required; the LP's liquidity is always in range and used for trading, so LPs always earn trading fees.
- **Specialized and suitable algorithms** for every asset type - not only from pegged stablecoins to volatile crypto pairs but also different token standards like ERC-20, ERC-4626, Rebasing, and more. While other AMMs rob the LPs of the rebases, Curve gives them where they belong: **to the LPs.**
- **Fully Permissionless** - deploy pools instantly without DAO approvals and **no deployment fees.**
- **Fully Onchain Built-in Oracles** - liquidity pools on Curve come with built-in EMA oracles; no need to pay extra for centralized, issue-prone oracles.
- **Routing Integration from Day 1** - liquidity pools are automatically picked up by leading aggregators like 1inch, CowSwap, and Paraswap.

### Llamalend
Curve's permissionless lending protocol. Anyone can deploy an isolated, one-way lending market for any ERC-20 pair:

- **Liquidation protection** - LLAMMA converts collateral gradually as the price falls, which gives borrowers time to react.
- **Isolated markets** - each market has one collateral token and one borrowed token, so its risk stays inside that market.
- **Broad collateral** - volatile assets, yield-bearing ERC-4626 tokens and Curve LP tokens.
- **High LTV ratios** - live markets for yield-bearing stablecoins allow a maximum LTV of up to about 98%.

See [Launch a Lending Market](/protocol/lending/launch-isolated-lending-market) for supported collateral and live examples.

:::info

Llamalend v1 is deprecated. New lending markets should use Llamalend v2.

:::


### Gauges & Incentives
Curve's protocol mechanics makes it easy to bootstrap, maintain, and build liquidity for on-chain assets. Curve's gauge system provides a flexible incentive mechanism that enables you to bootstrap and sustain liquidity for your asset:

- **CRV Emissions** - Direct a portion of Curve's weekly CRV inflation to your pool through gauge weight voting, attracting more liquidity providers.
- **Direct Gauge Rewards** - Add your own token rewards to your gauge without a governance vote.
- **Vote Incentives** - Provide rewards to veCRV holders to vote for your gauge, creating sustainable voting power.
- **Flexible Strategies** - Choose between temporary vote renting or permanent veCRV accumulation based on your needs.
- **Custom Combinations** - Mix CRV emissions, direct gauge rewards, and vote incentives to create your perfect liquidity bootstrapping strategy.

---

## Getting Started

Ready to deploy a pool or lending market or proliferate your asset across DeFi? Here's how to get started:

<GuideCardGrid guideKeys={['LiquidityPools', 'LendingMarkets', 'GaugesAndIncentives']} />
