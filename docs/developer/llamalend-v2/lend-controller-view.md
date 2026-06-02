# LendControllerView

The `LendControllerView` is a **stateless view helper** contract that the [LendController](./lend-controller.md) delegates read-only computations to. It extends the base `ControllerView` module with lending-specific logic — primarily making `max_borrowable` and `tokens_to_shrink` aware of **borrow caps** and **available balance**.

Each lending market deploys its own `LendControllerView` instance alongside the controller.

:::vyper[`LendControllerView.vy`]

The source code for the `LendControllerView.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendControllerView.vy). The base view module is [`ControllerView.vy`](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/ControllerView.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::


---


## Lending-Specific Views

These functions override the base `ControllerView` to account for borrow caps and available liquidity.

### `max_borrowable`

::::description[`LendControllerView.max_borrowable(_d_collateral: uint256, _N: uint256, _user: address) -> uint256: view`]

Returns the maximum amount that can be borrowed for a given collateral and band count. Unlike the base implementation, this caps the result by the **borrow cap** and **available balance** in the vault.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | Borrower address (for existing loan context) |

Returns: max borrowable amount, capped by market limits (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `tokens_to_shrink`

::::description[`LendControllerView.tokens_to_shrink(_user: address, _d_collateral: uint256) -> uint256: view`]

Returns the amount of debt tokens needed to "shrink" a user's position by the given collateral amount. Accounts for lending market constraints.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_collateral` | `uint256` | Collateral to remove |

Returns: tokens needed (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Health Previews

These functions are exported from the base `ControllerView` module and compute health predictions for various operations.

### `create_loan_health_preview`

::::description[`LendControllerView.create_loan_health_preview(_user: address, _collateral: uint256, _debt: uint256, _N: uint256, _full: bool) -> int256: view`]

Previews the health that would result from creating a loan with the given parameters.

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

::::description[`LendControllerView.borrow_more_health_preview(_user: address, _d_collateral: uint256, _d_debt: uint256, _full: bool) -> int256: view`]

Previews health after borrowing more.

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

::::description[`LendControllerView.add_collateral_health_preview(_user: address, _d_collateral: uint256, _full: bool) -> int256: view`]

Previews health after adding collateral.

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

::::description[`LendControllerView.remove_collateral_health_preview(_user: address, _d_collateral: uint256, _full: bool) -> int256: view`]

Previews health after removing collateral.

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

::::description[`LendControllerView.repay_health_preview(_user: address, _d_debt: uint256, _full: bool) -> int256: view`]

Previews health after repaying debt.

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

::::description[`LendControllerView.liquidate_health_preview(_user: address, _full: bool) -> int256: view`]

Previews health after liquidation.

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


## Position Info

### `user_state`

::::description[`LendControllerView.user_state(_user: address) -> uint256[4]: view`]

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

::::description[`LendControllerView.user_prices(_user: address) -> uint256[2]: view`]

Returns the upper and lower price bounds of a user's collateral bands.

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

::::description[`LendControllerView.users_to_liquidate(_from: uint256, _limit: uint256) -> IController.Position[]: view`]

Returns a paginated list of liquidatable positions.

| Input | Type | Description |
| --- | --- | --- |
| `_from` | `uint256` | Starting index |
| `_limit` | `uint256` | Maximum positions to return |

Returns: array of liquidatable positions (`IController.Position[]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `min_collateral`

::::description[`LendControllerView.min_collateral(_d_debt: uint256, _N: uint256) -> uint256: view`]

Returns the minimum collateral required for a given debt amount and number of bands.

| Input | Type | Description |
| --- | --- | --- |
| `_d_debt` | `uint256` | Desired debt |
| `_N` | `uint256` | Number of bands |

Returns: minimum collateral (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `calculate_debt_n1`

::::description[`LendControllerView.calculate_debt_n1(_collateral: uint256, _debt: uint256, _N: uint256) -> int256: view`]

Calculates the upper band number for a loan with the given parameters.

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
