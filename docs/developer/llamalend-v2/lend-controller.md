# LendController

The `LendController` is the **primary user-facing contract** for each lending market. Borrowers interact with it to create loans, manage collateral, borrow more, repay, and get liquidated. It wraps the core `controller.vy` module — which contains all shared loan logic — and extends it with lending-specific features: **borrow caps**, **vault token transfers**, and **available balance tracking**.

Each lending market gets its own `LendController` instance, deployed by the [LendFactory](./lend-factory.md).

:::vyper[`LendController.vy`]

The source code for the `LendController.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendController.vy). The core module is [`controller.vy`](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/controller.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

Examples use Ethers v6 with an ABI generated from the pinned source linked in each panel. Replace every zero address and amount placeholder. Read-only calls use the verified Ethereum v2 reference market; execute a write only on a fork first.

:::info

The `LendController` exports most of its functions from the `controller.vy` module. Functions documented below include both module-exported functions and lending-specific extensions. The module pattern means the core loan logic is shared with `MintController` (used for crvUSD mint markets).

:::


---


## Loan Management

### `create_loan`

::::description[`LendController.create_loan(_collateral: uint256, _debt: uint256, _N: uint256, _for: address = msg.sender, _callbacker: address = empty(address), _calldata: Bytes[CALLDATA_MAX_SIZE] = b"")`]

Creates a new loan by depositing collateral and borrowing tokens. The collateral is distributed across `_N` bands in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Amount of collateral to deposit |
| `_debt` | `uint256` | Amount of borrowed tokens to receive |
| `_N` | `uint256` | Number of bands to distribute collateral across (4–50) |
| `_for` | `address` | Address that owns the new loan |
| `_callbacker` | `address` | Optional callback contract for leveraged operations |
| `_calldata` | `Bytes[CALLDATA_MAX_SIZE]` | Data passed to the callback contract |

Emits: `Borrow` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def create_loan(
    _collateral: uint256,
    _debt: uint256,
    _N: uint256,
    _for: address = msg.sender,
    _callbacker: address = empty(address),
    _calldata: Bytes[CALLDATA_MAX_SIZE] = b"",
):
    """
    @notice Create loan but pass borrowed tokens to a callback first so that it can build leverage
    @param _collateral Amount of collateral to use
    @param _debt Borrowed asset debt to take
    @param _N Number of bands to deposit into (to do autoliquidation-deliquidation),
           can be from MIN_TICKS to MAX_TICKS
    @param _for Address to create the loan for
    @param _callbacker Address of the callback contract
    @param _calldata Any data for callbacker
    """
    assert self._has_approval(_for)

    more_collateral: uint256 = 0
    if _callbacker != empty(address):
        tkn.transfer(BORROWED_TOKEN, _callbacker, _debt)
        # If there is any unused debt, callbacker can send it to the user
        cb: IController.CallbackData = self._execute_callback(
            _callbacker,
            CALLBACK_DEPOSIT,
            _for,
            0,
            _collateral,
            _debt,
            _calldata,
        )
        assert cb.borrowed == 0  # dev: Not available
        more_collateral = cb.collateral

    total_collateral: uint256 = _collateral + more_collateral
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.create_loan(
  /* _collateral: uint256 */ 0n,
  /* _debt: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _callbacker: address */ "0x0000000000000000000000000000000000000000",
  /* _calldata: Bytes[CALLDATA_MAX_SIZE] */ 0n,
)
await tx.wait()
```

</Example>

::::

### `borrow_more`

::::description[`LendController.borrow_more(_collateral: uint256, _debt: uint256, _for: address = msg.sender, _callbacker: address = empty(address), _calldata: Bytes[CALLDATA_MAX_SIZE] = b"")`]

Adds additional collateral and/or borrows more tokens against an existing loan.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Additional collateral to deposit (can be 0) |
| `_debt` | `uint256` | Additional debt to take on (can be 0) |
| `_for` | `address` | Address that owns the loan |
| `_callbacker` | `address` | Optional callback contract for leveraged operations |
| `_calldata` | `Bytes[CALLDATA_MAX_SIZE]` | Data passed to the callback contract |

Emits: `Borrow` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def borrow_more(
    _collateral: uint256,
    _debt: uint256,
    _for: address = msg.sender,
    _callbacker: address = empty(address),
    _calldata: Bytes[CALLDATA_MAX_SIZE] = b"",
):
    """
    @notice Borrow more borrowed tokens while adding more collateral using a callback (to leverage more)
    @param _collateral Amount of collateral to add
    @param _debt Amount of borrowed asset debt to take
    @param _for Address to borrow for
    @param _callbacker Address of the callback contract
    @param _calldata Any data for callbacker
    """
    if _debt == 0:
        return
    assert self._has_approval(_for)

    more_collateral: uint256 = 0
    if _callbacker != empty(address):
        tkn.transfer(BORROWED_TOKEN, _callbacker, _debt)
        # If there is any unused debt, callbacker can send it to the user
        cb: IController.CallbackData = self._execute_callback(
            _callbacker,
            CALLBACK_DEPOSIT,
            _for,
            0,
            _collateral,
            _debt,
            _calldata,
        )
        assert cb.borrowed == 0  # dev: Not available
        more_collateral = cb.collateral

    rate_mul: uint256 = self._add_collateral_borrow(
        _collateral + more_collateral, _debt, _for, False
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.borrow_more(
  /* _collateral: uint256 */ 0n,
  /* _debt: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _callbacker: address */ "0x0000000000000000000000000000000000000000",
  /* _calldata: Bytes[CALLDATA_MAX_SIZE] */ 0n,
)
await tx.wait()
```

</Example>

::::

### `add_collateral`

::::description[`LendController.add_collateral(_collateral: uint256, _for: address = msg.sender)`]

Adds collateral to an existing loan without borrowing more. The borrower must call it directly or authorize the caller.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Amount of collateral to add |
| `_for` | `address` | Address of the borrower to add collateral for |

Emits: `Borrow` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def add_collateral(_collateral: uint256, _for: address = msg.sender):
    """
    @notice Add extra collateral to avoid bad liquidations
    @param _collateral Amount of collateral to add
    @param _for Address to add collateral for
    """
    if _collateral == 0:
        return
    assert self._has_approval(_for)
    self._add_collateral_borrow(_collateral, 0, _for, False)
    tkn.transfer_from(COLLATERAL_TOKEN, msg.sender, AMM.address, _collateral)
    self._save_rate()


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.add_collateral(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::

### `remove_collateral`

::::description[`LendController.remove_collateral(_collateral: uint256, _for: address = msg.sender)`]

Removes collateral from an existing loan. Reverts if the resulting health would be too low.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Amount of collateral to remove |
| `_for` | `address` | Address that owns the loan; the caller must be authorized |

Emits: `RemoveCollateral` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def remove_collateral(_collateral: uint256, _for: address = msg.sender):
    """
    @notice Remove some collateral without repaying the debt
    @param _collateral Amount of collateral to remove
    @param _for Address to remove collateral for
    """
    if _collateral == 0:
        return
    assert self._has_approval(_for)
    self._add_collateral_borrow(_collateral, 0, _for, True)
    tkn.transfer_from(COLLATERAL_TOKEN, AMM.address, _for, _collateral)
    self._save_rate()


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.remove_collateral(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::

### `repay`

::::description[`LendController.repay(_wallet_d_debt: uint256, _for: address = msg.sender, _max_active_band: int256 = max_value(int256), _callbacker: address = empty(address), _calldata: Bytes[CALLDATA_MAX_SIZE] = b"", _shrink: bool = False)`]

Repays debt for a loan. If `_wallet_d_debt` exceeds the current debt, only the outstanding debt is repaid. The borrower must call it directly or authorize the caller.

| Input | Type | Description |
| --- | --- | --- |
| `_wallet_d_debt` | `uint256` | Amount of debt to repay from the wallet (use `max_value(uint256)` to repay all) |
| `_for` | `address` | Address of the borrower to repay for |
| `_max_active_band` | `int256` | Maximum active band accepted for the repayment |
| `_callbacker` | `address` | Optional callback contract |
| `_calldata` | `Bytes[CALLDATA_MAX_SIZE]` | Data passed to the callback contract |
| `_shrink` | `bool` | Whether to shrink a soft-liquidated position |

Emits: `Repay` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def repay(
    _wallet_d_debt: uint256,
    _for: address = msg.sender,
    _max_active_band: int256 = max_value(int256),
    _callbacker: address = empty(address),
    _calldata: Bytes[CALLDATA_MAX_SIZE] = b"",
    _shrink: bool = False
):
    """
    @notice Repay debt (partially or fully)
    @param _wallet_d_debt The amount of debt to repay from user's wallet.
                   If it's max_value(uint256) or just higher than the current debt - will do full repayment.
    @param _for The user to repay the debt for
    @param _max_active_band Don't allow active band to be higher than this (to prevent front-running the repay)
    @param _callbacker Address of the callback contract
    @param _calldata Any data for callbacker
    @param _shrink Whether shrink soft-liquidated part of the position or not
    """
    assert self._has_approval(_for)
    debt: uint256 = 0
    rate_mul: uint256 = 0
    debt, rate_mul = self._debt(_for)
    self._check_loan_exists(debt)
    xy: uint256[2] = staticcall AMM.get_sum_xy(_for)

    cb: IController.CallbackData = empty(IController.CallbackData)
    if _callbacker != empty(address):
        xy = extcall AMM.withdraw(_for, WAD)
        tkn.transfer_from(COLLATERAL_TOKEN, AMM.address, _callbacker, xy[1])
        cb = self._execute_callback(
            _callbacker, CALLBACK_REPAY, _for, xy[0], xy[1], debt, _calldata
        )

    d_debt: uint256 = min(min(_wallet_d_debt, debt) + xy[0] + cb.borrowed, debt)
    assert d_debt > 0  # dev: no coins to repay

    if d_debt == debt:
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.repay(
  /* _wallet_d_debt: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _max_active_band: int256 */ 0n,
  /* _callbacker: address */ "0x0000000000000000000000000000000000000000",
  /* _calldata: Bytes[CALLDATA_MAX_SIZE] */ 0n,
  /* _shrink: bool */ false,
)
await tx.wait()
```

</Example>

::::

### `liquidate`

::::description[`LendController.liquidate(_user: address, _min_x: uint256, _frac: uint256 = 10**18, _callbacker: address = empty(address), _calldata: Bytes[CALLDATA_MAX_SIZE] = b"")`]

Liquidates an unhealthy loan (health < 0). The caller repays the debt and receives the remaining collateral. Supports partial liquidation if the position is partially in soft liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Address of the borrower to liquidate |
| `_min_x` | `uint256` | Minimum amount of collateral to receive (slippage protection) |
| `_frac` | `uint256` | Fraction of the position to liquidate, where `10**18` is 100% |
| `_callbacker` | `address` | Optional callback contract |
| `_calldata` | `Bytes[CALLDATA_MAX_SIZE]` | Data passed to the callback contract |

Emits: `Liquidate` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def liquidate(
    _user: address,
    _min_x: uint256,
    _frac: uint256 = 10**18,
    _callbacker: address = empty(address),
    _calldata: Bytes[CALLDATA_MAX_SIZE] = b"",
):
    """
    @notice Perform a bad liquidation (or self-liquidation) of user if health is not good
    @param _user Address of the user to liquidate
    @param _min_x Minimal amount of borrowed asset to receive (to avoid liquidators being sandwiched)
    @param _frac Fraction to liquidate; 100% = 10**18
    @param _callbacker Address of the callback contract
    @param _calldata Any data for callbacker
    """
    approval: bool = self._has_approval(_user)
    liquidation_discount: uint256 = self.liquidation_discounts[_user]
    debt: uint256 = 0
    rate_mul: uint256 = 0
    debt, rate_mul = self._debt(_user)

    health_before: int256 = self._health(_user, debt, True, liquidation_discount)
    health_limit: uint256 = 0
    if not approval:
        assert health_before < 0, "Not enough rekt"
        health_limit = liquidation_discount

    final_debt: uint256 = debt
    assert _frac <= WAD, "frac>100%"
    debt = unsafe_div(debt * _frac + (WAD - 1), WAD)
    assert debt > 0
    final_debt = unsafe_sub(final_debt, debt)

    # If liquidating entire debt, ensure full collateral withdrawal
    f_remove: uint256 = self._get_f_remove(_frac, health_limit)
    if final_debt == 0:
        f_remove = WAD
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.liquidate(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _min_x: uint256 */ 0n,
  /* _frac: uint256 */ 0n,
  /* _callbacker: address */ "0x0000000000000000000000000000000000000000",
  /* _calldata: Bytes[CALLDATA_MAX_SIZE] */ 0n,
)
await tx.wait()
```

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

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def debt(_user: address) -> uint256:
    """
    @notice Get the value of debt without changing the state
    @param _user User address
    @return Value of debt
    """
    return self._debt(_user)[0]


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.debt(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `health`

::::description[`LendController.health(_user: address, _full: bool = False) -> int256: view`]

Returns the health of a user's loan. Health > 0 means the loan is safe; health < 0 means it can be liquidated. If `_full` is true, the calculation also accounts for an oracle-price difference above the user's highest band when the position is not in soft liquidation. If false, it calculates health as for a user in soft-liquidation mode.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_full` | `bool` | If true, use full (pessimistic) health calculation |

Returns: health value (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def health(_user: address, _full: bool = False) -> int256:
    """
    @notice Returns position health normalized to 1e18 for the user.
            Liquidation starts when < 0, however devaluation of collateral doesn't cause liquidation
    @param _user Address of the user
    @param _full If True, use the full health calculation including bad debt discounts
    @return Health value normalized to 1e18
    """
    return self._health(
        _user, self._debt(_user)[0], _full, self.liquidation_discounts[_user]
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.health(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

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

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def loan_exists(_user: address) -> bool:
    """
    @notice Check whether there is a loan of `user` in existence
    @param _user Address of the user to check
    @return True if the user has an active loan, False otherwise
    """
    return self.loan[_user].initial_debt > 0


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.loan_exists(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `user_state`

::::description[`LendController.user_state(_user: address) -> uint256[4]: view`]

Returns the full state of a user's loan: `[collateral, borrowed, debt, N]`.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: `[collateral, borrowed, debt, N]` (`uint256[4]`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def user_state(_user: address) -> uint256[4]:
    """
    @notice Return the user state in one call
    @param _user User to return the state for
    @return (collateral, borrowed, debt, N)
    """
    return staticcall self._view.user_state(_user)


@internal
def _configure(
    _loan_discount: uint256,
    _liquidation_discount: uint256,
    _monetary_policy: IMonetaryPolicy,
    _view_blueprint: address,
    _fee: uint256,
    _price_oracle: IPriceOracle,
    _liquidity_mining_callback: ILMCallback,
):
    if _loan_discount != SKIP_CONFIG_UINT256 and _liquidation_discount != SKIP_CONFIG_UINT256:
        self.loan_discount = _loan_discount
        self.liquidation_discount = _liquidation_discount
    if _monetary_policy.address != SKIP_CONFIG_ADDRESS:
        self._monetary_policy = _monetary_policy
    if _view_blueprint != SKIP_CONFIG_ADDRESS:
        view: address = create_from_blueprint(
            _view_blueprint,
            self,
            SQRT_BAND_RATIO,
            LOGN_A_RATIO,
            AMM,
            A,
            COLLATERAL_TOKEN,
            COLLATERAL_PRECISION,
            BORROWED_TOKEN,
            BORROWED_PRECISION,
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.user_state(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def user_prices(_user: address) -> uint256[2]:  # Upper, lower
    """
    @notice Lowest price of the lower band and highest price of the upper band the user has deposit in the AMM
    @param _user User address
    @return (upper_price, lower_price)
    """
    return staticcall self._view.user_prices(_user)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.user_prices(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `users_to_liquidate`

::::description[`LendController.users_to_liquidate(_from: uint256 = 0, _limit: uint256 = 0) -> IController.Position[]: view`]

Returns a list of user positions that can be liquidated, paginated.

| Input | Type | Description |
| --- | --- | --- |
| `_from` | `uint256` | Starting index |
| `_limit` | `uint256` | Maximum number of positions to return |

Returns: array of liquidatable positions (`IController.Position[]`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def users_to_liquidate(
    _from: uint256 = 0, _limit: uint256 = 0
) -> DynArray[IController.Position, 1000]:
    """
    @notice Returns a dynamic array of users who can be "hard-liquidated".
            This method is designed for convenience of liquidation bots.
    @param _from Loan index to start iteration from
    @param _limit Number of loans to look over
    @return Dynamic array with detailed info about positions of users
    """
    return staticcall self._view.users_to_liquidate(_from, _limit)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.users_to_liquidate(
  /* _from: uint256 */ 0n,
  /* _limit: uint256 */ 0n,
)
```

</Example>

::::

### `tokens_to_liquidate`

::::description[`LendController.tokens_to_liquidate(_user: address, _frac: uint256 = 10**18) -> uint256: view`]

Returns the amount of borrowed tokens needed to fully liquidate a user's position.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_frac` | `uint256` | Fraction to liquidate, where `10**18` is 100% |

Returns: tokens needed for liquidation (`uint256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def tokens_to_liquidate(_user: address, _frac: uint256 = WAD) -> uint256:
    """
    @notice Calculate the amount of borrowed asset to have in liquidator's wallet to liquidate a user
    @param _user Address of the user to liquidate
    @param _frac Fraction to liquidate; 100% = 10**18
    @return The amount of borrowed asset needed
    """
    assert _frac <= WAD, "frac>100%"
    health_limit: uint256 = 0
    if not self._has_approval(_user):
        health_limit = self.liquidation_discounts[_user]
    borrowed: uint256 = unsafe_div(
        (staticcall AMM.get_sum_xy(_user))[0]
        * self._get_f_remove(_frac, health_limit),
        WAD,
    )
    debt: uint256 = unsafe_div(self._debt(_user)[0] * _frac + (WAD - 1), WAD)

    return crv_math.sub_or_zero(debt, borrowed)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.tokens_to_liquidate(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _frac: uint256 */ 0n,
)
```

</Example>

::::

### `total_debt`

::::description[`LendController.total_debt() -> uint256: view`]

Returns the total outstanding debt across all loans in this market, including accrued interest.

Returns: total debt (`uint256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
@reentrant
def total_debt() -> uint256:
    """
    @notice Total debt of this controller
    @dev Marked as reentrant because used by monetary policy
    @return Total outstanding debt with accrued interest
    """
    return self._get_total_debt()


@internal
@pure
def _get_y_effective(
    _collateral: uint256,
    _N: uint256,
    _discount: uint256,
    _SQRT_BAND_RATIO: uint256,
    _A: uint256,
) -> uint256:
    """
    @notice Intermediary method which calculates y_effective defined as x_effective / p_base,
            however discounted by loan_discount.
            x_effective is an amount which can be obtained from collateral when liquidating
    @param _collateral Amount of collateral with 18 decimals to get the value for
    @param _N Number of bands the deposit is made into
    @param _discount Loan discount at 1e18 base (e.g. 1e18 == 100%)
    @param _SQRT_BAND_RATIO Square root of the band ratio sqrt((A-1)/A) at 1e18 base
    @param _A Band width factor
    @return y_effective
    """
    # x_effective = sum_{i=0..N-1}(y / N * p(n_{n1+i})) =
    # = y / N * p_oracle_up(n1) * sqrt((A - 1) / A) * sum_{0..N-1}(((A-1) / A)**k)
    # === d_y_effective * p_oracle_up(n1) * sum(...) === y_effective * p_oracle_up(n1)
    # d_y_effective = y / N / sqrt(A / (A - 1))
    # d_y_effective: uint256 = collateral * unsafe_sub(10**18, discount) / (SQRT_BAND_RATIO * N)
    # Make some extra discount to always deposit lower when we have DEAD_SHARES rounding
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.total_debt()
```

</Example>

::::

### `n_loans`

::::description[`LendController.n_loans() -> uint256: view`]

Returns the total number of active loans.

Returns: number of loans (`uint256`).

<SourceCode>

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.n_loans()
await tx.wait()
```

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

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.loans(
  /* _index: uint256 */ 0n,
)
await tx.wait()
```

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

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.loan_ix(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::


---


## Health Previews

These functions allow UIs to show the health impact of operations before the user submits a transaction.

### `create_loan_health_preview`

::::description[`LendController.create_loan_health_preview(_collateral: uint256, _debt: uint256, _N: uint256, _for: address, _full: bool) -> int256: view`]

Previews the health of a loan that would result from calling `create_loan`.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral amount |
| `_debt` | `uint256` | Debt amount |
| `_N` | `uint256` | Number of bands |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def create_loan_health_preview(
    _collateral: uint256,
    _debt: uint256,
    _N: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling create_loan with the same params
    @param _collateral Amount of collateral to use (from wallet + callback).
           Note: the collateral amount coming from the callback should be included.
    @param _debt Borrowed asset debt to take
    @param _N Number of bands to deposit into (to do autoliquidation-deliquidation),
           can be from MIN_TICKS to MAX_TICKS
    @param _for Address of the user the loan is being created for
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.create_loan_health_preview(
        _collateral, _debt, _N, _for, _full
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.create_loan_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _debt: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `borrow_more_health_preview`

::::description[`LendController.borrow_more_health_preview(_collateral: uint256, _debt: uint256, _for: address, _full: bool) -> int256: view`]

Previews the health after borrowing more.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Additional collateral |
| `_debt` | `uint256` | Additional debt |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def borrow_more_health_preview(
    _collateral: uint256,
    _debt: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling borrow_more with the same params
    @param _collateral Amount of collateral to add (from wallet + callback).
           Note: the collateral amount coming from the callback should be included.
    @param _debt Amount of borrowed asset debt to take
    @param _for Address to borrow for
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.borrow_more_health_preview(
        _collateral, _debt, _for, _full
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.borrow_more_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _debt: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `add_collateral_health_preview`

::::description[`LendController.add_collateral_health_preview(_collateral: uint256, _for: address, _full: bool) -> int256: view`]

Previews the health after adding collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral to add |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def add_collateral_health_preview(
    _collateral: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling add_collateral with the same args
    @param _collateral Amount of collateral to add
    @param _for The user to add collateral for
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.add_collateral_health_preview(_collateral, _for, _full)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.add_collateral_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `remove_collateral_health_preview`

::::description[`LendController.remove_collateral_health_preview(_collateral: uint256, _for: address, _full: bool) -> int256: view`]

Previews the health after removing collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral to remove |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def remove_collateral_health_preview(
    _collateral: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling remove_collateral with the same args
    @param _collateral Amount of collateral to remove
    @param _for Address to remove collateral from
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.remove_collateral_health_preview(
        _collateral, _for, _full
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.remove_collateral_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `repay_health_preview`

::::description[`LendController.repay_health_preview(_d_collateral: uint256, _d_debt: uint256, _for: address, _shrink: bool, _full: bool) -> int256: view`]

Previews the health after repaying debt.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount removed through the callback |
| `_d_debt` | `uint256` | Debt to repay |
| `_for` | `address` | Borrower address |
| `_shrink` | `bool` | Whether the repayment shrinks a soft-liquidated position |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def repay_health_preview(
    _d_collateral: uint256,
    _d_debt: uint256,
    _for: address,
    _shrink: bool,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling repay with the same params
    @dev Works only for partial repay, reverts for full repay
    @param _d_collateral Amount of collateral to remove (goes to callback)
    @param _d_debt The amount of debt to repay (from wallet + callback).
           Note: the borrowed amount coming from the callback should be included.
    @param _for The user to repay the debt for
    @param _shrink Whether shrink soft-liquidated part of the position or not
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.repay_health_preview(
        _d_collateral, _d_debt, _for, _shrink, _full
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.repay_health_preview(
  /* _d_collateral: uint256 */ 0n,
  /* _d_debt: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _shrink: bool */ false,
  /* _full: bool */ false,
)
```

</Example>

::::

### `liquidate_health_preview`

::::description[`LendController.liquidate_health_preview(_user: address, _caller: address, _frac: uint256, _full: bool) -> int256: view`]

Previews what a user's health would be after liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_caller` | `address` | Address that would submit the liquidation |
| `_frac` | `uint256` | Fraction of the position to liquidate, where `10**18` is 100% |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def liquidate_health_preview(
    _user: address,
    _caller: address,
    _frac: uint256,
    _full: bool,
) -> int256:
    """
    @notice Calculates health after calling liquidate with the same args
    @param _user User to liquidate
    @param _caller Address from which liquidate tx is going to be sent.
           Depending on this address liquidation_discount will be changed or not.
    @param _frac Fraction to liquidate; 100% = 10**18
    @param _full Whether it's a 'full' health or not
    @return Signed health value
    """
    return staticcall self._view.liquidate_health_preview(
        _user, _caller, _frac, _full
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.liquidate_health_preview(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _caller: address */ "0x0000000000000000000000000000000000000000",
  /* _frac: uint256 */ 0n,
  /* _full: bool */ false,
)
```

</Example>

::::


---


## Lending-Specific

These functions are unique to `LendController` and not part of the shared `controller.vy` module.

### `available_balance`

::::description[`LendController.available_balance() -> uint256: view`]

Returns the amount of borrowed tokens currently available for new loans — i.e., tracked lender deposits minus amounts lent out. Direct token donations are not included in this accounting.

Returns: available balance (`uint256`).

<SourceCode>

Excerpt from [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy):

```vyper
@external
@view
@reentrant
def available_balance() -> uint256:
    return self._available_balance


# https://github.com/vyperlang/vyper/issues/4721
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.available_balance()
```

</Example>

::::

### `borrow_cap`

::::description[`LendController.borrow_cap() -> uint256: view`]

Returns the maximum total debt allowed for this market. It is initialized to 0, which prevents new borrowing; the LendConfigurator must raise it above 0 (for example, through a DAO action) before borrowing can be enabled.

Returns: borrow cap (`uint256`).

<SourceCode>

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.borrow_cap()
await tx.wait()
```

</Example>

::::

### `vault`

::::description[`LendController.vault() -> address: view`]

Returns the address of the associated ERC4626 vault.

Returns: vault address (`address`).

<SourceCode>

Excerpt from [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy):

```vyper
@external
@view
@reentrant
def vault() -> address:
    """
    @notice Address of the vault
    @return Address of the vault contract
    """
    return VAULT.address


@deploy
def __init__(
    _vault: IVault,
    _amm: IAMM,
    _borrowed_token: IERC20,
    _collateral_token: IERC20,
    _monetary_policy: IMonetaryPolicy,
    _loan_discount: uint256,
    _liquidation_discount: uint256,
    _view_blueprint: address,
    _configurator: core.IConfigurator,
):
    """
    @notice Lend Controller constructor
    @param _vault Address of the vault this controller belongs to
    @param _amm AMM address (already deployed from blueprint)
    @param _borrowed_token Token which is being borrowed
    @param _collateral_token Token to use for collateral
    @param _monetary_policy Address of monetary policy
    @param _loan_discount Discount of the maximum loan size compare to get_x_down() value
    @param _liquidation_discount Discount of the maximum loan size compare to
           get_x_down() for "bad liquidation" purposes
    @param _view_blueprint Address of the controller view blueprint
    @param _configurator Address of the configurator contract
    """
    VAULT = _vault

# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.vault()
```

</Example>

::::

### `configure_lend`

::::description[`LendController.configure_lend(_borrow_cap: uint256, _admin_percentage: uint256)`]

:::guard[Guarded Method]
This function is only callable by the LendConfigurator contract. Governance normally invokes it through the configurator's administrative methods.
:::

Configures the market's borrow cap and admin-fee share. Either parameter can be left unchanged by passing the protocol's `SKIP_CONFIG_UINT256` sentinel.

| Input | Type | Description |
| --- | --- | --- |
| `_borrow_cap` | `uint256` | New maximum total debt (0 disables new borrowing) |
| `_admin_percentage` | `uint256` | New admin-fee share, scaled so that `10**18` is 100% |

Updates the supplied configuration values.

<SourceCode>

Excerpt from [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy):

```vyper
@external
def configure_lend(_borrow_cap: uint256, _admin_percentage: uint256):
    assert msg.sender == core.CONFIGURATOR.address, "Only configurator"
    if _borrow_cap != core.SKIP_CONFIG_UINT256:
        self.borrow_cap = _borrow_cap
    if _admin_percentage != core.SKIP_CONFIG_UINT256:
        rate_mul: uint256 = staticcall core.AMM.get_rate_mul()
        core._update_total_debt(0, rate_mul, False)
        core.admin_percentage = _admin_percentage


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.configure_lend(
  /* _borrow_cap: uint256 */ 0n,
  /* _admin_percentage: uint256 */ 0n,
)
await tx.wait()
```

</Example>

::::

## Calculations

### `max_borrowable`

::::description[`LendController.max_borrowable(_d_collateral: uint256, _N: uint256, _user: address = empty(address)) -> uint256: view`]

Returns the maximum amount that can be borrowed given a collateral amount and number of bands, respecting the borrow cap and available balance.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | Borrower address (for existing loan context) |

Returns: max borrowable amount (`uint256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def max_borrowable(
    _d_collateral: uint256, _N: uint256, _user: address = empty(address)
) -> uint256:
    """
    @notice Calculation of maximum which can be borrowed.
            Returns the maximum additional amount to be borrowed in case the user has a position.
    @param _d_collateral Collateral amount against which to borrow
                         (additional amount if the user has a position)
    @param _N Number of bands to have the deposit into (to be ignored if the user has a position)
    @param _user User to calculate the value for
                 (can be zero address for create_loan if the user doesn't have extra_health)
    @return Maximum (additional) amount of borrowed asset to borrow
    """
    return staticcall self._view.max_borrowable(_d_collateral, _N, _user)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.max_borrowable(
  /* _d_collateral: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `min_collateral`

::::description[`LendController.min_collateral(_debt: uint256, _N: uint256, _user: address = empty(address)) -> uint256: view`]

Returns the minimum collateral required for a given debt amount and number of bands.

| Input | Type | Description |
| --- | --- | --- |
| `_debt` | `uint256` | Desired debt amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | User address, needed only when the user has nonzero extra health |

Returns: minimum collateral required (`uint256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def min_collateral(
    _debt: uint256, _N: uint256, _user: address = empty(address)
) -> uint256:
    """
    @notice Calculation of minimum collaterl amount required for given debt amount
    @param _debt The amount of debt for which calculation should be done
    @param _N number of bands to have the deposit into
    @param _user User to calculate the value for (only necessary for nonzero extra_health)
    @return Minimum amount of collateral asset to provide
    """
    return staticcall self._view.min_collateral(_debt, _N, _user)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.min_collateral(
  /* _debt: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `calculate_debt_n1`

::::description[`LendController.calculate_debt_n1(_collateral: uint256, _debt: uint256, _N: uint256, _user: address = empty(address)) -> int256: view`]

Calculates the upper band number (`n1`) for a loan with the given parameters. Used to determine where collateral will be placed in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral amount |
| `_debt` | `uint256` | Debt amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | User address, needed only when the user has nonzero extra health |

Returns: upper band number (`int256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
def calculate_debt_n1(
    _collateral: uint256,
    _debt: uint256,
    _N: uint256,
    _user: address = empty(address),
) -> int256:
    """
    @notice Calculate the upper band number for the deposit to sit in to support
            the given debt. Reverts if requested debt is too high.
    @param _collateral Amount of collateral (at its native precision)
    @param _debt Amount of requested debt
    @param _N Number of bands to deposit into
    @param _user User to calculate n1 for (only necessary for nonzero extra_health)
    @return Upper band n1 (n1 <= n2) to deposit into. Signed integer
    """
    assert _N > MIN_TICKS_UINT - 1  # dev: Need more ticks
    assert _N < MAX_TICKS_UINT + 1  # dev: Need less ticks
    return self._calculate_debt_n1(_collateral, _debt, _N, _user)


@internal
@view
def _calculate_debt_n1(
    _collateral: uint256,
    _debt: uint256,
    _N: uint256,
    _user: address,
) -> int256:
    assert _debt > 0  # dev: No loan
    n0: int256 = staticcall AMM.active_band()
    p_base: uint256 = staticcall AMM.p_oracle_up(n0)

    # x_effective = y / N * p_oracle_up(n1) * sqrt((A - 1) / A) * sum_{0..N-1}(((A-1) / A)**k)
    # === d_y_effective * p_oracle_up(n1) * sum(...) === y_effective * p_oracle_up(n1)
    # d_y_effective = y / N / sqrt(A / (A - 1))
    y_effective: uint256 = self._get_y_effective(
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.calculate_debt_n1(
  /* _collateral: uint256 */ 0n,
  /* _debt: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::


---


## Configuration

### `configure`

::::description[`LendController.configure(_loan_discount: uint256, _liquidation_discount: uint256, _monetary_policy: address, _view_blueprint: address, _fee: uint256, _price_oracle: address, _liquidity_mining_callback: address)`]

:::guard[Guarded Method]
This function is only callable by the LendConfigurator contract.
:::

Updates shared-controller settings. Governance normally invokes it through the LendConfigurator rather than calling the controller directly. Parameters that should remain unchanged use the protocol's `SKIP_CONFIG_UINT256` or `SKIP_CONFIG_ADDRESS` sentinel, as applicable.

| Input | Type | Description |
| --- | --- | --- |
| `_loan_discount` | `uint256` | Loan discount for LTV calculations |
| `_liquidation_discount` | `uint256` | Discount used in liquidation calculations |
| `_monetary_policy` | `address` | Monetary policy contract |
| `_view_blueprint` | `address` | Controller-view blueprint |
| `_fee` | `uint256` | Base AMM fee |
| `_price_oracle` | `address` | Price oracle contract |
| `_liquidity_mining_callback` | `address` | Liquidity-mining callback contract |

Updates the supplied configuration values.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def configure(
    _loan_discount: uint256,
    _liquidation_discount: uint256,
    _monetary_policy: IMonetaryPolicy,
    _view_blueprint: address,
    _fee: uint256,
    _price_oracle: IPriceOracle,
    _liquidity_mining_callback: ILMCallback,
):
    assert msg.sender == CONFIGURATOR.address  # dev: Only configurator
    self._configure(
        _loan_discount,
        _liquidation_discount,
        _monetary_policy,
        _view_blueprint,
        _fee,
        _price_oracle,
        _liquidity_mining_callback,
    )



@internal
@view
def _admin_fees() -> uint256:
    return self._stored_admin_fees + self._preview_total_debt(staticcall AMM.get_rate_mul(), self._total_debt)[1]


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.configure(
  /* _loan_discount: uint256 */ 0n,
  /* _liquidation_discount: uint256 */ 0n,
  /* _monetary_policy: address */ "0x0000000000000000000000000000000000000000",
  /* _view_blueprint: address */ "0x0000000000000000000000000000000000000000",
  /* _fee: uint256 */ 0n,
  /* _price_oracle: address */ "0x0000000000000000000000000000000000000000",
  /* _liquidity_mining_callback: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::


---


## Other Methods

### `amm`

::::description[`LendController.amm() -> address: view`]

Returns the AMM (LLAMMA) address for this market.

Returns: AMM address (`address`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
@reentrant
def amm() -> IAMM:
    """
    @notice Address of the AMM
    @return Address of the AMM contract
    """
    return AMM


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.amm()
```

</Example>

::::

### `monetary_policy`

::::description[`LendController.monetary_policy() -> address: view`]

Returns the current monetary policy address.

Returns: monetary policy address (`address`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
@reentrant
def monetary_policy() -> IMonetaryPolicy:
    """
    @notice Address of the monetary policy
    @return Address of the monetary policy contract
    """
    return self._monetary_policy


approval: public(HashMap[address, HashMap[address, bool]])
extra_health: public(reentrant(HashMap[address, uint256]))

loan: HashMap[address, IController.Loan]
liquidation_discounts: public(HashMap[address, uint256])
_total_debt: IController.Loan

# Enumerate existing loans
loans: public(address[2**64 - 1])
# Position of the loan in the list
loan_ix: public(HashMap[address, uint256])
# Number of nonzero loans
n_loans: public(uint256)


# cumulative amount of borrowed assets ever lent
lent: uint256
# cumulative amount of borrowed assets ever repaid
repaid: uint256
# cumulative amount of borrowed assets ever collected as admin fees
collected: uint256


# Admin fees yet to be collected. Goes to zero when collected.
_stored_admin_fees: uint256
admin_percentage: public(uint256)

# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.monetary_policy()
```

</Example>

::::

### `liquidation_discount`

::::description[`LendController.liquidation_discount() -> uint256: view`]

Returns the current liquidation discount.

Returns: liquidation discount (`uint256`).

<SourceCode>

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.liquidation_discount()
await tx.wait()
```

</Example>

::::

### `loan_discount`

::::description[`LendController.loan_discount() -> uint256: view`]

Returns the current loan discount.

Returns: loan discount (`uint256`).

<SourceCode>

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.loan_discount()
await tx.wait()
```

</Example>

::::

### `admin_fees`

::::description[`LendController.admin_fees() -> uint256: view`]

Returns the amount of uncollected admin fees.

Returns: admin fees (`uint256`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
@reentrant
def admin_fees() -> uint256:
    """
    @notice Pending admin fees which can be claimed if the controller has enough balance
    @return Amount of pending admin fees in borrowed token units
    """
    return self._admin_fees()


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.admin_fees()
```

</Example>

::::

### `admin_percentage`

::::description[`LendController.admin_percentage() -> uint256: view`]

Returns the current admin fee percentage, scaled so that `10**18` is 100%.

Returns: admin percentage (`uint256`).

<SourceCode>

The implementation is in [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.admin_percentage()
await tx.wait()
```

</Example>

::::

### `collect_fees`

::::description[`LendController.collect_fees()`]

Collects accumulated admin fees and sends them to the fee receiver set in the factory.

Emits: `CollectFees` event.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def collect_fees() -> uint256:
    """
    @notice Collect the fees charged as interest.
    @return Amount of fees collected and transferred to the fee receiver
    """
    rate_mul: uint256 = staticcall AMM.get_rate_mul()
    self._update_total_debt(0, rate_mul, False)

    # self._stored_admin_fees == self.admin_fees() after _update_total_debt
    pending_admin_fees: uint256 = self._stored_admin_fees
    self.collected += pending_admin_fees
    self._stored_admin_fees = 0

    extcall VIRTUAL.on_borrowed_token_transfer_out(pending_admin_fees)
    tkn.transfer(BORROWED_TOKEN, staticcall FACTORY.fee_receiver(), pending_admin_fees)

    self._save_rate()
    log IController.CollectFees(amount=pending_admin_fees)

    return pending_admin_fees


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, signer)
const tx = await contract.collect_fees()
await tx.wait()
```

</Example>

::::

### `save_rate`

::::description[`LendController.save_rate()`]

Updates the stored interest rate from the monetary policy. This is called automatically during loan operations but can also be called externally to keep the rate fresh.

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
def save_rate():
    """
    @notice Save current rate
    """
    self._save_rate()


@internal
@view
def _debt(_user: address) -> (uint256, uint256):
    """
    @notice Get the value of debt and rate_mul without changing the state
    @param _user User address
    @return (debt, rate_mul)
    """
    rate_mul: uint256 = staticcall AMM.get_rate_mul()
    loan: IController.Loan = self.loan[_user]
    if loan.initial_debt == 0:
        return (0, rate_mul)
    else:
        # Let user repay 1 smallest decimal more so that the system doesn't lose on precision
        # Use ceil div
        debt: uint256 = math._ceil_div(loan.initial_debt * rate_mul, loan.rate_mul)
        return (debt, rate_mul)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.save_rate()
```

</Example>

::::

### `version`

::::description[`LendController.version() -> String[10]: view`]

Returns the contract version string (e.g., `"2.0.0-lend"`).

Returns: version string (`String[10]`).

<SourceCode>

Excerpt from [`lending/LendController.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendController.vy):

```vyper
@external
@view
@reentrant
def version() -> String[10]:
    """
    @notice Version of this controller
    @return Version string of the form "<core_version>-lend"
    """
    return concat(core.version, "-lend")


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.version()
```

</Example>

::::

### `factory`

::::description[`LendController.factory() -> address: view`]

Returns the factory that deployed this controller.

Returns: factory address (`address`).

<SourceCode>

Excerpt from [`Controller.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Controller.vy):

```vyper
@external
@view
@reentrant
def factory() -> IFactory:
    """
    @notice Address of the factory
    @return Address of the factory contract
    """
    return FACTORY


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0', LendControllerAbi, provider)
const result = await contract.factory()
```

</Example>

::::
