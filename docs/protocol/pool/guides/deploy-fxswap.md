---
id: deploy-fxswap
title: "Deploy an FXSwap Pool"
sidebar_label: "Deploy an FXSwap Pool"
description: Step-by-step guide to deploying a Curve FXSwap pool for two low-volatility assets priced on an external price source, such as FX pairs.
---

import ThemedImage from '@theme/ThemedImage';
import ButtonGrid from '@site/src/components/ButtonGrid';

When you finish, an FXSwap pool for two low-volatility assets is live onchain, holds its first liquidity and can take refuels.

Deploying the pool is one transaction, and seeding it is another. Refuels and CRV emissions come after; CRV emissions add a 7-day Curve DAO vote.

<ButtonGrid buttonKeys={['gotoPoolDeployment']} />

## Before You Start

You need a wallet on a chain where FXSwap is available, two token addresses, a starting price, and a pair whose price is set on a deeper external trading venue. FXSwap is not meant for a token's primary price discovery; use [Cryptoswap](./deploy-cryptoswap.md) for that.

It costs gas, the tokens you deposit as initial liquidity and, over time, a refuel budget to keep the pool centered. Curve charges no fee to deploy a pool.

It takes two transactions to deploy and seed the pool.

Nobody approves it. Only CRV emissions need a Curve DAO vote, after you deploy a gauge.

## Choose the Pool Type

1. Open [Pool Creation](https://www.curve.finance/dex/ethereum/create-pool) in the Curve app and connect your wallet.
2. Switch your wallet to the chain where the pool will live. FXSwap isn't available on every chain Curve supports.
3. Under **POOL TYPE**, select **FXSwap**.
4. Select **Next**.

<figure>
  <ThemedImage
    alt="Pool type selection with FXSwap selected"
    sources={{
      light: require('@site/static/img/protocol/deploy-fxswap/pool_type_light.png').default,
      dark: require('@site/static/img/protocol/deploy-fxswap/pool_type_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Add the Tokens

1. Under **TOKENS IN POOL**, choose the two tokens. FXSwap pools hold exactly two.
2. Select **Next**.

## Set the Starting Price and Parameters

1. Under **PARAMETERS**, check the **Initial Liquidity Concentration Price**. The app fills in dollar prices from CoinGecko. Enter a price yourself if one is missing, and select **Update Quote** to refresh.
2. Choose a preset in **Pool Parameters Presets**: **FXSwap V3** or **FXSwap V1 & V2**. Use a preset unless the Curve team has helped you choose other values.
3. Select **Next**.

[Pool Parameter Presets](../presets.md) lists both presets' values, and [Curve Pool Parameters](../pool-parameters.md#fxswap-parameters) explains each parameter. [Understanding FXSwap](../understanding-fxswap.md) explains how the pool recenters.

<figure>
  <ThemedImage
    alt="FXSwap parameter presets"
    sources={{
      light: require('@site/static/img/protocol/deploy-fxswap/preset_light.png').default,
      dark: require('@site/static/img/protocol/deploy-fxswap/preset_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Name the Pool

1. Under **POOL INFO**, enter a name, such as `crvUSD/EURC`, and a symbol, such as `crvUSDEURC`.
2. Check both for typos. They become the name and symbol of the [LP token](/protocol/glossary#lp-token) (the token that represents a share of the pool) and can't be changed after deployment.

## Deploy the Pool {#create-the-pool}

1. Review the **Pool Summary**: the tokens, the starting price, the parameters, and the name and symbol.
2. Select **Create Pool** and confirm the transaction in your wallet.
3. When **Pool Creation Complete** appears, select **Go to pool**.

## Seed the Pool

1. On the new pool's page, open the **Seed pool** tab.
2. Deposit the first liquidity at the starting price. A pool can't process trades until it holds liquidity.

## Check It Worked

- The pool page opens on curve.finance at `https://www.curve.finance/dex/<network>/pools/<pool address>`.
- Its Advanced Details link to a **Manage pool** page, where you set up refuels.
- Once the pool holds liquidity and is indexed, the Curve Prices API returns it at `https://prices.curve.finance/v1/pools/<network>/<pool address>`.

If the pool drifts from the external price, see [Troubleshooting Curve Pools](../troubleshooting.md#an-fxswap-pool-drifts-from-the-market-price).

## Next Step

Fund refuels on the pool's **Manage pool** page, or schedule them with [Automating FXSwap Refuels](./donation-streamer.md).

Questions go to the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
