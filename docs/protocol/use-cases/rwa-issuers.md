---
id: rwa-issuers
title: Curve for RWA and Tokenized-Asset Issuers
sidebar_label: RWA & Tokenized Assets
description: How issuers of tokenized treasuries, credit, commodities, FX and other real-world assets use Curve pools, oracles and Llamalend lending markets, and which token requirements apply.
---

Issuers of tokenized real-world assets (RWAs), such as treasuries, credit, commodities and FX, use Curve for onchain liquidity and for isolated lending markets. Anyone can deploy a pool for an ERC-20 token, but a token's transfer rules decide what else Curve can offer it. Read [Requirements and Limits](#requirements-and-limits) first.

## What Curve Provides

A pool needs no listing process. You deploy it yourself, and it costs only gas.

The pool type depends on how your asset is priced. [Stableswap](../pool/understanding-stableswap.md) fits tokens that hold a stable value against a stablecoin. [FXSwap](../pool/understanding-fxswap.md) fits pairs whose price is set on an external market, such as FX rates.

Stableswap-NG accepts ERC-4626 vault shares and tokens priced by a rate oracle. A token whose value grows over time trades at its current rate.

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your token. Each market is isolated, so a loss in one market does not reach another.

The Curve DAO owns the protocol, and the same public rules apply to every token.

## What Your Users Get

- Holders can sell to stablecoins onchain whenever the pool has liquidity, without waiting for a redemption window.
- Liquidity providers earn trading fees without managing a position.
- Borrowers keep the asset's yield while it backs a loan, and LLAMMA converts collateral gradually if the price falls.
- Lenders supply to an ERC-4626 vault and earn the interest borrowers pay.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| Tokenized treasury or credit token with a growing value | Stableswap-NG with a stablecoin, ERC-4626 or oracle asset type | Against a stablecoin | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Stablecoin backed by real-world assets | Stableswap with USDC, USDT or crvUSD | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| FX token or asset with an external reference price | FXSwap against a stablecoin | Optional | [Deploy an FXSwap Pool](../pool/guides/deploy-fxswap.md) |

## Case Studies

Figures are from the Curve Prices API as of 17 November 2026.

Ethena's [USDtb/USDC pool](https://etherscan.io/address/0xC2921134073151490193AC7369313c8e0b08e1E7) held about $20.1M.

Maple's syrupUSDC, a yield-bearing USDC, is collateral in the syrupUSDC/crvUSD Llamalend market.

## Requirements and Limits

CRV emissions are usually out of reach for restricted tokens. The Curve DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes, blacklists or allowlists, and considers only freely transferable, openly accessible tokens. Rewards in your own token need no vote. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).

If your token moves only between approved addresses, the pool, its gauge and every user must be able to receive it. Check this before you deploy.

A rate oracle must return 18-decimal values, must never decrease and must not read a spot price. Check who controls it and whether they can change it.

FXSwap is not built for primary price discovery. It needs traders who arbitrage the pool against a deeper external market, and keeping it centered can require a refuel budget.

A Llamalend market needs a manipulation-resistant price for your token, and its borrow cap starts at zero until a Curve DAO vote raises it. Tokens with non-standard behavior must be tested before they back a market.

## FAQ

### Can a permissioned or KYC-gated token use Curve?

A pool can hold any ERC-20 token, but every user must be able to receive it. Tokens with transfer restrictions are generally refused CRV emissions.

### Which pool type fits a tokenized treasury?

Stableswap-NG against a stablecoin, with the ERC-4626 or oracle asset type so the pool follows the token's growing value.

### Can holders borrow against an RWA token?

Yes, if a reliable price oracle exists for it. Borrowing opens after a Curve DAO vote sets the borrow cap.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Oracles & Parameters](../lending/oracles-and-parameters.md)
- [Understanding FXSwap](../pool/understanding-fxswap.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
