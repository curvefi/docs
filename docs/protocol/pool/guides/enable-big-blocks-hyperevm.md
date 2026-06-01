---
id: enable-big-blocks-hyperevm
title: "Enabling Big Blocks on HyperEVM"
sidebar_label: "Enabling Big Blocks on HyperEVM"
---

[HyperEVM](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm) uses a [dual-block architecture](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture) where throughput is split between small blocks produced at a fast rate and large blocks produced at a slower rate.

Because deploying Curve pools and gauges can only be done in large blocks, the deployer needs to enable large blocks for their wallet.

## Step 1: Bridging HYPE

Bridge HYPE (native gas token on HyperEVM) from hyperCORE to hyperEVM. This can be done directly from the [Portfolio Section](https://app.hyperliquid.xyz/portfolio) on the Hyperliquid App.

:::warning Important
The deployer actually needs to bridge the HYPE from CORE to EVM. Simply transferring HYPE from one EVM address to another won't allow for enabling Big Blocks.
:::

<figure>
  <img
    src={require('@site/static/img/protocol/hyperevm/core-evm.png').default}
    alt="Core<>EVM"
    style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }}
  />
  <figcaption></figcaption>
</figure>

## Step 2: Enabling Big Blocks

After bridging, Big Blocks can be enabled in the following interface: [https://hyperevm-block-toggle.vercel.app/](https://hyperevm-block-toggle.vercel.app/)

Simply connect your wallet and sign the transaction to enable Big Blocks.

Alternatively, a Python script for enabling big blocks can be found here: [GitHub](https://github.com/curvefi/curve-core/blob/main/scripts/utils/hyperevm_enable_big_blocks.py).

## Step 3: Deploy Pool or Gauge

After enabling Big Blocks, one can simply deploy pools and gauges on HyperEVM via the Curve [Pool Creation UI](https://www.curve.finance/dex/hyperliquid/create-pool/).
