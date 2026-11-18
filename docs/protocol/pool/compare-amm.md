---
id: compare-amm
title: Curve vs Concentrated-Liquidity AMMs
sidebar_label: Curve vs. Other AMMs
description: How Curve's Stableswap and Cryptoswap pools compare with concentrated-liquidity AMMs such as Uniswap v3 and v4, covering price ranges, LP positions, fees and oracles.
---

Curve pools concentrate liquidity automatically: liquidity providers (LPs) deposit without choosing a price range. In a concentrated-liquidity AMM such as Uniswap v3 or v4, each LP chooses a range. A narrow range can earn more fees per dollar, but the position stops earning when the price leaves it.

As of 17 November 2026.

| | Curve | Uniswap v3 and v4 |
| --- | --- | --- |
| Where liquidity sits | Stableswap concentrates it near the peg (the shared target price, such as 1:1), set by the amplification factor `A`. Cryptoswap re-centers it as the price moves. LPs choose nothing. | Each LP chooses a price interval. Outside it, the position is inactive, earns no fees and ends up in a single asset ([docs](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity)). |
| LP position | ERC-20 LP token | ERC-721 NFT per position ([v3 whitepaper](https://uniswap.org/whitepaper-v3.pdf), [v4 docs](https://developers.uniswap.org/docs/protocols/v4/guides/managing-liquidity/mint-position)) |
| Swap fee | Dynamic: rises when the pool is imbalanced ([Pool Parameters](./pool-parameters.md)) | In v3, a fixed fee tier per pool, tied to tick spacing ([docs](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity)) |
| Tokens per pool | Stableswap up to 8, Cryptoswap 2 or 3 | 2 ([v3 whitepaper](https://uniswap.org/whitepaper-v3.pdf)) |

## How Curve Places Liquidity

A [Stableswap](./understanding-stableswap.md) pool behaves like a constant-sum AMM near the peg, where slippage (price impact of a trade) is low, and like a constant-product AMM further away, so it never runs out of liquidity. The amplification factor `A` sets how tightly liquidity sits around the peg. The Curve DAO can change `A` by vote.

A [Cryptoswap](./understanding-cryptoswap.md) pool concentrates liquidity around an internal exponential moving average (EMA) price and moves it when the price moves. It rebalances only when the cost is less than half of the trading fees LPs have earned, so a pool with little volume can lag the external price.

In both designs, an LP's whole deposit stays in the pool's active curve. Nobody has to adjust a position when the price changes.

## Pool Oracles {#price-oracles}

Every Curve pool records an EMA of its prices onchain as a pool oracle. crvUSD and Llamalend markets use Curve pool oracles, and other contracts can read them. See [Understanding Cryptoswap](./understanding-cryptoswap.md#rebalancing).

## When Each Design Fits

A concentrated-liquidity pool fits LPs who manage positions actively and want the most fee income per dollar inside a chosen range. They accept that the position stops earning outside it.

A Curve pool fits pegged assets, such as stablecoins, LSTs (liquid staking tokens) and wrapped BTC, and volatile pairs where LPs want to deposit without managing a range. The LP token is a plain ERC-20, so other protocols can lend against it, including Llamalend.

## Related

- [Deploy a Pool](./overview.md)
- [Understanding Stableswap](./understanding-stableswap.md)
- [Understanding Cryptoswap](./understanding-cryptoswap.md)
- [Understanding FXSwap](./understanding-fxswap.md)
