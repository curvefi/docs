---
id: rwa-issuers
title: Curve for RWA and Tokenized-Asset Issuers
sidebar_label: RWA & Tokenized Assets
description: How issuers of tokenized treasuries, credit, commodities, FX and other real-world assets use Curve pools, oracles and Llamalend lending markets, and which token requirements apply.
---

Curve is where issuers of tokenized real-world assets (RWAs), such as treasuries, credit, commodities and FX, can give their token onchain liquidity in a permissionless pool and open an isolated lending market for it.

## What You Get

- **Onchain liquidity without a listing process.** Anyone can deploy a pool for an ERC-20 token, with no approval and no fee beyond gas.
- **Pools for assets priced elsewhere.** FXSwap is built for pairs whose main market is outside the pool, such as FX rates or assets with an external reference price. Stableswap fits tokens that hold a stable value against a stablecoin.
- **Support for value-accruing tokens.** Stableswap-NG accepts ERC-4626 vault shares and tokens priced by a rate oracle, so a token whose value grows over time is priced at its current rate.
- **Lending for holders.** A Llamalend market lets holders borrow against your token. Each market is isolated, so its risk stays in that market.
- **Neutral, DAO-owned venue.** The Curve DAO owns the protocol, and every token follows the same public rules.

## What Your Users Get

- **Holders** can exit to stablecoins onchain at any time the pool has liquidity, without waiting for a redemption window.
- **Liquidity providers** earn trading fees with no range management.
- **Borrowers** keep the asset's yield while it backs a loan, with LLAMMA liquidation protection.
- **Lenders** supply to an ERC-4626 vault and earn interest from borrowers.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| Tokenized treasury or credit token that accrues value | Stableswap-NG pool with a stablecoin, using the ERC-4626 or oracle asset type | Llamalend market against a stablecoin | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Stablecoin backed by real-world assets | Stableswap pool with USDC, USDT or crvUSD | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| FX token or asset with an external reference price | FXSwap pool against a stablecoin | Optional | [Deploy an FXSwap Pool](../pool/guides/deploy-fxswap.md) |

## Case Studies

Figures as of 17 November 2026, from the Curve Prices API.

- **Ethena (USDtb).** The [USDtb/USDC pool](https://etherscan.io/address/0xC2921134073151490193AC7369313c8e0b08e1E7) holds about $20.1M.
- **Maple (syrupUSDC).** The syrupUSDC/crvUSD Llamalend market lends crvUSD against Maple's yield-bearing USDC.

## Requirements and Limits

Read this section before you deploy. Many RWA tokens have transfer rules that limit what Curve can offer.

- **Transfer restrictions block CRV emissions.** The DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes, blacklists or allowlists. Only freely transferable, openly accessible tokens are considered. Direct gauge rewards need no vote. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).
- **The pool must be able to hold your token.** If your token only moves between approved addresses, check that the pool, its gauge and its users can receive it before you deploy.
- **Rate oracles must be safe.** An oracle-priced token needs a rate oracle that returns 18-decimal values, never decreases and never reads a spot price. Check who controls the oracle.
- **FXSwap needs an outside market.** FXSwap is not meant for primary price discovery. It works when traders can arbitrage the pool against a deeper external market. Keeping it centered can cost a refuel budget. See [Understanding FXSwap](../pool/understanding-fxswap.md).
- **Lending needs a reliable oracle and a DAO vote.** A Llamalend market needs a manipulation-resistant price for your token, and its borrow cap starts at zero until a Curve DAO vote raises it. Non-standard token behavior is not guaranteed to work in a market and must be tested.

## FAQ

**Can a permissioned or KYC-gated token use Curve?**
A pool can be deployed for any ERC-20 token, but users must be able to receive it. Tokens with transfer restrictions are generally refused CRV emissions.

**Which pool type fits a tokenized treasury?**
A Stableswap-NG pool against a stablecoin, with the ERC-4626 or oracle asset type so the pool follows the token's growing value.

**Can holders borrow against my RWA token?**
Yes, if a reliable price oracle exists for it. Borrowing opens after a Curve DAO vote sets the borrow cap.

## Next Steps

- Follow the [Launch Playbook](../launch-playbook.md) from pool to lending market.
- Review [Oracles & Parameters](../lending/oracles-and-parameters.md) before you plan a lending market.
- Ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
