---
id: enable-big-blocks-hyperevm
title: "Enable Big Blocks on HyperEVM"
sidebar_label: "Enable Big Blocks on HyperEVM"
description: How to enable large blocks for your wallet on HyperEVM, which is required to deploy Curve pools and gauges there.
---



When you finish, your wallet sends transactions in HyperEVM's large blocks, so it can deploy Curve pools and gauges there.

It takes two transactions: one bridge and one signature to switch block size.

## Before You Start

You need HYPE on HyperCore, Hyperliquid's native layer, in the wallet you will deploy from.

It costs a small amount of HYPE for gas.

It takes two transactions.

Nobody approves it.

[HyperEVM](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm) produces [small fast blocks and large slow blocks](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture). Deploying Curve pools and gauges only fits in large blocks.

## Bridge HYPE to HyperEVM {#step-1-bridging-hype}

1. Open the [Portfolio](https://app.hyperliquid.xyz/portfolio) page in the Hyperliquid app.
2. Bridge HYPE from HyperCore to HyperEVM, to the wallet you will deploy from. A transfer from another HyperEVM address doesn't work; the HYPE has to come over the bridge.

<figure>
  <img
    src={require('@site/static/img/protocol/hyperevm/core-evm.png').default}
    alt="Core<>EVM"
    style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }}
  />
  <figcaption></figcaption>
</figure>

## Enable Big Blocks {#step-2-enabling-big-blocks}

1. Open the [HyperEVM block toggle](https://hyperevm-block-toggle.vercel.app/) and connect your wallet.
2. Sign the transaction to enable big blocks.

To do it from a script instead, use [`hyperevm_enable_big_blocks.py`](https://github.com/curvefi/curve-core/blob/main/scripts/utils/hyperevm_enable_big_blocks.py) in curve-core.

## Check It Worked

Deploy from [Pool Creation](https://www.curve.finance/dex/hyperliquid/create-pool/) on HyperEVM with the same wallet. If the deployment doesn't confirm, check that big blocks are enabled for that wallet.

## Next Step {#step-3-deploy-pool-or-gauge}

[Deploy a Stableswap Pool](./deploy-stableswap.md) walks through the deployment. The other pool types follow the same flow.
