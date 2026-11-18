---
id: rwa-issuers
title: Curve for RWA and Tokenized-Asset Issuers
sidebar_label: RWA & Tokenized Assets
description: How issuers of tokenized treasuries, credit, commodities, FX and other real-world assets use Curve pools, oracles and Llamalend lending markets, and which token requirements apply.
---

Issuers of tokenized real-world assets (RWAs), such as treasuries, credit, commodities and FX, use Curve for onchain liquidity and isolated lending markets. Anyone can deploy a pool for an ERC-20 token, but your token's transfer rules decide what else Curve can offer it, so read [Before You Deploy](#before-you-deploy) first.

## Liquidity Without a Listing Process

You deploy the pool yourself, with no approval and no fee beyond gas. The pool type depends on how your asset is priced. [Stableswap](../pool/understanding-stableswap.md) fits tokens that hold a stable value against a stablecoin. [FXSwap](../pool/understanding-fxswap.md) fits pairs whose price is set by an external price source, such as FX rates.

A token whose value grows over time, such as a tokenized treasury, can use Stableswap-NG's [ERC-4626](/protocol/glossary#erc-4626) (the standard yield-bearing deposit token) or rate-oracle token types and trade at its current rate.

## Borrowing Against Your Token

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your token and keep it. Each market is isolated, so a loss in one market does not reach another. Liquidity providers (LPs) in a 2-coin Stableswap-NG pool can also borrow against their [LP token](/protocol/glossary#lp-token) (the token that represents a share of the pool).

## What Holders and LPs Get

- Holders can sell to stablecoins onchain whenever the pool has liquidity, without waiting for a redemption window.
- LPs earn trading fees without managing a position.
- Borrowers keep the asset's yield while it backs a loan, and soft liquidation converts collateral gradually as the price falls, instead of selling it at one price.
- Lenders supply to an ERC-4626 vault and earn the interest borrowers pay.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| Tokenized treasury or credit token with a growing value | Stableswap-NG with a stablecoin, ERC-4626 or oracle token type | Against a stablecoin | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| Stablecoin backed by real-world assets | Stableswap with USDC, USDT or crvUSD | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md) |
| FX token or asset with an external reference price | FXSwap against a stablecoin | Optional | [Deploy an FXSwap Pool](../pool/guides/deploy-fxswap.md) |

## Case Studies

- [Ethena Leverages Curve Finance to Support USDtb Launch](https://news.curve.finance/ethena-usdtb-curve-launch/)

## Before You Deploy

Tokens with transfer restrictions, transfer taxes, blacklists or allowlists are generally refused CRV emissions by the Curve DAO, which considers only freely transferable, openly accessible tokens. Direct rewards in your own token need no vote. See [Whitelist a Gauge](../gauge/whitelisting-gauge.md).

If your token moves only between approved addresses, the pool, its [gauge](/protocol/glossary#gauge) (the contract that distributes incentives) and every user must be able to receive it.

A rate oracle has strict rules, and you should know who controls it. Read [Oracle-Based Tokens](../pool/guides/deploy-stableswap.md#oracle-based-tokens).

FXSwap needs traders who arbitrage the pool against deeper trading liquidity elsewhere, and keeping it centered can require a refuel budget.

A Llamalend market needs a manipulation-resistant price for your token, and its borrow cap starts at zero until a Curve DAO vote raises it.

## FAQ

### Can a permissioned or KYC-gated token use Curve?

A pool can hold any ERC-20 token, but every user must be able to receive it. Tokens with transfer restrictions are generally refused CRV emissions.

### Which pool type fits a tokenized treasury?

Stableswap-NG against a stablecoin, with the ERC-4626 or oracle token type so the pool follows the token's growing value.

### Can holders borrow against an RWA token or its LP token?

Yes, if a reliable price oracle exists. Llamalend accepts the token itself, or the LP token of a 2-coin Stableswap-NG pool, as collateral. Borrowing opens after a DAO vote sets the borrow cap.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Timeline](../launch-playbook.md)
- [Oracles & Parameters](../lending/oracles-and-parameters.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
