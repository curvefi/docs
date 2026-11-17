---
id: why-curve
title: Why Build on Curve
sidebar_label: Why Curve
description: Curve is a permissionless DEX and lending protocol owned by the Curve DAO. Stablecoin, LST, RWA and token issuers, DeFi protocols and chains use it to deploy liquidity pools, Llamalend lending markets and gauge incentives.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid'
import ProtocolCardGrid from '@site/src/components/ProtocolCardGrid'
import ChainPresence from '@site/src/components/ChainPresence'
import GhostPosts from '@site/src/components/GhostPosts';

Curve is a decentralized exchange (DEX) and lending protocol owned by the [Curve DAO](/user/dao/overview). Anyone can deploy a liquidity pool, a [Llamalend](/protocol/lending/launch-isolated-lending-market) lending market or a gauge for any ERC-20 token. There is no listing process and no fee beyond gas.

A token on Curve can trade in a pool, serve as collateral in a lending market and earn incentives through the same gauge system.

## How Large Is Curve?

| Metric | Value |
| --- | --- |
| Liquidity pools | About 2,400 |
| Liquidity in pools | About $1.15B |
| Trading volume, last 24 hours | About $76M |
| Llamalend v2 markets | 11, on Ethereum and Optimism |
| Live since | 2020 |

Pool figures are from the [Curve Prices API](https://prices.curve.finance/v1/chains/) as of 17 November 2026 and cover the 10 chains it tracks. The market count is read onchain from the Llamalend v2 factories.

## Where Should You Start?

Each page below covers one type of builder. It explains what Curve provides, what your users get and which guides to follow.

<GuideCardGrid guideKeys={['StartStablecoinIssuers', 'StartLstBtcIssuers', 'StartRwaIssuers', 'StartTokenProjects', 'StartDefiProtocols', 'StartChains', 'StartIntegrators', 'LaunchPlaybook']} />

## What Does Each Participant Get?

| Participant | What Curve provides |
| --- | --- |
| Asset issuers | A pool with a built-in price oracle, a lending market for holders and gauges for incentives |
| Liquidity providers | Trading fees without range management, plus gauge rewards |
| Borrowers | Loans against volatile, yield-bearing and LP tokens, with gradual liquidation through LLAMMA |
| Lenders | ERC-4626 vaults that earn interest in isolated markets |

## How Do Pools and Lending Markets Work Together?

A Curve pool gives your token a price oracle and the trading liquidity that liquidations depend on. A Llamalend market can read that oracle, and it lets holders borrow against the token and keep it. Liquidity providers can post their LP tokens as collateral and keep earning trading fees. One gauge system pays incentives on both. See [How Llamalend Works With the Curve DEX](/protocol/lending/launch-isolated-lending-market#how-llamalend-works-with-the-curve-dex).

## Who Controls Curve?

The Curve DAO controls Curve's contracts on every chain. veCRV holders vote onchain on Ethereum, and passed votes are relayed to other chains.

The [Emergency DAO](/user/dao/emergency-dao), a 5-of-9 multisig, holds narrower powers. It can reduce risk, for example by lowering debt ceilings, and it cannot move user funds.

Curve's contracts have been audited by ChainSecurity, MixBytes, Quantstamp, StateMind and Trail of Bits. A bug bounty pays up to $250,000. See [Security](/developer/security).

Every token follows the same rules. Deploying a pool or a lending market needs no approval. CRV emissions and the borrow cap of a new lending market each need a public Curve DAO vote, described in [Whitelisting a Gauge](/protocol/gauge/whitelisting-gauge).

## Who Builds on Curve?

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

- Convex and StakeDAO hold veCRV and let their token holders direct its votes.
- Inverse Finance pairs DOLA with Curve base pools and has an sDOLA market on Llamalend.
- Lido's stETH trades in the ETH/stETH pool.
- Resupply's reUSD/sfrxUSD LP token is collateral in a Llamalend market.
- YieldBasis runs crvUSD/WBTC and crvUSD/cbBTC pools, funded with crvUSD minted for it.

## Which Chains Does Curve Run On?

**Curve Lite** is a smaller deployment for new chains: Curve's pool factories, a router, gauges and frontend support, owned by the Curve DAO. Its gauges can receive CRV emissions once the Curve DAO adds them by vote. Full deployments add frontend analytics, and Llamalend runs on Ethereum and Optimism. See [Curve for Chains and L2s](/protocol/start-here/chains).

<ChainPresence />

## What Does Curve Offer?

### Curve DEX

Curve started as a DEX in 2020 with the Stableswap algorithm for pegged assets. Cryptoswap for volatile pairs followed in 2021, and FXSwap for pairs priced on an external market came later.

Liquidity providers don't set price ranges. Their liquidity stays active as prices move, so it keeps earning trading fees. Stableswap-NG pools accept standard, rebasing, ERC-4626 and oracle-priced tokens, and yield from rebasing tokens goes to liquidity providers. Every pool has an EMA price oracle that other contracts, including Llamalend, can read. Aggregators such as [0x](https://docs.0x.org/evm/need-help/faq), 1inch, [CoW Swap](https://docs.cow.fi/cow-protocol), [KyberSwap](https://docs.kyberswap.com/getting-started/supported-exchanges-and-networks), Odos and ParaSwap route swaps through Curve pools, and they pick up new pools without a listing step.

### Llamalend

Llamalend is Curve's lending protocol. Each market is isolated, with one collateral token and one borrowed token. When the collateral price falls, LLAMMA converts collateral gradually across a price range. Collateral can be a volatile asset, a yield-bearing ERC-4626 token or a Curve LP token. Live markets for yield-bearing stablecoins allow a maximum LTV of up to about 98%. See [Launch a Lending Market](/protocol/lending/launch-isolated-lending-market).

Llamalend v1 is deprecated. New markets use Llamalend v2.

### Gauges and Incentives

A gauge pays rewards to liquidity providers who stake their LP tokens in it. It can pay CRV emissions, which veCRV holders direct with weekly votes, and rewards in a token you choose, which need no vote. You can also pay vote incentives to veCRV holders, or hold veCRV or vlCVX and vote for your own gauge. See [Incentivizing a Pool](/protocol/gauge/incentive-routes).

## FAQ

### What is Curve?

A DEX and lending protocol owned by the Curve DAO. It runs liquidity pools for stable and volatile assets, Llamalend lending markets and a gauge system for CRV emissions and other rewards.

### Do I need approval to list a token on Curve?

No. Anyone can deploy a pool or lending market for an ERC-20 token. CRV emissions and the borrow cap of a new lending market need a Curve DAO vote.

### Which chains does Curve support?

Curve pools run on the chains listed above. Llamalend v2 runs on Ethereum and Optimism.

### How do I attract liquidity to a pool?

Deploy a gauge. Fund it with your own token, request CRV emissions through a DAO vote, or pay vote incentives to veCRV holders.

## Related

- [Launch Playbook](/protocol/launch-playbook)
- [Pool Types](/protocol/pool/overview)
- [Launch a Lending Market](/protocol/lending/launch-isolated-lending-market)
- [Gauges & Incentives](/protocol/gauge/overview)

<GhostPosts tag="why-curve" limit={3} sectionTitle="Latest Articles" compact={true} enablePagination={true} />
