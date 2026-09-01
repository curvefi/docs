# LMCallback

`LMCallback` works like a liquidity gauge for the collateral side of a LlamaLend/crvUSD AMM: it tracks each band's and each user's share of collateral over time and streams CRV emissions to depositors accordingly, in the same way a `LiquidityGauge` streams CRV to LPs. It is deployed only on :logos-ethereum: Ethereum Mainnet, since the `CRV`, `GAUGE_CONTROLLER`, and `MINTER` addresses are hardcoded.

:::vyper[`LMCallback.vy`]

The source code for the `LMCallback.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lm_callback/LMCallback.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

This contract is not deployed as a single, canonical instance. It is a blueprint that [`CurveLMCallbackFactory`](./lm-callback-factory) deploys once per LlamaLend/crvUSD AMM market via `deploy_lm_callback()`. The current blueprint is deployed at [`0x61C404B60ee9c5fB09F70F9A645DD38fE5b3A956`](https://etherscan.io/address/0x61C404B60ee9c5fB09F70F9A645DD38fE5b3A956) — being a blueprint (ERC-5202), it cannot be interacted with directly; it only exists to be cloned by the factory.

Every LM Callback deployed from a blueprint can be looked up through the factory that deployed it:

- Verify a given address with `CurveLMCallbackFactory.is_valid_gauge(address) -> bool`
- Resolve a market's callback directly with `CurveLMCallbackFactory.get_lm_callback_by_amm(address) -> address`
- Enumerate deployed instances with `CurveLMCallbackFactory.get_lm_callback(uint256) -> address` and `CurveLMCallbackFactory.get_lm_callback_count() -> uint256`

info

This page documents the current blueprint, which introduced an `attached`/`detached` lifecycle. An earlier blueprint used a simpler `is_killed`/`set_killed` mechanism controlled by the factory owner; that mechanism no longer exists in the current version.

<ContractABI>


```json
[{"inputs":[{"name":"_amm","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"Attached","type":"event"},{"anonymous":false,"inputs":[],"name":"Detached","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_rate","type":"uint256"},{"indexed":false,"name":"future_epoch_time","type":"uint256"}],"name":"UpdateInflationRate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"rpc","type":"uint256"},{"indexed":false,"name":"t","type":"uint256"}],"name":"CheckpointRPC","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"n","type":"int256"},{"indexed":false,"name":"rps","type":"uint256"},{"indexed":false,"name":"collateral_per_share","type":"uint256"}],"name":"CheckpointBand","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"integrate_fraction","type":"uint256"}],"name":"CheckpointUser","type":"event"},{"stateMutability":"view","type":"function","name":"total_collateral","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"user_collateral","inputs":[{"name":"user","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"callback_collateral_shares","inputs":[{"name":"n_start","type":"int256"},{"name":"collateral_per_share","type":"uint256[]"},{"name":"size","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"callback_user_shares","inputs":[{"name":"user","type":"address"},{"name":"n_start","type":"int256"},{"name":"old_user_shares","type":"uint256[]"},{"name":"size","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"user_checkpoint","inputs":[{"name":"addr","type":"address"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"claimable_tokens","inputs":[{"name":"addr","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"factory","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"AMM","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"COLLATERAL_TOKEN","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"attached","inputs":[],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"detached","inputs":[],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"collateral_per_share","inputs":[{"name":"arg0","type":"int256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"inflation_rate","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_epoch_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"I_rpc","inputs":[],"outputs":[{"name":"","type":"tuple","components":[{"name":"rpc","type":"uint256"},{"name":"t","type":"uint256"}]}]},{"stateMutability":"view","type":"function","name":"I_rps","inputs":[{"name":"arg0","type":"int256"}],"outputs":[{"name":"","type":"tuple","components":[{"name":"rps","type":"uint256"},{"name":"rpc","type":"uint256"}]}]},{"stateMutability":"view","type":"function","name":"I_rpu","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"int256"}],"outputs":[{"name":"","type":"tuple","components":[{"name":"rpu","type":"uint256"},{"name":"rps","type":"uint256"}]}]},{"stateMutability":"view","type":"function","name":"integrate_fraction","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]}]
```

</ContractABI>

:::

## AMM Callbacks

### `callback_collateral_shares`
::::description[`LMCallback.callback_collateral_shares(n_start: int256, collateral_per_share: DynArray[uint256, MAX_TICKS_UINT], size: uint256)`]

:::guard[Guarded Method]
This function can only be called by the `AMM` this LM Callback is deployed for. The AMM invokes it on every action that changes band balances, before `callback_user_shares`.
:::

Checkpoints the CRV emission shares owed across a range of bands. If this LM Callback is not currently attached (see `attached`), the call is a no-op. Otherwise it advances the global rewards-per-collateral integral (accruing CRV emissions since the last checkpoint, weighted by the gauge's relative weight in `GaugeController`) and then the rewards-per-share integral for each band in the range, using each band's collateral-per-share ratio taken **before** the AMM action that triggered the callback.

| Input                   | Type                              | Description                                             |
| ------------------------ | ---------------------------------- | ----------------------------------------------------------------- |
| `n_start`                 | `int256`                          | Index of the first band to checkpoint                            |
| `collateral_per_share`     | `DynArray[uint256, MAX_TICKS_UINT]` | Collateral per share ratio by band                                |
| `size`                     | `uint256`                          | The number of bands to checkpoint starting from `n_start`          |

Emits: `Attached` or `Detached` event (at most one, on the transition), `UpdateInflationRate` event (on a new mining epoch), `CheckpointRPC` event, and `CheckpointBand` event (per band).

<SourceCode>

```vyper
@external
def callback_collateral_shares(n_start: int256, collateral_per_share: DynArray[uint256, MAX_TICKS_UINT], size: uint256):
    """
    @notice Checkpoint for shares in a set of bands
    @dev Updates the CRV emission shares are entitled to receive.
         Can be called only be the corresponding AMM.
         It is important that this callback is called every time before callback_user_shares.
    @param n_start Index of the first band to checkpoint
    @param collateral_per_share Collateral per share ratio by bands
    @param size The number of bands to checkpoint starting from `n_start`
    """
    # It is important that this callback is called every time before callback_user_shares
    assert msg.sender == AMM.address
    self._checkpoint_collateral_shares(n_start, collateral_per_share, convert(size, int256))

@internal
def _checkpoint_collateral_shares(n_start: int256, collateral_per_share: DynArray[uint256, MAX_TICKS_UINT], size: int256):
    """
    @notice Checkpoint for shares in a set of bands
    @dev Updates the CRV emission shares are entitled to receive
    @param n_start Index of the first band to checkpoint
    @param collateral_per_share Collateral per share ratio by bands
    @param size The number of bands to checkpoint starting from `n_start`
    """
    if not self._attached():
        return

    # Read current and new rate; update the new rate if needed
    I_rpc: ILMCallback.IntegralRPC = self.I_rpc
    rate: uint256 = self.inflation_rate
    new_rate: uint256 = rate
    prev_future_epoch: uint256 = self.future_epoch_time
    if block.timestamp >= prev_future_epoch:
        self.future_epoch_time = extcall CRV.future_epoch_time_write()
        new_rate = staticcall CRV.rate()
        self.inflation_rate = new_rate
        log ILMCallback.UpdateInflationRate(new_rate=new_rate, future_epoch_time=self.future_epoch_time)

    # Transfers from/to AMM always happen after LM Callback calls, so this value is taken BEFORE the action
    total_collateral: uint256 = staticcall COLLATERAL_TOKEN.balanceOf(AMM.address)
    delta_rpc: uint256 = 0

    if total_collateral > 0 and block.timestamp > I_rpc.t:
        extcall GAUGE_CONTROLLER.checkpoint_gauge(self)
        prev_week_time: uint256 = I_rpc.t
        week_time: uint256 = min(unsafe_div(prev_week_time + WEEK, WEEK) * WEEK, block.timestamp)

        for week_iter: uint256 in range(500):
            w: uint256 = staticcall GAUGE_CONTROLLER.gauge_relative_weight(self, prev_week_time)

            if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                # If we went across one or multiple epochs, apply the rate
                # of the first epoch until it ends, and then the rate of
                # the last epoch.
                # If more than one epoch is crossed - the gauge gets less,
                # but that'd mean it wasn't called for more than 1 year
                delta_rpc += unsafe_div(rate * w * unsafe_sub(prev_future_epoch, prev_week_time), total_collateral)
                rate = new_rate
                delta_rpc += unsafe_div(rate * w * unsafe_sub(week_time, prev_future_epoch), total_collateral)
            else:
                delta_rpc += unsafe_div(rate * w * unsafe_sub(week_time, prev_week_time), total_collateral)
            # On precisions of the calculation
            # rate ~= 10e18
            # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
            # total_collateral ~= TVL * 1e18 ~= 1e26 ($100M for example)
            # The largest loss is at dt = 1
            # Loss is 1e-9 - acceptable

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # * Record the collateral per share values
    # * Record integrals of rewards per share
    I_rpc.t = block.timestamp
    I_rpc.rpc += delta_rpc
    self.I_rpc = I_rpc
    log ILMCallback.CheckpointRPC(rpc=I_rpc.rpc, t=I_rpc.t)

    for i: int256 in range(size, bound=MAX_TICKS_INT):
        _n: int256 = n_start + i

        old_cps: uint256 = self.collateral_per_share[_n]
        if len(collateral_per_share) > 0:
            self.collateral_per_share[_n] = collateral_per_share[i]

        I_rps: ILMCallback.IntegralRPS = self.I_rps[_n]
        I_rps.rps += unsafe_div(old_cps * unsafe_sub(I_rpc.rpc, I_rps.rpc), 10**18)
        I_rps.rpc = I_rpc.rpc
        self.I_rps[_n] = I_rps
        log ILMCallback.CheckpointBand(n=_n, rps=I_rps.rps, collateral_per_share=old_cps)

@internal
def _attached() -> bool:
    """
    @notice Whether this contract is currently the AMM's configured callback
    @dev Latches `detached` on a negative observation, but only once the callback
         has gone live - see `attached`. Both integrals are gated on this: while
         detached the AMM stops reporting band and user share changes, so
         `collateral_per_share` freezes while `total_collateral` keeps tracking
         `balanceOf(AMM)`, and deposits land with no `I_rpu` baseline. Accruing on
         either would mint more CRV than the gauge weight allows.
    @return True only while this contract is the AMM's live callback
    """
    if self.detached:
        return False

    if (staticcall AMM.liquidity_mining_callback()).address == self:
        if not self.attached:
            self.attached = True
            log ILMCallback.Attached()
        return True

    # Not the AMM's callback. Before going live that is just the deployment
    # window and must not arm the latch; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False
```

</SourceCode>

<Example>

```shell
>>> LMCallback.callback_collateral_shares(-10, [1000000000000000000], 1)
```

</Example>

::::

### `callback_user_shares`
::::description[`LMCallback.callback_user_shares(user: address, n_start: int256, old_user_shares: DynArray[uint256, MAX_TICKS_UINT], size: uint256)`]

:::guard[Guarded Method]
This function can only be called by the `AMM` this LM Callback is deployed for. It must be called after `callback_collateral_shares` for the same action, since it relies on the band integrals that call just updated.
:::

Checkpoints a user's CRV emission entitlement across a range of bands, using the user's shares in each band taken **before** the AMM action that triggered the callback. If this LM Callback is not currently attached (see `attached`), the call is a no-op.

| Input                | Type                                | Description                                                |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `user`                  | `address`                           | The address of the user                                             |
| `n_start`               | `int256`                            | Index of the first band to checkpoint                              |
| `old_user_shares`        | `DynArray[uint256, MAX_TICKS_UINT]` | User's shares by bands taken before the action                     |
| `size`                  | `uint256`                           | The number of bands to checkpoint starting from `n_start`          |

Emits: `Attached` or `Detached` event (at most one, on the transition), and `CheckpointUser` event.

<SourceCode>

```vyper
@external
def callback_user_shares(user: address, n_start: int256, old_user_shares: DynArray[uint256, MAX_TICKS_UINT], size: uint256):
    """
    @notice Checkpoint for user's shares in a set of bands.
    @dev Updates the CRV emissions a user is entitled to receive.
         Can be called only be the corresponding AMM.
    @param user The address of the user
    @param n_start Index of the first band to checkpoint
    @param old_user_shares User's shares by bands taken BEFORE the action
    @param size The number of bands to checkpoint starting from `n_start`
    """
    assert msg.sender == AMM.address
    self._checkpoint_user_shares(user, n_start, old_user_shares, convert(size, int256))

@internal
def _checkpoint_user_shares(user: address, n_start: int256, old_user_shares: DynArray[uint256, MAX_TICKS_UINT], size: int256):
    """
    @notice Checkpoint for user's shares in a set of bands
    @dev Updates the CRV emissions a user is entitled to receive
    @param user The address of the user
    @param n_start Index of the first band to checkpoint
    @param old_user_shares User's shares by bands taken BEFORE the action
    @param size The number of bands to checkpoint starting from `n_start`
    """
    if not self._attached():
        return

    rpu: uint256 = self.integrate_fraction[user]
    for i: int256 in range(size, bound=MAX_TICKS_INT):
        _n: int256 = n_start + i

        old_user_shares_i: uint256 = 0
        if len(old_user_shares) > 0:
            old_user_shares_i = old_user_shares[i]

        I_rpu: ILMCallback.IntegralRPU = self.I_rpu[user][_n]
        I_rps: uint256 = self.I_rps[_n].rps
        d_rpu: uint256 = unsafe_div(old_user_shares_i * unsafe_sub(I_rps, I_rpu.rps), 10**18)
        I_rpu.rpu += d_rpu
        I_rpu.rps = I_rps
        self.I_rpu[user][_n] = I_rpu
        rpu += d_rpu

    self.integrate_fraction[user] = rpu
    log ILMCallback.CheckpointUser(user=user, integrate_fraction=rpu)

@internal
def _attached() -> bool:
    """
    @notice Whether this contract is currently the AMM's configured callback
    @dev Latches `detached` on a negative observation, but only once the callback
         has gone live - see `attached`. Both integrals are gated on this: while
         detached the AMM stops reporting band and user share changes, so
         `collateral_per_share` freezes while `total_collateral` keeps tracking
         `balanceOf(AMM)`, and deposits land with no `I_rpu` baseline. Accruing on
         either would mint more CRV than the gauge weight allows.
    @return True only while this contract is the AMM's live callback
    """
    if self.detached:
        return False

    if (staticcall AMM.liquidity_mining_callback()).address == self:
        if not self.attached:
            self.attached = True
            log ILMCallback.Attached()
        return True

    # Not the AMM's callback. Before going live that is just the deployment
    # window and must not arm the latch; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False
```

</SourceCode>

<Example>

```shell
>>> LMCallback.callback_user_shares("0x0000000000000000000000000000000000000A", -10, [500000000000000000], 1)
```

</Example>

::::

## Checkpoints & Claiming

### `user_checkpoint`
::::description[`LMCallback.user_checkpoint(addr: address) -> bool`]

Records a checkpoint for `addr`, reading its current tick range and per-band shares directly from the `AMM` and settling both the collateral-share and user-share integrals up to now. Can be called by anyone. If this LM Callback is not currently attached (see `attached`), the call is a no-op — this is also the recommended way to immediately arm the `detached` latch after a market's callback is repointed elsewhere, so that borrowers depositing afterward don't get an unintended `I_rpu` baseline.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `addr` | `address` | User address  |

Returns: always `True` (`bool`).

Emits: `Attached` or `Detached` event (at most one, on the transition), `UpdateInflationRate` event (on a new mining epoch), `CheckpointRPC` event, `CheckpointBand` event (per band), and `CheckpointUser` event.

<SourceCode>

```vyper
@external
def user_checkpoint(addr: address) -> bool:
    """
    @notice Record a checkpoint for `addr`
    @param addr User address
    @return Always True
    """
    self._user_checkpoint(addr)

    return True

@internal
def _user_checkpoint(addr: address):
    """
    @notice Record a checkpoint for `addr`
    @param addr User address
    """
    ns: int256[2] = staticcall AMM.read_user_tick_numbers(addr)
    user_shares: DynArray[uint256, MAX_TICKS_UINT] = staticcall AMM.read_user_ticks(addr)
    self._checkpoint_collateral_shares(ns[0], [], ns[1] - ns[0] + 1)
    if len(user_shares) > 0 and user_shares[0] > 0:
        self._checkpoint_user_shares(addr, ns[0], user_shares, ns[1] - ns[0] + 1)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.user_checkpoint("0x0000000000000000000000000000000000000A")
```

</Example>

::::

### `claimable_tokens`
::::description[`LMCallback.claimable_tokens(addr: address) -> uint256`]

Returns the number of CRV tokens `addr` can currently claim from the `Minter`. The function first checkpoints `addr` to settle its rewards up to the current block, which is why it is declared `nonpayable` rather than `view` even though it does not itself transfer any funds; callers that only want to read the value (e.g. from a UI) can call it with `eth_call` the same way a view function would be called.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `addr` | `address` | User address  |

Returns: number of claimable CRV tokens for `addr` (`uint256`).

<SourceCode>

```vyper
@external
def claimable_tokens(addr: address) -> uint256:
    """
    @notice Get the number of claimable tokens per user
    @dev This function should be manually changed to "view" in the ABI
    @param addr User address
    @return uint256 number of claimable tokens per user
    """
    self._user_checkpoint(addr)

    return self.integrate_fraction[addr] - staticcall MINTER.minted(addr, self)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.claimable_tokens("0x0000000000000000000000000000000000000A")
```

</Example>

::::

## Collateral & Rewards Accounting

### `total_collateral`
::::description[`LMCallback.total_collateral() -> uint256: view`]

Returns the total collateral balance currently held by the `AMM`. This keeps tracking `balanceOf(AMM)` regardless of whether this LM Callback is attached — unlike `collateral_per_share`, which freezes once detached.

Returns: total collateral amount in the LlamaLend/crvUSD AMM (`uint256`).

<SourceCode>

```vyper
@external
@view
def total_collateral() -> uint256:
    """
    @return Total collateral amount in LlamaLend/crvUSD AMM
    """
    return staticcall COLLATERAL_TOKEN.balanceOf(AMM.address)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.total_collateral()
```

</Example>

::::

### `user_collateral`
::::description[`LMCallback.user_collateral(user: address) -> uint256: view`]

Returns a user's collateral balance in the `AMM`.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `user` | `address` | The address of the user |

Returns: user's collateral amount in the LlamaLend/crvUSD AMM (`uint256`).

<SourceCode>

```vyper
@external
@view
def user_collateral(user: address) -> uint256:
    """
    @param user The address of the user
    @return User's collateral amount in LlamaLend/crvUSD AMM
    """
    return (staticcall AMM.get_sum_xy(user))[1]
```

</SourceCode>

<Example>

```shell
>>> LMCallback.user_collateral("0x0000000000000000000000000000000000000A")
```

</Example>

::::

### `collateral_per_share`
::::description[`LMCallback.collateral_per_share(arg0: int256) -> uint256: view`]

Returns the collateral-per-share ratio last recorded for band `arg0`, as of the last time that band was checkpointed while this LM Callback was attached. This value freezes once the callback is detached, since detached checkpoints are a no-op.

| Input  | Type     | Description       |
| ------ | -------- | ------------------ |
| `arg0` | `int256` | Band index         |

Returns: collateral per share ratio for the band (`uint256`).

<SourceCode>

```vyper
collateral_per_share: public(HashMap[int256, uint256])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.collateral_per_share(-10)
```

</Example>

::::

### `inflation_rate`
::::description[`LMCallback.inflation_rate() -> uint256: view`]

Returns the CRV inflation rate used for this LM Callback's emissions calculation as of the last checkpoint of the current mining epoch.

Returns: CRV inflation rate (`uint256`).

<SourceCode>

```vyper
inflation_rate: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.inflation_rate()
```

</Example>

::::

### `future_epoch_time`
::::description[`LMCallback.future_epoch_time() -> uint256: view`]

Returns the timestamp at which the current CRV mining epoch ends, as last recorded by this LM Callback.

Returns: future epoch time (`uint256`).

<SourceCode>

```vyper
future_epoch_time: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.future_epoch_time()
```

</Example>

::::

### `I_rpc`
::::description[`LMCallback.I_rpc() -> IntegralRPC: view`]

Returns the running integral of rewards-per-collateral: the cumulative CRV emissions per unit of collateral in the `AMM`, along with the timestamp it was last updated at.

Returns: the `IntegralRPC` struct, with fields `rpc` (`uint256`, the cumulative rewards-per-collateral value) and `t` (`uint256`, the timestamp of the last update).

<SourceCode>

```vyper
I_rpc: public(ILMCallback.IntegralRPC)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rpc()
```

</Example>

::::

### `I_rps`
::::description[`LMCallback.I_rps(arg0: int256) -> IntegralRPS: view`]

Returns the running integral of rewards-per-share for band `arg0`: the cumulative CRV emissions per unit of share in that band, along with the value of `I_rpc.rpc` it was last updated against.

| Input  | Type     | Description   |
| ------ | -------- | ------------- |
| `arg0` | `int256` | Band index    |

Returns: the `IntegralRPS` struct, with fields `rps` (`uint256`, the cumulative rewards-per-share value for the band) and `rpc` (`uint256`, the `I_rpc.rpc` value at the last update).

<SourceCode>

```vyper
I_rps: public(HashMap[int256, ILMCallback.IntegralRPS])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rps(-10)
```

</Example>

::::

### `I_rpu`
::::description[`LMCallback.I_rpu(arg0: address, arg1: int256) -> IntegralRPU: view`]

Returns the running integral of rewards-per-user-share for user `arg0` in band `arg1`: the cumulative CRV emissions attributed to that user's share in that band, along with the value of `I_rps[arg1].rps` it was last updated against.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | User address  |
| `arg1` | `int256`  | Band index    |

Returns: the `IntegralRPU` struct, with fields `rpu` (`uint256`, the cumulative rewards attributed to the user in the band) and `rps` (`uint256`, the `I_rps[arg1].rps` value at the last update).

<SourceCode>

```vyper
I_rpu: public(HashMap[address, HashMap[int256, ILMCallback.IntegralRPU]])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rpu("0x0000000000000000000000000000000000000A", -10)
```

</Example>

::::

### `integrate_fraction`
::::description[`LMCallback.integrate_fraction(arg0: address) -> uint256: view`]

Returns the total CRV a user has been credited with by this LM Callback as of the last time they were checkpointed. `Minter` subtracts what has already been minted to determine the claimable amount (see `claimable_tokens`).

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | User address  |

Returns: cumulative CRV credited to the user (`uint256`).

<SourceCode>

```vyper
integrate_fraction: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.integrate_fraction("0x0000000000000000000000000000000000000A")
```

</Example>

::::

## Contract Info

### `AMM`
::::description[`LMCallback.AMM() -> address: view`]

Returns the address of the LlamaLend/crvUSD AMM this LM Callback was deployed for. Set once at deployment and immutable thereafter.

Returns: address of the AMM (`address`).

<SourceCode>

```vyper
AMM: public(immutable(IAMM))
```

</SourceCode>

<Example>

```shell
>>> LMCallback.AMM()
```

</Example>

::::

### `COLLATERAL_TOKEN`
::::description[`LMCallback.COLLATERAL_TOKEN() -> address: view`]

Returns the address of the AMM's collateral token (`AMM.coins(1)`), read once at deployment. Deployment reverts if this token does not have 18 decimals.

Returns: address of the collateral token (`address`).

<SourceCode>

```vyper
COLLATERAL_TOKEN: public(immutable(IERC20))
```

</SourceCode>

<Example>

```shell
>>> LMCallback.COLLATERAL_TOKEN()
```

</Example>

::::

### `factory`
::::description[`LMCallback.factory() -> address: view`]

Returns the address recorded as `msg.sender` at deployment. Named after the gauge convention — pairing with the deploying factory's `is_valid_gauge()` getter — rather than being called something like `LM_CALLBACK_FACTORY`. This value is only meaningful when the LM Callback was actually deployed through a factory: if it was deployed directly, `factory()` simply returns the deployer, and no factory vouches for it. To trust a callback's factory link, check both directions — that `factory()` points at a factory you trust, **and** that the factory's `is_valid_gauge(address)` returns `True` for this callback.

Returns: address recorded as this contract's deployer (`address`).

<SourceCode>

```vyper
# Not public: gauges expose their factory as `factory()`, so the getter below
# carries that name instead of the `FACTORY()` a public immutable would give
_FACTORY: immutable(address)

@external
@view
def factory() -> address:
    """
    @notice Address of the factory which deployed this callback
    @dev Named after the gauge convention. Set to `msg.sender` in the constructor,
         so on a callback deployed outside a factory it is just the deployer.
    @return Address of the LM Callback factory
    """
    return _FACTORY
```

</SourceCode>

<Example>

```shell
>>> LMCallback.factory()
```

</Example>

::::

### `attached`
::::description[`LMCallback.attached() -> bool: view`]

Returns whether this LM Callback has ever been observed as the AMM's configured callback. This is set the first time any checkpoint call sees `AMM.liquidity_mining_callback()` pointing at this contract, and stays `True` from then on — it does not toggle back to `False` if the callback is later replaced; see `detached` for that.

Returns: whether this callback has ever gone live (`bool`).

<SourceCode>

```vyper
# Set the first time this contract is seen as the AMM's configured callback
attached: public(bool)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.attached()
```

</Example>

::::

### `detached`
::::description[`LMCallback.detached() -> bool: view`]

Returns whether this LM Callback has permanently stopped accruing rewards. This latches to `True` the first time a checkpoint call notices that `attached` was already `True` but the AMM's configured callback no longer points at this contract — i.e. the Controller's Configurator has repointed the AMM elsewhere. Once `detached` is `True`, it can never be reset, and all further checkpoint calls on this contract become no-ops: CRV emissions cannot be resumed on this instance, even if the AMM's callback is later pointed back at it.

Returns: whether this callback has been permanently detached (`bool`).

<SourceCode>

```vyper
# Latched when a callback that had gone live is no longer the AMM's configured
# callback. A detached callback reads `attached == True` and `detached == True`.
detached: public(bool)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.detached()
```

</Example>

::::

## Other Methods

### `version`
::::description[`LMCallback.version() -> String[5]: view`]

Returns the version of this contract as a string.

Returns: contract version (`String[5]`).

<SourceCode>

```vyper
version: public(constant(String[5])) = "1.0.0"
```

</SourceCode>

<Example>

```shell
>>> LMCallback.version()
```

</Example>

::::
