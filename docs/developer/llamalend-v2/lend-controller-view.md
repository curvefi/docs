# LendControllerView

The `LendControllerView` is a **stateless view helper** contract that the [LendController](./lend-controller.md) delegates read-only computations to. It extends the base `ControllerView` module with lending-specific logic — primarily making `max_borrowable` and `tokens_to_shrink` aware of **borrow caps** and **available balance**.

Each lending market deploys its own `LendControllerView` instance alongside the controller.

:::vyper[`LendControllerView.vy`]

The source code for the `LendControllerView.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendControllerView.vy). The base view module is [`ControllerView.vy`](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/ControllerView.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

Examples use Ethers v6 with an ABI generated from the pinned source linked in each panel. Replace every zero address and amount placeholder. Read-only calls use the verified Ethereum v2 reference market.


---


## Lending-Specific Views

These functions override the base `ControllerView` to account for borrow caps and available liquidity.

### `max_borrowable`

::::description[`LendControllerView.max_borrowable(_d_collateral: uint256, _N: uint256, _user: address = empty(address)) -> uint256: view`]

Returns the maximum amount that can be borrowed for a given collateral and band count. Unlike the base implementation, this caps the result by the **borrow cap** and **available balance** in the vault.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | Borrower address (for existing loan context) |

Returns: max borrowable amount, capped by market limits (`uint256`).

<SourceCode>

Excerpt from [`lending/LendControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendControllerView.vy):

```vyper
@external
@view
def max_borrowable(
    _d_collateral: uint256,
    _N: uint256,
    _user: address = empty(address),
) -> uint256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    user_state: uint256[4] = core._user_state(_user)
    if user_state[1] > 0:  # Can't borrow in soft-liquidation
        return 0

    N: uint256 = _N
    if user_state[3] > 0:  # The user has the position
        N = user_state[3]

    return crv_math.sub_or_zero(
        core._max_borrowable(user_state[0] + _d_collateral, N, self._get_cap() + user_state[2] , _user),
        user_state[2],
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.max_borrowable(
  /* _d_collateral: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `tokens_to_shrink`

::::description[`LendControllerView.tokens_to_shrink(_user: address, _d_collateral: uint256 = 0) -> uint256: view`]

Returns the amount of debt tokens needed to "shrink" a user's position by the given collateral amount. Accounts for lending market constraints.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_d_collateral` | `uint256` | Collateral to remove |

Returns: tokens needed (`uint256`).

<SourceCode>

Excerpt from [`lending/LendControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendControllerView.vy):

```vyper
@external
@view
def tokens_to_shrink(_user: address, _d_collateral: uint256 = 0) -> uint256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    return core._tokens_to_shrink(_user, self._get_cap(), _d_collateral)

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.tokens_to_shrink(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _d_collateral: uint256 */ 0n,
)
```

</Example>

::::


---


## Health Previews

These functions are exported from the base `ControllerView` module and compute health predictions for various operations.

### `create_loan_health_preview`

::::description[`LendControllerView.create_loan_health_preview(_collateral: uint256, _debt: uint256, _N: uint256, _for: address, _full: bool) -> int256: view`]

Previews the health that would result from creating a loan with the given parameters.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral amount |
| `_debt` | `uint256` | Debt amount |
| `_N` | `uint256` | Number of bands |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

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
    @notice Natspec for this function is available in its controller contract
    """
    assert _debt > 0, "debt==0"
    n1: int256 = staticcall CONTROLLER.calculate_debt_n1(_collateral, _debt, _N, _for)
    ld: uint256 = self._liquidation_discount()

    return self._calc_full_health(_collateral, _debt, _N, n1, ld, _full)


@internal
@view
def _add_collateral_borrow_health_preview(
        _collateral: uint256,
        _debt: uint256,
        _for: address,
        _full: bool,
        _remove: bool,
) -> int256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    debt: uint256 = self._debt(_for)
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(_for)
    N: uint256 = convert(unsafe_add(unsafe_sub(ns[1], ns[0]), 1), uint256)
    xy: uint256[2] = staticcall AMM.get_sum_xy(_for)

    assert debt > 0, "debt==0"
    assert xy[0] == 0, "Underwater"
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
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

::::description[`LendControllerView.borrow_more_health_preview(_collateral: uint256, _debt: uint256, _for: address, _full: bool) -> int256: view`]

Previews health after borrowing more.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Additional collateral |
| `_debt` | `uint256` | Additional debt |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

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
    @notice Natspec for this function is available in its controller contract
    """
    if _debt == 0:
        return staticcall CONTROLLER.health(_for, _full)
    return self._add_collateral_borrow_health_preview(
        _collateral, _debt, _for, _full, False
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
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

::::description[`LendControllerView.add_collateral_health_preview(_collateral: uint256, _for: address, _full: bool) -> int256: view`]

Previews health after adding collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral to add |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def add_collateral_health_preview(
    _collateral: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    if _collateral == 0:
        return staticcall CONTROLLER.health(_for, _full)
    return self._add_collateral_borrow_health_preview(_collateral, 0, _for, _full, False)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.add_collateral_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `remove_collateral_health_preview`

::::description[`LendControllerView.remove_collateral_health_preview(_collateral: uint256, _for: address, _full: bool) -> int256: view`]

Previews health after removing collateral.

| Input | Type | Description |
| --- | --- | --- |
| `_collateral` | `uint256` | Collateral to remove |
| `_for` | `address` | Borrower address |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def remove_collateral_health_preview(
    _collateral: uint256,
    _for: address,
    _full: bool,
) -> int256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    if _collateral == 0:
        return staticcall CONTROLLER.health(_for, _full)
    return self._add_collateral_borrow_health_preview(
        _collateral, 0, _for, _full, True
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.remove_collateral_health_preview(
  /* _collateral: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
  /* _full: bool */ false,
)
```

</Example>

::::

### `repay_health_preview`

::::description[`LendControllerView.repay_health_preview(_d_collateral: uint256, _d_debt: uint256, _for: address, _shrink: bool, _full: bool) -> int256: view`]

Previews health after repaying debt.

| Input | Type | Description |
| --- | --- | --- |
| `_d_collateral` | `uint256` | Collateral amount removed through the callback |
| `_d_debt` | `uint256` | Debt to repay |
| `_for` | `address` | Borrower address |
| `_shrink` | `bool` | Whether the repayment shrinks a soft-liquidated position |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

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
    @notice Natspec for this function is available in its controller contract
    """
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(_for)
    debt: uint256 = self._debt(_for)
    active_band: int256 = staticcall AMM.active_band_with_skip()

    assert debt > 0, "Loan doesn't exist"

    if ns[0] > active_band or _shrink:  # re-deposit
        xy: uint256[2] = staticcall AMM.get_sum_xy(_for)
        d_debt: uint256 = _d_debt + xy[0]
        assert d_debt > 0, "No coins to repay"
        assert debt > d_debt, "Repay amount is too high"
        debt = unsafe_sub(debt, d_debt)

        collateral: uint256 = xy[1]
        assert collateral > _d_collateral, "Can't remove more collateral than user has"
        collateral = unsafe_sub(collateral, _d_collateral)

        if _shrink:
            assert ns[1] >= active_band + MIN_TICKS, "Can't shrink"

        N: uint256 = convert(unsafe_add(unsafe_sub(ns[1], max(ns[0], active_band + 1)), 1), uint256)
        n1: int256 = staticcall CONTROLLER.calculate_debt_n1(collateral, debt, N, _for)

        return self._calc_full_health(collateral, debt, N, n1, self._liquidation_discount(), _full)
    else:
        assert _d_debt > 0, "No coins to repay"
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
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

::::description[`LendControllerView.liquidate_health_preview(_user: address, _caller: address, _frac: uint256, _full: bool) -> int256: view`]

Previews health after a partial liquidation.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |
| `_caller` | `address` | Address that would submit the liquidation |
| `_frac` | `uint256` | Fraction of the position to liquidate, where `10**18` is 100% |
| `_full` | `bool` | Full (pessimistic) health |

Returns: predicted health (`int256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

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
    @notice Natspec for this function is available in its controller contract
    """
    assert _frac < WAD, "frac >= 100%"
    debt: uint256 = self._debt(_user)
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(_user)
    active_band: int256 = staticcall AMM.active_band_with_skip()

    approval: bool = self._has_approval(_user, _caller)
    health_limit: uint256 = 0
    ld: uint256 = 0
    if approval:
        ld = self._liquidation_discount()
    else:
        assert staticcall CONTROLLER.health(_user, True) < 0, "Not enough rekt"
        ld = self._liquidation_discounts(_user)
        health_limit = ld
    f_remove: uint256 = core._get_f_remove(_frac, health_limit)

    x_eff: uint256 = staticcall AMM.get_x_down(_user) * (WAD - f_remove) // WAD
    debt = debt * (WAD - _frac) // WAD
    health: int256 = self._calc_health(x_eff, debt, ld)

    if _full and ns[0] > active_band:
        xy: uint256[2] = staticcall AMM.get_sum_xy(_user)
        collateral: uint256 = xy[1] * (WAD - f_remove) // WAD
        p0: uint256 = staticcall AMM.p_oracle_up(ns[0])
        p_diff: uint256 = crv_math.sub_or_zero(staticcall AMM.price_oracle(), p0)

        if p_diff > 0:
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
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


## Position Info

### `user_state`

::::description[`LendControllerView.user_state(_user: address) -> uint256[4]: view`]

Returns the full state of a user's loan: `[collateral, borrowed, debt, N]`.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | Borrower address |

Returns: `[collateral, borrowed, debt, N]` (`uint256[4]`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def user_state(_user: address) -> uint256[4]:
    """
    @notice Natspec for this function is available in its controller contract
    """
    return self._user_state(_user)


@internal
@view
def _max_p_base(_amm: IAMM, _logn_a_ration: int256) -> uint256:
    """
    @notice Calculate max base price including skipping bands
    """
    p_oracle: uint256 = staticcall _amm.price_oracle()
    # Should be correct unless price changes suddenly by MAX_P_BASE_BANDS+ bands
    n1: int256 = math._wad_ln(
        convert(staticcall _amm.get_base_price() * WAD // p_oracle, int256)
    )
    if n1 < 0:
        n1 -= (
            _logn_a_ration - 1
        )  # This is to deal with vyper's rounding of negative numbers
    n1 = unsafe_div(n1, _logn_a_ration) + MAX_P_BASE_BANDS
    n_min: int256 = staticcall _amm.active_band_with_skip()
    n1 = max(n1, n_min + 1)
    p_base: uint256 = staticcall _amm.p_oracle_up(n1)

    for _: uint256 in range(MAX_SKIP_TICKS + 1):
        n1 -= 1
        if n1 <= n_min:
            break
        p_base_prev: uint256 = p_base
        p_base = staticcall _amm.p_oracle_up(n1)
        if p_base > p_oracle:
            return p_base_prev
    return p_base
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.user_state(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def user_prices(_user: address) -> uint256[2]:  # Upper, lower
    """
    @notice Natspec for this function is available in its controller contract
    """
    assert staticcall AMM.has_liquidity(_user)
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(_user)  # ns[1] > ns[0]
    return [
        staticcall AMM.p_oracle_up(ns[0]), staticcall AMM.p_oracle_down(ns[1])
    ]


@internal
@view
def _user_state(_user: address) -> uint256[4]:
    """
    @notice Natspec for this function is available in its controller contract
    """
    xy: uint256[2] = empty(uint256[2])
    N: uint256 = 0
    debt: uint256 = self._debt(_user)
    if debt > 0:
        xy = staticcall AMM.get_sum_xy(_user)
        ns: int256[2] = staticcall AMM.read_user_tick_numbers(_user)  # ns[1] > ns[0]
        N = convert(unsafe_add(unsafe_sub(ns[1], ns[0]), 1), uint256)

    return [xy[1], xy[0], debt, N]


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.user_prices(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `users_to_liquidate`

::::description[`LendControllerView.users_to_liquidate(_from: uint256 = 0, _limit: uint256 = 0) -> IController.Position[]: view`]

Returns a paginated list of liquidatable positions.

| Input | Type | Description |
| --- | --- | --- |
| `_from` | `uint256` | Starting index |
| `_limit` | `uint256` | Maximum positions to return |

Returns: array of liquidatable positions (`IController.Position[]`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def users_to_liquidate(
    _from: uint256 = 0, _limit: uint256 = 0
) -> DynArray[IController.Position, 1000]:
    """
    @notice Natspec for this function is available in its controller contract
    """
    return self.users_with_health(
        CONTROLLER,
        _from,
        _limit,
        0,
        False,
        empty(address),
        True,
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.users_to_liquidate(
  /* _from: uint256 */ 0n,
  /* _limit: uint256 */ 0n,
)
```

</Example>

::::

### `min_collateral`

::::description[`LendControllerView.min_collateral(_debt: uint256, _N: uint256, _user: address = empty(address)) -> uint256: view`]

Returns the minimum collateral required for a given debt amount and number of bands.

| Input | Type | Description |
| --- | --- | --- |
| `_debt` | `uint256` | Desired debt |
| `_N` | `uint256` | Number of bands |
| `_user` | `address` | User address, needed only when the user has nonzero extra health |

Returns: minimum collateral (`uint256`).

<SourceCode>

Excerpt from [`ControllerView.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/ControllerView.vy):

```vyper
@external
@view
def min_collateral(
    _debt: uint256, _N: uint256, _user: address = empty(address)
) -> uint256:
    """
    @notice Natspec for this function is available in its controller contract
    """
    # Add N**2 to account for precision loss in multiple bands, e.g. N / (y/N) = N**2 / y
    assert _N <= MAX_TICKS_UINT and _N >= MIN_TICKS_UINT
    return unsafe_div(
        unsafe_div(
            _debt
            * unsafe_mul(WAD, BORROWED_PRECISION) // self._max_p_base(AMM, LOGN_A_RATIO)
            * WAD // self._get_y_effective(
                WAD, _N, self._loan_discount() + self._extra_health(_user)
            )
            + unsafe_add(
                unsafe_mul(_N, unsafe_add(_N, 2 * DEAD_SHARES)),
                unsafe_sub(COLLATERAL_PRECISION, 1),
            ),
            COLLATERAL_PRECISION,
        )
        * WAD,
        WAD - 10**14,
    )


@internal
@view
def _tokens_to_shrink(_user: address, _cap: uint256, _d_collateral: uint256) -> uint256:
    active_band: int256 = staticcall AMM.active_band_with_skip()
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(_user)

    if ns[0] > active_band:
        return 0

    assert ns[1] >= active_band + MIN_TICKS, "Can't shrink"
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xcda563f85388e621e7d810387e5afdac5d395e2b', LendControllerViewAbi, provider)
const result = await contract.min_collateral(
  /* _debt: uint256 */ 0n,
  /* _N: uint256 */ 0n,
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::
