---
id: why-curve
title: Why Build on Curve
sidebar_label: Why Curve
description: Curve is a permissionless DEX and lending protocol, owned by the Curve DAO, where stablecoin, LST, RWA and token issuers, DeFi protocols and chains deploy liquidity pools, Llamalend lending markets and gauge incentives.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid'
import ProtocolCardGrid from '@site/src/components/ProtocolCardGrid'
import ChainPresence from '@site/src/components/ChainPresence'
import GhostPosts from '@site/src/components/GhostPosts';

Curve is a permissionless decentralized exchange (DEX) and lending protocol, owned and governed by the Curve DAO. Anyone can deploy a liquidity pool, a Llamalend lending market and gauge incentives for any ERC-20 token, without asking a central team and without a listing fee. Your token gets a place to trade, a place to borrow and lend, and one incentive system for both.

## Curve in Numbers

| | |
| --- | --- |
| Liquidity pools | About 2,400 |
| Liquidity in pools | About $1.15B |
| Trading volume, last 24 hours | About $76M |
| Llamalend v2 markets | 11, on Ethereum and Optimism |
| Live since | 2020 |

As of 17 November 2026. Pool figures cover the 10 chains tracked by the [Curve Prices API](https://prices.curve.finance/v1/chains/). The market count is read onchain from the Llamalend v2 factories.

## Start Here

Choose the page that matches what you are building. Each one explains what you get, what your users get and how to set it up.

<GuideCardGrid guideKeys={['StartStablecoinIssuers', 'StartLstBtcIssuers', 'StartRwaIssuers', 'StartTokenProjects', 'StartDefiProtocols', 'StartChains', 'StartIntegrators', 'LaunchPlaybook']} />

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

## Liquidity and Lending in One Place

A Curve pool and a Llamalend market work best together. The pool gives your token a price oracle and the liquidity that liquidations need. The market gives holders and liquidity providers a reason to keep their tokens and borrow against them. Both use the same gauges to direct incentives. See [How Llamalend Works With the Curve DEX](/protocol/lending/launch-isolated-lending-market#how-llamalend-works-with-the-curve-dex).

## Security and Neutrality

- **Owned by the Curve DAO.** veCRV holders control Curve's contracts on every chain. Changes need an onchain vote on Ethereum. See [Curve DAO](/user/dao/overview).
- **Limited emergency powers.** The Emergency DAO, a 5-of-9 multisig, can only reduce risk, such as lowering debt ceilings, and cannot move user funds. See [Emergency DAO](/user/dao/emergency-dao).
- **Audited and covered by a bug bounty.** Audits by ChainSecurity, MixBytes, Quantstamp, Trail of Bits and StateMind, and a bug bounty of up to $250,000. See [Security](/developer/security).
- **The same rules for every token.** Deploying a pool or lending market needs no approval and no fee beyond gas. CRV emissions and lending borrow caps go through public DAO votes. See [Whitelisting a Gauge](/protocol/gauge/whitelisting-gauge).

## Who Builds on Curve

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

- **Lido** provides stETH liquidity through the ETH/stETH pool on Curve.
- **Inverse Finance** pairs DOLA against a Curve base pool and has an sDOLA lending market on Llamalend.
- **Resupply**: the reUSD/sfrxUSD Curve LP token is collateral in a Llamalend market.
- **YieldBasis** runs crvUSD/WBTC and crvUSD/cbBTC pools on Curve, using crvUSD minted for it.
- **Convex, Yearn and StakeDAO** build products on veCRV and Curve gauges.

## Curve's Chain Presence

Curve runs on many networks. Full DEX deployments deliver the complete Curve experience: gauges, CRV emissions and full frontend support. **Curve Lite** lets new rollups launch with production-grade swapping from day one. It deploys Curve's core pool factories, a router, gauges for your own rewards and frontend support, all owned by the Curve DAO. See [Curve for Chains and L2s](/protocol/start-here/chains).

<ChainPresence />

## Three Core Pillars

### Curve DEX
Curve started as a DEX. Its **Stableswap algorithm**, launched in 2020, trades stable-like assets with low slippage. The **Cryptoswap algorithm** for volatile pairs followed in 2021, and **FXSwap** for low-volatility pairs priced elsewhere came later.

Curve pools provide:

- **Passive liquidity** - no range-setting, rebalancing or manual upkeep; liquidity is always in range, so LPs always earn trading fees.
- **Algorithms for every asset type** - from pegged stablecoins to volatile pairs, and for ERC-20, ERC-4626, rebasing and oracle-priced tokens. Yield from rebasing tokens goes to LPs.
- **Permissionless deployment** - deploy pools without DAO approval and with **no deployment fees**.
- **Built-in onchain oracles** - every pool has an EMA price oracle that other protocols, including Llamalend, can read.
- **Open to routing** - pools are open contracts that Curve's router and other routing services can trade through.

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
Curve's gauge system lets you bootstrap and sustain liquidity for your token:

- **CRV emissions** - a share of Curve's weekly CRV inflation, directed by veCRV gauge weight votes.
- **Direct gauge rewards** - your own token rewards in your gauge, with no governance vote.
- **Vote incentives** - rewards to veCRV holders who vote for your gauge.
- **Owned voting power** - hold veCRV or vlCVX to vote for your own gauge.

You can combine these routes. See [Incentivizing a Pool](/protocol/gauge/incentive-routes).

## FAQ

**What is Curve?**
A permissionless DEX and lending protocol owned by the Curve DAO. It runs liquidity pools for stable and volatile assets, Llamalend lending markets and a gauge system that directs CRV emissions and other rewards.

**Do I need approval to list my token on Curve?**
No. Anyone can deploy a pool or a lending market for any ERC-20 token, with no fee beyond gas. CRV emissions and the borrow cap of a new lending market need a Curve DAO vote.

**Which chains does Curve support?**
Curve pools run on many EVM chains, listed above. Llamalend v2 runs on Ethereum and Optimism.

**How do I attract liquidity to my pool?**
Deploy a gauge and fund it with your own rewards, request CRV emissions through a DAO vote, or pay vote incentives to veCRV holders. See [Incentivizing a Pool](/protocol/gauge/incentive-routes).

## Getting Started

Follow the [Launch Playbook](/protocol/launch-playbook) for every step, or go straight to a product:

<GuideCardGrid guideKeys={['LiquidityPools', 'LendingMarkets', 'GaugesAndIncentives']} />

<GhostPosts tag="why-curve" limit={3} sectionTitle="Latest Articles" compact={true} enablePagination={true} />
