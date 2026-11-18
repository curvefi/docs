---
id: troubleshooting
title: Troubleshooting Curve Pools
sidebar_label: Troubleshooting
description: Fixes for common Curve pool problems after deployment, including pools hidden from the list, default token logos, skewed Stableswap balances, stale Cryptoswap liquidity and FXSwap pools drifting from the market price.
---

import ThemedImage from '@theme/ThemedImage'

## The Pool Doesn't Appear in the Pool List

The pool list hides pools with no liquidity, and its search only covers pools in the list. Open an empty pool directly at `https://www.curve.finance/dex/<network>/pools/<pool address>`, then make the first deposit in the **Seed pool** tab. The pool joins the list once it holds liquidity and the Curve Prices API has indexed it.

## The Token Shows a Default Logo

Curve keeps its token icons in the [curve-assets repository](https://github.com/curvefi/curve-assets?tab=readme-ov-file#adding-a-token-icon). Open a pull request there to add your token's logo.

## Stableswap Balances Are Heavily Skewed

A pool holding much more of one token than the other can mean the amplification factor `A` is too high for how far the tokens' prices move apart. The Curve DAO can ramp `A` down gradually by vote. Compare your pool with the presets in [Pool Parameter Presets](./presets.md).

## Cryptoswap Liquidity Is Stale

A Cryptoswap pool rebalances only when the cost is less than half of the trading fees liquidity providers have earned. During a large price move this can leave the pool stuck: its center of liquidity, `price_scale`, sits far from the market price. Less liquidity near the market price means fewer trades and less fee income, so the pool can't afford to rebalance.

<figure style={{ textAlign: 'center' }}>
  <ThemedImage
    alt="A Cryptoswap pool's price moving outside its adjustment range without enough profit to rebalance"
    sources={{
      light: '/img/protocol/amm/cryptoswap-stale-pools-light.svg',
      dark: '/img/protocol/amm/cryptoswap-stale-pools-dark.svg',
    }}
    style={{
      width: "1000px",
      height: 'auto',
      border: '1px solid var(--Layer-2-Outline)',
    }}
  />
</figure>

### Check Whether a Pool Is Stale

Open the pool in the Curve app and find the **Price Oracle** and **Price Scale** cards in its Advanced Details. Compare the two values:

- **Price Scale** is the price at which liquidity was last rebalanced, the center of liquidity.
- **Price Oracle** is the EMA of recent prices. Rebalances follow this price, which makes them hard to manipulate.

A large gap between them that persists means the pool is stale.

<figure>
  <ThemedImage
    alt="Price Scale and Price Oracle in the pool's Advanced tab"
    sources={{
      light: require('@site/static/img/protocol/amm/price-scale.png').default,
      dark: require('@site/static/img/protocol/amm/price-scale.png').default,
    }}
    style={{
      width: "1000px",
      display: "block",
      margin: "0 auto"
    }}
  />
</figure>

### Prevent It

Parameters set at deployment are the main defense. A higher `gamma` and a lower `A` spread liquidity over a wider price range. The pool keeps earning fees through large swings, and an eventual rebalance costs less because liquidity is less concentrated. [Llamarisk](https://www.llamarisk.com/) can help simulate parameters.

### Fix It

1. **Change parameters by DAO vote.** `A` and `gamma` can be ramped gradually. Lowering `A` and adjusting `gamma` spreads liquidity and adds depth at the current price. They can be ramped back once the pool recovers.
2. **Seed a new pool.** This works mainly for protocols that own most of the pool's liquidity. Deploy a pool with better parameters and, if there is one, have the old gauge killed.
3. **Generate volume.** Large trades, often funded with flash loans, can earn enough fees for the pool to rebalance. This costs money, needs careful simulation and can be undone by the next market move. Treat it as a last resort.

## An FXSwap Pool Drifts From the Market Price

FXSwap recenters using a refuel budget. When the budget runs out, the pool can lag the external market. Add refuels on the pool's **Manage pool** page in the Curve app, linked from its Advanced Details, or schedule them with [Automating FXSwap Refuels](./guides/donation-streamer.md). The Manage pool page also charts recent refuels and the pool's price scale. See [Understanding FXSwap](./understanding-fxswap.md#refuels) for how refuels are spent.

## Related

- [After Deploying a Pool](./post-deployment.md)
- [Curve Pool Parameters](./pool-parameters.md)
- [Understanding Cryptoswap](./understanding-cryptoswap.md)
