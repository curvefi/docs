---
title: FXSwap Oracles
sidebar_label: Oracles
---

# FXSwap Oracles

FXSwap uses an exponential moving average (EMA) of its own observed prices to guide gradual changes to the center of liquidity. The oracle is AMM state: it helps the pool recenter, but it is not automatically suitable as a lending, liquidation, or solvency oracle.

:::deploy[Contract Source & Deployment]

This page documents the oracle behavior of deployed FXSwap pools reporting `version() == "v2.1.0d"`. The verified pool source was compiled with Vyper `0.4.3` and is closest to [`curvefi/twocrypto-ng@387fbe5`](https://github.com/curvefi/twocrypto-ng/commit/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d).

Read these getters from the target pool. They are pool methods, not a separate external-price oracle contract.

:::

## Price direction and precision

`last_prices()`, `price_oracle()`, and `price_scale()` all use 1e18 precision and express the price of `coins(1)` in units of `coins(0)`.

For a USDC/WBTC pool ordered as `[USDC, WBTC]`, a value near `100_000e18` means one WBTC is worth approximately 100,000 USDC. Always read `coins(0)` and `coins(1)` instead of inferring direction from a pool name.

| Getter | Meaning | Update behavior |
| --- | --- | --- |
| `last_prices() -> uint256` | Latest normalized price observed by the pool | Stored during a state-changing operation; explicitly treated as manipulable spot state |
| `price_oracle() -> uint256` | Current EMA value | Calculates the time-decayed value at the current timestamp, even when cached storage has not yet changed |
| `price_scale() -> uint256` | Center around which liquidity is concentrated | Changes only when the recentering conditions pass |
| `last_timestamp() -> uint256` | Timestamp of the last cached EMA update | Advances at most once per block during relevant state changes |
| `ma_time() -> uint256` | Approximate EMA half-life in seconds | Decoded from the packed recentering parameter |

## `last_prices`

::::description[`FXSwap.last_prices() -> uint256: view`]

Returns the latest normalized pool price with 1e18 precision. The contract updates it from the post-operation balances and invariant:

```text
last_prices = Math.get_p(xp, D, A_gamma) × price_scale ÷ 1e18
```

The deployed source explicitly marks this value as unsafe and manipulable. Use it to inspect or reproduce pool behavior, not as an independent market price.

::::

## `price_oracle`

::::description[`FXSwap.price_oracle() -> uint256: view`]

Returns the EMA target price with 1e18 precision. If time has elapsed since `last_timestamp()`, the view calculates the current value without writing storage:

```text
alpha = exp(-(elapsed × 1e18) / internal_ma_parameter)
oracle = min(last_prices, 2 × price_scale) × (1 - alpha)
       + cached_oracle × alpha
```

The contribution from `last_prices` is capped at twice `price_scale`. A later state-changing operation can cache the calculated value and timestamp.

The oracle follows pool observations; it does not fetch an external FX feed. External markets influence it indirectly when arbitrage trades against the pool.

::::

## `price_scale`

::::description[`FXSwap.price_scale() -> uint256: view`]

Returns the current liquidity center with 1e18 precision. It is neither the latest trade price nor the EMA itself.

A relevant state-changing operation can evaluate a move from `price_scale` toward `price_oracle`. The move occurs only when the oracle distance, `adjustment_step`, profit conditions, and available recentering budget allow it. A swap or liquidity operation therefore does not guarantee a `price_scale` update.

Read [Mechanism and Parameters](./mechanism.md) for the recentering conditions and [Refuels](./refuels.md) for the finite refuel budget.

::::

## `ma_time`

::::description[`FXSwap.ma_time() -> uint256: view`]

Returns the approximate EMA half-life in seconds. The pool stores the exponent denominator internally and returns:

```text
packed_ma_parameter × 694 ÷ 1000
```

This integer conversion can differ from the mathematical half-life by one second. The admin setter `apply_new_parameters` accepts the internal exponent parameter, described in its source as `time_in_seconds / ln(2)`, rather than the decoded `ma_time()` return value.

::::

## Updates and recentering

The deployed pool evaluates its price-update routine after swaps and unbalanced liquidity operations, including one-coin and fixed-out withdrawals. During that routine it:

1. updates the cached EMA at most once per block;
2. records a new manipulable `last_prices` value;
3. updates profit and refuel accounting;
4. tests whether `price_scale` may move toward `price_oracle`; and
5. burns available refuel shares before using the permitted normal profit buffer.

These transitions are visible through getters and operation events, but there is no dedicated oracle-update event. Indexers should read the price fields at the block containing the pool operation when exact post-operation state matters.

## Safe integration boundary

- Use the getters to quote, monitor, reproduce pool calculations, or explain recentering.
- Treat values as block-sensitive and read all related fields at the same block.
- Do not assume `price_oracle` is independent of Curve trading activity.
- Do not use `last_prices` for manipulation-sensitive decisions.
- Before using any pool-derived price for lending or solvency, perform a separate oracle-security analysis covering manipulation cost, staleness, liquidity, external-market failure, and fallback behavior.
