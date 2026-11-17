---
id: compare-amm
title: Curve vs Concentrated-Liquidity and Weighted AMMs
sidebar_label: Curve vs. Other AMMs
description: How Curve's Stableswap and Cryptoswap pools compare with concentrated-liquidity AMMs such as Uniswap v3 and weighted pools such as Balancer, covering price ranges, LP tokens, fees and oracles.
---

Curve pools concentrate liquidity automatically: liquidity providers (LPs) deposit without choosing a price range. Concentrated-liquidity AMMs such as Uniswap v3 let each LP choose a range, which can earn more fees per dollar but stops earning when the price leaves it. Weighted pools such as Balancer's hold up to 8 tokens in fixed proportions. Each design fits a different kind of asset and LP.

As of 17 November 2026.

| | Curve | Concentrated liquidity (Uniswap v3) | Weighted pools (Balancer v3) |
| --- | --- | --- | --- |
| Where liquidity sits | Stableswap concentrates it near the peg, set by the amplification factor `A`. Cryptoswap re-centers it as the price moves. LPs choose nothing. | Each LP chooses a price interval. Outside it, the position is inactive, earns no fees and ends up in a single asset ([docs](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity)). | Spread according to custom token weights, such as 80/20 ([docs](https://docs.balancer.fi/concepts/explore-available-balancer-pools/weighted-pool/weighted-pool.html)). |
| LP position | ERC-20 LP token | ERC-721 NFT per position ([whitepaper](https://uniswap.org/whitepaper-v3.pdf)) | ERC-20 pool token ([docs](https://docs.balancer.fi/concepts/core-concepts/balancer-pool-tokens.html)) |
| Swap fee | Dynamic: rises when the pool is imbalanced ([Pool Parameters](./pool-parameters.md)) | Fixed fee tier per pool, tied to tick spacing ([docs](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity)) | Set per pool between 0.001% and 10% ([docs](https://docs.balancer.fi/concepts/explore-available-balancer-pools/weighted-pool/weighted-pool.html)) |
| Tokens per pool | Stableswap up to 8, Cryptoswap 2 or 3 | 2 ([whitepaper](https://uniswap.org/whitepaper-v3.pdf)) | Up to 8 ([docs](https://docs.balancer.fi/concepts/explore-available-balancer-pools/weighted-pool/weighted-pool.html)) |

## How Curve Places Liquidity

A [Stableswap](./understanding-stableswap.md) pool behaves like a constant-sum market near the peg, where slippage is low, and like a constant-product market further away, so it never runs out of liquidity. The amplification factor `A` sets how tightly liquidity sits around the peg. The Curve DAO can change `A` by vote.

A [Cryptoswap](./understanding-cryptoswap.md) pool concentrates liquidity around an internal EMA price and moves it when the market moves. It rebalances only when the cost is less than half of the trading fees LPs have earned, so a pool with little volume can lag the market price.

In both designs, an LP's whole deposit stays in the pool's active curve. Nobody has to adjust a position when the price changes.

## Price Oracles

Every Curve pool records an exponential moving average (EMA) of its prices onchain. crvUSD and Llamalend markets use Curve pool oracles, and other contracts can read them. See [Understanding Stableswap](./understanding-stableswap.md#oracles).

## When Each Design Fits

A concentrated-liquidity pool fits LPs who actively manage positions and want the most fee income per dollar inside a chosen range. They accept that the position stops earning outside it.

A weighted pool fits a basket of tokens, or a token held in a fixed ratio against another, such as an 80/20 pool for a governance token.

A Curve pool fits pegged assets, such as stablecoins, LSTs and wrapped BTC, and volatile pairs where LPs want to deposit without managing a range. An LP token is a plain ERC-20, so other protocols can lend against it, including Llamalend.

## Related

- [Pool Types](./overview.md)
- [Understanding Stableswap](./understanding-stableswap.md)
- [Understanding Cryptoswap](./understanding-cryptoswap.md)
- [Understanding FXSwap](./understanding-fxswap.md)
