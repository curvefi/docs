# LMCallback

An `LMCallback` is a liquidity mining gauge for the collateral of a single Llamalend market. Instead of holding deposits, it is hooked into the market's AMM as its liquidity mining callback: every time collateral moves in or out of bands, the AMM reports the change to the callback, which keeps running integrals of rewards per collateral, per band, and per user. Borrowers earn CRV in proportion to the collateral they keep in the AMM and claim it through the regular CRV `Minter`, exactly like with any other gauge.

Each market gets its own callback, deployed from a shared blueprint by the [`CurveLMCallbackFactory`](./lm-callback-factory.md). The blueprint itself cannot be called; all functions below are called on a deployed instance.

:::warning[Ethereum only]
The `CRV`, `GaugeController`, and `Minter` addresses are hardcoded, so the contract can only be used on Ethereum mainnet. The collateral token must have 18 decimals; the constructor reverts otherwise.
:::

:::vyper[`LMCallback.vy`]

The source code for the `LMCallback.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/604548484c7771fb49b5c57eb35dfb8b62b58078/curve_stablecoin/lm_callback/LMCallback.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The blueprint implementation is deployed on :logos-ethereum: Ethereum at [`0x0fDFE9c8F16AffF693EA16544d6d1Bac555343c4`](https://etherscan.io/address/0x0fDFE9c8F16AffF693EA16544d6d1Bac555343c4). Individual callbacks are deployed per market via [`LMCallbackFactory.deploy_lm_callback`](./lm-callback-factory.md#deploy_lm_callback); query the factory with `get_lm_callback_by_amm` or `get_lm_callback` to find them.

<ContractABI>

```json
[{"anonymous":false,"inputs":[{"indexed":false,"name":"killed","type":"bool"}],"name":"SetKilled","type":"event"},{"anonymous":false,"inputs":[],"name":"Attached","type":"event"},{"anonymous":false,"inputs":[],"name":"Detached","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"new_rate","type":"uint256"},{"indexed":false,"name":"future_epoch_time","type":"uint256"}],"name":"UpdateInflationRate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"rpc","type":"uint256"},{"indexed":false,"name":"t","type":"uint256"}],"name":"CheckpointRPC","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"n","type":"int256"},{"indexed":false,"name":"rps","type":"uint256"},{"indexed":false,"name":"collateral_per_share","type":"uint256"}],"name":"CheckpointBand","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"integrate_fraction","type":"uint256"}],"name":"CheckpointUser","type":"event"},{"inputs":[],"name":"factory","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lp_token","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"is_killed","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"killed","type":"bool"}],"name":"set_killed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"total_collateral","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"user","type":"address"}],"name":"user_collateral","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"n_start","type":"int256"},{"name":"collateral_per_share","type":"uint256[]"},{"name":"size","type":"uint256"}],"name":"callback_collateral_shares","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"user","type":"address"},{"name":"n_start","type":"int256"},{"name":"old_user_shares","type":"uint256[]"},{"name":"size","type":"uint256"}],"name":"callback_user_shares","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"user_checkpoint","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"claimable_tokens","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"AMM","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"COLLATERAL_TOKEN","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"attached","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"detached","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"int256"}],"name":"collateral_per_share","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"inflation_rate","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"future_epoch_time","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"I_rpc","outputs":[{"components":[{"name":"rpc","type":"uint256"},{"name":"t","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"int256"}],"name":"I_rps","outputs":[{"components":[{"name":"rps","type":"uint256"},{"name":"rpc","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"int256"}],"name":"I_rpu","outputs":[{"components":[{"name":"rpu","type":"uint256"},{"name":"rps","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_fraction","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_amm","type":"address"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"}]
```

</ContractABI>

:::

---

## Lifecycle

A callback goes through three states, tracked by `attached`, `detached`, and an internal `rewards_killed` flag:

1. **Deployed, not live.** After `deploy_lm_callback`, the callback exists but is not yet the AMM's callback. It ignores all checkpoints. Being "not the AMM's callback" during this window is treated as normal and does not retire the callback.
2. **Live.** The `Configurator` sets the callback on the AMM. The first call that sees this latches `attached = True` and emits `Attached`. From then on, the callback accrues CRV according to its gauge weight. Once the DAO has added it to the `GaugeController`, borrowers start earning.
3. **Retired.** If the AMM's callback is later changed to any other address, the next call that sees this latches `detached = True` and emits `Detached`. A retired callback is permanently inert: CRV accrual stops and cannot be resumed, but already-credited rewards can still be minted.

Independently of this lifecycle, the factory owner can **pause rewards** with `set_killed(True)`. While paused, checkpoints and AMM accounting keep running but the effective emission rate is zero, so nothing accrues. `set_killed(False)` resumes accrual, as long as the callback is still attached; it cannot undo a retirement.

:::danger[Retiring a callback]
To retire a callback without losing rewards:

1. Checkpoint every borrower (`user_checkpoint`) **before** detaching. Accrual stops once detached, so anything not yet credited is lost.
2. Detach via `Configurator.set_callback`, and call `user_checkpoint(empty(address))` on the callback **in the same transaction**. This records the retirement immediately.

Never reattach a callback after it has missed AMM updates while detached.
:::

### Reward Accounting

The callback tracks three running integrals:

- `I_rpc` — rewards per unit of collateral, accumulated over time from the CRV inflation rate $r$, the callback's relative gauge weight $w$, and the total collateral in the AMM:

$$\text{rrpc} = \frac{r \cdot w}{\sum_i s_i \cdot cs_i}, \qquad I_{rpc} = \int \text{rrpc} \, dt$$

- `I_rps[i]` — rewards per share in band $i$, where $cs_i$ is the collateral per share of the band:

$$I_{rps,i} = \sum cs_i \cdot \Delta I_{rpc}$$

- `I_rpu[u, i]` — rewards per user $u$ in band $i$, where $s_{u,i}$ are the user's shares in that band. Summed over bands, this is the user's `integrate_fraction`:

$$I_{rpu,u,i} = \sum s_{u,i} \cdot \Delta I_{rps,i}$$

---

## AMM Callbacks

These functions are called by the AMM whenever collateral shares change. The AMM always calls `callback_collateral_shares` before `callback_user_shares`.

### `callback_collateral_shares`
::::description[`LMCallback.callback_collateral_shares(n_start: int256, collateral_per_share: DynArray[uint256, MAX_TICKS_UINT], size: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `AMM` the callback was deployed for.
:::

Checkpoints the reward integrals for a set of bands and records their new collateral-per-share values. It first advances `I_rpc` up to the current block, refreshing the CRV inflation rate if a new epoch has started and checkpointing the callback in the `GaugeController`, then updates `I_rps` for each band from `n_start` to `n_start + size - 1`.

The call is a no-op unless the callback is currently attached to the AMM. While rewards are paused with `set_killed`, the integrals are still checkpointed but with a zero emission rate.

| Input                  | Type                                | Description                                                   |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `n_start`              | `int256`                            | Index of the first band to checkpoint.                        |
| `collateral_per_share` | `DynArray[uint256, MAX_TICKS_UINT]` | Collateral per share ratio of each band; empty keeps the stored values. |
| `size`                 | `uint256`                           | Number of bands to checkpoint, starting from `n_start`.       |

Emits: `CheckpointRPC`, `CheckpointBand`, and, on a new CRV epoch, `UpdateInflationRate` events. `Attached` or `Detached` is emitted when this call observes a change in the AMM's callback.

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

    # Keep rate caching and AMM accounting live; zero only effective rates.
    if self.rewards_killed:
        rate = 0
        new_rate = 0

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
    # window and must not set `detached`; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False
```

</SourceCode>

<Example>

```shell
>>> LMCallback.callback_collateral_shares(-5, [1000000000000000000, 1000000000000000000], 2)  # only callable by the AMM
```

</Example>

::::

### `callback_user_shares`
::::description[`LMCallback.callback_user_shares(user: address, n_start: int256, old_user_shares: DynArray[uint256, MAX_TICKS_UINT], size: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `AMM` the callback was deployed for.
:::

Credits a user with the rewards their shares earned since the user's last checkpoint, for each band from `n_start` to `n_start + size - 1`, and adds them to `integrate_fraction`. `old_user_shares` must be the user's shares **before** the action that triggered the callback.

The call is a no-op unless the callback is currently attached to the AMM.

| Input             | Type                                | Description                                                  |
| ----------------- | ----------------------------------- | ------------------------------------------------------------ |
| `user`            | `address`                           | Address of the user.                                         |
| `n_start`         | `int256`                            | Index of the first band to checkpoint.                       |
| `old_user_shares` | `DynArray[uint256, MAX_TICKS_UINT]` | User's shares in each band, taken before the action.         |
| `size`            | `uint256`                           | Number of bands to checkpoint, starting from `n_start`.      |

Emits: `CheckpointUser` event. `Attached` or `Detached` is emitted when this call observes a change in the AMM's callback.

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
    # window and must not set `detached`; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False
```

</SourceCode>

<Example>

```shell
>>> LMCallback.callback_user_shares("0xUser...", -5, [500000000000000000, 500000000000000000], 2)  # only callable by the AMM
```

</Example>

::::

---

## Checkpoints and Claiming

CRV is minted through the CRV `Minter` at [`0xd061D61a4d941c39E5453435B6345Dc261C2fcE0`](https://etherscan.io/address/0xd061D61a4d941c39E5453435B6345Dc261C2fcE0) by calling `mint(lm_callback)`, which reads `integrate_fraction` after calling `user_checkpoint`.

### `user_checkpoint`
::::description[`LMCallback.user_checkpoint(addr: address) -> bool`]

Records a checkpoint for `addr`: advances the reward integrals for all bands the user has collateral in and credits the user with what they earned since their last checkpoint. Anyone can call this function for any address.

Calling it with any address (for example the zero address) also makes the callback re-check whether it is still attached to the AMM. This is how a detach is recorded immediately; see [Lifecycle](#lifecycle).

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `addr` | `address` | Address of the user. |

Returns: always `True` (`bool`).

Emits: `CheckpointRPC`, `CheckpointBand`, and `CheckpointUser` events while attached; `Attached` or `Detached` when the call observes a change in the AMM's callback.

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

    # Keep rate caching and AMM accounting live; zero only effective rates.
    if self.rewards_killed:
        rate = 0
        new_rate = 0

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
    # window and must not set `detached`; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False
```

</SourceCode>

<Example>

```shell
>>> LMCallback.user_checkpoint("0xUser...")
True
```

</Example>

::::

### `claimable_tokens`
::::description[`LMCallback.claimable_tokens(addr: address) -> uint256`]

Checkpoints `addr` and returns the amount of CRV it can currently mint: its `integrate_fraction` minus what the `Minter` has already minted for it from this callback. The function is not marked `view` because it writes a checkpoint, but it is meant to be called statically (e.g. with `eth_call`).

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `addr` | `address` | Address of the user. |

Returns: claimable CRV (`uint256`).

<SourceCode>

```vyper
MINTER: constant(IMinter) = IMinter(0xd061D61a4d941c39E5453435B6345Dc261C2fcE0)

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
>>> LMCallback.claimable_tokens("0xUser...")
1234567890000000000
```

</Example>

::::

### `integrate_fraction`
::::description[`LMCallback.integrate_fraction(arg0: address) -> uint256: view`]

Getter for the total CRV ever credited to a user as of their last checkpoint, including what has already been minted. The `Minter` mints the difference between this value and its own `minted(user, gauge)`.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `arg0` | `address` | Address of the user. |

Returns: cumulative CRV credited (`uint256`).

<SourceCode>

```vyper
integrate_fraction: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.integrate_fraction("0xUser...")
5000000000000000000
```

</Example>

::::

---

## Emission Control

### `set_killed`
::::description[`LMCallback.set_killed(killed: bool)`]

:::guard[Guarded Method]
This function is only callable by the `owner` of the factory that deployed the callback (`factory().owner()`), which is intended to be the Curve DAO. Pausing and resuming CRV rewards on a market's callback is therefore in the hands of the factory owner.
:::

Pauses (`True`) or resumes (`False`) CRV accrual without detaching the callback from the AMM. Before the flag changes, the reward integrals are checkpointed under the old setting, so pausing keeps what was earned up to that point and resuming does not back-pay the paused period.

While paused, the callback stays attached and keeps tracking AMM accounting; only the effective emission rate is set to zero. Rewards credited before the pause can still be minted. Resuming reverts with `"not attached"` if the callback is no longer the AMM's callback, so a retired callback cannot be revived.

| Input    | Type   | Description                                  |
| -------- | ------ | -------------------------------------------- |
| `killed` | `bool` | `True` to pause rewards, `False` to resume.  |

Emits: `SetKilled` event.

<SourceCode>

```vyper
event SetKilled:
    killed: bool

rewards_killed: bool

@external
def set_killed(killed: bool):
    """
    @notice Pause or resume new CRV accrual without detaching the callback
    @param killed True to pause rewards; False to resume while still attached
    """
    assert msg.sender == staticcall ILMCallbackFactory(_FACTORY).owner(), "only owner"
    if not killed:
        assert self._attached(), "not attached"

    # Checkpoint under the old flag so resuming cannot backpay paused time.
    self._checkpoint_collateral_shares(0, [], 0)
    self.rewards_killed = killed
    log ILMCallback.SetKilled(killed=killed)

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
    # window and must not set `detached`; after going live it is a detach.
    if self.attached:
        self.detached = True
        log ILMCallback.Detached()

    return False

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

    # Keep rate caching and AMM accounting live; zero only effective rates.
    if self.rewards_killed:
        rate = 0
        new_rate = 0

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
```

</SourceCode>

<Example>

```shell
>>> LMCallback.set_killed(True)
>>> LMCallback.is_killed()
True
```

</Example>

::::

### `is_killed`
::::description[`LMCallback.is_killed() -> bool: view`]

Returns whether the callback is no longer accruing new CRV, either because rewards were paused with `set_killed` or because the callback has been retired. A callback that has gone live but is no longer the AMM's callback reports `True` even before `detached` has been latched.

This mirrors the `is_killed()` getter of regular gauges for integrations. It is only a view and does not record anything. A `False` result does not imply that the callback is attached, live, or receiving gauge weight.

Returns: `True` if accrual is paused or the callback is retired (`bool`).

<SourceCode>

```vyper
@external
@view
def is_killed() -> bool:
    """
    @notice Whether new CRV accrual is paused or the callback is retired
    @dev False does not imply attachment, initialization, or positive emissions.
    """
    return self.rewards_killed or self.detached or (
        self.attached and (staticcall AMM.liquidity_mining_callback()).address != self
    )
```

</SourceCode>

<Example>

```shell
>>> LMCallback.is_killed()
False
```

</Example>

::::

### `attached`
::::description[`LMCallback.attached() -> bool: view`]

Getter for whether the callback has gone live, i.e. has been observed as the AMM's callback at least once. It is never reset, so a retired callback reads `attached == True` and `detached == True`.

Returns: `True` once the callback has gone live (`bool`).

<SourceCode>

```vyper
# Set the first time this contract is seen as the AMM's configured callback
attached: public(bool)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.attached()
True
```

</Example>

::::

### `detached`
::::description[`LMCallback.detached() -> bool: view`]

Getter for whether the callback has been retired. It is latched the first time a call observes that a live callback is no longer the AMM's callback, and is permanent.

Returns: `True` if retired (`bool`).

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
False
```

</Example>

::::

---

## Reward Integrals and Rates

### `I_rpc`
::::description[`LMCallback.I_rpc() -> IntegralRPC: view`]

Getter for the rewards-per-collateral integral and the timestamp of its last update.

Returns: `IntegralRPC` struct with `rpc` (`uint256`) and `t` (`uint256`).

<SourceCode>

```vyper
struct IntegralRPC:
    rpc: uint256
    t: uint256

I_rpc: public(ILMCallback.IntegralRPC)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rpc()
(152340000000000, 1761480000)
```

</Example>

::::

### `I_rps`
::::description[`LMCallback.I_rps(arg0: int256) -> IntegralRPS: view`]

Getter for the rewards-per-share integral of a band, together with the value of `I_rpc` it was last updated against.

| Input  | Type     | Description    |
| ------ | -------- | -------------- |
| `arg0` | `int256` | Band index.    |

Returns: `IntegralRPS` struct with `rps` (`uint256`) and `rpc` (`uint256`).

<SourceCode>

```vyper
struct IntegralRPS:
    rps: uint256
    rpc: uint256

I_rps: public(HashMap[int256, ILMCallback.IntegralRPS])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rps(-5)
(98760000000000, 152340000000000)
```

</Example>

::::

### `I_rpu`
::::description[`LMCallback.I_rpu(arg0: address, arg1: int256) -> IntegralRPU: view`]

Getter for a user's rewards integral in a band, together with the value of `I_rps` it was last updated against.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `arg0` | `address` | Address of the user. |
| `arg1` | `int256`  | Band index.          |

Returns: `IntegralRPU` struct with `rpu` (`uint256`) and `rps` (`uint256`).

<SourceCode>

```vyper
struct IntegralRPU:
    rpu: uint256
    rps: uint256

I_rpu: public(HashMap[address, HashMap[int256, ILMCallback.IntegralRPU]])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.I_rpu("0xUser...", -5)
(1200000000000000000, 98760000000000)
```

</Example>

::::

### `collateral_per_share`
::::description[`LMCallback.collateral_per_share(arg0: int256) -> uint256: view`]

Getter for the last recorded collateral per share of a band, as reported by the AMM through `callback_collateral_shares`.

| Input  | Type     | Description    |
| ------ | -------- | -------------- |
| `arg0` | `int256` | Band index.    |

Returns: collateral per share (`uint256`).

<SourceCode>

```vyper
collateral_per_share: public(HashMap[int256, uint256])
```

</SourceCode>

<Example>

```shell
>>> LMCallback.collateral_per_share(-5)
1000000000000000000
```

</Example>

::::

### `inflation_rate`
::::description[`LMCallback.inflation_rate() -> uint256: view`]

Getter for the cached CRV inflation rate. It is read from the CRV token at deployment and refreshed on the first checkpoint after each CRV epoch ends. It keeps tracking the CRV rate while rewards are paused.

Returns: CRV inflation rate per second (`uint256`).

<SourceCode>

```vyper
CRV: constant(ICRV20) = ICRV20(0xD533a949740bb3306d119CC777fa900bA034cd52)

inflation_rate: public(uint256)

@deploy
def __init__(_amm: IAMM):
    """
    @notice LMCallback constructor
    @param _amm The address of the AMM
    """
    _FACTORY = msg.sender
    AMM = _amm
    COLLATERAL_TOKEN = IERC20(staticcall AMM.coins(1))
    assert staticcall COLLATERAL_TOKEN.decimals() == 18, "collateral decimals must be 18"

    self.future_epoch_time = extcall CRV.future_epoch_time_write()
    self.inflation_rate = staticcall CRV.rate()
    self.I_rpc.t = block.timestamp
```

</SourceCode>

<Example>

```shell
>>> LMCallback.inflation_rate()
3610000000000000000
```

</Example>

::::

### `future_epoch_time`
::::description[`LMCallback.future_epoch_time() -> uint256: view`]

Getter for the timestamp at which the current CRV inflation epoch ends. The next checkpoint after this time refreshes `inflation_rate`.

Returns: end of the current CRV epoch (`uint256`).

<SourceCode>

```vyper
future_epoch_time: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> LMCallback.future_epoch_time()
1786000000
```

</Example>

::::

---

## Collateral

### `total_collateral`
::::description[`LMCallback.total_collateral() -> uint256: view`]

Returns the total amount of collateral held by the AMM.

Returns: total collateral (`uint256`).

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
2500000000000000000000
```

</Example>

::::

### `user_collateral`
::::description[`LMCallback.user_collateral(user: address) -> uint256: view`]

Returns the amount of collateral a user has in the AMM, read from the AMM's `get_sum_xy`.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `user` | `address` | Address of the user. |

Returns: user's collateral (`uint256`).

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
>>> LMCallback.user_collateral("0xUser...")
10000000000000000000
```

</Example>

::::

### `lp_token`
::::description[`LMCallback.lp_token() -> address: view`]

Returns the collateral token rewarded through the callback. It is the same address as `COLLATERAL_TOKEN` and exists so that integrations that read `lp_token()` from gauges can handle LM Callbacks the same way.

Returns: collateral token (`address`).

<SourceCode>

```vyper
COLLATERAL_TOKEN: public(immutable(IERC20))

@external
@view
def lp_token() -> address:
    """
    @notice Collateral token rewarded through the AMM callback
    """
    return COLLATERAL_TOKEN.address
```

</SourceCode>

<Example>

```shell
>>> LMCallback.lp_token()
'0xCollateralToken...'
```

</Example>

::::

### `COLLATERAL_TOKEN`
::::description[`LMCallback.COLLATERAL_TOKEN() -> IERC20: view`]

Getter for the market's collateral token, set at deployment from `AMM.coins(1)`.

Returns: collateral token (`address`).

<SourceCode>

```vyper
COLLATERAL_TOKEN: public(immutable(IERC20))
```

</SourceCode>

<Example>

```shell
>>> LMCallback.COLLATERAL_TOKEN()
'0xCollateralToken...'
```

</Example>

::::

---

## Other Methods

### `AMM`
::::description[`LMCallback.AMM() -> IAMM: view`]

Getter for the AMM the callback was deployed for. Only this AMM can call `callback_collateral_shares` and `callback_user_shares`.

Returns: AMM (`address`).

<SourceCode>

```vyper
AMM: public(immutable(IAMM))
```

</SourceCode>

<Example>

```shell
>>> LMCallback.AMM()
'0xAMM...'
```

</Example>

::::

### `factory`
::::description[`LMCallback.factory() -> address: view`]

Returns the factory that deployed the callback. It is set to the deployer in the constructor, so for a callback deployed outside a factory it is simply the deployer. The owner of this address is the account allowed to call `set_killed`.

Returns: LM Callback factory (`address`).

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
'0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0'
```

</Example>

::::

### `version`
::::description[`LMCallback.version() -> String[5]: view`]

Getter for the version of the contract.

Returns: contract version (`String[5]`).

<SourceCode>

```vyper
version: public(constant(String[5])) = "1.0.0"
```

</SourceCode>

<Example>

```shell
>>> LMCallback.version()
'1.0.0'
```

</Example>

::::
