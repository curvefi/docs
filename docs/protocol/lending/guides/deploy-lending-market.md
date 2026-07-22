---
id: deploy-lending-market
title: Deploying a LlamaLend v1 Market (Legacy)
sidebar_label: Deploying a v1 Market (Legacy)
---

import ThemedImage from '@theme/ThemedImage';

:::warning
This is historical documentation for **LlamaLend v1**. V1 markets are being phased out and **no new v1 markets will be deployed**. Its factories, `create_from_pool` flow, and crvUSD-pair requirement do not apply to v2. Any new market must use the [v2 LendFactory](/developer/llamalend-v2/lend-factory) and [Configurator](/developer/llamalend-v2/configurator) references.
:::

The following describes the historical v1 deployment flow. Do not use it to deploy a market; new markets must use LlamaLend v2.

**Important**: You can only deploy lending markets if one of the tokens is crvUSD (either as the borrowable token or as the collateral token).

## Requirements

**Data that the v1 deployment flow required:**

- Token addresses of the collateral and borrowable tokens
- Simulated parameters (A, fee, loan_discount, liquidation_discount)
- Minimum and maximum borrow rates (defaults to 0.5% and 50% if not set)
- Price oracle contract
- Name for the lending market

For more information on how to acquire this information, see: [Oracles & Parameters](../oracles-and-parameters.md).

## Historical deployment via Etherscan

This guide assumes you have all the required data from the [Requirements](#requirements) section ready.

The v1 factory contracts were deployed on the following chains:

- **Ethereum**: [0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0](https://etherscan.io/address/0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0#writeContract#F1)
- **Arbitrum**: [0xcaEC110C784c9DF37240a8Ce096D352A75922DeA](https://arbiscan.io/address/0xcaEC110C784c9DF37240a8Ce096D352A75922DeA#writeContract)
- **Fraxtal**: [0xf3c9bdab17b7016fbe3b77d17b1602a7db93ac66](https://fraxscan.com/address/0xf3c9bdab17b7016fbe3b77d17b1602a7db93ac66#writeContract)
- **Optimism**: [0x5EA8f3D674C70b020586933A0a5b250734798BeF](https://optimistic.etherscan.io/address/0x5EA8f3D674C70b020586933A0a5b250734798BeF#writeContract)
- **Sonic**: [0x30D1859DaD5A52aE03B6e259d1b48c4b12933993](https://sonicscan.org/address/0x30D1859DaD5A52aE03B6e259d1b48c4b12933993#writeContract)

## Historical deployment methods

The v1 factory offered two deployment methods:

1. **`create_from_pool` function**: Use this when both tokens exist in the same Curve liquidity pool with a suitable oracle. The factory will automatically use the pool's EMA oracle, eliminating the need for an external oracle.

2. **`create` function**: Use this when you need a custom price oracle, such as when a token has a Curve pool but is priced against USDC instead of crvUSD.

**Recommendation**: The `create_from_pool` function is the easiest approach. For example, if a protocol wants to create a lending market for their governance token, they should first create a TOKEN/crvUSD liquidity pool, which will provide the necessary oracle.

### create_from_pool

This function can be used when both tokens are in the same Curve liquidity pool with a reliable oracle (stableswap-ng, twocrypto-ng, or tricrypto-ng).

<figure>
<ThemedImage
    alt="`create_from_pool` function interface"
    sources={{
        light: require('@site/static/img/protocol/deploy-lending/create-from-pool-light.png').default,
        dark: require('@site/static/img/protocol/deploy-lending/create-from-pool-dark.png').default,
    }}
    style={{ width: '800px', display: 'block', margin: '0 auto' }}
/>
</figure>

**Required inputs:**

- **borrowed_token**: Token address of the borrowable token
- **collateral_token**: Token address of the collateral token
- **A**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **fee**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **loan_discount**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **liquidation_discount**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **pool**: Curve liquidity pool contract address containing both tokens
- **name**: Name of the market (see [naming conventions](../oracles-and-parameters.md#name))
- **min_borrow_rate**: Minimum borrow rate (see [rate parameters](../oracles-and-parameters.md#borrow-rate-parameters))
- **max_borrow_rate**: Maximum borrow rate (see [rate parameters](../oracles-and-parameters.md#borrow-rate-parameters))


### create

This function can be used when the collateral token's oracle cannot be obtained from an existing Curve pool.

<figure>
<ThemedImage
    alt="`create` function interface"
    sources={{
        light: require('@site/static/img/protocol/deploy-lending/create-light.png').default,
        dark: require('@site/static/img/protocol/deploy-lending/create-dark.png').default,
    }}
    style={{ width: '800px', display: 'block', margin: '0 auto' }}
/>
</figure>

**Required inputs:**

The inputs are the same as the `create_from_pool` method above, except that instead of providing a pool contract address, you provide a custom price oracle (which must have a `price()` function to comply with the ABI):

- **borrowed_token**: Token address of the borrowable token
- **collateral_token**: Token address of the collateral token
- **A**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **fee**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **loan_discount**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **liquidation_discount**: Value obtained from [simulations](../oracles-and-parameters.md#a-fee-loan--and-liquidation-discount)
- **price_oracle**: Custom price oracle contract address (must have `price()` function)
- **name**: Name of the market (see [naming conventions](../oracles-and-parameters.md#name))
- **min_borrow_rate**: Minimum borrow rate (see [rate parameters](../oracles-and-parameters.md#borrow-rate-parameters))
- **max_borrow_rate**: Maximum borrow rate (see [rate parameters](../oracles-and-parameters.md#borrow-rate-parameters))
