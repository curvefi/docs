---
title: FXSwap Pool
sidebar_label: FXSwap Pool
---

# FXSwap Pool

This reference covers the verified public ABI of deployed FXSwap `v2.1.0d` pools. Unless stated otherwise, amounts are raw token or LP-token units, indices are `uint256`, and the only valid coin indices are `0` and `1`.

For transaction sequencing and examples, start with [Integrating FXSwap](../guides/integration.md). Protocols holding LP positions should read [Building on FXSwap](../guides/building.md). For recentering and parameter interactions, see [Mechanism and Parameter Design](./mechanism.md). For the refuel lifecycle, see [FXSwap Refuels](./refuels.md).

## Deployed version and source

:::vyper[`Twocrypto.vy`]

The callable pool used for this reference is the YieldBasis WBTC pool at [`0xD9FF…8373`](https://etherscan.io/address/0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373#code). Its verified similar-match source has SHA-256 `5b4c3e0cf8a23c0e16d5d3c4d0a2d06ebd39220fa71c6300a72dec5159b3dfad` and was compiled with Vyper `0.4.3`.

The source is closest to [`curvefi/twocrypto-ng@387fbe5`](https://github.com/curvefi/twocrypto-ng/commit/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d), with deployment-specific constructor values for the Views address, Math address, and initial `admin_fee`.

The live pool currently returns Views [`0x3504…D31f`](https://etherscan.io/address/0x35048188c02cbc9239e1e5ecb3761eF9dfDcD31f), Math [`0x7983…2e51`](https://etherscan.io/address/0x79839c2D74531A8222C0F555865aAc1834e82e51), and factory [`0x98EE…AF7F`](https://etherscan.io/address/0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F). Read `VIEW()`, `MATH()`, and `factory()` from the target pool because periphery addresses and implementations may differ.

:::

This page inventories every deployed FXSwap entry point. It documents the swap and LP-token methods locally even where their call shapes remain compatible with earlier two-coin pools, so an FXSwap integration does not depend on another AMM reference.

All entries on this page are available in deployed `v2.1.0d` unless a version boundary says otherwise. View methods have no caller restriction. State-changing user methods are permissionless and nonpayable; token allowance, balance, index, receiver, cap, invariant, and slippage guards still apply. The [Admin controls](#admin-controls) table identifies the factory-admin-only methods. Event names are listed with the state-changing method or group and defined in [Events](#events).

## FXSwap-specific source walkthroughs

These focused excerpts come from the verified deployed source identified above. They explain the refuel and recentering behavior that is unique to FXSwap; the complete public interface follows them.

### Refuel creation and supply accounting

The refuel overload calculates shares, enforces the zero receiver and configured cap, then increases aggregate supply without minting an account balance:

```vyper
if donation:
    assert receiver == empty(address), "nonzero receiver"
    new_donation_shares: uint256 = self.donation_shares + d_token
    assert (
        new_donation_shares * PRECISION // (token_supply + d_token)
        <= self.donation_shares_max_ratio
    ), "donation above cap!"

    self.donation_shares = new_donation_shares
    self.totalSupply += d_token
    log Donation(donor=msg.sender, token_amounts=amounts_received)
```

The deployed user-owned-supply getter is therefore:

```vyper
@external
@view
def user_supply() -> uint256:
    return self.totalSupply - self.donation_shares
```

### Unlocking and protection

The internal availability calculation linearly unlocks the outstanding shares, then damps them while protection remains active:

```vyper
elapsed: uint256 = block.timestamp - self.last_donation_release_ts
unlocked_shares: uint256 = min(
    donation_shares,
    donation_shares * elapsed // self.donation_duration
)

protection_factor: uint256 = 0
expiry: uint256 = self.donation_protection_expiry_ts
if expiry > block.timestamp:
    protection_factor = min(
        (expiry - block.timestamp) * PRECISION
        // self.donation_protection_period,
        PRECISION,
    )

return unlocked_shares * (PRECISION - protection_factor) // PRECISION
```

Regular LP additions can extend the protection expiry in proportion to their relative size, capped at one configured protection period. Overlapping refuels instead shift `last_donation_release_ts` to preserve shares already unlocked. See [FXSwap Refuels](./refuels.md) for the complete lifecycle and the limits of public state inspection.

### Recenter, burn, and depletion

The pool only proposes a new center when the normalized distance between `price_oracle` and `price_scale` exceeds the effective adjustment step:

```vyper
adjustment_step: uint256 = max(rebalancing_params[1], norm // 5)
if norm > adjustment_step:
    p_new: uint256 = (
        price_scale * (norm - adjustment_step)
        + adjustment_step * price_oracle
    ) // norm
```

It calculates the virtual price at `p_new` and finds the smallest available refuel-share burn that can restore the permitted target, capped by currently available shares:

```vyper
tweaked_supply: uint256 = 10**18 * new_xcp // goal_vp
donation_shares_to_burn = min(
    total_supply - tweaked_supply,
    donation_shares,
)
new_virtual_price = (
    10**18 * new_xcp
    // (total_supply - donation_shares_to_burn)
)
```

The new `price_scale` is stored only if the post-burn virtual price remains above the contract's acceptance thresholds. A burn reduces both `donation_shares` and `totalSupply` and shifts the release timestamp to preserve the remaining unlock state.

### Dynamic-fee calculation

`_fee(xp)` builds a normalized balance indicator that is 1e18 near balance and tends toward zero with imbalance. `fee_gamma` shapes that indicator, then the contract interpolates between the 1e10-precision bounds:

```vyper
B = PRECISION * N_COINS**N_COINS * xp[0] // B * xp[1] // B
B = fee_gamma * B // (fee_gamma * B // 10**18 + 10**18 - B)
return (mid_fee * B + out_fee * (10**18 - B)) // 10**18
```

The names in this shortened excerpt correspond to the values unpacked from `packed_fee_params`. Use `fee()` for current pool state and `fee_calc(xp)` only with correctly normalized balances.

## Exchange Methods

| Signature | Mutability | Returns | Behavior |
| --- | --- | --- | --- |
| `exchange(uint256 i, uint256 j, uint256 dx, uint256 min_dy)` | nonpayable | `uint256` | Pulls input from caller; sends output to caller |
| `exchange(uint256 i, uint256 j, uint256 dx, uint256 min_dy, address receiver)` | nonpayable | `uint256` | Pulls input from caller; sends output to `receiver` |
| `exchange_received(uint256 i, uint256 j, uint256 dx, uint256 min_dy)` | nonpayable | `uint256` | Uses input already transferred to the pool; sends output to caller |
| `exchange_received(uint256 i, uint256 j, uint256 dx, uint256 min_dy, address receiver)` | nonpayable | `uint256` | Pre-transfer flow with explicit receiver |
| `get_dy(uint256 i, uint256 j, uint256 dx)` | view | `uint256` | Exact-input quote after the dynamic fee |
| `get_dx(uint256 i, uint256 j, uint256 dy)` | view | `uint256` | Approximate required input using five iterations |
| `get_dx(uint256 i, uint256 j, uint256 dy, uint256 n_iter)` | view | `uint256` | Approximate required input with an explicit iteration count |

`i` and `j` must differ. Swap methods revert when token transfer fails or the output is below `min_dy`. `exchange_received` requires the caller to have transferred at least `dx` input tokens to the pool; keep the transfer and call atomic. `get_dx` is comparatively expensive and is an estimate, not an exact-output execution method.

Successful swaps emit `TokenExchange`.

### `exchange`

`exchange` pulls `dx` from the caller with `transferFrom`, applies the current dynamic fee, checks that output is at least `min_dy`, and transfers raw `coins(j)` units to the receiver. The caller must approve the pool for `coins(i)`.

The return value and `TokenExchange.tokens_bought` are the realized raw output amount. `TokenExchange.tokens_sold` records the amount actually received, which can differ from requested `dx` for unusual token behavior.

### `exchange_received`

`exchange_received` uses the surplus token balance already transferred to the pool instead of calling `transferFrom`. It accounts for the full observed surplus when that surplus is at least `dx`; the realized sold amount can therefore exceed the minimum declared `dx`.

The transfer and call must be atomic. A separate transaction exposes the prefunded tokens to another caller, who can direct the output to their own receiver.

### `get_dy` and `get_dx`

`get_dy` is the normal exact-input quote and includes the dynamic fee. `get_dx` iteratively estimates the input for a target output; it does not provide an exact-output execution path. Both wrappers call the pool's current [Views contract](../utility-contracts/views.md).

## Adding Liquidity

| Signature | Mutability | Returns | Behavior |
| --- | --- | --- | --- |
| `add_liquidity(uint256[2] amounts, uint256 min_mint_amount)` | nonpayable | `uint256` | Mints LP tokens to caller |
| `add_liquidity(uint256[2] amounts, uint256 min_mint_amount, address receiver)` | nonpayable | `uint256` | Mints LP tokens to `receiver` |
| `add_liquidity(uint256[2] amounts, uint256 min_mint_amount, address receiver, bool donation)` | nonpayable | `uint256` | With `donation=true`, creates refuel shares rather than a user position |
| `calc_token_amount(uint256[2] amounts, bool deposit)` | view | `uint256` | With `deposit=true`, estimates LP tokens minted, including fee |

`amounts` is ordered as `[coins(0), coins(1)]` and uses raw token units. At least one amount must be non-zero. The call pulls both non-zero amounts from the caller, reverts if no shares can be created or the result is below `min_mint_amount`, and emits `AddLiquidity`.

### Refuel overload

The four-argument `add_liquidity` overload uses immutable contract terminology:

| Parameter | Meaning |
| --- | --- |
| `amounts` | Raw amounts of `coins(0)` and `coins(1)` pulled from the caller |
| `min_mint_amount` | Minimum refuel shares that may be created |
| `receiver` | Must be the zero address when `donation=true`; no user receives the shares |
| `donation` | Set to `true` to add a refuel |

The return value is the number of refuel shares created. The call increases `totalSupply()` and `donation_shares()`, emits `Donation`, and does not increase any account's `balanceOf`. The refuel path applies its own cap, unlock, protection, and fee logic described in [Refuels](./refuels.md).

## Removing Liquidity

| Signature | Mutability | Returns | Behavior |
| --- | --- | --- | --- |
| `remove_liquidity(uint256 amount, uint256[2] min_amounts)` | nonpayable | `uint256[2]` | Proportional withdrawal to caller |
| `remove_liquidity(uint256 amount, uint256[2] min_amounts, address receiver)` | nonpayable | `uint256[2]` | Proportional withdrawal to `receiver` |
| `remove_liquidity_fixed_out(uint256 token_amount, uint256 i, uint256 amount_i, uint256 min_amount_j)` | nonpayable | `uint256` | Burns `token_amount`, withdraws exactly `amount_i` of coin `i`, and returns the coin `1-i` amount |
| `remove_liquidity_fixed_out(uint256 token_amount, uint256 i, uint256 amount_i, uint256 min_amount_j, address receiver)` | nonpayable | `uint256` | Fixed-out withdrawal to `receiver` |
| `remove_liquidity_one_coin(uint256 lp_token_amount, uint256 i, uint256 min_amount)` | nonpayable | `uint256` | Single-coin withdrawal to caller |
| `remove_liquidity_one_coin(uint256 lp_token_amount, uint256 i, uint256 min_amount, address receiver)` | nonpayable | `uint256` | Single-coin withdrawal to `receiver` |
| `calc_token_amount(uint256[2] amounts, bool deposit)` | view | `uint256` | With `deposit=false`, estimates LP tokens burned, including fee |
| `calc_withdraw_fixed_out(uint256 lp_token_amount, uint256 i, uint256 amount_i)` | view | `uint256` | Estimates coin `1-i` for a fixed-out withdrawal |
| `calc_withdraw_one_coin(uint256 lp_token_amount, uint256 i)` | view | `uint256` | Estimates single-coin output |

All minimum amounts are raw token units. Proportional withdrawal emits `RemoveLiquidity`; fixed-out withdrawal emits `RemoveLiquidityImbalance`; one-coin withdrawal emits `RemoveLiquidityOne`.

## Refuel state

| Signature | Mutability | Returns | Unit / meaning |
| --- | --- | --- | --- |
| `user_supply()` | view | `uint256` | `totalSupply() - donation_shares()` |
| `donation_shares()` | view | `uint256` | Total outstanding refuel shares |
| `donation_shares_max_ratio()` | view | `uint256` | Maximum refuel-share ratio, 1e18 precision |
| `donation_duration()` | view | `uint256` | Linear unlock duration, seconds |
| `last_donation_release_ts()` | view | `uint256` | Release-schedule timestamp |
| `donation_protection_expiry_ts()` | view | `uint256` | Active protection expiry, Unix seconds |
| `donation_protection_period()` | view | `uint256` | Protection period, seconds |
| `donation_protection_lp_threshold()` | view | `uint256` | LP threshold, 1e18 precision |

There is no public getter that separates the exact locked, unlocked, protected, and immediately burnable shares.

## Price Scaling and Oracles

| Signature | Mutability | Returns | Unit / meaning |
| --- | --- | --- | --- |
| `price_scale()` | view | `uint256` | Internal center price of coin 1 in coin 0, 1e18 |
| `price_oracle()` | view | `uint256` | EMA target price of coin 1 in coin 0, 1e18 |
| `last_prices()` | view | `uint256` | Last observed normalized price, 1e18 |
| `last_timestamp()` | view | `uint256` | Last oracle timestamp, Unix seconds |
| `lp_price()` | view | `uint256` | LP-token price estimate, 1e18 |
| `get_virtual_price()` | view | `uint256` | Current virtual-price calculation, 1e18 |
| `virtual_price()` | view | `uint256` | Cached internal virtual price, 1e18 |
| `ma_time()` | view | `uint256` | Approximate EMA half-life, seconds |

All three price getters express the price of `coins(1)` in `coins(0)` with 1e18 precision. Read [FXSwap Oracles](./oracles.md) for update behavior, recentering, and manipulation boundaries.

## Fees and Profits

| Signature | Mutability | Returns | Unit / meaning |
| --- | --- | --- | --- |
| `fee()` | view | `uint256` | Current dynamic fee, 1e10 |
| `mid_fee()` | view | `uint256` | Lower dynamic-fee bound, 1e10 |
| `out_fee()` | view | `uint256` | Upper dynamic-fee bound, 1e10 |
| `fee_gamma()` | view | `uint256` | Fee-transition parameter, 1e18 |
| `admin_fee()` | view | `uint256` | Share of profit assigned to admin, 1e10 |
| `fee_calc(uint256[2] xp)` | view | `uint256` | Dynamic fee for normalized balances, 1e10 |
| `calc_token_fee(uint256[2] amounts, uint256[2] xp)` | view | `uint256` | Liquidity fee calculation |
| `calc_token_fee(uint256[2] amounts, uint256[2] xp, bool donation)` | view | `uint256` | Liquidity fee with explicit refuel flag |
| `calc_token_fee(uint256[2] amounts, uint256[2] xp, bool donation, bool deposit)` | view | `uint256` | Liquidity fee with explicit refuel and deposit flags |
| `xcp_profit()` | view | `uint256` | Current profit-accounting value, 1e18 |
| `xcp_profit_a()` | view | `uint256` | Profit value at the prior admin claim, 1e18 |

`xp` is the two-coin normalized balance vector, not the raw balances. For parameter interactions, see [Mechanism and Parameter Design](./mechanism.md).

## Parameters

| Signature | Mutability | Returns | Unit / meaning |
| --- | --- | --- | --- |
| `A()` | view | `uint256` | Amplification parameter in contract precision |
| `gamma()` | view | `uint256` | Compatibility value; unused by the FXSwap invariant |
| `precisions()` | view | `uint256[2]` | Token precision multipliers |
| `allowed_extra_profit()` | view | `uint256` | Recentring profit buffer, 1e18 |
| `adjustment_step()` | view | `uint256` | Minimum recentering step, 1e18 |
| `ma_time()` | view | `uint256` | Approximate EMA half-life, seconds |

## LP Token Methods

The pool is its own 18-decimal ERC-20 LP token:

| Signature | Mutability | Returns |
| --- | --- | --- |
| `name()` | view | `string` |
| `symbol()` | view | `string` |
| `decimals()` | view | `uint8` |
| `version()` | view | `string` |
| `totalSupply()` | view | `uint256` |
| `balanceOf(address owner)` | view | `uint256` |
| `allowance(address owner, address spender)` | view | `uint256` |
| `approve(address spender, uint256 value)` | nonpayable | `bool` |
| `transfer(address to, uint256 value)` | nonpayable | `bool` |
| `transferFrom(address from, address to, uint256 value)` | nonpayable | `bool` |

`totalSupply()` includes refuel shares. Use `user_supply()` when an application needs the user-owned LP supply.

## Contract Info

| Signature | Mutability | Returns | Meaning |
| --- | --- | --- | --- |
| `coins(uint256 i)` | view | `address` | Token address at index `i` |
| `balances(uint256 i)` | view | `uint256` | Internally accounted raw token balance |
| `factory()` | view | `address` | Factory and admin source |
| `admin()` | view | `address` | Admin read through the factory |
| `fee_receiver()` | view | `address` | Fee receiver read through the factory |
| `MATH()` | view | `address` | Current Math contract |
| `VIEW()` | view | `address` | Current Views contract |
| `D()` | view | `uint256` | Cached invariant |
| `initial_A_gamma()` | view | `uint256` | Packed ramp start |
| `future_A_gamma()` | view | `uint256` | Packed ramp target |
| `initial_A_gamma_time()` | view | `uint256` | Ramp start timestamp |
| `future_A_gamma_time()` | view | `uint256` | Ramp end timestamp |
| `packed_fee_params()` | view | `uint256` | Packed dynamic-fee configuration |
| `packed_rebalancing_params()` | view | `uint256` | Packed recentering configuration |

Prefer decoded getters such as `mid_fee()`, `out_fee()`, `fee_gamma()`, `allowed_extra_profit()`, `adjustment_step()`, and `ma_time()` instead of unpacking values in application code.

## Admin controls

Every method below is nonpayable and checks the factory-provided admin:

| Signature | Guard / effect |
| --- | --- |
| `ramp_A_gamma(uint256 future_A, uint256 future_gamma, uint256 future_time)` | Starts a bounded ramp lasting at least the contract minimum |
| `stop_ramp_A_gamma()` | Stops an active ramp at current values |
| `apply_new_parameters(uint256 mid_fee, uint256 out_fee, uint256 fee_gamma, uint256 allowed_extra_profit, uint256 adjustment_step, uint256 ma_exp_time)` | Updates validated fee and recentering parameters; the last argument is the internal EMA exponent denominator, approximately `half_life / ln(2)` |
| `set_donation_duration(uint256 duration)` | Requires `duration > 0`; emits `SetDonationDuration` |
| `set_donation_protection_params(uint256 period, uint256 threshold, uint256 max_shares_ratio)` | Requires positive values; ratios use 1e18 precision; emits `SetDonationProtection` |
| `set_admin_fee(uint256 admin_fee)` | Requires a value at or below the contract maximum; 1e10 precision; emits `SetAdminFee` |
| `set_periphery(address views, address math)` | Updates either or both periphery addresses; at least one must be non-zero; emits `SetPeriphery` |

`apply_new_parameters` uses compatibility-preserving sentinel behavior: out-of-range values for an individual field retain that field's current value, while combinations such as `mid_fee > out_fee` still revert. Read the emitted `NewParameters` event or decoded getters after the transaction instead of assuming every requested value was applied. `NewParameters.ma_time` is the internal exponent parameter; `ma_time()` returns its approximate half-life in seconds.

:::warning[Version boundary]

`set_donation_parameters`, `POLICY`, allowlist methods, and `reserved_profit_fraction` occur in a later development design. They are not part of deployed `v2.1.0d` and are intentionally absent from this reference.

:::

## Events

```solidity
event TokenExchange(
    address indexed buyer,
    uint256 sold_id,
    uint256 tokens_sold,
    uint256 bought_id,
    uint256 tokens_bought,
    uint256 fee,
    uint256 price_scale
);
event AddLiquidity(
    address indexed provider,
    address indexed receiver,
    uint256[2] token_amounts,
    uint256 fee,
    uint256 token_supply,
    uint256 price_scale
);
event Donation(address indexed donor, uint256[2] token_amounts);
event RemoveLiquidity(address indexed provider, uint256[2] token_amounts, uint256 token_supply);
event RemoveLiquidityOne(
    address indexed provider,
    uint256 token_amount,
    uint256 coin_index,
    uint256 coin_amount,
    uint256 approx_fee,
    uint256 packed_price_scale
);
event RemoveLiquidityImbalance(
    address indexed provider,
    uint256 lp_token_amount,
    uint256[2] token_amounts,
    uint256 approx_fee,
    uint256 price_scale
);
event NewParameters(
    uint256 mid_fee,
    uint256 out_fee,
    uint256 fee_gamma,
    uint256 allowed_extra_profit,
    uint256 adjustment_step,
    uint256 ma_time
);
event RampAgamma(
    uint256 initial_A,
    uint256 future_A,
    uint256 initial_gamma,
    uint256 future_gamma,
    uint256 initial_time,
    uint256 future_time
);
event StopRampA(uint256 current_A, uint256 current_gamma, uint256 time);
event ClaimAdminFee(address indexed admin, uint256[2] tokens);
event SetDonationDuration(uint256 duration);
event SetDonationProtection(
    uint256 donation_protection_period,
    uint256 donation_protection_lp_threshold,
    uint256 donation_shares_max_ratio
);
event SetAdminFee(uint256 admin_fee);
event SetPeriphery(address views, address math);
event Transfer(address indexed sender, address indexed receiver, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

`Donation` is the immutable deployed event name for a refuel. Its token amounts and all swap/liquidity event amounts are raw token units. Decode events by pool address and versioned ABI.
