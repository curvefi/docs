---
id: deploy-stableswap
title: "Deploy a Stableswap Pool"
sidebar_label: "Deploy a Stableswap Pool"
description: Step-by-step guide to deploying a Curve Stableswap pool for up to eight pegged tokens, including rebasing, ERC-4626 and oracle-priced tokens.
---

import ThemedImage from '@theme/ThemedImage';
import ButtonGrid from '@site/src/components/ButtonGrid';

When you finish, a Stableswap pool for your pegged tokens is live onchain and holds its first liquidity.

Creating the pool is one transaction, and seeding it is another. Getting CRV emissions later adds a 7-day Curve DAO vote.

<ButtonGrid buttonKeys={['gotoPoolDeployment']} />

## Before You Start

You need a wallet on the chain you deploy to, the tokens' addresses, and a rate oracle for any token whose value grows against the others.

It costs gas and the tokens you deposit as initial liquidity. Curve charges no fee to deploy a pool.

It takes two transactions: one to create the pool and one to seed it.

Nobody approves it. Only CRV emissions need a Curve DAO vote, after you deploy a gauge.

## Choose the Pool Type

1. Open [Pool Creation](https://www.curve.finance/dex/ethereum/create-pool) in the Curve app and connect your wallet.
2. Switch your wallet to the chain where the pool will live. The app follows your wallet's network.
3. Under **POOL TYPE**, select **Stableswap**.
4. Select **Next**.

<figure>
  <ThemedImage
    alt="Pool type selection with Stableswap and Cryptoswap"
    sources={{
      light: require('@site/static/img/protocol/deploy-pool/pool_type_light.png').default,
      dark: require('@site/static/img/protocol/deploy-pool/pool_type_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Add the Tokens

1. Under **TOKENS IN POOL**, choose the first two tokens. Select **Add token** for each extra token, up to eight.
2. For each token, pick its asset type: **Standard**, **Oracle**, **Rebasing** or **ERC4626**. The table below explains which one to use.
3. For an **Oracle** token, enter the oracle's **Address** and its **Function**, such as `stEthPerToken()`. The app checks that the rate has 18 decimals.
4. Select **Next**.

To build a metapool, pick a base pool's LP token, marked **BASE** in the token list. A metapool holds two tokens: yours and the base pool's LP token.

| Asset type | Use it for | Example |
| --- | --- | --- |
| **Standard** | A plain ERC-20 token | USDC |
| **Oracle** | A token whose value grows against the others, priced by a rate oracle | wstETH |
| **Rebasing** | A token whose balance changes on its own | stETH |
| **ERC4626** | A vault share that follows the ERC-4626 standard | sDAI |

[Understanding Stableswap](../understanding-stableswap.md#supported-asset-types) explains how each type is priced. Curve contracts can't detect tokens with transfer fees or other non-standard behavior, so check your token before you add it.

<figure>
  <ThemedImage
    alt="Tokens in pool with asset type options"
    sources={{
      light: require('@site/static/img/protocol/deploy-pool/tokens_in_pool_light.png').default,
      dark: require('@site/static/img/protocol/deploy-pool/tokens_in_pool_dark.png').default,
    }}
    style={{ width: "600px", display: "block", margin: "0 auto" }}
  />
</figure>

## Check the Rate Oracle {#oracle-based-tokens}

Skip this section if none of your tokens uses the **Oracle** type.

A Stableswap oracle returns a redemption rate: the value of one token in the pool's base asset, with 18 decimals. It is not a market price. Before you deploy, confirm three things:

1. **The rate never decreases.** A lower rate shifts the pool's center of liquidity down, and anyone who can push it down can trade around the update at liquidity providers' expense. Yield-bearing tokens such as staking or savings tokens only accrue, so their redemption rate qualifies.
2. **The rate moves slowly.** One update must not move the rate by more than twice the pool fee. See [The Oracle Sandwich](../understanding-stableswap.md#1-the-oracle-sandwich-2-fee-rule).
3. **You know who controls the oracle.** A multisig or a single address that can change the rate at will is a risk to the pool.

Never use a spot price, a withdrawal simulation such as `calc_withdraw_one_coin()` or token balances as the rate. [Best Practices for Oracles](../understanding-stableswap.md#best-practices-for-oracles) lists the rest.

Pools with an oracle the Curve team hasn't verified stay hidden on curve.finance until it is verified. You can still deploy. Swiss Stake reviews oracle designs for protocols and issuers: [inquiries@curve.finance](mailto:inquiries@curve.finance).

## Set the Parameters

1. Under **PARAMETERS**, choose a preset in **Pool Parameters Presets**: **Fiat Redeemable Stablecoins**, **Crypto Collateralized Stablecoins** or **Liquid Restaking Tokens**.
2. To change a value, open **Advanced** and edit **A**, **Swap Fee**, **Offpeg Fee Multiplier** or **Moving Average Time**.
3. Select **Next**.

[Pool Parameter Presets](../presets.md) lists each preset's values next to live pools, and [Curve Pool Parameters](../pool-parameters.md#stableswap-parameters) explains what each parameter does.

<figure>
  <ThemedImage
    alt="Pool parameter presets"
    sources={{
      light: require('@site/static/img/protocol/deploy-pool/presets_light.png').default,
      dark: require('@site/static/img/protocol/deploy-pool/presets_dark.png').default,
    }}
    style={{ width: "500px", display: "block", margin: "0 auto" }}
  />
</figure>

## Name the Pool

1. Under **POOL INFO**, enter a name, such as `stETH/ETH`, and a symbol, such as `stETHETH`.
2. Check both for typos. They become the LP token's name and symbol and can't be changed after deployment.

## Create the Pool

1. Review the **Pool Summary**: the tokens and their types, the parameters, and the name and symbol.
2. Select **Create Pool** and confirm the transaction in your wallet.
3. When **Pool Creation Complete** appears, select **Go to pool**.

<figure>
  <ThemedImage
    alt="Pool summary before creation"
    sources={{
      light: require('@site/static/img/resource/pool_creation/ss_summary_light.png').default,
      dark: require('@site/static/img/resource/pool_creation/ss_summary_dark.png').default,
    }}
    style={{ width: "200px", display: "block", margin: "0 auto" }}
  />
</figure>

## Seed the Pool

1. On the new pool's page, open the **Seed pool** tab.
2. Deposit the first liquidity in balanced amounts. A pool can't process trades until it holds liquidity.

## Check It Worked

- The pool page opens on curve.finance at `https://www.curve.finance/dex/<network>/pools/<pool address>`.
- The creation transaction appears in your wallet's history and on the chain's block explorer.
- Once the pool holds liquidity and is indexed, the Curve Prices API returns it at `https://prices.curve.finance/v1/pools/<network>/<pool address>`, and it appears in the pool list.

If the pool doesn't show up, see [Troubleshooting Curve Pools](../troubleshooting.md).

## Next Step

[After Deploying a Pool](../post-deployment.md) covers the token logo, integrations and incentives, starting with deploying your pool's gauge.

Questions go to the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
