---
title: Building on FXSwap
sidebar_label: Building on FXSwap
---

# Building on FXSwap

Protocols can compose FXSwap swaps and LP positions into vaults, strategies, collateral systems, and other financial applications. Safe composition requires separating user-owned LP supply from refuel accounting, valuing positions against executable withdrawals, and treating pool price getters as AMM state rather than automatically safe lending oracles.

Start with the [swap integration guide](./integration.md) if the protocol only executes trades. This page is for applications that hold LP tokens, consume pool state, or build accounting around FXSwap.

## Identify the deployment first

Before accepting an LP token or reading pool state:

1. Confirm the pool is registered and is on the protocol's versioned allowlist.
2. Read `version()`, `coins(0)`, `coins(1)`, and both coin decimals.
3. Record the pool, factory, `VIEW()`, and `MATH()` addresses.
4. Verify that the integration supports that exact deployed interface.

The reviewed Ethereum pools report `v2.1.0d`. Do not assume another pool is compatible because it shares the Twocrypto factory or exposes a similar ABI.

## LP-token and supply accounting

The pool contract is also its own ERC-20 LP token:

- `decimals()` returns `18`;
- `balanceOf(account)` is the account's withdrawable LP balance;
- `totalSupply()` includes user LP tokens **and outstanding refuel shares**;
- `donation_shares()` is the outstanding refuel-share supply;
- `user_supply()` returns `totalSupply() - donation_shares()`.

Refuel shares have no owner account and cannot be transferred or withdrawn. They can be burned when the pool recenters. A protocol must not treat `totalSupply()` as entirely user-owned supply when calculating ownership percentages, rewards, or market capitalization.

Use `user_supply()` when a denominator specifically means the LP tokens held by user accounts, such as distributing a user-only incentive. It is not an unconditional claim on a fixed fraction of each raw pool balance. Pool withdrawals use the deployed pool's accounting and can be affected by fees, imbalance, state changes, refuel shares, and the selected withdrawal method.

## Deposits and withdrawals

Use the pool's quote methods before building transaction bounds:

| Task | Quote method | Execution method |
| --- | --- | --- |
| Add two-sided or one-sided liquidity | `calc_token_amount(amounts, true)` | `add_liquidity` |
| Proportional withdrawal | Compute the pro-rata starting point and simulate | `remove_liquidity` |
| Single-coin withdrawal | `calc_withdraw_one_coin(lpAmount, i)` | `remove_liquidity_one_coin` |
| Fixed-out withdrawal | `calc_withdraw_fixed_out(lpAmount, i, amountI)` | `remove_liquidity_fixed_out` |

Quotes are state-sensitive. Simulate the exact receiver and calldata, set non-zero minimum amounts, and apply a deadline in the calling contract. Test fee-on-transfer, rebasing, callback-capable, or otherwise unusual tokens explicitly before supporting them.

## Value LP positions by realizable outcomes

`lp_price()` and `get_virtual_price()` are useful pool accounting signals, but neither is a universal mark-to-market price for every integration:

- `lp_price()` is a 1e18 LP-price estimate using pool state;
- `get_virtual_price()` calculates the current 1e18 virtual price;
- `virtual_price()` exposes the cached internal value;
- withdrawal quotes incorporate the selected exit path and current imbalance.

For user-facing valuations, state the block number, external coin prices, token decimals, and valuation method. For solvency or risk decisions, stress executable withdrawal values across imbalance, price movement, fee changes, and refuel depletion instead of multiplying LP balance by a single getter.

## Pool balances are accounted balances

`balances(i)` returns the pool's internally accounted raw balance for coin `i`. It is not interchangeable with `IERC20(coins(i)).balanceOf(pool)`.

Direct token transfers, pending pre-transfer flows, and other accounting paths can make the ERC-20 balance differ from the pool's stored balance. Use `balances(i)` for invariant and pool-state interpretation. Use the ERC-20 balance only when the integration specifically needs custody reconciliation, and explain any difference rather than silently treating it as available liquidity.

## Fees, imbalance, and refuel depletion

FXSwap charges a dynamic fee between `mid_fee()` and `out_fee()`, both at 1e10 precision. The realized fee depends on normalized balances and `fee_gamma()`. Deposits and withdrawals have their own fee paths, so a balanced-looking notional position does not imply a fee-free exit.

Refuel shares increase `totalSupply()` but are not user positions. When available refuel shares burn during recentering, both `donation_shares()` and `totalSupply()` decrease while account `balanceOf` values remain unchanged. Applications that snapshot supply, calculate rewards, or reconcile share price must handle this state transition.

## Oracle getters are AMM state

| Getter | Meaning | Safe-use boundary |
| --- | --- | --- |
| `last_prices()` | Latest normalized observed pool price | The deployed source explicitly describes it as unsafe and manipulable |
| `price_oracle()` | Exponential moving average of prior observed prices | Useful for understanding pool recentering; not automatically a manipulation-resistant lending price |
| `price_scale()` | Center of concentrated liquidity | A pool parameter/state value, not an external market oracle |

An application may use these values to monitor the pool or reproduce its logic. A lending, liquidation, minting, or solvency system should not adopt them without an independent oracle-security analysis covering manipulation cost, update timing, liquidity, stale states, external reference markets, and failure behavior.

## What to monitor

Protocols holding or wrapping FXSwap LP tokens should monitor:

- supported `version()`, pool code, factory, `VIEW()`, and `MATH()`;
- coin addresses, decimals, redemption behavior, and token incidents;
- account LP balance, `user_supply()`, `totalSupply()`, and `donation_shares()`;
- `balances`, withdrawal quotes, virtual-price signals, and external coin values;
- `last_prices`, `price_oracle`, and `price_scale`;
- dynamic-fee and recentering parameters;
- refuel unlock, protection, and depletion state;
- admin parameter and periphery events.

Re-evaluate risk assumptions after a parameter change, prolonged imbalance, depleted refuel budget, external-market disruption, or token-behavior change.

## Safe composition checklist

- Allowlist exact pool implementations and reject unknown versions.
- Use `user_supply()` where the calculation means user-owned LP supply.
- Never assign ownership or withdrawal rights to refuel shares.
- Quote and simulate deposits, swaps, and each supported withdrawal path.
- Value positions with explicit external prices and executable exit assumptions.
- Use stored pool balances for pool accounting; reconcile ERC-20 balances separately.
- Treat pool oracle getters as AMM state unless a separate oracle review proves suitability.
- Test every deployment's tokens, parameters, liquidity, and monitoring thresholds independently.

See [Mechanism & Parameters](../pools/mechanism.md) for recentering behavior, [Oracles](../pools/oracles.md) for price-state boundaries, and the [FXSwap Pool](../pools/fxswap.md) for exact signatures, units, and events.
