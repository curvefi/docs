---
title: FXSwap Pool Reference
sidebar_label: Pool Reference
---

# FXSwap pool reference

This reference covers the verified public ABI of deployed FXSwap `v2.1.0d` pools. Unless stated otherwise, amounts are raw token or LP-token units, indices are `uint256`, and the only valid coin indices are `0` and `1`.

For integration sequencing and examples, start with [Integrating FXSwap](./integration.md). For the refuel lifecycle, see [Refuels](./refuels.md).

## Swaps and quotes

| Signature | Returns | Notes |
| --- | --- | --- |
| `exchange(i, j, dx, min_dy)` | `uint256` | Pulls input from caller; sends output to caller |
| `exchange(i, j, dx, min_dy, receiver)` | `uint256` | Pulls input from caller; sends output to `receiver` |
| `exchange_received(i, j, dx, min_dy)` | `uint256` | Uses input already transferred to the pool |
| `exchange_received(i, j, dx, min_dy, receiver)` | `uint256` | Pre-transfer flow with explicit receiver |
| `get_dy(i, j, dx)` | `uint256` | Exact-input quote after fee |
| `get_dx(i, j, dy)` | `uint256` | Approximate required input; five iterations |
| `get_dx(i, j, dy, n_iter)` | `uint256` | Approximate required input with explicit iteration count |

`i` and `j` must differ. The state-changing methods enforce `min_dy`. `get_dx` is comparatively expensive and approximate.

## Liquidity

| Signature | Returns | Notes |
| --- | --- | --- |
| `add_liquidity(amounts, min_mint_amount)` | `uint256` | Mints LP tokens to caller |
| `add_liquidity(amounts, min_mint_amount, receiver)` | `uint256` | Mints to receiver |
| `add_liquidity(amounts, min_mint_amount, receiver, donation)` | `uint256` | With `donation=true`, creates refuel shares instead of a user position |
| `remove_liquidity(amount, min_amounts)` | `uint256[2]` | Proportional withdrawal to caller |
| `remove_liquidity(amount, min_amounts, receiver)` | `uint256[2]` | Proportional withdrawal to receiver |
| `remove_liquidity_fixed_out(token_amount, i, amount_i, min_amount_j)` | `uint256` | Burns the specified LP amount; fixes the withdrawal of coin `i`; returns coin `1-i` amount |
| `remove_liquidity_fixed_out(token_amount, i, amount_i, min_amount_j, receiver)` | `uint256` | Fixed-out variant with receiver |
| `remove_liquidity_one_coin(lp_token_amount, i, min_amount)` | `uint256` | Single-coin withdrawal |
| `remove_liquidity_one_coin(lp_token_amount, i, min_amount, receiver)` | `uint256` | Single-coin withdrawal to receiver |
| `calc_token_amount(amounts, deposit)` | `uint256` | Estimates minted or burned LP amount |
| `calc_withdraw_fixed_out(lp_token_amount, i, amount_i)` | `uint256` | Estimates coin `1-i` for the fixed-out withdrawal |
| `calc_withdraw_one_coin(lp_token_amount, i)` | `uint256` | Estimates single-coin output |

All `amounts` and `min_amounts` arrays have length two.

## Refuels

| Getter | Returns | Unit / meaning |
| --- | --- | --- |
| `donation_shares()` | `uint256` | Total outstanding refuel shares |
| `user_supply()` | `uint256` | `totalSupply - donation_shares` |
| `donation_shares_max_ratio()` | `uint256` | Maximum refuel-share ratio, 1e18 precision |
| `donation_duration()` | `uint256` | Linear unlock duration, seconds |
| `last_donation_release_ts()` | `uint256` | Release-schedule timestamp |
| `donation_protection_expiry_ts()` | `uint256` | Active protection expiry, Unix seconds |
| `donation_protection_period()` | `uint256` | Protection period, seconds |
| `donation_protection_lp_threshold()` | `uint256` | LP threshold, 1e18 precision |

There is no public getter that separates locked, unlocked, protected, and immediately burnable shares.

## Prices, oracle, and fees

| Getter | Unit / meaning |
| --- | --- |
| `price_scale()` | Internal center price of coin 1 in coin 0, 1e18 |
| `price_oracle()` | EMA target price of coin 1 in coin 0, 1e18 |
| `last_prices()` | Last observed normalized price, 1e18 |
| `last_timestamp()` | Last oracle timestamp, Unix seconds |
| `lp_price()` | LP-token price estimate, 1e18 |
| `get_virtual_price()` | Current virtual price calculation, 1e18 |
| `virtual_price()` | Cached internal virtual price, 1e18 |
| `fee()` | Current dynamic fee, 1e10 |
| `mid_fee()` / `out_fee()` | Dynamic-fee bounds, 1e10 |
| `fee_gamma()` | Fee-transition parameter, 1e18 |
| `admin_fee()` | Share of fees assigned to admin, 1e10 |
| `allowed_extra_profit()` | Recentring profit buffer, 1e18 |
| `adjustment_step()` | Minimum recentering step, 1e18 |
| `ma_time()` | EMA half-time approximation in seconds |
| `A()` | Amplification parameter in contract precision |
| `gamma()` | Compatibility value; unused by the FXSwap invariant |

`calc_token_fee(amounts, xp)`, `calc_token_fee(amounts, xp, donation)`, and `calc_token_fee(amounts, xp, donation, deposit)` expose the pool's liquidity-fee calculation. `xp` is the current two-coin normalized balance vector, not raw balances. `fee_calc(xp)` returns the dynamic fee for normalized balances. `precisions()` returns the two token precision multipliers.

## LP token surface

The pool is its own 18-decimal ERC-20 LP token:

```text
name() → string                 symbol() → string
decimals() → uint8              version() → string
totalSupply() → uint256         balanceOf(owner) → uint256
allowance(owner, spender) → uint256
approve(spender, value) → bool
transfer(to, value) → bool
transferFrom(from, to, value) → bool
```

`totalSupply()` includes refuel shares; use `user_supply()` when the distinction matters.

## Configuration and state getters

| Getter | Meaning |
| --- | --- |
| `coins(i)` | Token address at index `i` |
| `balances(i)` | Internally accounted raw token balance |
| `factory()` | Factory/admin source |
| `admin()` / `fee_receiver()` | Values read through the factory |
| `MATH()` / `VIEW()` | Periphery contract addresses |
| `D()` | Cached invariant |
| `xcp_profit()` / `xcp_profit_a()` | Profit accounting |
| `initial_A_gamma()` / `future_A_gamma()` | Packed ramp endpoints |
| `initial_A_gamma_time()` / `future_A_gamma_time()` | Ramp timestamps |
| `packed_fee_params()` | Packed dynamic-fee configuration |
| `packed_rebalancing_params()` | Packed recentering configuration |

Prefer the decoded getters (`mid_fee`, `out_fee`, `fee_gamma`, `allowed_extra_profit`, `adjustment_step`, and `ma_time`) over unpacking storage in application code.

## Admin controls

These methods call the pool's factory-admin check and are not public integration entry points:

| Signature | Guard / effect |
| --- | --- |
| `ramp_A_gamma(future_A, future_gamma, future_time)` | Starts a bounded ramp lasting at least the contract minimum |
| `stop_ramp_A_gamma()` | Stops an active ramp at current values |
| `apply_new_parameters(mid_fee, out_fee, fee_gamma, allowed_extra_profit, adjustment_step, ma_time)` | Updates validated fee and recentering parameters |
| `set_donation_duration(duration)` | Requires `duration > 0` |
| `set_donation_protection_params(period, threshold, max_shares_ratio)` | Each value must be positive; ratios use 1e18 precision |
| `set_admin_fee(admin_fee)` | Must not exceed the contract's maximum; 1e10 precision |
| `set_periphery(views, math)` | Updates one or both periphery addresses; at least one must be non-zero |

:::warning[Version boundary]

`set_donation_parameters`, `POLICY`, allowlist methods, and `reserved_profit_fraction` occur in a later development design. They are not part of deployed `v2.1.0d` and are intentionally absent from this reference.

:::

## Events

| Event | Important fields / purpose |
| --- | --- |
| `TokenExchange` | buyer, sold/bought indices and amounts, fee, price scale |
| `AddLiquidity` | provider, receiver, amounts, fee, supply, price scale |
| `Donation` | Emitted when a refuel is added; contains the indexed provider in `donor` and two raw token amounts |
| `RemoveLiquidity` | provider, amounts, supply |
| `RemoveLiquidityOne` | provider, LP amount, index, coin amount, approximate fee, price scale |
| `RemoveLiquidityImbalance` | provider, LP amount, amounts, approximate fee, price scale |
| `Transfer` / `Approval` | Standard LP-token events |
| `NewParameters` | Fee and recentering configuration |
| `RampAgamma` / `StopRampA` | Amplification/gamma ramp lifecycle |
| `SetDonationDuration` | New duration |
| `SetDonationProtection` | New protection settings |
| `SetAdminFee` | New admin-fee fraction |
| `SetPeriphery` | New Views and Math addresses |
| `ClaimAdminFee` | Admin and claimed token amounts |

The ABI is verified against the live Ethereum pool at [`0xD9FF…8373`](https://etherscan.io/address/0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373#code). Treat other versions as separate implementations and inspect their bytecode and ABI before integration.
