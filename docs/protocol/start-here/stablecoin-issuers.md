---
id: stablecoin-issuers
title: Curve for Stablecoin Issuers
sidebar_label: Stablecoin Issuers
description: How stablecoin issuers, including yield-bearing, savings and FX stablecoins, use Curve for peg liquidity, metapools, crvUSD pairs, Llamalend lending markets and CRV incentives.
---

Curve is where stablecoin issuers build deep, low-slippage peg liquidity and give holders a place to borrow and lend. It works for USD, EUR, CHF and other fiat-pegged stablecoins, and for their yield-bearing and savings versions.

## What You Get

- **A pool built for pegged assets.** Stableswap concentrates liquidity around the peg, so large trades move the price very little. Liquidity providers don't set ranges, so liquidity stays in place when the market moves.
- **Support for your token's design.** Stableswap-NG pools accept standard ERC-20s, rebasing tokens, ERC-4626 vault shares and tokens priced by a rate oracle. A savings version of your stablecoin can sit in a pool next to the base token.
- **Access to existing liquidity.** A metapool pairs your stablecoin with a DAO-approved base pool, such as USDC/USDT, so traders reach your token from every coin in that base pool.
- **A price oracle.** Every pool has a built-in EMA price oracle that you, lending protocols and dashboards can read onchain.
- **Lending for your holders.** A Llamalend market lets holders borrow against your stablecoin, or its savings version, instead of selling it.
- **One incentive system.** CRV emissions, your own rewards and vote incentives all run through the same gauges.
- **No listing fee.** Deploying a pool costs only gas and needs no approval.

## What Your Users Get

- **Traders** swap in and out of your stablecoin with low slippage, on Curve or through routers that include Curve pools.
- **Liquidity providers** earn trading fees with no range management, plus gauge rewards. Yield from rebasing tokens goes to them.
- **Borrowers** borrow against your stablecoin with LLAMMA liquidation protection, and a savings token keeps earning while it backs a loan.
- **Lenders** supply to an ERC-4626 vault and earn interest from borrowers.

## Pairing With crvUSD

crvUSD is Curve's decentralized stablecoin, backed by crypto collateral and governed by the Curve DAO. A pool against crvUSD connects your stablecoin to every venue where crvUSD trades.

It also matters for lending. The live Llamalend markets on Ethereum lend crvUSD, so a market with your token as collateral lets your holders borrow crvUSD against it. See [crvUSD](/user/curve-tokens/crvusd).

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| USD stablecoin | Stableswap pool with USDC, USDT or crvUSD, or a metapool on a base pool | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Savings or yield-bearing stablecoin (ERC-4626) | Stableswap-NG pool with the base stablecoin, using the ERC-4626 asset type | Llamalend market with the savings token as collateral | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| Non-USD stablecoin (EUR, CHF, GBP) | Stableswap pool with another stablecoin on the same peg, or FXSwap against a USD stablecoin | Optional | [Understanding FXSwap](../pool/understanding-fxswap.md) |

Then deploy a gauge and choose an incentive route. See [Incentivizing a Pool](../gauge/incentive-routes.md).

## Case Studies

Figures as of 17 November 2026, from the Curve Prices API.

- **PayPal USD (PYUSD).** The [pyUSD/crvUSD pool](https://etherscan.io/address/0x625E92624Bc2D88619ACCc1788365A69767f6200) holds about $24.0M, and PYUSD/USDC is a base pool for metapools on Ethereum.
- **Inverse Finance (DOLA).** The [DOLA/sUSDe pool](https://etherscan.io/address/0x744793B5110f6ca9cC7CDfe1CE16677c3Eb192ef) holds about $46.3M. The sDOLA/crvUSD Llamalend market lends crvUSD against Inverse's savings token.
- **Frax (frxUSD).** The [sfrxUSD/frxUSD pool](https://etherscan.io/address/0xF292eB6c5dcb693Eaaf392D0562a01C3710E5978) holds about $17.5M, and the sfrxUSD/crvUSD Llamalend market is the largest live v2 market.
- **Frankencoin (ZCHF).** The Swiss franc stablecoin has a [ZCHF/crvUSD pool](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9) and an svZCHF/crvUSD Llamalend market for its savings token.

## Requirements and Limits

- **Token behavior.** Pools support standard, rebasing, ERC-4626 and oracle-priced tokens with at most 18 decimals. A rate oracle must never decrease and must not use spot prices. See [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md#oracle-based-tokens).
- **CRV emissions need a DAO vote.** The DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists. Direct gauge rewards need no vote. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).
- **Base pools are DAO-approved.** You can deploy a metapool only on an existing base pool.
- **Lending needs a DAO vote too.** A new Llamalend market starts with a borrow cap of zero until a Curve DAO vote raises it.
- **Parameters can change.** The DAO can adjust pool parameters, such as the amplification factor, after deployment.

## FAQ

**Which pool type should a stablecoin use?**
Stableswap, paired with another asset on the same peg. Use FXSwap for pairs with different pegs, such as EUR against USD.

**Can my savings stablecoin be in a Curve pool?**
Yes. Stableswap-NG supports ERC-4626 vault shares and tokens priced by a rate oracle.

**Can holders borrow against my stablecoin on Curve?**
Yes, through a Llamalend market with your token as collateral. Borrowing opens after a Curve DAO vote sets the borrow cap.

**Does a pool need CRV emissions to work?**
No. A pool works without a gauge. Gauges and rewards help attract more liquidity.

## Next Steps

- Follow the [Launch Playbook](../launch-playbook.md) from pool to lending market.
- Read [Understanding Stableswap](../pool/understanding-stableswap.md) for how the pool prices trades.
- Ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
