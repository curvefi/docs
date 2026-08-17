---
title: FXSwap Views Contract
sidebar_label: Views
---

# Views Contract

The FXSwap Views contract supplies quote and liquidity-calculation methods used by the pool. These methods are useful for offchain search, routing, and simulation, but some are too expensive to call repeatedly from another contract.

:::deploy[Contract Source & Deployment]

The deployed FXSwap pool returns its Views address from `VIEW()`. The verified source is closest to [`TwocryptoView.vy` at commit `387fbe5`](https://github.com/curvefi/twocrypto-ng/blob/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d/contracts/main/TwocryptoView.vy), compiled with Vyper `0.4.3`.

Read `VIEW()` from the target pool instead of hardcoding a periphery address. The pool's own quote methods forward to its configured Views contract.

:::

All coin and token amounts are raw token units. `i` and `j` are pool coin indices and must be `0` or `1`.

## Exchange Methods

### `get_dy`

::::description[`Views.get_dy(i: uint256, j: uint256, dx: uint256, swap: address) -> uint256: view`]

Returns the amount of `coins(j)` expected for an exact input of `dx` raw units of `coins(i)`, including the dynamic swap fee.

| Input | Description |
| --- | --- |
| `i` | Input coin index |
| `j` | Output coin index; must differ from `i` |
| `dx` | Positive input amount in raw `coins(i)` units |
| `swap` | FXSwap pool address |

The call reverts for equal or out-of-range indices or a zero input. For ordinary quoting, prefer `pool.get_dy(i, j, dx)`, which routes through the pool's current `VIEW()` address.

::::

### `get_dx`

::::description[`Views.get_dx(i: uint256, j: uint256, dy: uint256, swap: address, n_iter: uint256 = 5) -> uint256: view`]

Estimates the raw `coins(i)` input required to receive `dy` raw units of `coins(j)`, including fees. The calculation iteratively adds the estimated output fee and is not an exact-output execution method.

`n_iter` defaults to `5` and is bounded by the contract at `100`. More iterations cost more gas and do not turn the result into an execution guarantee. The call reverts for equal or out-of-range indices or zero `dy`.

Prefer `pool.get_dx(i, j, dy)` for the default iteration count. Apply an input buffer, simulate the final transaction, and execute through an exact-input swap with a protected `min_dy`.

::::

### `calc_fee_get_dy`

::::description[`Views.calc_fee_get_dy(i: uint256, j: uint256, dx: uint256, swap: address) -> uint256: view`]

Returns the fee component, denominated in raw `coins(j)` units, for the exact-input quote described by `get_dy`. It uses the same index and positive-input guards.

This is an analytical helper. Swap execution emits the realized fee in `TokenExchange`.

::::

## Liquidity Methods

### `calc_token_amount`

::::description[`Views.calc_token_amount(amounts: uint256[2], deposit: bool, swap: address, donation: bool = False) -> uint256: view`]

Estimates LP tokens minted for a deposit or burned for a withdrawal, including the applicable liquidity fee.

| Input | Description |
| --- | --- |
| `amounts` | Raw amounts ordered as `[coins(0), coins(1)]` |
| `deposit` | `true` for adding liquidity; `false` for removing liquidity |
| `swap` | FXSwap pool address |
| `donation` | Immutable ABI name; set `true` only when estimating a refuel |

For user liquidity, prefer `pool.calc_token_amount(amounts, deposit)`. Call the Views contract directly only when the refuel flag or a separate fee breakdown is required.

::::

### `calc_withdraw_one_coin`

::::description[`Views.calc_withdraw_one_coin(token_amount: uint256, i: uint256, swap: address) -> uint256: view`]

Returns the estimated raw amount of `coins(i)` received for burning `token_amount` LP units in a one-coin withdrawal, after the approximate fee.

The call requires `i < 2` and `token_amount <= pool.totalSupply()`. Prefer `pool.calc_withdraw_one_coin(token_amount, i)` for normal integrations.

::::

### `calc_fee_withdraw_one_coin`

::::description[`Views.calc_fee_withdraw_one_coin(token_amount: uint256, i: uint256, swap: address) -> uint256: view`]

Returns the approximate fee component for the same one-coin withdrawal. The value is denominated in raw `coins(i)` units and uses the same guards as `calc_withdraw_one_coin`.

::::

### `calc_fee_token_amount`

::::description[`Views.calc_fee_token_amount(amounts: uint256[2], deposit: bool, swap: address, donation: bool = False) -> uint256: view`]

Returns the liquidity-fee component expressed in LP-token units for a deposit or withdrawal quote. `donation=true` selects the immutable contract path used to estimate a refuel.

::::

## Integration guidance

- Read `VIEW()` from each allowlisted pool and version the pool and periphery together.
- Prefer the pool-native wrappers for `get_dy`, `get_dx`, `calc_token_amount`, and `calc_withdraw_one_coin`.
- Use direct Views calls for fee breakdowns or the refuel-specific `donation` flag.
- Batch offchain calls at one block number so balances, parameters, prices, and supply are consistent.
- Simulate state-changing calldata immediately before submission; a view quote does not reserve pool state.
