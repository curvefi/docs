---
title: FXSwap Mechanism and Parameter Design
sidebar_label: Mechanism & Parameters
---

# FXSwap Mechanism and Parameter Design

FXSwap concentrates passive, full-range liquidity around a moving `price_scale`. It is designed for two-asset markets whose primary price discovery happens outside the pool and whose liquidity can be recentered through arbitrage, trading profit, and a finite refuel budget.

This page is for protocol teams evaluating or operating a market. Route aggregators can start with the [integration guide](./integration.md); contract researchers should use the [pool reference](./reference.md).

## When FXSwap fits

Volatility alone does not determine whether a pair fits FXSwap. The important inputs are external price discovery, market depth, arbitrage access, desired concentration, and the cost of recentering.

| Market property | FXSwap implication |
| --- | --- |
| Reliable external reference market | Gives arbitrageurs a price against which to trade the pool |
| Sufficient external depth | Makes it more likely that arbitrage remains economical at useful trade sizes |
| Passive liquidity is preferred | Avoids requiring LPs to choose and manage active ranges |
| Sustainable recentering budget | Supports the desired concentration as the external price moves |
| Primary price discovery occurs in this Curve pool | Usually favors CryptoSwap rather than FXSwap |

Fiat FX pairs are a natural use case, but externally priced volatile pairs such as BTC/USD can also fit. They generally require more careful parameter selection and stress testing because larger or faster moves can increase recentering demand.

## Price tracking and recentering

The pool maintains three related prices:

| Getter | Precision | Role |
| --- | --- | --- |
| `last_prices()` | 1e18 | Most recently observed normalized trade price |
| `price_oracle()` | 1e18 | Exponential moving-average target derived from recent prices |
| `price_scale()` | 1e18 | Current center of the pool's concentrated liquidity |

Each expresses the price of `coins(1)` in `coins(0)` units. A state-changing pool operation can update the oracle and, when the contract's conditions are satisfied, move `price_scale` toward `price_oracle`.

Refuels do not set an external price and do not force a rebalance. They help pay the cost when the pool's normal recentering logic moves concentrated liquidity. Read [Refuels](./refuels.md) for unlocking, protection, burn priority, and depletion.

The general exponential moving-average behavior is shared with Twocrypto-NG, but the invariant and recentering budget are not identical. Do not infer FXSwap behavior from the [Twocrypto oracle reference](../twocrypto-ng/pools/oracles.md) without checking the deployed FXSwap version.

## The recentering budget

Moving concentrated liquidity can reduce the pool's measured profit. FXSwap can fund that movement from:

1. unlocked refuel shares that have passed the protection rules; and
2. the pool's normal profit buffer when more funding is required.

This makes refuels a spendable market-liquidity budget, not recoverable principal. A protocol can observe the outstanding shares and public unlock parameters, but the deployed `v2.1.0d` interface does not expose separate getters for the exact locked, unlocked, protected, and immediately burnable amounts.

## Parameter interactions

Parameters must be selected together. Raising concentration without providing enough room, fees, or recentering budget can improve quotes near the center while making the pool more fragile when the external price moves.

| Parameter | Unit / precision | Primary effect | Interaction to test |
| --- | --- | --- | --- |
| `A()` | Contract amplification precision | Controls StableSwap-style concentration around `price_scale` | Higher concentration can improve near-center depth and increase recentering cost |
| `mid_fee()` | 1e10 | Lower dynamic-fee bound | Affects routine execution and fee income |
| `out_fee()` | 1e10 | Upper dynamic-fee bound | Must remain low enough for useful rebalancing flow while charging adverse imbalance |
| `fee_gamma()` | 1e18 | Shapes the transition between fee bounds | Changes how quickly fees rise with imbalance |
| `ma_time()` | seconds | Controls oracle smoothing | Too slow can lag the external market; too fast can follow short-lived moves |
| `allowed_extra_profit()` | 1e18 | Profit buffer before recentering | Interacts with how readily the pool moves `price_scale` |
| `adjustment_step()` | 1e18 | Minimum recentering step | Affects the size and frequency of adjustments |
| Refuel schedule | Token amounts and seconds | Supplies the finite external budget | Must be evaluated against volatility, concentration, fees, and expected flow |

`gamma()` remains in the ABI for compatibility but is unused by the reviewed FXSwap invariant.

:::warning[Do not copy example parameters]

Parameters that work for one pair, time period, or external market can fail for another. Read the target pool's current values and treat historical configurations as dated evidence, not defaults.

:::

## Simulation-driven design

The Curve simulation workflow described in [FXSwap Simulations: Behind the Scenes](https://news.curve.finance/fxswap-simulations/) replays historical price data against many parameter combinations. It models whether arbitrage would be economical after external market depth and trading costs, then measures outcomes such as price tracking, imbalance, execution, pool profitability, and refuel demand.

A practical design workflow is:

1. Define the external reference market, coin order, token behavior, and usable historical data.
2. Model external liquidity depth and arbitrage costs instead of assuming unlimited rebalancing.
3. Search combinations of `A`, dynamic-fee settings, oracle smoothing, recentering parameters, and a proposed refuel schedule.
4. Evaluate several outcomes together; do not optimize only for the best near-center quote.
5. Stress periods with fast moves, thin external liquidity, and prolonged one-directional flow.
6. Deploy conservatively, monitor observed behavior, and re-simulate before changing parameters.

In simulation discussions, **refuel rate** or **boost rate** describes an assumed funding schedule. It is not a deployed pool getter.

:::warning[Backtests are decision support, not guarantees]

The published simulation methodology models arbitrage flow and relies on assumptions about external depth and costs. Organic flow is uncertain, historical volatility may not repeat, and parameter optimization does not eliminate market or LP risk.

:::

## Dated performance evidence

An independent analysis summarized in the [January 9, 2026 FXSwap article](https://news.curve.finance/fxswap/) compared a YieldBasis WBTC route with a Uniswap V3 WBTC/USDC pool over November 1–December 17. For a $10 million quoted trade, the article reports better FXSwap execution in approximately 80% of observed blocks, with about 2% average improvement. Quotes included swap fees and excluded gas.

This is evidence for those pools, trade sizes, market conditions, and dates. It is not a general promise about another FXSwap deployment or smaller trades. Integrators should quote the live pool, and protocol teams should reproduce relevant simulations for their own market.

## Operating checklist

- Monitor `price_oracle()` relative to `price_scale()` and the external reference market.
- Track pool balances, realized fees, refuel shares, and refuel depletion.
- Measure live execution across representative trade sizes, not only spot price.
- Revisit assumptions when external market depth, token redemption paths, volatility, or flow changes.
- Simulate and govern parameter changes as a coordinated set.
