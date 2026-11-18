---
id: stablecoin-issuers
title: Curve for Stablecoin Issuers
sidebar_label: Stablecoin Issuers
description: How stablecoin issuers, including yield-bearing, savings and FX stablecoins, use Curve for peg liquidity, metapools, Llamalend lending markets and CRV incentives.
---

Stablecoin issuers use Curve to hold their peg (the price the token tracks, such as $1) with deep onchain liquidity and to let holders borrow against their token. This page covers USD, EUR, CHF and other fiat-pegged stablecoins, including yield-bearing and savings versions.

## A Pool Built Around Your Peg

A [Stableswap](../pool/understanding-stableswap.md) pool concentrates liquidity around the peg, so large trades move the price very little. Liquidity providers (LPs) don't set ranges, and their liquidity stays in place when the price moves. Every pool also records a pool oracle (an exponential moving average, or EMA, of its price) that lending protocols and dashboards can read as a peg signal.

## Savings and Yield-Bearing Versions

Stableswap-NG pools accept rebasing tokens (balances that grow without transfers), ERC-4626 tokens (the standard yield-bearing deposit token) and tokens priced by a rate oracle, so a savings version of your stablecoin can trade next to the base token at its current rate. [Understanding Stableswap](../pool/understanding-stableswap.md#supported-asset-types) lists the supported token types.

## Reaching Existing Liquidity Through a Metapool

A metapool pairs your stablecoin with a base pool that the Curve DAO has approved, such as PYUSD/USDC on Ethereum. Traders reach your token from every coin in the base pool. [Understanding Stableswap](../pool/understanding-stableswap.md#basepool-list) lists the base pools.

## Borrowing Against Your Stablecoin

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your stablecoin or its savings version, and keep it. LPs can also borrow against the pool's LP token (the token that represents a share of the pool). Gauges (the contracts that distribute incentives) pay incentives on the pool and on the market.

## What Holders and LPs Get

![Holders can borrow against your token, earn swap fees by providing liquidity, or borrow against the LP token.](/img/protocol/pool/token-holder-options.png)

- Traders swap in and out of your stablecoin with low slippage (little price movement per trade), on Curve or through DEX aggregators.
- LPs earn trading fees and incentives without managing a position.
- Borrowers keep the savings yield on their collateral, and soft liquidation converts collateral gradually as the price falls, instead of selling it at one price.
- Lenders supply to an ERC-4626 vault and earn the interest borrowers pay.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| USD stablecoin | Stableswap with USDC, USDT or crvUSD, or a metapool | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Savings or yield-bearing stablecoin | Stableswap-NG with the base stablecoin, ERC-4626 asset type | Savings token as collateral | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| EUR, CHF, GBP or other non-USD stablecoin | Stableswap with a token on the same peg, or FXSwap against a USD stablecoin | Optional | [Understanding FXSwap](../pool/understanding-fxswap.md) |

[Pool Parameter Presets](../pool/presets.md) gives starting parameters and live stablecoin pools to compare against.

## Case Studies

- [Resupply: A Curve Ecosystem Success Story](https://news.curve.finance/resupply-success-story/)
- [Ethena Leverages Curve Finance to Support USDtb Launch](https://news.curve.finance/ethena-usdtb-curve-launch/)

## Requirements and Limits

A rate oracle for a savings token has strict rules; read [Oracle-Based Tokens](../pool/guides/deploy-stableswap.md#oracle-based-tokens) before you deploy.

CRV emissions need a Curve DAO vote, and the DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists. Direct rewards in your own token need no vote. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).

You can deploy a metapool only on an existing base pool. A new lending market can't lend until a DAO vote raises its borrow cap from zero.

## FAQ

### Which pool type should a stablecoin use?

Stableswap, paired with a token on the same peg. Pairs with different pegs, such as EUR against USD, fit FXSwap.

### Can a savings stablecoin trade in a Curve pool?

Yes. Stableswap-NG supports ERC-4626 tokens and tokens priced by a rate oracle.

### Can holders borrow against my stablecoin?

Yes, through a Llamalend market with your token as collateral. Borrowing opens after a DAO vote sets the borrow cap.

### Can liquidity providers borrow against the pool's LP token?

Yes. Llamalend accepts LP tokens of 2-coin Stableswap-NG pools as collateral, and LPs keep earning trading fees on the liquidity underneath. The reUSD/sfrxUSD LP market on Ethereum is an example. See [Supported Collateral](../lending/launch-isolated-lending-market.md#supported-collateral).

### Does a pool need CRV emissions?

No. A pool works without a gauge. Incentives help attract liquidity.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Timeline](../launch-playbook.md)
- [Understanding Stableswap](../pool/understanding-stableswap.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
