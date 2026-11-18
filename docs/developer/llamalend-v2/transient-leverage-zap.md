import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TransientLeverageZap

The `TransientLeverageZapLend` contract creates, increases and unwinds **leveraged positions** on Llamalend v2 lending markets in a single transaction. The user calls the zap, which stores the swap parameters in transient storage and calls the market's controller on their behalf. The controller then calls back into the zap to execute the swap through a whitelisted exchange.

Users have to approve the zap on the market's controller (`controller.approve(zap, True)`) before using it. For how the zap works, the integration flow and the exchange whitelist, see the [Leverage overview](./leverage-overview.md).

:::vyper[`TransientLeverageZapLend.vy`]

The source code for the `TransientLeverageZapLend.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/zaps/transient_leverage_zap/TransientLeverageZapLend.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed on :logos-ethereum: Ethereum at [`0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2`](https://etherscan.io/address/0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2) and on :logos-optimism: Optimism at [`0xA7a4bb50AF91f90b6fEb3388E7f8286aF45b299B`](https://optimistic.etherscan.io/address/0xA7a4bb50AF91f90b6fEb3388E7f8286aF45b299B). Each deployment is bound to the Llamalend v2 [LendFactory](./lend-factory.md) on its chain: [`0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd`](https://etherscan.io/address/0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd) on Ethereum and [`0x5F94073E3f51c1FFf92ffc6b4B06b7Af193B3640`](https://optimistic.etherscan.io/address/0x5F94073E3f51c1FFf92ffc6b4B06b7Af193B3640) on Optimism.

<ContractABI>

```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"exchange","type":"address"},{"indexed":false,"name":"approved","type":"bool"}],"name":"SetExchange","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"controller","type":"address"},{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"leverage_collateral","type":"uint256"},{"indexed":false,"name":"d_debt","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"controller","type":"address"},{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"state_collateral_used","type":"uint256"},{"indexed":false,"name":"borrowed_from_state_collateral","type":"uint256"}],"name":"Repay","type":"event"},{"inputs":[{"name":"_controller","type":"address"},{"name":"_user_collateral","type":"uint256"},{"name":"_leverage_collateral","type":"uint256"},{"name":"_N","type":"uint256"},{"name":"_p_avg","type":"uint256"}],"name":"max_borrowable","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_controller","type":"address"},{"name":"_user_collateral","type":"uint256"},{"name":"_leverage_collateral","type":"uint256"},{"name":"_N","type":"uint256"},{"name":"_p_avg","type":"uint256"},{"name":"_user","type":"address"}],"name":"max_borrowable","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_borrowed","type":"uint256"},{"name":"_user_collateral","type":"uint256"},{"name":"_d_debt","type":"uint256"},{"name":"_calldata","type":"bytes"}],"name":"callback_deposit","outputs":[{"name":"","type":"uint256[2]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_borrowed","type":"uint256"},{"name":"_collateral","type":"uint256"},{"name":"_debt","type":"uint256"},{"name":"_calldata","type":"bytes"}],"name":"callback_repay","outputs":[{"name":"","type":"uint256[2]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller_id","type":"uint256"},{"name":"_collateral","type":"uint256"},{"name":"_debt","type":"uint256"},{"name":"_N","type":"uint256"},{"name":"_min_recv","type":"uint256"},{"name":"_exchange_address","type":"address"},{"name":"_exchange_calldata","type":"bytes"}],"name":"create_loan","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller_id","type":"uint256"},{"name":"_collateral","type":"uint256"},{"name":"_debt","type":"uint256"},{"name":"_min_recv","type":"uint256"},{"name":"_exchange_address","type":"address"},{"name":"_exchange_calldata","type":"bytes"}],"name":"borrow_more","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller_id","type":"uint256"},{"name":"_wallet_d_debt","type":"uint256"},{"name":"_collateral_to_spend","type":"uint256"},{"name":"_min_recv","type":"uint256"},{"name":"_exchange_address","type":"address"},{"name":"_exchange_calldata","type":"bytes"}],"name":"repay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller_id","type":"uint256"},{"name":"_wallet_d_debt","type":"uint256"},{"name":"_collateral_to_spend","type":"uint256"},{"name":"_min_recv","type":"uint256"},{"name":"_exchange_address","type":"address"},{"name":"_exchange_calldata","type":"bytes"},{"name":"_max_active_band","type":"int256"}],"name":"repay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller_id","type":"uint256"},{"name":"_wallet_d_debt","type":"uint256"},{"name":"_collateral_to_spend","type":"uint256"},{"name":"_min_recv","type":"uint256"},{"name":"_exchange_address","type":"address"},{"name":"_exchange_calldata","type":"bytes"},{"name":"_max_active_band","type":"int256"},{"name":"_shrink","type":"bool"}],"name":"repay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"FACTORY","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_exchange","type":"address"},{"name":"_approved","type":"bool"}],"name":"set_exchange","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"is_approved_exchange","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_factory","type":"address"},{"name":"_exchanges","type":"address[]"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"}]
```

</ContractABI>

:::

---

## Leverage

### `create_loan`
::::description[`TransientLeverageZapLend.create_loan(_controller_id: uint256, _collateral: uint256, _debt: uint256, _N: uint256, _min_recv: uint256, _exchange_address: address, _exchange_calldata: Bytes[32000])`]

Creates a new leveraged loan for `msg.sender`. The zap pulls `_collateral` from the caller, then calls the controller's `create_loan` on their behalf. Inside the callback, up to `_debt` of the borrowed token is swapped into collateral through `_exchange_address`, and the swap output is added to the position as extra collateral. Any borrowed tokens the exchange did not spend are refunded to the caller at the end.

The caller must have approved the zap on the controller and approved the zap to spend `_collateral` of the collateral token.

| Input                | Type                | Description                                                                               |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `_controller_id`     | `uint256`           | Index of the market in the `LendFactory`.                                                 |
| `_collateral`        | `uint256`           | Amount of collateral token provided by the caller.                                        |
| `_debt`              | `uint256`           | Amount of borrowed token to borrow and swap for collateral; also caps what the exchange may spend. |
| `_N`                 | `uint256`           | Number of bands to deposit into.                                                          |
| `_min_recv`          | `uint256`           | Minimum amount of collateral the swap must return (slippage protection).                  |
| `_exchange_address`  | `address`           | Whitelisted exchange (pool or router) to swap borrowed token → collateral.                |
| `_exchange_calldata` | `Bytes[32000]`      | Calldata passed to the exchange via `raw_call`.                                           |

Emits: `Deposit` event.

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

```vyper
from curve_std import token as tkn

EXCHANGE_CALLDATA_MAX_SIZE: constant(uint256) = zc.EXCHANGE_CALLDATA_MAX_SIZE

_LEND_FACTORY: immutable(ILendFactory)

stashed_controller: transient(address)
stashed_exchange: transient(address)
stashed_max_spent: transient(uint256)
stashed_min_recv: transient(uint256)
stashed_calldata: transient(Bytes[EXCHANGE_CALLDATA_MAX_SIZE])
stashed_held: transient(uint256)

@external
def create_loan(
        _controller_id: uint256,
        _collateral: uint256,
        _debt: uint256,
        _N: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
):
    """
    @notice Create a leveraged position
    @dev Requires `controller.approve(zap, True)` from the caller, since the zap
         creates the loan on their behalf
    @param _controller_id Index of the market in the factory
    @param _collateral Amount of collateral token provided by the caller
    @param _debt Amount to borrow and swap for collateral
    @param _N Number of bands to deposit into
    @param _min_recv Minimum amount of collateral to receive from the exchange
    @param _exchange_address Address of the exchange (e. g. pool, router) to swap borrowed -> collateral
    @param _exchange_calldata Data for the exchange
    """
    self._create_loan(
        (staticcall _LEND_FACTORY.markets(_controller_id)).controller,
        _collateral,
        _debt,
        _N,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
    )

@internal
def _create_loan(
        _controller: IController,
        _collateral: uint256,
        _debt: uint256,
        _N: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
):
    amm: IAMM = staticcall _controller.amm()
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    # The controller pulls `_collateral` from us (we are its `msg.sender`), so it has
    # to be here before the call, parked rather than swapped - see `stashed_held`.
    tkn.transfer_from(collateral_token, msg.sender, self, _collateral)
    self._stash(
        _controller.address,
        _debt,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
        staticcall collateral_token.balanceOf(self),
    )

    extcall _controller.create_loan(_collateral, _debt, _N, msg.sender, self, b"")

    self._unstash()
    self._refund(amm)

@internal
def _stash(
        _controller: address,
        _max_spent: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
        _held: uint256,
):
    """
    @notice Park the swap parameters for the controller call which is about to be made
    @dev The entry points cannot use `@nonreentrant`: the callback takes that lock while
         the entry point is still on the stack. A non-empty `stashed_controller` guards
         them instead - it is only set while a call started here is running.
    """
    assert self.stashed_controller == empty(address), "Reentrancy"
    assert _controller != empty(address)  # dev: would leave the callback unguarded

    self.stashed_controller = _controller
    self.stashed_max_spent = _max_spent
    self.stashed_min_recv = _min_recv
    self.stashed_exchange = _exchange_address
    self.stashed_calldata = _exchange_calldata
    self.stashed_held = _held

@internal
def _unstash():
    self.stashed_controller = empty(address)
    self.stashed_max_spent = 0
    self.stashed_min_recv = 0
    self.stashed_exchange = empty(address)
    self.stashed_calldata = b""
    self.stashed_held = 0

@internal
def _refund(_amm: IAMM):
    """
    @notice Return everything the zap is left holding to the caller
    """
    for i: uint256 in range(2):
        token: IERC20 = IERC20(staticcall _amm.coins(i))
        tkn.transfer(token, msg.sender, staticcall token.balanceOf(self))
```

</TabItem>
<TabItem value="token.vy" label="token.vy (curve_std)">

```vyper
@internal
def transfer_from(token: IERC20, _from: address, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transferFrom(_from, _to, amount, default_return_value=True)

@internal
def transfer(token: IERC20, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transfer(_to, amount, default_return_value=True)
```

</TabItem>
<TabItem value="transient_leverage_zap_constants.vy" label="transient_leverage_zap_constants.vy">

```vyper
# Exchange calldata is handed straight to a zap and never travels through the
# controller, so it is not bounded by the controller's CALLDATA_MAX_SIZE - which
# aggregator routes regularly exceed.
EXCHANGE_CALLDATA_MAX_SIZE: constant(uint256) = 32 * 1000
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
# one-time setup
>>> LendController.approve(TransientLeverageZap, True)
>>> CollateralToken.approve(TransientLeverageZap, 10**18)

# 1 collateral token, borrow 2,000 borrowed tokens, 10 bands,
# require at least 1.4 collateral tokens from the swap
>>> TransientLeverageZap.create_loan(0, 10**18, 2000 * 10**18, 10, 14 * 10**17, CurveRouter, route_calldata)
```

</Example>

::::

### `borrow_more`
::::description[`TransientLeverageZapLend.borrow_more(_controller_id: uint256, _collateral: uint256, _debt: uint256, _min_recv: uint256, _exchange_address: address, _exchange_calldata: Bytes[32000])`]

Increases the leverage of an existing position of `msg.sender`. Works like `create_loan`, but calls the controller's `borrow_more`: the zap pulls `_collateral` (may be `0`), borrows `_debt` more, swaps it into collateral through `_exchange_address` and adds both to the position. Leftover tokens are refunded to the caller.

The caller must have approved the zap on the controller and, if `_collateral > 0`, approved the zap to spend the collateral token.

| Input                | Type           | Description                                                                 |
| -------------------- | -------------- | --------------------------------------------------------------------------- |
| `_controller_id`     | `uint256`      | Index of the market in the `LendFactory`.                                   |
| `_collateral`        | `uint256`      | Amount of collateral token provided by the caller.                          |
| `_debt`              | `uint256`      | Additional amount of borrowed token to borrow and swap for collateral.      |
| `_min_recv`          | `uint256`      | Minimum amount of collateral the swap must return.                          |
| `_exchange_address`  | `address`      | Whitelisted exchange to swap borrowed token → collateral.                   |
| `_exchange_calldata` | `Bytes[32000]` | Calldata passed to the exchange via `raw_call`.                             |

Emits: `Deposit` event.

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

```vyper
@external
def borrow_more(
        _controller_id: uint256,
        _collateral: uint256,
        _debt: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
):
    """
    @notice Increase leverage on an existing position
    @dev Requires `controller.approve(zap, True)` from the caller
    @param _controller_id Index of the market in the factory
    @param _collateral Amount of collateral token provided by the caller
    @param _debt Amount to borrow and swap for collateral
    @param _min_recv Minimum amount of collateral to receive from the exchange
    @param _exchange_address Address of the exchange (e. g. pool, router) to swap borrowed -> collateral
    @param _exchange_calldata Data for the exchange
    """
    self._borrow_more(
        (staticcall _LEND_FACTORY.markets(_controller_id)).controller,
        _collateral,
        _debt,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
    )

@internal
def _borrow_more(
        _controller: IController,
        _collateral: uint256,
        _debt: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
):
    amm: IAMM = staticcall _controller.amm()
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    tkn.transfer_from(collateral_token, msg.sender, self, _collateral)
    self._stash(
        _controller.address,
        _debt,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
        staticcall collateral_token.balanceOf(self),
    )

    extcall _controller.borrow_more(_collateral, _debt, msg.sender, self, b"")

    self._unstash()
    self._refund(amm)
```

</TabItem>
<TabItem value="token.vy" label="token.vy (curve_std)">

```vyper
@internal
def transfer_from(token: IERC20, _from: address, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transferFrom(_from, _to, amount, default_return_value=True)

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
# add 0.5 collateral tokens and borrow 1,000 more borrowed tokens for leverage
>>> TransientLeverageZap.borrow_more(0, 5 * 10**17, 1000 * 10**18, 7 * 10**17, CurveRouter, route_calldata)
```

</Example>

::::

### `repay`
::::description[`TransientLeverageZapLend.repay(_controller_id: uint256, _wallet_d_debt: uint256, _collateral_to_spend: uint256, _min_recv: uint256, _exchange_address: address, _exchange_calldata: Bytes[32000], _max_active_band: int256 = max_value(int256), _shrink: bool = False)`]

Deleverages a position of `msg.sender` by selling part of its collateral for the borrowed token and repaying debt with the proceeds. The caller can top up the repayment with `_wallet_d_debt` borrowed tokens from their wallet.

Before calling the controller, the zap sends any collateral it already holds to the caller (otherwise that dust would be counted as swap leftovers), then pulls `_wallet_d_debt` from the caller, capped at the caller's current debt. Passing `max_value(uint256)` therefore means "as much as needed". During the callback, the exchange may spend at most `_collateral_to_spend` of the position's collateral. If the debt is fully repaid, only the part the swap did not cover is used, and the rest is refunded together with any remaining collateral.

The caller must have approved the zap on the controller and, if `_wallet_d_debt > 0`, approved the zap to spend the borrowed token.

| Input                  | Type           | Description                                                                                                  |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| `_controller_id`       | `uint256`      | Index of the market in the `LendFactory`.                                                                    |
| `_wallet_d_debt`       | `uint256`      | Amount of borrowed token the caller adds from their wallet; capped at the outstanding debt.                  |
| `_collateral_to_spend` | `uint256`      | Maximum amount of the position's collateral the exchange may take. Pass `max_value(uint256)` for no cap.     |
| `_min_recv`            | `uint256`      | Minimum amount of borrowed token the swap must return.                                                       |
| `_exchange_address`    | `address`      | Whitelisted exchange to swap collateral → borrowed token.                                                    |
| `_exchange_calldata`   | `Bytes[32000]` | Calldata passed to the exchange via `raw_call`.                                                              |
| `_max_active_band`     | `int256`       | Revert if the AMM's active band is higher than this (front-running protection). Defaults to `max_value(int256)`. |
| `_shrink`              | `bool`         | Whether to shrink the soft-liquidated part of the position. Defaults to `False`.                             |

Emits: `Repay` event.

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

```vyper
@external
def repay(
        _controller_id: uint256,
        _wallet_d_debt: uint256,
        _collateral_to_spend: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
        _max_active_band: int256 = max_value(int256),
        _shrink: bool = False,
):
    """
    @notice Deleverage a position, selling its collateral for the borrowed token
    @dev Requires `controller.approve(zap, True)` from the caller. `_wallet_d_debt` is
         pulled from the caller up front, capped at the outstanding debt, so
         `max_value(uint256)` means "as much as needed". A full repay only consumes the
         part the swap did not cover; the rest is refunded.
    @param _controller_id Index of the market in the factory
    @param _wallet_d_debt Amount of borrowed token the caller adds from their wallet
    @param _collateral_to_spend Maximum amount of state collateral the exchange is allowed to take.
           Pass exactly `max_value(uint256)` for no cap
    @param _min_recv Minimum amount of borrowed token to receive from the exchange
    @param _exchange_address Address of the exchange (e. g. pool, router) to swap collateral -> borrowed
    @param _exchange_calldata Data for the exchange
    @param _max_active_band Don't allow active band to be higher than this (to prevent front-running the repay)
    @param _shrink Whether to shrink the soft-liquidated part of the position
    """
    self._repay(
        (staticcall _LEND_FACTORY.markets(_controller_id)).controller,
        _wallet_d_debt,
        _collateral_to_spend,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
        _max_active_band,
        _shrink,
    )

@internal
def _repay(
        _controller: IController,
        _wallet_d_debt: uint256,
        _collateral_to_spend: uint256,
        _min_recv: uint256,
        _exchange_address: address,
        _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE],
        _max_active_band: int256,
        _shrink: bool,
):
    amm: IAMM = staticcall _controller.amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    # The controller sends the position's collateral here and takes back whatever the
    # swap left, refusing to take back more than it sent. Collateral already sitting
    # here would be part of that leftover, so it has to go before the call - otherwise
    # dust exceeding the swapped amount reverts the repay.
    tkn.transfer(collateral_token, msg.sender, staticcall collateral_token.balanceOf(self))

    # Whatever the swap does not cover is pulled from us by the controller, so the
    # wallet part of the repayment has to be here before the call. What is left over
    # (a full repay only takes the shortfall) is refunded at the end. Capped at the
    # debt so that `max_value(uint256)` keeps meaning "as much as needed".
    wallet_d_debt: uint256 = min(_wallet_d_debt, staticcall _controller.debt(msg.sender))
    tkn.transfer_from(borrowed_token, msg.sender, self, wallet_d_debt)
    self._stash(
        _controller.address,
        _collateral_to_spend,
        _min_recv,
        _exchange_address,
        _exchange_calldata,
        staticcall borrowed_token.balanceOf(self),
    )

    extcall _controller.repay(wallet_d_debt, msg.sender, _max_active_band, self, b"", _shrink)

    self._unstash()
    self._refund(amm)
```

</TabItem>
<TabItem value="token.vy" label="token.vy (curve_std)">

```vyper
@internal
def transfer_from(token: IERC20, _from: address, _to: address, amount: uint256):
    if amount > 0:
        assert extcall token.transferFrom(_from, _to, amount, default_return_value=True)

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
# sell up to 1 collateral token for at least 1,350 borrowed tokens, no wallet top-up
>>> TransientLeverageZap.repay(0, 0, 10**18, 1350 * 10**18, CurveRouter, route_calldata)

# close the position: sell collateral and cover any shortfall from the wallet
>>> BorrowedToken.approve(TransientLeverageZap, 2**256 - 1)
>>> TransientLeverageZap.repay(0, 2**256 - 1, 2**256 - 1, min_recv, CurveRouter, route_calldata)
```

</Example>

::::

---

## Calculations

### `max_borrowable`
::::description[`TransientLeverageZapLend.max_borrowable(_controller: IController, _user_collateral: uint256, _leverage_collateral: uint256, _N: uint256, _p_avg: uint256, _user: address = empty(address)) -> uint256: view`]

Calculates the maximum amount of borrowed token that can be borrowed with leverage, given the user's own collateral and the average price expected from the leverage swap. The formula is

$$
\text{max\_borrowable} = \frac{\text{user\_collateral}}{\frac{1}{k_{\text{effective}} \cdot p_{\text{max\_base}}} - \frac{1}{p_{\text{avg}}}}
$$

where $k_{\text{effective}}$ discounts the collateral value by the market's `loan_discount` plus the `extra_health` the user has set on the controller, and $p_{\text{max\_base}}$ is the highest base price the position could be deposited at. The result is capped at the controller's `available_balance()`.

Unlike the other functions, this one takes the **controller address**, not the market index. `_N` must be between `4` and `50`.

| Input                  | Type          | Description                                                                                 |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `_controller`          | `IController` | Controller of the market.                                                                   |
| `_user_collateral`     | `uint256`     | Amount of collateral token provided by the user.                                            |
| `_leverage_collateral` | `uint256`     | Amount of collateral token expected from the leverage swap.                                 |
| `_N`                   | `uint256`     | Number of bands.                                                                            |
| `_p_avg`               | `uint256`     | Average price of collateral in borrowed token expected from the swap (18 decimals).         |
| `_user`                | `address`     | User whose `extra_health` is applied. Only needed if it is non-zero; defaults to `empty(address)`. |

Returns: maximum borrowable amount of borrowed token (`uint256`).

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

```vyper
WAD: constant(uint256) = c.WAD
DEAD_SHARES: constant(uint256) = c.DEAD_SHARES
MIN_TICKS_UINT: constant(uint256) = c.MIN_TICKS_UINT
MAX_TICKS_UINT: constant(uint256) = c.MAX_TICKS_UINT

@external
@view
def max_borrowable(
        _controller: IController,
        _user_collateral: uint256,
        _leverage_collateral: uint256,
        _N: uint256,
        _p_avg: uint256,
        _user: address = empty(address),
) -> uint256:
    """
    @notice Calculation of maximum which can be borrowed with leverage
    @param _controller Controller of the market
    @param _user_collateral Amount of collateral token provided by the user
    @param _leverage_collateral Amount of collateral token obtained from leverage (borrowed swapped to collateral)
    @param _N Number of bands the deposit is made into
    @param _p_avg Average price of collateral in borrowed token expected from the leverage swap
    @param _user User to calculate the value for (only necessary for nonzero extra_health)
    @return Maximum amount of borrowed token that can be borrowed with leverage
    """
    assert _N >= MIN_TICKS_UINT and _N <= MAX_TICKS_UINT, "Wrong N"

    # max_borrowable = collateral / (1 / (k_effective * max_p_base) - 1 / p_avg)
    amm: IAMM = staticcall _controller.amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))
    borrowed_precision: uint256 = pow_mod256(10, convert(18 - staticcall borrowed_token.decimals(), uint256))
    collateral_precision: uint256 = pow_mod256(10, convert(18 - staticcall collateral_token.decimals(), uint256))

    user_collateral: uint256 = _user_collateral * collateral_precision
    leverage_collateral: uint256 = _leverage_collateral * collateral_precision
    k_effective: uint256 = self._get_k_effective(_controller, user_collateral + leverage_collateral, _N, _user)

    A: uint256 = staticcall amm.A()
    max_p_base: uint256 = ControllerView._max_p_base(amm, math._wad_ln(convert(A * WAD // (A - 1), int256)))
    max_borrowable: uint256 = user_collateral * WAD // (10**36 // k_effective * WAD // max_p_base - 10**36 // _p_avg)
    max_borrowable = max_borrowable // borrowed_precision

    return min(max_borrowable, staticcall _controller.available_balance()) # Cannot borrow beyond the amount of coins Controller has

@internal
@view
def _get_k_effective(_controller: IController, _collateral: uint256, _N: uint256, _user: address) -> uint256:
    """
    @notice Intermediary method which calculates k_effective defined as x_effective / p_base / y,
            however discounted by loan_discount + extra_health of the user.
            x_effective is an amount which can be obtained from collateral when liquidating
    @param _controller Controller of the market
    @param _collateral Total collateral deposited into the bands
    @param _N Number of bands the deposit is made into
    @param _user User whose extra_health is applied
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

    discount: uint256 = staticcall _controller.loan_discount() + staticcall _controller.extra_health(_user)
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
MIN_TICKS_UINT: constant(uint256) = 4
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
  address="0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2"
  abi={["function max_borrowable(address, uint256, uint256, uint256, uint256) view returns (uint256)"]}
  method="max_borrowable"
  args={["0xc77d97cf01737eb7ace46cab7cd9f60ec51a40c0", "1000000000000000000", "0", "10", "1400000000000000000"]}
  labels={["_controller", "_user_collateral", "_leverage_collateral", "_N", "_p_avg"]}
  contractName="TransientLeverageZap"
/>

</Example>

::::

---

## Callbacks

The controller calls these functions during `create_loan`, `borrow_more` and `repay`. They can only run inside a call started by one of the zap's own entry points; calling them directly reverts.

### `callback_deposit`
::::description[`TransientLeverageZapLend.callback_deposit(_user: address, _borrowed: uint256, _user_collateral: uint256, _d_debt: uint256, _calldata: Bytes[32]) -> uint256[2]`]

:::guard[Guarded Method]
This function can only be called by the controller that the zap itself is currently calling, which is stored in the transient `stashed_controller` variable. Outside of a `create_loan` or `borrow_more` call started through the zap, `stashed_controller` is empty and the call reverts with `"wrong controller"`.
:::

Called by the controller after it has sent the newly borrowed `_d_debt` to the zap. The zap approves the stashed exchange for at most `stashed_max_spent` borrowed tokens, executes the stashed swap, revokes the approval and checks that the collateral received (the zap's collateral balance minus the balance stashed before the call) is at least `stashed_min_recv`. It returns `[0, leverage_collateral]`; the controller then pulls the leverage collateral from the zap. Borrowed tokens the exchange did not spend stay in the zap and are refunded by the entry point.

| Input              | Type        | Description                                                            |
| ------------------ | ----------- | ---------------------------------------------------------------------- |
| `_user`            | `address`   | Owner of the position.                                                 |
| `_borrowed`        | `uint256`   | Always `0`.                                                            |
| `_user_collateral` | `uint256`   | Collateral provided by the user (unused).                              |
| `_d_debt`          | `uint256`   | Amount being borrowed in addition to the existing debt.                |
| `_calldata`        | `Bytes[32]` | Unused and always empty; swap parameters are read from transient storage. |

Returns: `[0, leverage_collateral]` (`uint256[2]`).

Emits: `Deposit` event.

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

```vyper
event Deposit:
    controller: indexed(address)
    user: indexed(address)
    leverage_collateral: uint256
    d_debt: uint256

CALLBACK_CALLDATA_MAX_SIZE: constant(uint256) = zc.CALLBACK_CALLDATA_MAX_SIZE

@external
@nonreentrant
def callback_deposit(
        _user: address,
        _borrowed: uint256,
        _user_collateral: uint256,
        _d_debt: uint256,
        _calldata: Bytes[CALLBACK_CALLDATA_MAX_SIZE],
) -> uint256[2]:
    """
    @notice Callback method called by the controller to create a leveraged position
    @dev Only reachable from a controller call started by this zap's own entry points
    @param _user Address of the user
    @param _borrowed Always 0
    @param _user_collateral The amount of collateral token provided by user (unused)
    @param _d_debt The amount to be borrowed (in addition to what has already been borrowed)
    @param _calldata Unused, always empty - the swap parameters are stashed instead
    @return [0, leverage_collateral]
    """
    controller: address = self._stashed_controller()
    amm: IAMM = staticcall IController(controller).amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    tkn.max_approve(collateral_token, controller)

    # Buy leverage_collateral for d_debt
    # The amount to be spent is specified inside the exchange_calldata, capped by the approval.
    self._execute_raw_call(borrowed_token, self.stashed_max_spent, self.stashed_exchange, self.stashed_calldata)

    # Everything the zap held before the swap belongs to the user, not to the exchange
    leverage_collateral: uint256 = (staticcall collateral_token.balanceOf(self)) - self.stashed_held
    assert leverage_collateral >= self.stashed_min_recv, "Slippage"

    log ITransientLeverageZap.Deposit(
        controller=controller,
        user=_user,
        leverage_collateral=leverage_collateral,
        d_debt=_d_debt,
    )

    # Borrowed tokens the exchange didn't spend stay here and are refunded by the entry
    # point (the controller requires the returned borrowed amount to be 0).
    return [0, leverage_collateral]

@internal
@view
def _stashed_controller() -> address:
    """
    @notice Controller of the call this zap started, asserting that it is the caller
    @dev Empty outside of an entry point, so the callbacks cannot be called from
         anywhere else - including through a controller the zap was not talking to
    @return Address of the controller
    """
    controller: address = self.stashed_controller
    assert msg.sender == controller and controller != empty(address), "wrong controller"
    return controller

@internal
def _execute_raw_call(_token: IERC20, _max_spent: uint256, _exchange_address: address, _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE]):
    assert self.is_approved_exchange[_exchange_address], "Exchange not approved"

    # Approve at most `_max_spent`, call the exchange, then revoke so it retains no allowance afterwards
    assert extcall _token.approve(_exchange_address, _max_spent, default_return_value=True)
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
```

</TabItem>
<TabItem value="transient_leverage_zap_constants.vy" label="transient_leverage_zap_constants.vy">

```vyper
# Size the transient zaps accept for the controller's callback `calldata` argument,
# which they do not use. Smallest usable value, so nothing can be routed through the
# controller by mistake.
CALLBACK_CALLDATA_MAX_SIZE: constant(uint256) = 32
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
# Not called directly. The controller calls it during TransientLeverageZap.create_loan / borrow_more.
>>> TransientLeverageZap.callback_deposit(user, 0, 10**18, 2000 * 10**18, b"")
Error: "wrong controller"
```

</Example>

::::

### `callback_repay`
::::description[`TransientLeverageZapLend.callback_repay(_user: address, _borrowed: uint256, _collateral: uint256, _debt: uint256, _calldata: Bytes[32]) -> uint256[2]`]

:::guard[Guarded Method]
This function can only be called by the controller that the zap itself is currently calling, which is stored in the transient `stashed_controller` variable. Outside of a `repay` call started through the zap, the call reverts with `"wrong controller"`.
:::

Called by the controller after it has sent the position's collateral to the zap. The zap approves the stashed exchange for at most `stashed_max_spent` collateral (the `_collateral_to_spend` passed to `repay`), executes the stashed swap and revokes the approval. It then checks that:

- the borrowed tokens received (the zap's borrowed balance minus the wallet top-up stashed before the call) are at least `stashed_min_recv` (`"Slippage"`);
- the zap's collateral balance actually decreased (`"Collateral must decrease"`);
- no more than `stashed_max_spent` collateral was used (`"Input slippage"`).

It returns the borrowed tokens obtained from the swap and the remaining collateral, which the controller uses to repay debt and to return collateral to the position.

| Input        | Type        | Description                                                              |
| ------------ | ----------- | ------------------------------------------------------------------------ |
| `_user`      | `address`   | Owner of the position.                                                   |
| `_borrowed`  | `uint256`   | Borrowed tokens in the position (from `user_state`).                     |
| `_collateral`| `uint256`   | Collateral in the position (from `user_state`).                          |
| `_debt`      | `uint256`   | Debt of the position (from `user_state`).                                |
| `_calldata`  | `Bytes[32]` | Unused and always empty; swap parameters are read from transient storage. |

Returns: `[borrowed_from_state_collateral, remaining_collateral]` (`uint256[2]`).

Emits: `Repay` event.

<SourceCode>

<Tabs>
<TabItem value="TransientLeverageZapLend.vy" label="TransientLeverageZapLend.vy">

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
        _calldata: Bytes[CALLBACK_CALLDATA_MAX_SIZE],
) -> uint256[2]:
    """
    @notice Callback method called by the controller to deleverage/repay a position
            using collateral from the user's position
    @dev Only reachable from a controller call started by this zap's own entry points
    @param _user Address of the user
    @param _borrowed The value from user_state
    @param _collateral The value from user_state
    @param _debt The value from user_state
    @param _calldata Unused, always empty - the swap parameters are stashed instead
    @return [borrowed_from_state_collateral, remaining_collateral]
    """
    controller: address = self._stashed_controller()
    amm: IAMM = staticcall IController(controller).amm()
    borrowed_token: IERC20 = IERC20(staticcall amm.coins(0))
    collateral_token: IERC20 = IERC20(staticcall amm.coins(1))

    initial_collateral: uint256 = staticcall collateral_token.balanceOf(self)

    tkn.max_approve(borrowed_token, controller)
    tkn.max_approve(collateral_token, controller)

    # Buy borrowed token for collateral from user's position.
    # The amount to be spent is specified inside the exchange_calldata, capped by the approval.
    self._execute_raw_call(collateral_token, self.stashed_max_spent, self.stashed_exchange, self.stashed_calldata)

    remaining_collateral: uint256 = staticcall collateral_token.balanceOf(self)
    # Everything the zap held before the swap belongs to the user, not to the exchange
    borrowed_from_state_collateral: uint256 = (staticcall borrowed_token.balanceOf(self)) - self.stashed_held
    assert borrowed_from_state_collateral >= self.stashed_min_recv, "Slippage"
    assert remaining_collateral < initial_collateral, "Collateral must decrease"
    state_collateral_used: uint256 = initial_collateral - remaining_collateral
    # Sanity check just in case, the approval already caps what the exchange can pull
    assert state_collateral_used <= self.stashed_max_spent, "Input slippage"

    log ITransientLeverageZap.Repay(
        controller=controller,
        user=_user,
        state_collateral_used=state_collateral_used,
        borrowed_from_state_collateral=borrowed_from_state_collateral,
    )

    return [borrowed_from_state_collateral, remaining_collateral]

@internal
@view
def _stashed_controller() -> address:
    controller: address = self.stashed_controller
    assert msg.sender == controller and controller != empty(address), "wrong controller"
    return controller

@internal
def _execute_raw_call(_token: IERC20, _max_spent: uint256, _exchange_address: address, _exchange_calldata: Bytes[EXCHANGE_CALLDATA_MAX_SIZE]):
    assert self.is_approved_exchange[_exchange_address], "Exchange not approved"

    # Approve at most `_max_spent`, call the exchange, then revoke so it retains no allowance afterwards
    assert extcall _token.approve(_exchange_address, _max_spent, default_return_value=True)
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
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
# Not called directly. The controller calls it during TransientLeverageZap.repay.
>>> TransientLeverageZap.callback_repay(user, 0, 10**18, 1000 * 10**18, b"")
Error: "wrong controller"
```

</Example>

::::

---

## Exchange Whitelist

The zap only calls exchanges on its whitelist. The exchanges added at deployment are listed in the [Leverage overview](./leverage-overview.md#transientleveragezap). The live examples on this page query the Ethereum deployment only.

### `is_approved_exchange`
::::description[`TransientLeverageZapLend.is_approved_exchange(arg0: address) -> bool: view`]

Returns whether an exchange (pool or router) is on the whitelist of addresses the zap may `raw_call` during the callbacks.

| Input  | Type      | Description             |
| ------ | --------- | ----------------------- |
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
  address="0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2"
  abi={["function is_approved_exchange(address) view returns (bool)"]}
  method="is_approved_exchange"
  args={["0x45312ea0eFf7E09C83CBE249fa1d7598c4C8cd4e"]}
  labels={["arg0"]}
  contractName="TransientLeverageZap"
/>

</Example>

::::

### `set_exchange`
::::description[`TransientLeverageZapLend.set_exchange(_exchange: address, _approved: bool)`]

:::guard[Guarded Method]
This function is only callable by the `admin` of the zap, which is not stored on the zap itself but read from the `LendFactory` it is bound to (`FACTORY.admin()`). Whoever controls the factory therefore also controls which exchanges the zap may call.
:::

Adds an exchange to, or removes it from, the whitelist of addresses the zap may call during the leverage callbacks.

| Input       | Type      | Description                                   |
| ----------- | --------- | --------------------------------------------- |
| `_exchange` | `address` | Address of the exchange (pool or router).     |
| `_approved` | `bool`    | `True` to whitelist, `False` to remove.       |

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
    log ITransientLeverageZap.SetExchange(exchange=_exchange, approved=_approved)
```

</SourceCode>

<Example>

```shell
>>> TransientLeverageZap.set_exchange("0x6131B5fae19EA4f9D964eAc0408E4408b66337b5", False)
```

</Example>

::::

---

## Other Methods

### `FACTORY`
::::description[`TransientLeverageZapLend.FACTORY() -> address: view`]

Returns the `LendFactory` the zap is bound to. Market indices passed to the entry points are resolved through this factory, and its `admin` manages the exchange whitelist. Set at deployment and immutable.

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
  address="0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2"
  abi={["function FACTORY() view returns (address)"]}
  method="FACTORY"
  contractName="TransientLeverageZap"
/>

</Example>

::::

### `admin`
::::description[`TransientLeverageZapLend.admin() -> address: view`]

Returns the admin allowed to manage the exchange whitelist. The value is read live from the factory (`LendFactory.admin()`), so a change of the factory admin applies to the zap immediately.

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
  address="0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2"
  abi={["function admin() view returns (address)"]}
  method="admin"
  contractName="TransientLeverageZap"
/>

</Example>

::::

### `version`
::::description[`TransientLeverageZapLend.version() -> String[5]: view`]

Returns the version of the contract.

Returns: version (`String[5]`).

<SourceCode>

```vyper
version: public(constant(String[5])) = "1.0.2"
```

</SourceCode>

<Example>

<ContractCall
  address="0xFE02553d3Ba4c3f39F36a4632F91404DF94b9AE2"
  abi={["function version() view returns (string)"]}
  method="version"
  contractName="TransientLeverageZap"
/>

</Example>

::::
