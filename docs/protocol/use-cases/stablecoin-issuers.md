---
id: stablecoin-issuers
title: Curve for Stablecoin Issuers
sidebar_label: Stablecoin Issuers
description: How stablecoin issuers, including yield-bearing, savings and FX stablecoins, use Curve for peg liquidity, metapools, crvUSD pairs, Llamalend lending markets and CRV incentives.
---

Stablecoin issuers use Curve to hold their peg with deep onchain liquidity and to let holders borrow against their token. This page covers USD, EUR, CHF and other fiat-pegged stablecoins, including yield-bearing and savings versions.

## What Curve Provides

A [Stableswap](../pool/understanding-stableswap.md) pool concentrates liquidity around the peg, so large trades move the price very little. Liquidity providers don't set ranges, and their liquidity stays in place when the market moves.

Stableswap-NG pools accept standard ERC-20 tokens, rebasing tokens, ERC-4626 vault shares and tokens priced by a rate oracle. A savings version of your stablecoin can sit in a pool next to the base token and trade at its current rate.

A metapool pairs your stablecoin with a base pool that the Curve DAO has approved, such as PYUSD/USDC on Ethereum. Traders then reach your token from every coin in the base pool.

Every pool has a built-in EMA price oracle. Lending protocols and dashboards can read it onchain as a peg signal.

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your stablecoin or its savings version. Gauges pay incentives on both the pool and the market. Deploying a pool costs only gas.

## Pairing With crvUSD

crvUSD is Curve's stablecoin, backed by crypto collateral and governed by the Curve DAO. A pool against crvUSD links your stablecoin to every venue where crvUSD trades.

The pairing also matters for lending. The live Llamalend markets on Ethereum lend crvUSD, so a market with your token as collateral lets your holders borrow crvUSD against it. See [crvUSD](/user/curve-tokens/crvusd).

## What Your Users Get

- Traders swap in and out of your stablecoin with low slippage, on Curve or through DEX aggregators.
- Liquidity providers earn trading fees and gauge rewards without managing a position. Yield from rebasing tokens goes to them.
- Borrowers keep the savings yield on their collateral, and LLAMMA converts collateral gradually if the price falls.
- Lenders supply to an ERC-4626 vault and earn the interest borrowers pay.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| USD stablecoin | Stableswap with USDC, USDT or crvUSD, or a metapool | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Savings or yield-bearing stablecoin | Stableswap-NG with the base stablecoin, ERC-4626 asset type | Savings token as collateral | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| EUR, CHF, GBP or other non-USD stablecoin | Stableswap with a token on the same peg, or FXSwap against a USD stablecoin | Optional | [Understanding FXSwap](../pool/understanding-fxswap.md) |

After the pool, deploy a gauge and pick an incentive route from [Incentivizing a Pool](../gauge/incentive-routes.md).

## Case Studies

Figures are from the Curve Prices API as of 17 November 2026.

Frankencoin's Swiss franc stablecoin, ZCHF, has a [ZCHF/crvUSD pool](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9). Its savings token, svZCHF, is collateral in a Llamalend market.

Frax pairs its savings token in the [sfrxUSD/frxUSD pool](https://etherscan.io/address/0xF292eB6c5dcb693Eaaf392D0562a01C3710E5978), which held about $17.5M. The sfrxUSD/crvUSD market was the largest Llamalend v2 market.

Inverse Finance's [DOLA/sUSDe pool](https://etherscan.io/address/0x744793B5110f6ca9cC7CDfe1CE16677c3Eb192ef) held about $46.3M. Holders of its savings token borrow crvUSD in the sDOLA/crvUSD market.

PayPal USD has a [pyUSD/crvUSD pool](https://etherscan.io/address/0x625E92624Bc2D88619ACCc1788365A69767f6200) with about $24.0M. PYUSD/USDC is also a base pool for metapools on Ethereum.

## Requirements and Limits

A pool supports tokens with up to 18 decimals. A rate oracle for a savings token must never decrease and must not read a spot price; the [Stableswap guide](../pool/guides/deploy-stableswap.md#oracle-based-tokens) lists the rules.

CRV emissions need a Curve DAO vote, and the DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists. Rewards in your own token need no vote. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).

You can deploy a metapool only on an existing base pool. A new lending market can't lend until a Curve DAO vote raises its borrow cap from zero. The DAO can also change pool parameters, such as the amplification factor, after deployment.

## FAQ

### Which pool type should a stablecoin use?

Stableswap, paired with a token on the same peg. Pairs with different pegs, such as EUR against USD, fit FXSwap.

### Can a savings stablecoin trade in a Curve pool?

Yes. Stableswap-NG supports ERC-4626 vault shares and tokens priced by a rate oracle.

### Can holders borrow against my stablecoin?

Yes, through a Llamalend market with your token as collateral. Borrowing opens after a Curve DAO vote sets the borrow cap.

### Does a pool need CRV emissions?

No. A pool works without a gauge. Rewards help attract liquidity.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Understanding Stableswap](../pool/understanding-stableswap.md)
- [Incentivizing a Pool](../gauge/incentive-routes.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
