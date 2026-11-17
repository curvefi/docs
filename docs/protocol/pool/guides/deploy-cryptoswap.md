---
id: deploy-cryptoswap
title: "Deploying a Cryptoswap Pool"
sidebar_label: "Deploying a Cryptoswap Pool"
description: Step-by-step guide to deploying a Curve Cryptoswap pool for two or three volatile tokens, with parameter presets.
---

import ThemedImage from '@theme/ThemedImage';
import ButtonGrid from '@site/src/components/ButtonGrid';

A Cryptoswap pool holds two or three volatile tokens that are not pegged to each other, such as ETH/USDC or BTC/ETH. The pool creation wizard in the Curve app walks you through each step. Questions go to the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/rgrfS7W).

[Understanding Cryptoswap](../understanding-cryptoswap.md) explains how the pool prices trades.

<ButtonGrid buttonKeys={['gotoPoolDeployment']} />

---

## Step 1: Choose Pool Type

Make sure your wallet is connected (top right corner) and your network is set to the chain where you want to deploy the pool. Curve supports pool deployment on all networks where Curve is live — just switch chains in your wallet, and the UI will follow automatically.

Select **Cryptoswap** as the pool type. This is used for volatile assets that do not share a common price peg — such as ETH, BTC, or volatile non-pegged pairs.

<figure>
  <ThemedImage
    alt="Select Pool Type"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/pool_type_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/pool_type_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

## Step 2: Select Tokens

In this step, you'll define which assets your pool will support. Cryptoswap pools support **two or three tokens**. To add a third token, click the blue **Add token** button.

<figure>
  <ThemedImage
    alt="Tokens in Pool"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/tokens_in_pool_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/tokens_in_pool_dark.png').default,
    }}
    style={{ 
      width: "600px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

:::warning
Due to safety reasons, **plain ETH cannot be used** in Cryptoswap pools. Please use WETH instead.
:::

## Step 3: Set Pool Parameters

You can choose a preset configuration or switch to advanced mode to fine-tune the pool's behavior.

<figure>
  <ThemedImage
    alt="Parameters"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/parameters_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/parameters_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

> 💡 Initial price bounds are fetched automatically from [CoinGecko](https://www.coingecko.com/). If unavailable, you will need to input them manually.

### Preset Options

Presets vary depending on whether your pool contains two or three tokens.

#### Two-Asset Pools

- **Crypto:** For highly volatile pairs like ETH–LDO  
- **Forex:** For relatively stable foreign exchange pairs like crvUSD–EURe  
- **Liquid Staking Derivatives:** For LSDs such as cbETH–wETH  
- **Liquid Restaking Tokens:** For restaking assets such as pufETH–wETH

#### Three-Asset Pools

- **Tricrypto:** For pools like USDT–wBTC–ETH  
- **Three Coin Volatile:** For volatile tokens paired with ETH and a stablecoin

<figure>
  <ThemedImage
    alt="Presets"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/presets_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/presets_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

You can use these as-is or switch to **Advanced** mode to adjust parameters manually.

### Advanced Parameters

To fine-tune the pool, enable the **Advanced** toggle:

<figure>
  <ThemedImage
    alt="Advanced Parameters"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/parameters_advanced_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/parameters_advanced_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

| Parameter | Description |
|----------|-------------|
| **Mid Fee / Out Fee** | The base and maximum fee range, charged depending on pool imbalance. More here: [Cryptoswap Dynamic Fees](../understanding-cryptoswap.md#dynamic-fees)|
| **Fee Gamma** | Controls how fee ramps up with imbalance. Suggested: `0.0023` (volatile) or `0.005` (less volatile). More here: [Cryptoswap Dynamic Fees](../understanding-cryptoswap.md#dynamic-fees)|
| **Amplification (A)** | Higher = flatter curve = tighter prices near balance. Use lower for volatile pairs. More here: [Cryptoswap Parameters](../understanding-cryptoswap.md#parameters)|
| **Gamma** | Shapes the bonding curve. Suggested: `0.000145` (volatile) or `0.0001` (less volatile).  More here: [Cryptoswap Parameters](../understanding-cryptoswap.md#parameters)|
| **Allowed Extra Profit** | Sets profit-taking buffer. Suggested: `0.000002` (volatile) or `0.00000001` (less volatile). |
| **Adjustment Step** | Step size for rebalancing. Suggested: `0.000146` (volatile) or `0.0000055` (less volatile). |
| **Moving Average Time** | Smooths price changes over time using an EMA (in seconds). |

> 📖 **Further reading**: [Deep Dive: Curve V2 Parameters](https://nagaking.substack.com/p/deep-dive-curve-v2-parameters?s=curve),  [Cryptoswap Explainer](../understanding-cryptoswap.md)

## Step 4: Enter Pool Info

After configuring your parameters, you’ll be prompted to set the **Pool Name** and **Pool Symbol**.

These values will be used as the ERC‑20 metadata for the pool’s LP token and will appear in block explorers and in the Curve UI.

- **Pool Name** – A human-readable label for the pool (e.g. `ETH/USDC Crypto`)
- **Pool Symbol** – The LP token symbol (e.g. `ETHUSDC`, `crvETHUSDC`)

<figure>
  <ThemedImage
    alt="Pool Info"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/pool_info_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/pool_info_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

> 💡 **Tip:** Use short, clear names that reflect the assets in the pool. These fields are immutable after deployment — double-check for typos.

## Step 5: Deploy the Pool

Before deploying, review all your settings in the **Summary panel** on the right. This includes:

- Selected tokens
- Pool parameters (A, Fees, Gamma, etc.)
- Pool name and symbol

Once everything looks correct, click the blue **Create Pool** button at the bottom of the page. Your wallet will prompt you to approve the transaction.

<figure>
  <ThemedImage
    alt="Pool Summary"
    sources={{
      light: require('@site/static/img/protocol/deploy-cryptoswap/pool_summary_light.png').default,
      dark: require('@site/static/img/protocol/deploy-cryptoswap/pool_summary_dark.png').default,
    }}
    style={{ 
      width: "500px",
      display: "block",
      margin: "0 auto"
    }}
  />
  <figcaption></figcaption>
</figure>

---

## What to do after deployment

✅ **Seed initial liquidity** — a pool with zero balance cannot process trades.  
✅ (Optional) **[Create a gauge](/protocol/gauge/overview)** to distribute CRV or other incentives to LPs.
