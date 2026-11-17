---
id: overview
title: Overview & Pool Types
sidebar_label: Overview & Pool Types
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';
import ThemedImage from '@theme/ThemedImage';

Curve offers a **permissionless** system for deploying liquidity pools — no DAO vote, no approval process, and no technical barrier beyond the gas cost to deploy. A full-featured interface is available in the Curve app, so you can launch a custom pool without writing any code.

To get started quickly, follow one of the deployment guides:

<GuideCardGrid guideKeys={['deployStableswapPool', 'deployCryptoswapPool', 'deployFXSwapPool']} />

Factories make launching pools on Curve fast, flexible, and accessible to any project—whether you're a stablecoin issuer, LST protocol, synthetic-asset platform, or any other DeFi team looking to bootstrap deep, reliable liquidity.

## How are Pools Deployed?

In the background, new liquidity pools are deployed by making use of a **Pool Factory**, which essentially is a smart contract for deploying new pools. Each factory contains the logic and configuration for a specific pool type. Factories support a few different pool types:

- **Stableswap** — for pegged or correlated assets (e.g., USDC/USDT, stETH/ETH)  
- **Cryptoswap** — for more volatile or uncorrelated assets (e.g., ETH/USDC)
- **FXSwap** - for lower-volatility assets like Forex pairs, or lower volatility Crypto pairs like BTC/ETH.

Once a factory is deployed, anyone can create a new pool of that type — either through the Curve UI or directly on-chain.

:::info
**Pool deployment is completely free of charge** beyond standard gas costs. There are no additional fees, no protocol charges, and no hidden costs associated with deploying a new pool on Curve.
:::

Pools deployed through a factory appear on the Curve frontend after a short delay. Aggregators such as [0x](https://docs.0x.org/evm/need-help/faq), 1inch, [CoW Swap](https://docs.cow.fi/cow-protocol), [KyberSwap](https://docs.kyberswap.com/getting-started/supported-exchanges-and-networks), Odos and ParaSwap route swaps through Curve pools, and they pick up new pools without a listing step.

## Choosing the Right Pool Type

Curve supports multiple pool designs to fit different kinds of assets. Selecting the correct type is essential to ensure low slippage, efficient trading, and capital-efficient liquidity.

Not sure which to use? Reach out in the official Curve channels.

### Stableswap Pool

Choose a **Stableswap pool** when your assets are expected to stay close or correlated in price — e.g., stablecoins (USDC/USDT), LSTs (wstETH/stETH), or yield-bearing stable assets like sDAI. Learn more here: [Understanding Stableswap](understanding-stableswap.md).

Stableswap-NG pools support a wide variety of token types beyond standard ERC-20 tokens. This flexibility allows you to create pools with yield-bearing tokens, rebasing tokens, and oracle-enabled tokens.

**Supported Asset Types:**

| Type | Description | Use Cases | Examples |
|------|-------------|-----------|----------|
| **0** | Standard ERC-20 | Basic tokens with no special features | USDC, USDT, DAI |
| **1** | Oracle-enabled | Tokens with rate oracles for accurate pricing | wstETH, cbETH |
| **2** | Rebasing | Tokens that change supply over time | stETH |
| **3** | ERC4626 Vault | Yield-bearing vault tokens | sDAI |

**Technical Requirements:**

- All tokens must be ERC-20 compatible (return True/revert, True/False, or None)
- Maximum 18 decimals supported
- Oracle tokens must have precision $\le 18$
- ERC4626 vaults support arbitrary precision for both vault and underlying tokens


### Cryptoswap
Choose a **Cryptoswap pool** when your assets are more volatile or uncorrelated—e.g., ETH/USDC or BTC/USDC. Cryptoswap pools use dynamic pricing that handles larger price swings while still retaining Curve’s efficiency advantages. Learn more about [Understanding Cryptoswap](understanding-cryptoswap.md).


### FXSwap
**FXSwap** is designed for uncorrelated low-volatility asset pairs like Forex (e.g., crvUSD/EURC) or lower volatility crypto pairs (e.g., BTC/ETH). It combines Stableswap's mathematical efficiency with Cryptoswap's dynamic rebalancing framework, plus a "refueling" mechanism that allows projects to fast-track rebalancing with external incentives. Learn more about [Understanding FXSwap](understanding-fxswap.md).

---

## Base Pools and Metapools

Stableswap pools on Curve support a powerful structure of **base pools** and **metapools**.

- A **base pool** is a regular Curve pool that the DAO has specifically approved to be used in metapools.  
- A **metapool** pairs a token against an existing base pool rather than against a single token.

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

For example, the USDC/USDT pool might begin as a normal Stableswap pool. If the DAO adds it as a base pool, it can then be reused in other pools. A protocol such as Inverse can create a metapool that pairs their stablecoin DOLA against the base pool, resulting in a DOLA–USDC/USDT market. Users can directly swap DOLA/USDT or DOLA/USDC through this pool.

This approach gives new tokens a major advantage: they can **tap into the deep, established liquidity of the base pool** instead of needing to attract all liquidity themselves **by** pairing their token against an already existing and established pool with TVL.