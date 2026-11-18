---
id: why-curve
title: Why Build on Curve
sidebar_label: Why Curve
description: Curve is a permissionless DEX and lending protocol owned by the Curve DAO. Issuers, DeFi protocols and chains deploy liquidity pools, Llamalend lending markets and gauge incentives on it without approval.
---

import ChainPresence from '@site/src/components/ChainPresence'

Curve is a decentralized exchange (DEX) and lending protocol owned by the [Curve DAO](/user/dao/overview). Anyone can deploy a liquidity pool, a [Llamalend](./lending/launch-isolated-lending-market.md) lending market or a gauge (the contract that pays incentives to a pool's liquidity providers, or LPs) for an ERC-20 token, with no listing process and no fee beyond gas.

A token on Curve can trade in a pool, back loans in a lending market and earn incentives through one gauge system. The pool oracle (the pool's own moving-average price) and trading liquidity are what a lending market for the token relies on.

## Key Figures

| Metric | Value |
| --- | --- |
| Liquidity pools | About 2,400 |
| Liquidity in pools | About $1.15B |
| Trading volume, last 24 hours | About $76M |
| Llamalend v2 markets | 11, on Ethereum and Optimism |
| Live since | 2020 |

Pool figures are from the [Curve Prices API](https://prices.curve.finance/v1/chains/) as of 17 November 2026 and cover the 10 chains it tracks. The market count is read onchain from the Llamalend v2 factories.

## Who Controls Curve

The Curve DAO controls Curve's contracts on every chain. Holders of veCRV (CRV locked for voting power) vote onchain on Ethereum, and passed votes are relayed to other chains. CRV emissions for a gauge and the borrow cap of a new lending market each need a public Curve DAO vote.

The [Emergency DAO](/user/dao/emergency-dao), a 5-of-9 multisig (a wallet that needs several signers to act), can reduce risk, for example by lowering the debt ceilings of crvUSD mint markets. It cannot move user funds.

Curve's contracts have been audited by ChainSecurity, MixBytes, Quantstamp, StateMind and Trail of Bits, and a bug bounty pays up to $250,000. See [Security](/developer/security).

## Where to Go Next

| Job | Start here |
| --- | --- |
| Find the setup for your token or protocol | [Use Cases](./use-cases/overview.md) |
| Deploy a pool | [Launch Liquidity](./pool/overview.md) |
| Deploy a lending market | [Launch and Run a Lending Market](./lending/launch-isolated-lending-market.md) |
| Fund liquidity and get CRV emissions | [Incentives and Governance](./gauge/overview.md) |
| Integrate Curve contracts and data | [Integrate](./integrate/overview.md) |

## Chains

<ChainPresence />
