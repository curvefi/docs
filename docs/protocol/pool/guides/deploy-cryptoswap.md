---
id: deploy-cryptoswap
title: "Deploy a Cryptoswap Pool"
sidebar_label: "Deploy a Cryptoswap Pool"
description: Step-by-step guide to deploying a Curve Cryptoswap pool for two or three volatile tokens, with parameter presets.
---

import ThemedImage from '@theme/ThemedImage';
import ButtonGrid from '@site/src/components/ButtonGrid';

When you finish, a Cryptoswap pool for two or three volatile tokens is live onchain and holds its first liquidity.

Deploying the pool is one transaction, and seeding it is another. Getting CRV emissions later adds a 7-day Curve DAO vote.

<ButtonGrid buttonKeys={['gotoPoolDeployment']} />

## Before You Start

You need a wallet on the chain you deploy to, the tokens' addresses and a starting price for each token.

It costs gas and the tokens you deposit as initial liquidity. Curve charges no fee to deploy a pool.

It takes two transactions: one to deploy the pool and one to seed it.

Nobody approves it. Only CRV emissions need a Curve DAO vote, after you deploy a gauge.

## Choose the Pool Type

1. Open [Pool Creation](https://www.curve.finance/dex/ethereum/create-pool) in the Curve app and connect your wallet.
2. Switch your wallet to the chain where the pool will live. The app follows your wallet's network.
3. Under **POOL TYPE**, select **Cryptoswap**.
4. Select **Next**.

<figure>
  <ThemedImage
    alt="Pool type selection with Cryptoswap selected"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/pool_type_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/pool_type_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Add the Tokens

1. Under **TOKENS IN POOL**, choose two tokens. Select **Add token** for a third.
2. Use WETH for ether. Cryptoswap pools don't accept plain ETH.
3. Select **Next**.

## Set the Starting Price and Parameters

1. Under **PARAMETERS**, check the **Initial Liquidity Concentration Price**. The app fills in dollar prices from CoinGecko. Enter a price yourself if one is missing, and select **Update Quote** to refresh.
2. Choose a preset in **Pool Parameters Presets**. Two-token pools offer **Crypto**, **Low volatility**, **Liquid Staking Derivatives** and **Liquid Restaking Tokens**. Three-token pools offer **Tricrypto** and **Three Coin Volatile**.
3. To change a value, open **Advanced** and edit it.
4. Select **Next**.

The pool concentrates liquidity around the starting price, so set it close to the current trading price. [Pool Parameter Presets](../presets.md) lists each preset's values next to live pools, and [Curve Pool Parameters](../pool-parameters.md#cryptoswap-parameters) explains each parameter.

<figure>
  <ThemedImage
    alt="Cryptoswap parameter presets"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/presets_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/presets_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Name the Pool

1. Under **POOL INFO**, enter a name, such as `ETH/USDC`, and a symbol, such as `ETHUSDC`.
2. Check both for typos. They become the name and symbol of the LP token (the token that represents a share of the pool) and can't be changed after deployment.

## Deploy the Pool {#create-the-pool}

1. Review the **Pool Summary**: the tokens, the starting price, the parameters, and the name and symbol.
2. Select **Create Pool** and confirm the transaction in your wallet.
3. When **Pool Creation Complete** appears, select **Go to pool**.

## Seed the Pool

1. On the new pool's page, open the **Seed pool** tab.
2. Deposit the first liquidity at the starting price. A pool can't process trades until it holds liquidity.

## Check It Worked

- The pool page opens on curve.finance at `https://www.curve.finance/dex/<network>/pools/<pool address>`.
- The creation transaction appears in your wallet's history and on the chain's block explorer.
- Once the pool holds liquidity and is indexed, the Curve Prices API returns it at `https://prices.curve.finance/v1/pools/<network>/<pool address>`, and it appears in the pool list.

If the pool doesn't show up or its liquidity drifts from the external price, see [Troubleshooting Curve Pools](../troubleshooting.md).

## Next Step

[After Deploying a Pool](../post-deployment.md) covers the token logo, integrations and incentives, starting with deploying your pool's gauge.

Questions go to the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85). [Understanding Cryptoswap](../understanding-cryptoswap.md) explains how the pool prices trades.
