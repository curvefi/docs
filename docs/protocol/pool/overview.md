---
id: overview
title: "Curve Pool Types: Stableswap, Cryptoswap and FXSwap"
sidebar_label: Overview & Pool Types
description: "How to choose and deploy a permissionless Curve liquidity pool: Stableswap for pegged assets, Cryptoswap for volatile pairs, FXSwap for externally priced pairs, plus metapools and supported token types."
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';
import ThemedImage from '@theme/ThemedImage';

Deploy a pool in one transaction, without permission. Major aggregators route through Curve pools, so your token becomes swappable across DeFi.

![Holders can borrow against your token, earn swap fees by providing liquidity, or borrow against the LP token.](/img/protocol/pool/token-holder-options.png)

It takes the tokens' addresses, a pool type that fits your pair, gas and the liquidity you seed it with. Curve charges no fee to deploy a pool.

<GuideCardGrid guideKeys={['deployStableswapPool', 'deployCryptoswapPool', 'deployFXSwapPool']} />

## Which Pool Type?

| Asset pair | Pool type | Why |
| --- | --- | --- |
| Two USD stablecoins, such as USDC/USDT | Stableswap | Liquidity sits at the peg (the shared target price), so trades near 1:1 have the lowest slippage (price impact of a trade) |
| A savings or yield-bearing stablecoin and its base, such as sfrxUSD/frxUSD | Stableswap-NG with the ERC-4626 (standard yield-bearing token) or oracle token type | The pool prices the savings token at its current rate |
| An LST or LRT (liquid staking or restaking token) and ETH, such as wstETH/WETH or weETH/WETH | Stableswap-NG with the oracle or rebasing (balance grows in the wallet) token type | The pool follows the token's staking rate |
| Two wrapped BTC tokens, such as tBTC/WBTC | Stableswap | Both track BTC |
| Your stablecoin and a DAO-approved base pool | Stableswap metapool | Traders reach your token from every coin in the base pool |
| A volatile token and ETH or a stablecoin, such as CVX/ETH or YB/crvUSD | Cryptoswap | The pool can be where the token mainly trades, and it re-centers as the price moves |
| A USD stablecoin, BTC and ETH | Cryptoswap, Tricrypto preset | One pool for three volatile assets |
| An FX pair or an asset priced on a deeper external trading venue, such as crvUSD/EURC or BTC/crvUSD | FXSwap | The pool recenters toward the external price, paid for by refuels |

If your pair fits none of these, ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85). [Pool Parameter Presets](./presets.md) gives starting parameters and live pools for each case.

## How Pools Are Deployed {#how-are-pools-deployed}

Each pool type has a factory contract. Anyone can call it, from the Curve app or onchain, to deploy a pool of that type. A new pool appears in the Curve app once it holds liquidity. Aggregators such as [0x](https://docs.0x.org/evm/need-help/faq), 1inch, [CoW Swap](https://docs.cow.fi/cow-protocol), [KyberSwap](https://docs.kyberswap.com/getting-started/supported-exchanges-and-networks), Odos and ParaSwap route swaps through Curve pools and pick up new pools without a listing step.

## The Pool Types {#choosing-the-right-pool-type}

### Stableswap {#stableswap-pool}

For assets expected to trade near the same price. Stableswap-NG pools hold up to eight tokens and accept standard, oracle-priced, rebasing and ERC-4626 tokens. [Understanding Stableswap](./understanding-stableswap.md#supported-asset-types) explains each token type.

### Cryptoswap

For volatile or uncorrelated assets, two or three per pool. Liquidity is concentrated around an internal price that follows the token's price. See [Understanding Cryptoswap](./understanding-cryptoswap.md).

### FXSwap

For two low-volatility assets whose price is set on a deeper external trading venue, such as FX pairs. The pool recenters toward that price and uses refuels to pay for it. FXSwap is not meant for primary price discovery. See [Understanding FXSwap](./understanding-fxswap.md).

## Base Pools and Metapools

A base pool is a Stableswap pool that the Curve DAO has approved for metapools. A metapool pairs one token with a base pool's LP token (the token that represents a share of the pool), so traders can swap the token against every coin in the base pool. A new token reaches the base pool's existing liquidity without attracting all of it itself.

<figure>
<ThemedImage
    alt="`create_from_pool` function interface"
    sources={{
        light: require('@site/static/img/protocol/deploy-pool/basepool-metapool.png').default,
        dark: require('@site/static/img/protocol/deploy-pool/basepool-metapool.png').default,
    }}
    style={{ width: '600px', display: 'block', margin: '0 auto' }}
/>
</figure>

For example, the DOLA/3CRV metapool pairs DOLA with the DAI/USDC/USDT base pool, so traders swap DOLA for DAI, USDC or USDT in one pool. [Understanding Stableswap](./understanding-stableswap.md#basepool-list) lists the base pools.

## Case Studies

- [YieldBasis on Curve: What's Happened So Far](https://news.curve.finance/yieldbasis-on-curve-whats-happened-so-far/)
