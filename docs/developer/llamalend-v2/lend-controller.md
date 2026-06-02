# LendController

The `LendController` is the **primary user-facing contract** for each lending market. Borrowers interact with it to create loans, manage collateral, borrow more, repay, and get liquidated. It wraps the core `controller.vy` module — which contains all shared loan logic — and extends it with lending-specific features: **borrow caps**, **vault token transfers**, and **available balance tracking**.

Each lending market gets its own `LendController` instance, deployed by the [LendFactory](./lend-factory.md).

:::vyper[`LendController.vy`]

The source code for the `LendController.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendController.vy). The core module is [`controller.vy`](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/controller.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

:::info

The `LendController` exports most of its functions from the `controller.vy` module. Functions documented below include both module-exported functions and lending-specific extensions. The module pattern means the core loan logic is shared with `MintController` (used for crvUSD mint markets).

:::


---


## Loan Management

### `create_loan`

::::description[`LendController.create_loan(_collateral: uint256, _debt: uint256, _N: uint256)`]

Creates a new loan by depositing collateral and borrowing tokens. The collateral is distributed across `_N` bands in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Amount of collateral to deposit |
| `_debt` | `uint256` | Amount of borrowed tokens to receive |
| `_N` | `uint256` | Number of bands to distribute collateral across (4–50) |

Emits: `Borrow` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `borrow_more`

::::description[`LendController.borrow_more(_d_collateral: uint256, _d_debt: uint256)`]

Adds additional collateral and/or borrows more tokens against an existing loan.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Additional collateral to deposit (can be 0) |
| `_d_debt` | `uint256` | Additional debt to take on (can be 0) |

Emits: `Borrow` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `add_collateral`

::::description[`LendController.add_collateral(_d_collateral: uint256, _for: address)`]

Adds collateral to an existing loan without borrowing more. Can be called by anyone on behalf of a borrower.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Amount of collateral to add |
| `_for` | `address` | Address of the borrower to add collateral for |

Emits: `Borrow` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `remove_collateral`

::::description[`LendController.remove_collateral(_d_collateral: uint256)`]

Removes collateral from an existing loan. Reverts if the resulting health would be too low.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Amount of collateral to remove |

Emits: `RemoveCollateral` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `repay`

::::description[`LendController.repay(_d_debt: uint256, _for: address)`]

Repays debt for a loan. If `_d_debt` exceeds the current debt, only the outstanding debt is repaid. Can be called by anyone on behalf of a borrower.

| Input | Type | Description |
| --- | --- | --- |
| `_d_debt` | `uint256` | Amount of debt to repay (use `max_value(uint256)` to repay all) |
| `_for` | `address` | Address of the borrower to repay for |

Emits: `Repay` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `liquidate`

::::description[`LendController.liquidate(_user: address, _min_x: uint256)`]

Liquidates an unhealthy loan (health < 0). The caller repays the debt and receives the remaining collateral. Supports partial liquidation if the position is partially in soft liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Address of the borrower to liquidate |
| `_min_x` | `uint256` | Minimum amount of collateral to receive (slippage protection) |

Emits: `Liquidate` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Loan Info

### `debt`

::::description[`LendController.debt(_user: address) -> uint256: view`]

Returns the current debt of a user, including accrued interest.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: current debt (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `health`

::::description[`LendController.health(_user: address, _full: bool) -> int256: view`]

Returns the health of a user's loan. Health > 0 means the loan is safe; health < 0 means it can be liquidated. If `_full` is true, returns health assuming the worst-case scenario where all collateral has been soft-liquidated.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_full` | `bool` | If true, use full (pessimistic) health calculation |

Returns: health value (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `loan_exists`

::::description[`LendController.loan_exists(_user: address) -> bool: view`]

Returns whether a loan exists for the given user.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: whether the loan exists (`bool`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `user_state`

::::description[`LendController.user_state(_user: address) -> uint256[4]: view`]

Returns the full state of a user's loan: `[collateral, stablecoin, debt, N]`.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: `[collateral, stablecoin, debt, N]` (`uint256[4]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `user_prices`

::::description[`LendController.user_prices(_user: address) -> uint256[2]: view`]

Returns the upper and lower price bounds of a user's collateral bands in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: `[price_upper, price_lower]` (`uint256[2]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `users_to_liquidate`

::::description[`LendController.users_to_liquidate(_from: uint256, _limit: uint256) -> IController.Position[]: view`]

Returns a list of user positions that can be liquidated, paginated.

| Input | Type | Description |
| --- | --- | --- |
| `_from` | `uint256` | Starting index |
| `_limit` | `uint256` | Maximum number of positions to return |

Returns: array of liquidatable positions (`IController.Position[]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `tokens_to_liquidate`

::::description[`LendController.tokens_to_liquidate(_user: address) -> uint256: view`]

Returns the amount of borrowed tokens needed to fully liquidate a user's position.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: tokens needed for liquidation (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `total_debt`

::::description[`LendController.total_debt() -> uint256: view`]

Returns the total outstanding debt across all loans in this market, including accrued interest.

Returns: total debt (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `n_loans`

::::description[`LendController.n_loans() -> uint256: view`]

Returns the total number of active loans.

Returns: number of loans (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `loans`

::::description[`LendController.loans(_index: uint256) -> address: view`]

Returns the borrower address at a given loan index.

| Input | Type | Description |
| --- | --- | --- |
| `_index` | `uint256` | Loan index |

Returns: borrower address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `loan_ix`

::::description[`LendController.loan_ix(_user: address) -> uint256: view`]

Returns the index of a user's loan in the loans array.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: loan index (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Health Previews

These functions allow UIs to show the health impact of operations before the user submits a transaction.

### `create_loan_health_preview`

::::description[`LendController.create_loan_health_preview(_user: address, _collateral: uint256, _debt: uint256, _N: uint256, _full: bool) -> int256: view`]

Previews the health of a loan that would result from calling `create_loan`.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_collateral` | `uint256` | Collateral amount |
| `_debt` | `uint256` | Debt amount |
| `_N` | `uint256` | Number of bands |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `borrow_more_health_preview`

::::description[`LendController.borrow_more_health_preview(_user: address, _d_collateral: uint256, _d_debt: uint256, _full: bool) -> int256: view`]

Previews the health after borrowing more.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_collateral` | `uint256` | Additional collateral |
| `_d_debt` | `uint256` | Additional debt |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `add_collateral_health_preview`

::::description[`LendController.add_collateral_health_preview(_user: address, _d_collateral: uint256, _full: bool) -> int256: view`]

Previews the health after adding collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_collateral` | `uint256` | Collateral to add |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `remove_collateral_health_preview`

::::description[`LendController.remove_collateral_health_preview(_user: address, _d_collateral: uint256, _full: bool) -> int256: view`]

Previews the health after removing collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_collateral` | `uint256` | Collateral to remove |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `repay_health_preview`

::::description[`LendController.repay_health_preview(_user: address, _d_debt: uint256, _full: bool) -> int256: view`]

Previews the health after repaying debt.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_debt` | `uint256` | Debt to repay |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `liquidate_health_preview`

::::description[`LendController.liquidate_health_preview(_user: address, _full: bool) -> int256: view`]

Previews what a user's health would be after liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Lending-Specific

These functions are unique to `LendController` and not part of the shared `controller.vy` module.

### `available_balance`

::::description[`LendController.available_balance() -> uint256: view`]

Returns the amount of borrowed tokens currently available for new loans — i.e., the tokens deposited by lenders minus what's already lent out.

Returns: available balance (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `borrow_cap`

::::description[`LendController.borrow_cap() -> uint256: view`]

Returns the maximum total debt allowed for this market. If 0, there is no cap.

Returns: borrow cap (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `vault`

::::description[`LendController.vault() -> address: view`]

Returns the address of the associated ERC4626 vault.

Returns: vault address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_borrow_cap`

::::description[`LendController.set_borrow_cap(_borrow_cap: uint256)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the maximum total debt cap for this market.

| Input | Type | Description |
| --- | --- | --- |
| `_borrow_cap` | `uint256` | New borrow cap (0 = unlimited) |

Emits: `SetBorrowCap` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_admin_percentage`

::::description[`LendController.set_admin_percentage(_admin_percentage: uint256)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the percentage of interest that goes to the protocol (admin fees) rather than lenders.

| Input | Type | Description |
| --- | --- | --- |
| `_admin_percentage` | `uint256` | Admin fee percentage (scaled, max 50%) |

Emits: `SetAdminPercentage` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Calculations

### `max_borrowable`

::::description[`LendController.max_borrowable(_d_collateral: uint256, _N: uint256, _user: address) -> uint256: view`]

Returns the maximum amount that can be borrowed given a collateral amount and number of bands, respecting the borrow cap and available balance.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | Borrower address (for existing loan context) |

Returns: max borrowable amount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `min_collateral`

::::description[`LendController.min_collateral(_d_debt: uint256, _N: uint256) -> uint256: view`]

Returns the minimum collateral required for a given debt amount and number of bands.

| Input | Type | Description |
| --- | --- | --- |
| `_d_debt` | `uint256` | Desired debt amount |
| `_N` | `uint256` | Number of bands |

Returns: minimum collateral required (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `calculate_debt_n1`

::::description[`LendController.calculate_debt_n1(_collateral: uint256, _debt: uint256, _N: uint256) -> int256: view`]

Calculates the upper band number (`n1`) for a loan with the given parameters. Used to determine where collateral will be placed in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral amount |
| `_debt` | `uint256` | Debt amount |
| `_N` | `uint256` | Number of bands |

Returns: upper band number (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Configuration

### `set_amm_fee`

::::description[`LendController.set_amm_fee(_fee: uint256)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the swap fee on the associated AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_fee` | `uint256` | New fee value |

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_borrowing_discounts`

::::description[`LendController.set_borrowing_discounts(_loan_discount: uint256, _liquidation_discount: uint256)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the loan discount and liquidation discount. The loan discount determines the maximum LTV, and the liquidation discount determines the threshold for liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_loan_discount` | `uint256` | New loan discount |
| `_liquidation_discount` | `uint256` | New liquidation discount |

Emits: `SetBorrowingDiscounts` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_monetary_policy`

::::description[`LendController.set_monetary_policy(_monetary_policy: address)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the monetary policy contract that determines the borrow rate.

| Input | Type | Description |
| --- | --- | --- |
| `_monetary_policy` | `address` | New monetary policy address |

Emits: `SetMonetaryPolicy` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_price_oracle`

::::description[`LendController.set_price_oracle(_price_oracle: address)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the price oracle for this market.

| Input | Type | Description |
| --- | --- | --- |
| `_price_oracle` | `address` | New price oracle address |

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_callback`

::::description[`LendController.set_callback(_callback: address)`]

:::guard[Guarded Method]
This function is only callable by the factory admin.
:::

Sets the liquidity mining callback (gauge) for the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_callback` | `address` | Liquidity mining callback address |

Emits: `SetLMCallback` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Other Methods

### `amm`

::::description[`LendController.amm() -> address: view`]

Returns the AMM (LLAMMA) address for this market.

Returns: AMM address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `amm_price`

::::description[`LendController.amm_price() -> uint256: view`]

Returns the current price from the AMM's internal oracle.

Returns: AMM price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `monetary_policy`

::::description[`LendController.monetary_policy() -> address: view`]

Returns the current monetary policy address.

Returns: monetary policy address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `liquidation_discount`

::::description[`LendController.liquidation_discount() -> uint256: view`]

Returns the current liquidation discount.

Returns: liquidation discount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `loan_discount`

::::description[`LendController.loan_discount() -> uint256: view`]

Returns the current loan discount.

Returns: loan discount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `admin_fees`

::::description[`LendController.admin_fees() -> uint256: view`]

Returns the amount of uncollected admin fees.

Returns: admin fees (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `admin_percentage`

::::description[`LendController.admin_percentage() -> uint256: view`]

Returns the current admin fee percentage.

Returns: admin percentage (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `collect_fees`

::::description[`LendController.collect_fees()`]

Collects accumulated admin fees and sends them to the fee receiver set in the factory.

Emits: `CollectFees` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `save_rate`

::::description[`LendController.save_rate()`]

Updates the stored interest rate from the monetary policy. This is called automatically during loan operations but can also be called externally to keep the rate fresh.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `version`

::::description[`LendController.version() -> String[10]: view`]

Returns the contract version string (e.g., `"2.0.0-lend"`).

Returns: version string (`String[10]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `factory`

::::description[`LendController.factory() -> address: view`]

Returns the factory that deployed this controller.

Returns: factory address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::
