---
id: pool-parameters
title: Pool Parameters
sidebar_label: Pool Parameters
---

## Setting Parameters at Deployment

Pool parameters are set at the time of pool deployment, and most parameters can be changed by the DAO later through governance votes. This flexibility allows for parameter optimization as market conditions evolve and new data becomes available.

When deploying pools via the Curve UI, recommended parameters are automatically suggested based on the algorithm type and tokens used.

## Monitoring Parameters

Monitoring parameters is crucial for optimal pool performance. Depending on factors like market conditions, asset liquidity, trading volume, parameters can be optimized to help LPs earn more fees and provide better exchange rates for traders. Regular parameter adjustments ensure pools remain competitive and efficient.

:::info
**Struggling with parameters?** Don't worry, you're not alone! Jump into our <a href="https://t.me/curvefi" target="_blank" rel="noopener noreferrer">Telegram</a> and let the Curve wizards work their magic. From A to γ, we've got your back! 🧙‍♂️
:::

## Stableswap Parameters

| Name | Variable Name | Description |
| :--: | :-----------: | ----------- |
| Amplification coefficient | `A` | Controls liquidity concentration around the 1:1 price. Higher values reduce slippage near the peg, lower values spread liquidity more evenly. More here: [Stableswap `A`](understanding-stableswap.md#amplification-factor-a) |
| Regular fee | `fee` | Regular trading fee charged on swaps when pool is perfectly balanced |
| Off-peg fee multiplier | `offpeg_fee_multiplier` | Multiplier applied to fees when pool is imbalanced. The greater the imbalance, the higher the multiplier. More here: [Dynamic Fees](understanding-stableswap.md#offpeg-fee-multiplier-and-dynamic-fees) |
| EMA time | `ma_exp_time` | Time constant for exponential moving average price oracle |

## Cryptoswap Parameters

CryptoSwap extends StableSwap by keeping **A** and adding parameters that adapt the curve and the fees to volatile assets.

| Name | Variable Name | Role |
|------|:------:|-------------------|
| Amplification coefficient | `A` | Same meaning as in Stableswap, sets liquidity depth at balanced price.  However, `A`=10,000 in Cryptoswap is `A`=1 in Stableswap, giving extra precicion for Cryptoswap pools.  More here: [Cryptoswap Parameters](./understanding-cryptoswap.md#parameters)|
| Curve-width modifier | `γ` (gamma) | Controls how fast prices degrade when pools become unbalanced, lower values mean price declines are more gradual.  More here: [Cryptoswap Parameters](./understanding-cryptoswap.md#parameters) |
| EMA half-life | `ma_time` | Time constant (in seconds) of the exponential moving average that tracks the market price |
| Allowed extra profit | `allowed_extra_profit` | Minimum theoretical arbitrage gain (in bp) before the contract updates its internal price scale, preventing micro-adjustments |
| Adjustment step | `adjustment_step` | The minimum rebalancing step (min movement of `price_scale`) |
| Mid fee | `fee_mid` | Swap fee when the pool is perfectly balanced.  More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees)|
| Out fee | `out_fee` | Maximum fee charged at total imbalance. More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees) |
| Fee gamma | `fee_gamma` | Governs how quickly the fee rises between `fee_mid` and `out_fee` as the pool leaves equilibrium. More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees)|

## FXSwap Parameters

FXSwap reuses CryptoSwap's oracle, fee, and recentering parameter families, but uses a StableSwap-style invariant. It also adds governable parameters for the refuel (donation) mechanism:

| Name | Variable Name | Role |
|------|:------:|-------------------|
| Amplification coefficient | `A` | Controls liquidity concentration around the balanced price. Higher values reduce slippage near the peg, lower values spread liquidity more evenly. Same meaning as Stableswap `A`. More here: [FXSwap `A`](understanding-fxswap.md#amplification-factor-a) |
| EMA half-life | `ma_time` | Time constant (in seconds) of the exponential moving average that tracks the market price |
| Allowed extra profit | `allowed_extra_profit` | Minimum theoretical arbitrage gain (in bp) before the contract updates its internal price scale, preventing micro-adjustments |
| Adjustment step | `adjustment_step` | The minimum rebalancing step (min movement of `price_scale`) |
| Mid fee | `mid_fee` | Swap fee when the pool is perfectly balanced.  More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees)|
| Out fee | `out_fee` | Maximum fee charged at total imbalance. More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees) |
| Fee gamma | `fee_gamma` | Governs how quickly the fee rises between `fee_mid` and `out_fee` as the pool leaves equilibrium. More here: [Cryptoswap Dynamic Fees](./understanding-cryptoswap.md#dynamic-fees)|
| Donation Duration | `donation_duration` | Time required for refuels (donations) to fully unlock (default: 7 days) |
| Protection Period | `donation_protection_period` | Maximum duration donation protection can be extended (default: 10 minutes) |
| Protection LP Threshold | `donation_protection_lp_threshold` | LP addition threshold that triggers protection extension (default: 20%) |
| Maximum Donation Share Ratio | `donation_shares_max_ratio` | Cap on donation shares as percentage of total supply (default: 10%) |
