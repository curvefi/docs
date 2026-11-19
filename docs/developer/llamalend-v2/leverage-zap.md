import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LeverageZap

The `LeverageZapLend` contract creates, increases and unwinds **leveraged positions** on Llamalend v2 lending markets. Unlike the [`TransientLeverageZap`](./transient-leverage-zap.md), the user does not call this zap directly. They call the market's controller (`create_loan`, `borrow_more` or `repay`) and pass the zap as the `_callbacker`, together with ABI-encoded swap parameters as `_calldata`. The controller then calls back into the zap, which executes the swap through a whitelisted exchange.

Because the swap route travels through the controller's `_calldata`, it is limited to 9,440 bytes (`CALLDATA_MAX_SIZE` minus the encoded parameters). For how leverage works on Llamalend v2 and when to use which zap, see the [Leverage overview](./leverage-overview.md).

:::vyper[`LeverageZapLend.vy`]

The source code for the `LeverageZapLend.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/zaps/LeverageZapLend.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed on :logos-ethereum: Ethereum at [`0x5D847c892891B503c3483D3Abbc2a23774279b85`](https://etherscan.io/address/0x5D847c892891B503c3483D3Abbc2a23774279b85) and on :logos-optimism: Optimism at [`0xdbeBDaE6f2D47B553B984E4091693824cf38584a`](https://optimistic.etherscan.io/address/0xdbeBDaE6f2D47B553B984E4091693824cf38584a). Each deployment is bound to the Llamalend v2 [LendFactory](./lend-factory.md) on its chain: [`0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd`](https://etherscan.io/address/0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd) on Ethereum and [`0x5F94073E3f51c1FFf92ffc6b4B06b7Af193B3640`](https://optimistic.etherscan.io/address/0x5F94073E3f51c1FFf92ffc6b4B06b7Af193B3640) on Optimism.

<ContractABI>

```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"exchange","type":"address"},{"indexed":false,"name":"approved","type":"bool"}],"name":"SetExchange","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"controller","type":"address"},{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"leverage_collateral","type":"uint256"},{"indexed":false,"name":"d_debt","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"controller","type":"address"},{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"state_collateral_used","type":"uint256"},{"indexed":false,"name":"borrowed_from_state_collateral","type":"uint256"}],"name":"Repay","type":"event"},{"inputs":[],"name":"FACTORY","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_exchange","type":"address"},{"name":"_approved","type":"bool"}],"name":"set_exchange","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller","type":"address"},{"name":"_user_collateral","type":"uint256"},{"name":"_leverage_collateral","type":"uint256"},{"name":"_N","type":"uint256"},{"name":"_p_avg","type":"uint256"}],"name":"max_borrowable","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_borrowed","type":"uint256"},{"name":"_user_collateral","type":"uint256"},{"name":"_d_debt","type":"uint256"},{"name":"_calldata","type":"bytes"}],"name":"callback_deposit","outputs":[{"name":"","type":"uint256[2]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_borrowed","type":"uint256"},{"name":"_collateral","type":"uint256"},{"name":"_debt","type":"uint256"},{"name":"_calldata","type":"bytes"}],"name":"callback_repay","outputs":[{"name":"","type":"uint256[2]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"is_approved_exchange","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_factory","type":"address"},{"name":"_exchanges","type":"address[]"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"}]
```

</ContractABI>

:::

---

## Using the Zap

The zap has no entry points of its own. To use it, call the market's [LendController](./lend-controller.md) with the zap as `_callbacker` and the swap parameters encoded as `_calldata`:

```python
_calldata = abi.encode(
    ["uint256", "uint256", "address", "bytes"],
    [controller_id, min_recv, exchange_address, exchange_calldata],
)
```

| Field               | Type      | Description                                                                                       |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `controller_id`     | `uint256` | Index of the market in the `LendFactory`. The zap uses it to check that the caller is that market's controller. |
| `min_recv`          | `uint256` | Minimum amount the swap must return: collateral when leveraging, borrowed token when deleveraging.  |
| `exchange_address`  | `address` | Whitelisted exchange (pool or router) to swap through.                                            |
| `exchange_calldata` | `bytes`   | Calldata passed to the exchange via `raw_call`, at most 9,440 bytes. It must send the swap output to the zap. |

| Action | Controller call | Swap direction |
| --- | --- | --- |
| Open a leveraged position | `create_loan(_collateral, _debt, _N, _for, zap, _calldata)` | borrowed → collateral |
| Increase leverage | `borrow_more(_collateral, _debt, _for, zap, _calldata)` | borrowed → collateral |
| Deleverage or close | `repay(_wallet_d_debt, _for, _max_active_band, zap, _calldata, _shrink)` | collateral → borrowed |

When the user calls the controller themselves (`_for` is `msg.sender`), no approval of the zap on the controller is needed, only the usual token approvals of the controller.

:::warning[No input cap]

The zap approves the exchange for `max_value(uint256)` of the input token during the swap, and revokes the approval right after it. How much is spent is decided only by `exchange_calldata`. The [`TransientLeverageZap`](./transient-leverage-zap.md) caps the approval at the borrowed amount or at `_collateral_to_spend` instead.

:::

---

## Callbacks

### `callback_deposit`
::::description[`LeverageZapLend.callback_deposit(_user: address, _borrowed: uint256, _user_collateral: uint256, _d_debt: uint256, _calldata: Bytes[9600]) -> uint256[2]`]

:::guard[Guarded Method]
This function can only be called by the controller of the market given by `controller_id` in `_calldata`. The zap looks up that controller in its `LendFactory` (`markets(controller_id).controller`) and reverts with `"wrong controller"` if the caller is anything else. In practice, it is called by a Llamalend v2 controller during `create_loan` or `borrow_more`.
:::

Called by the controller after it has sent the newly borrowed `_d_debt` to the zap. The zap first sends any collateral already sitting in it to the user (dust cleaning), then swaps the borrowed tokens into collateral through `exchange_address`, checks that the zap received at least `min_recv` collateral and refunds any borrowed tokens the exchange did not spend to the user. It returns `[0, leverage_collateral]`, and the controller pulls the collateral from the zap into the position.

| Input              | Type          | Description                                                                 |
| ------------------ | ------------- | --------------------------------------------------------------------------- |
| `_user`            | `address`     | Owner of the position.                                                      |
| `_borrowed`        | `uint256`     | Always `0`.                                                                 |
| `_user_collateral` | `uint256`     | Collateral provided by the user (unused).                                   |
| `_d_debt`          | `uint256`     | Amount being borrowed in addition to the existing debt.                     |
| `_calldata`        | `Bytes[9600]` | ABI-encoded `(controller_id, min_recv, exchange_address, exchange_calldata)`. |

Returns: `[0, leverage_collateral]` (`uint256[2]`).

Emits: `Deposit` event.

<SourceCode>

<Tabs>
<TabItem value="LeverageZapLend.vy" label="LeverageZapLend.vy">

```vyper
event Deposit:
    controller: indexed(address)
    user: indexed(address)
    leverage_collateral: uint256
    d_debt: uint256

CALLDATA_MAX_SIZE: constant(uint256) = c.CALLDATA_MAX_SIZE

_LEND_FACTORY: immutable(ILendFactory)

@external
@nonreentrant
def callback_deposit(
        _user: address,
        _borrowed: uint256,
        _user_collateral: uint256,
        _d_debt: uint256,
        _calldata: Bytes[CALLDATA_MAX_SIZE],
) -> uint256[2]:
    """
    @notice Callback method which should be called by controller to create leveraged position
    @param _user Address of the user
    @param _borrowed Always 0
    @param _user_collateral The amount of collateral token provided by user (unused)
    @param _d_debt The amount to be borrowed (in addition to what has already been borrowed)
    @param _calldata controller_id + min_recv + exchange_address + exchange_calldata
                    - controller_id is needed to check that msg.sender is the one of our controllers
                    - min_recv - the minimum amount to receive from exchange of _d_debt for collateral tokens
                    - exchange_address - the address of the exchange (e. g. pool, router) to swap borrowed -> collateral
                    - exchange_calldata - the data for the exchange (e. g. pool, router)
    @return [0, leverage_collateral]
    """
    controller_id: uint256 = 0
    min_recv: uint256 = 0
    exchange_address: address = empty(address)
    exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32] = empty(Bytes[CALLDATA_MAX_SIZE - 5 * 32])
    controller_id, min_recv, exchange_address, exchange_calldata = abi_decode(
        _calldata, (uint256, uint256, address, Bytes[CALLDATA_MAX_SIZE - 5 * 32])
    )

    controller: address = (staticcall _LEND_FACTORY.markets(controller_id)).controller.address
    assert msg.sender == controller, "wrong controller"

    return self._callback_deposit(
        controller,
        _user,
        _d_debt,
        min_recv,
        exchange_address,
        exchange_calldata,
    )

@internal
def _callback_deposit(
        _controller: address,
        _user: address,
        _d_debt: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32],
) -> uint256[2]:
    amm: IAMM = staticcall IController(_controller).amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    # Dust cleaning
    tkn.transfer(collateral_token, _user, staticcall collateral_token.balanceOf(self))

    tkn.max_approve(collateral_token, _controller)

    # Buy leverage_collateral for d_debt
    # The amount to be spent is specified inside the exchange_calldata.
    self._execute_raw_call(borrowed_token, _exchange_address, _exchange_calldata)

    leverage_collateral: uint256 = staticcall collateral_token.balanceOf(self)
    assert leverage_collateral >= _min_recv, "Slippage"

    # Refund borrowed tokens the exchange didn't spend back to the user (controller requires returned borrowed == 0).
    tkn.transfer(borrowed_token, _user, staticcall borrowed_token.balanceOf(self))

    log ILeverageZap.Deposit(
        controller=_controller,
        user=_user,
        leverage_collateral=leverage_collateral,
        d_debt=_d_debt,
    )

    return [0, leverage_collateral]

@internal
def _execute_raw_call(
        _token: IERC20,
        _exchange_address: address,
        _exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32],
):
    assert self.is_approved_exchange[_exchange_address], "Exchange not approved"

    # Approve, call the exchange, then revoke so it retains no allowance afterwards
    assert extcall _token.approve(_exchange_address, max_value(uint256), default_return_value=True)
    raw_call(_exchange_address, _exchange_calldata)
    assert extcall _token.approve(_exchange_address, 0, default_return_value=True)
```

</TabItem>
<TabItem value="token.vy" label="token.vy (curve_std)">

```vyper
@internal
def max_approve(token: IERC20, spender: address):
    if staticcall token.allowance(self, spender) == 0:
        assert extcall token.approve(spender, max_value(uint256), default_return_value=True)

@internal
def transfer(token: IERC20, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transfer(_to, amount, default_return_value=True)
```

</TabItem>
<TabItem value="constants.vy" label="constants.vy">

```vyper
CALLDATA_MAX_SIZE: constant(uint256) = 32 * 300
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
# Not called directly. Pass the zap as `_callbacker` to the controller:
>>> calldata = abi.encode(["uint256", "uint256", "address", "bytes"], [0, 14 * 10**17, CurveRouter, route_calldata])
>>> LendController.create_loan(10**18, 2000 * 10**18, 10, user, LeverageZap, calldata)
```

</Example>

::::

### `callback_repay`
::::description[`LeverageZapLend.callback_repay(_user: address, _borrowed: uint256, _collateral: uint256, _debt: uint256, _calldata: Bytes[9600]) -> uint256[2]`]

:::guard[Guarded Method]
This function can only be called by the controller of the market given by `controller_id` in `_calldata`, looked up in the zap's `LendFactory`. Any other caller is rejected with `"wrong controller"`. In practice, it is called by a Llamalend v2 controller during `repay`.
:::

Called by the controller after it has sent the position's collateral to the zap. The zap first sends any borrowed tokens already sitting in it to the user (dust cleaning), then swaps collateral into the borrowed token through `exchange_address`. It checks that at least `min_recv` borrowed tokens were received and that the zap's collateral balance actually decreased. It returns the borrowed tokens obtained and the remaining collateral, which the controller uses to repay debt and to return collateral to the position.

| Input         | Type          | Description                                                                 |
| ------------- | ------------- | --------------------------------------------------------------------------- |
| `_user`       | `address`     | Owner of the position.                                                      |
| `_borrowed`   | `uint256`     | Borrowed tokens in the position (from `user_state`).                        |
| `_collateral` | `uint256`     | Collateral in the position (from `user_state`).                             |
| `_debt`       | `uint256`     | Debt of the position (from `user_state`).                                   |
| `_calldata`   | `Bytes[9600]` | ABI-encoded `(controller_id, min_recv, exchange_address, exchange_calldata)`. |

Returns: `[borrowed_from_state_collateral, remaining_collateral]` (`uint256[2]`).

Emits: `Repay` event.

<SourceCode>

<Tabs>
<TabItem value="LeverageZapLend.vy" label="LeverageZapLend.vy">

```vyper
event Repay:
    controller: indexed(address)
    user: indexed(address)
    state_collateral_used: uint256
    borrowed_from_state_collateral: uint256

@external
@nonreentrant
def callback_repay(
        _user: address,
        _borrowed: uint256,
        _collateral: uint256,
        _debt: uint256,
        _calldata: Bytes[CALLDATA_MAX_SIZE],
) -> uint256[2]:
    """
    @notice Callback method which should be called by controller to deleverage/repay a position using collateral from the user's position
    @param _user Address of the user
    @param _borrowed The value from user_state
    @param _collateral The value from user_state
    @param _debt The value from user_state
    @param _calldata controller_id + min_recv + exchange_address + exchange_calldata
                    - controller_id is needed to check that msg.sender is the one of our controllers
                    - min_recv - the minimum amount to receive from exchange of state_collateral for borrowed tokens
                    - exchange_address - the address of the exchange (e. g. pool, router) to swap collateral -> borrowed
                    - exchange_calldata - the data for the exchange (e. g. pool, router)
    @return [borrowed_from_state_collateral, remaining_collateral]
    """
    controller_id: uint256 = 0
    min_recv: uint256 = 0
    exchange_address: address = empty(address)
    exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32] = empty(Bytes[CALLDATA_MAX_SIZE - 5 * 32])
    controller_id, min_recv, exchange_address, exchange_calldata = abi_decode(
        _calldata, (uint256, uint256, address, Bytes[CALLDATA_MAX_SIZE - 5 * 32])
    )

    controller: address = (staticcall _LEND_FACTORY.markets(controller_id)).controller.address
    assert msg.sender == controller, "wrong controller"

    return self._callback_repay(
        controller,
        _user,
        min_recv,
        exchange_address,
        exchange_calldata,
    )

@internal
def _callback_repay(
        _controller: address,
        _user: address,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32],
) -> uint256[2]:
    amm: IAMM = staticcall IController(_controller).amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    # Dust cleaning
    tkn.transfer(borrowed_token, _user, staticcall borrowed_token.balanceOf(self))

    initial_collateral: uint256 = staticcall collateral_token.balanceOf(self)

    tkn.max_approve(borrowed_token, _controller)
    tkn.max_approve(collateral_token, _controller)

    # Buy borrowed token for collateral from user's position.
    # The amount to be spent is specified inside the exchange_calldata.
    self._execute_raw_call(collateral_token, _exchange_address, _exchange_calldata)

    remaining_collateral: uint256 = staticcall collateral_token.balanceOf(self)
    borrowed_from_state_collateral: uint256 = staticcall borrowed_token.balanceOf(self)
    assert borrowed_from_state_collateral >= _min_recv, "Slippage"
    assert remaining_collateral < initial_collateral, "Collateral must decrease"
    state_collateral_used: uint256 = initial_collateral - remaining_collateral

    log ILeverageZap.Repay(
        controller=_controller,
        user=_user,
        state_collateral_used=state_collateral_used,
        borrowed_from_state_collateral=borrowed_from_state_collateral,
    )

    return [borrowed_from_state_collateral, remaining_collateral]

@internal
def _execute_raw_call(
        _token: IERC20,
        _exchange_address: address,
        _exchange_calldata: Bytes[CALLDATA_MAX_SIZE - 5 * 32],
):
    assert self.is_approved_exchange[_exchange_address], "Exchange not approved"

    # Approve, call the exchange, then revoke so it retains no allowance afterwards
    assert extcall _token.approve(_exchange_address, max_value(uint256), default_return_value=True)
    raw_call(_exchange_address, _exchange_calldata)
    assert extcall _token.approve(_exchange_address, 0, default_return_value=True)
```

</TabItem>
<TabItem value="token.vy" label="token.vy (curve_std)">

```vyper
@internal
def max_approve(token: IERC20, spender: address):
    if staticcall token.allowance(self, spender) == 0:
        assert extcall token.approve(spender, max_value(uint256), default_return_value=True)

@internal
def transfer(token: IERC20, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transfer(_to, amount, default_return_value=True)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
# Not called directly. Pass the zap as `_callbacker` to the controller:
>>> calldata = abi.encode(["uint256", "uint256", "address", "bytes"], [0, 1350 * 10**18, CurveRouter, route_calldata])
>>> LendController.repay(0, user, 2**255 - 1, LeverageZap, calldata, False)
```

</Example>

::::

---

## Calculations

### `max_borrowable`
::::description[`LeverageZapLend.max_borrowable(_controller: IController, _user_collateral: uint256, _leverage_collateral: uint256, _N: uint256, _p_avg: uint256) -> uint256: view`]

Calculates the maximum amount of borrowed token that can be borrowed with leverage, given the user's own collateral and the average price expected from the leverage swap. The formula is

$$
\text{max\_borrowable} = \frac{\text{user\_collateral}}{\frac{1}{k_{\text{effective}} \cdot p_{\text{max\_base}}} - \frac{1}{p_{\text{avg}}}}
$$

where $k_{\text{effective}}$ discounts the collateral value by the market's `loan_discount`, and $p_{\text{max\_base}}$ is the highest base price the position could be deposited at. The result is capped at the controller's `available_balance()`.

Unlike the `TransientLeverageZap` version, this function does not take a user's `extra_health` into account and does not check that `_N` is within the allowed range.

| Input                  | Type          | Description                                                                         |
| ---------------------- | ------------- | ----------------------------------------------------------------------------------- |
| `_controller`          | `IController` | Controller of the market.                                                           |
| `_user_collateral`     | `uint256`     | Amount of collateral token provided by the user.                                    |
| `_leverage_collateral` | `uint256`     | Amount of collateral token expected from the leverage swap.                         |
| `_N`                   | `uint256`     | Number of bands.                                                                    |
| `_p_avg`               | `uint256`     | Average price of collateral in borrowed token expected from the swap (18 decimals). |

Returns: maximum borrowable amount of borrowed token (`uint256`).

<SourceCode>

<Tabs>
<TabItem value="LeverageZapLend.vy" label="LeverageZapLend.vy">

```vyper
WAD: constant(uint256) = c.WAD
DEAD_SHARES: constant(uint256) = c.DEAD_SHARES
MAX_TICKS_UINT: constant(uint256) = c.MAX_TICKS_UINT

@external
@view
def max_borrowable(
        _controller: IController,
        _user_collateral: uint256,
        _leverage_collateral: uint256,
        _N: uint256,
        _p_avg: uint256,
) -> uint256:
    """
    @notice Calculation of maximum which can be borrowed with leverage
    @param _controller Controller of the market
    @param _user_collateral Amount of collateral token provided by the user
    @param _leverage_collateral Amount of collateral token obtained from leverage (borrowed swapped to collateral)
    @param _N Number of bands the deposit is made into
    @param _p_avg Average price of collateral in borrowed token expected from the leverage swap
    @return Maximum amount of borrowed token that can be borrowed with leverage
    """
    # max_borrowable = collateral / (1 / (k_effective * max_p_base) - 1 / p_avg)
    amm: IAMM = staticcall _controller.amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))
    borrowed_precision: uint256 = pow_mod256(10, convert(18 - staticcall borrowed_token.decimals(), uint256))
    collateral_precision: uint256 = pow_mod256(10, convert(18 - staticcall collateral_token.decimals(), uint256))

    user_collateral: uint256 = _user_collateral * collateral_precision
    leverage_collateral: uint256 = _leverage_collateral * collateral_precision
    k_effective: uint256 = self._get_k_effective(_controller, user_collateral + leverage_collateral, _N)

    A: uint256 = staticcall amm.A()
    max_p_base: uint256 = ControllerView._max_p_base(amm, math._wad_ln(convert(A * WAD // (A - 1), int256)))
    max_borrowable: uint256 = user_collateral * WAD // (10**36 // k_effective * WAD // max_p_base - 10**36 // _p_avg)
    max_borrowable = max_borrowable // borrowed_precision

    return min(max_borrowable, staticcall _controller.available_balance()) # Cannot borrow beyond the amount of coins Controller has

@internal
@view
def _get_k_effective(_controller: IController, _collateral: uint256, _N: uint256) -> uint256:
    """
    @notice Intermediary method which calculates k_effective defined as x_effective / p_base / y,
            however discounted by loan_discount.
            x_effective is an amount which can be obtained from collateral when liquidating
    @param _controller Controller of the market
    @param _collateral Total collateral deposited into the bands
    @param _N Number of bands the deposit is made into
    @return k_effective
    """
    # x_effective = sum_{i=0..N-1}(y / N * p(n_{n1+i})) =
    # = y / N * p_oracle_up(n1) * sqrt((A - 1) / A) * sum_{0..N-1}(((A-1) / A)**k)
    # === d_y_effective * p_oracle_up(n1) * sum(...) === y * k_effective * p_oracle_up(n1)
    # d_k_effective = 1 / N / sqrt(A / (A - 1))
    # d_k_effective: uint256 = 10**18 * unsafe_sub(10**18, discount) / (SQRT_BAND_RATIO * N)
    # Make some extra discount to always deposit lower when we have DEAD_SHARES rounding
    A: uint256 = staticcall (staticcall _controller.amm()).A()
    SQRT_BAND_RATIO: uint256 = isqrt(unsafe_div(10 ** 36 * A, unsafe_sub(A, 1)))

    discount: uint256 = staticcall _controller.loan_discount()
    d_k_effective: uint256 = WAD * unsafe_sub(
        WAD, min(discount + (DEAD_SHARES * WAD) // max(_collateral // _N, DEAD_SHARES), WAD)
    ) // (SQRT_BAND_RATIO * _N)
    k_effective: uint256 = d_k_effective
    for _: uint256 in range(1, _N, bound=MAX_TICKS_UINT):
        d_k_effective = unsafe_div(d_k_effective * (A - 1), A)
        k_effective = unsafe_add(k_effective, d_k_effective)
    return k_effective
```

</TabItem>
<TabItem value="ControllerView.vy" label="ControllerView.vy">

```vyper
MAX_P_BASE_BANDS: constant(int256) = 5
MAX_SKIP_TICKS: constant(uint256) = c.MAX_SKIP_TICKS_UINT

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
```

</TabItem>
<TabItem value="constants.vy" label="constants.vy">

```vyper
MAX_TICKS_UINT: constant(uint256) = 50
MAX_SKIP_TICKS_UINT: constant(uint256) = 1024

DEAD_SHARES: constant(uint256) = 1000
WAD: constant(uint256) = 10**18
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

This example uses Ethereum market `0` (sDOLA collateral, crvUSD borrowed) with 1 sDOLA of user collateral, 10 bands and an expected swap price of 1.4 crvUSD per sDOLA.

<ContractCall
  address="0x5D847c892891B503c3483D3Abbc2a23774279b85"
  abi={["function max_borrowable(address, uint256, uint256, uint256, uint256) view returns (uint256)"]}
  method="max_borrowable"
  args={["0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0", "1000000000000000000", "0", "10", "1400000000000000000"]}
  labels={["_controller", "_user_collateral", "_leverage_collateral", "_N", "_p_avg"]}
  contractName="LeverageZap"
/>

</Example>

::::

---

## Exchange Whitelist

The zap only calls exchanges on its whitelist. The current state on Ethereum is listed in the [Leverage overview](./leverage-overview.md#leveragezap). The live examples on this page query the Ethereum deployment only.

### `is_approved_exchange`
::::description[`LeverageZapLend.is_approved_exchange(arg0: address) -> bool: view`]

Returns whether an exchange (pool or router) is on the whitelist of addresses the zap may `raw_call` during the callbacks.

| Input  | Type      | Description              |
| ------ | --------- | ------------------------ |
| `arg0` | `address` | Address of the exchange. |

Returns: whether the exchange is approved (`bool`).

<SourceCode>

```vyper
# Whitelist of exchanges (routers/pools) the zap is allowed to `raw_call`
is_approved_exchange: public(HashMap[address, bool])
```

</SourceCode>

<Example>

<ContractCall
  address="0x5D847c892891B503c3483D3Abbc2a23774279b85"
  abi={["function is_approved_exchange(address) view returns (bool)"]}
  method="is_approved_exchange"
  args={["0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e"]}
  labels={["arg0"]}
  contractName="LeverageZap"
/>

</Example>

::::

### `set_exchange`
::::description[`LeverageZapLend.set_exchange(_exchange: address, _approved: bool)`]

:::guard[Guarded Method]
This function is only callable by the `admin` of the zap, which is not stored on the zap itself but read from the `LendFactory` it is bound to (`FACTORY.admin()`). Whoever controls the factory therefore also controls which exchanges the zap may call.
:::

Adds an exchange to, or removes it from, the whitelist of addresses the zap may call during the leverage callbacks.

| Input       | Type      | Description                               |
| ----------- | --------- | ----------------------------------------- |
| `_exchange` | `address` | Address of the exchange (pool or router). |
| `_approved` | `bool`    | `True` to whitelist, `False` to remove.   |

Emits: `SetExchange` event.

<SourceCode>

```vyper
event SetExchange:
    exchange: indexed(address)
    approved: bool

@external
def set_exchange(_exchange: address, _approved: bool):
    """
    @notice Add or remove an exchange (router/pool) from the whitelist of
            targets the zap is allowed to call during leverage callbacks
    @param _exchange Address of the exchange
    @param _approved Whether the exchange is allowed
    """
    assert msg.sender == staticcall _LEND_FACTORY.admin(), "Only admin"
    self._set_exchange(_exchange, _approved)

@internal
def _set_exchange(_exchange: address, _approved: bool):
    self.is_approved_exchange[_exchange] = _approved
    log ILeverageZap.SetExchange(exchange=_exchange, approved=_approved)
```

</SourceCode>

<Example>

```shell
>>> LeverageZap.set_exchange("0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf", False)
```

</Example>

::::

---

## Other Methods

### `FACTORY`
::::description[`LeverageZapLend.FACTORY() -> address: view`]

Returns the `LendFactory` the zap is bound to. The `controller_id` in the callback data is resolved through this factory, and its `admin` manages the exchange whitelist. Set at deployment and immutable.

Returns: factory (`address`).

<SourceCode>

```vyper
_LEND_FACTORY: immutable(ILendFactory)

@deploy
def __init__(_factory: address, _exchanges: DynArray[address, MAX_INIT_EXCHANGES]):
    """
    @notice Contract constructor
    @param _factory Address of the factory the zap is associated with (used to look up controllers and the admin)
    @param _exchanges Initial list of exchanges (routers/pools) to add to the whitelist
    """
    _LEND_FACTORY = ILendFactory(_factory)

    for exchange: address in _exchanges:
        self._set_exchange(exchange, True)

@external
@view
def FACTORY() -> address:
    """
    @notice Factory the zap is associated with
    @return Address of the factory
    """
    return _LEND_FACTORY.address
```

</SourceCode>

<Example>

<ContractCall
  address="0x5D847c892891B503c3483D3Abbc2a23774279b85"
  abi={["function FACTORY() view returns (address)"]}
  method="FACTORY"
  contractName="LeverageZap"
/>

</Example>

::::

### `admin`
::::description[`LeverageZapLend.admin() -> address: view`]

Returns the admin allowed to manage the exchange whitelist. The value is read live from the factory (`LendFactory.admin()`).

Returns: admin (`address`).

<SourceCode>

```vyper
@external
@view
def admin() -> address:
    """
    @notice Admin allowed to manage the exchange whitelist, delegated to the factory
    @return Address of the admin
    """
    return staticcall _LEND_FACTORY.admin()
```

</SourceCode>

<Example>

<ContractCall
  address="0x5D847c892891B503c3483D3Abbc2a23774279b85"
  abi={["function admin() view returns (address)"]}
  method="admin"
  contractName="LeverageZap"
/>

</Example>

::::
