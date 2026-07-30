import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DonationStreamer

The `DonationStreamer` contract enables permissionless, scheduled refuels for FXSwap pools. Refuel providers deposit tokens and ETH rewards upfront to create streams that add refuels over multiple periods. Anyone can execute due streams and earn ETH bounties for doing so.

This contract is fully permissionless — there is no admin or owner. Once a stream is created, it can only be cancelled by its creator, stored in the `donor` field.

A frontend for creating, viewing, and executing streams is available at [curvefi.github.io/refuel-automation](https://curvefi.github.io/refuel-automation/).

For background on how pool-level refuels work, see [Refuels and Automation](./refuels.md) and the [FXSwap Pool Reference](./reference.md).

:::info[Contract naming]

`DonationStreamer`, `DonationStream`, and `donor` are immutable deployed names. This page uses **refuel** for the mechanism and switches to the legacy names only for exact signatures, fields, events, and source excerpts.

:::

:::vyper[`DonationStreamer.vy`]

The source code for the `DonationStreamer.vy` contract can be found on [GitHub](https://github.com/curvefi/refuel-automation). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed at the same address on all chains (via CREATE3):

- :logos-ethereum: Ethereum: [`0x2b786BB995978CC2242C567Ae62fd617b0eBC828`](https://etherscan.io/address/0x2b786BB995978CC2242C567Ae62fd617b0eBC828)
- :logos-gnosis: Gnosis: [`0x2b786BB995978CC2242C567Ae62fd617b0eBC828`](https://gnosisscan.io/address/0x2b786BB995978CC2242C567Ae62fd617b0eBC828)
- :logos-base: Base: [`0x2b786BB995978CC2242C567Ae62fd617b0eBC828`](https://basescan.org/address/0x2b786BB995978CC2242C567Ae62fd617b0eBC828)
- :logos-polygon: Polygon: [`0x2b786BB995978CC2242C567Ae62fd617b0eBC828`](https://polygonscan.com/address/0x2b786BB995978CC2242C567Ae62fd617b0eBC828)

<ContractABI>


```json
[{"anonymous":false,"inputs":[{"indexed":false,"name":"stream_id","type":"uint256"},{"indexed":true,"name":"donor","type":"address"},{"indexed":true,"name":"pool","type":"address"},{"indexed":false,"name":"amounts","type":"uint256[2]"},{"indexed":false,"name":"period_length","type":"uint256"},{"indexed":false,"name":"n_periods","type":"uint256"},{"indexed":false,"name":"reward_per_period","type":"uint256"}],"name":"StreamCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"stream_id","type":"uint256"},{"indexed":true,"name":"caller","type":"address"},{"indexed":true,"name":"pool","type":"address"},{"indexed":false,"name":"periods","type":"uint256"},{"indexed":false,"name":"amounts","type":"uint256[2]"},{"indexed":false,"name":"reward_paid","type":"uint256"}],"name":"StreamExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"stream_id","type":"uint256"},{"indexed":true,"name":"donor","type":"address"},{"indexed":true,"name":"pool","type":"address"},{"indexed":false,"name":"amounts","type":"uint256[2]"},{"indexed":false,"name":"reward_refund","type":"uint256"}],"name":"StreamCancelled","type":"event"},{"inputs":[{"name":"pool","type":"address"},{"name":"coins","type":"address[2]"},{"name":"amounts","type":"uint256[2]"},{"name":"period_length","type":"uint256"},{"name":"n_periods","type":"uint256"},{"name":"reward_per_period","type":"uint256"}],"name":"create_stream","outputs":[{"name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"name":"stream_id","type":"uint256"}],"name":"cancel_stream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"stream_id","type":"uint256"}],"name":"execute","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"stream_ids","type":"uint256[]"}],"name":"execute_many","outputs":[{"name":"","type":"bool[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"stream_id","type":"uint256"}],"name":"is_due","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"streams_and_rewards_due","outputs":[{"name":"","type":"uint256[]"},{"name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stream_count","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"streams","outputs":[{"components":[{"name":"donor","type":"address"},{"name":"pool","type":"address"},{"name":"coins","type":"address[2]"},{"name":"amounts_per_period","type":"uint256[2]"},{"name":"period_length","type":"uint256"},{"name":"reward_per_period","type":"uint256"},{"name":"next_ts","type":"uint256"},{"name":"reward_remaining","type":"uint256"},{"name":"amounts_remaining","type":"uint256[2]"},{"name":"periods_remaining","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"outputs":[],"stateMutability":"nonpayable","type":"constructor"}]
```

</ContractABI>

:::


## Stream Management

### `create_stream`
::::description[`DonationStreamer.create_stream(pool: address, coins: address[2], amounts: uint256[2], period_length: uint256, n_periods: uint256, reward_per_period: uint256) -> uint256`]

Payable function to create a new refuel stream for a pool. The caller deposits the full token amounts and ETH rewards upfront. The contract adds the tokens to the pool's refuel buffer in portions over `n_periods`. The `coins` parameter must match the pool's coin configuration. Any excess ETH beyond the required `reward_per_period * n_periods` is refunded.

| Input               | Type           | Description                                                |
| ------------------- | -------------- | ---------------------------------------------------------- |
| `pool`              | `address`      | Address of the target FXSwap pool                          |
| `coins`             | `address[2]`   | Token addresses matching the pool's `coins(0)` and `coins(1)` |
| `amounts`           | `uint256[2]`   | Total token amounts to refuel across all periods           |
| `period_length`     | `uint256`      | Duration of each period in seconds                         |
| `n_periods`         | `uint256`      | Number of refuel periods                                   |
| `reward_per_period` | `uint256`      | ETH reward paid to the executor for each period            |

Returns: the stream ID (`uint256`).

Emits: `StreamCreated` event.

<SourceCode>

```vyper
@external
@payable
@nonreentrant
def create_stream(
    pool: address,
    coins: address[N_COINS],
    amounts: uint256[N_COINS],
    period_length: uint256,
    n_periods: uint256,
    reward_per_period: uint256,
) -> uint256:
    """
    @notice Create a donation stream for a pool.
    """
    assert pool != empty(address), "pool required"
    assert n_periods > 0, "bad n_periods"
    assert period_length > 0, "bad period_length"
    assert amounts[0] > 0 or amounts[1] > 0, "zero amounts"

    # Ensure caller-provided coins match the pool configuration.
    assert (
        coins[0] == staticcall DonationPoolTarget(pool).coins(0)
        and coins[1] == staticcall DonationPoolTarget(pool).coins(1)
    ), "coin mismatch"

    # Rewards are pre-funded for all periods; excess is refunded.
    reward_total: uint256 = reward_per_period * n_periods
    assert msg.value >= reward_total, "reward mismatch"

    # Per-period amounts are truncated; remainders donate on the final period.
    amounts_per_period: uint256[N_COINS] = empty(uint256[N_COINS])
    for i: uint256 in range(N_COINS):
        amount: uint256 = amounts[i]
        if amount > 0:
            balance_before: uint256 = staticcall IERC20(coins[i]).balanceOf(self)
            assert extcall IERC20(coins[i]).transferFrom(
                msg.sender, self, amount, default_return_value=True
            ), "transfer failed"
            balance_after: uint256 = staticcall IERC20(coins[i]).balanceOf(self)
            assert balance_after - balance_before == amount, "bad token transfer"
        amounts_per_period[i] = amount // n_periods

    stream_id: uint256 = self.stream_count
    self.stream_count = stream_id + 1

    self.streams[stream_id] = DonationStream(
        donor=msg.sender,
        pool=pool,
        coins=coins,
        amounts_per_period=amounts_per_period,
        period_length=period_length,
        reward_per_period=reward_per_period,
        next_ts=block.timestamp,
        reward_remaining=reward_total,
        amounts_remaining=amounts,
        periods_remaining=n_periods,
    )

    # Refund excess message value.
    if msg.value > reward_total:
        send(msg.sender, msg.value - reward_total)

    log StreamCreated(
        stream_id=stream_id,
        donor=msg.sender,
        pool=pool,
        amounts=amounts,
        period_length=period_length,
        n_periods=n_periods,
        reward_per_period=reward_per_period,
    )

    return stream_id
```

</SourceCode>

<Example>

```shell
>>> DonationStreamer.create_stream(
...     pool,                      # FXSwap pool address
...     [coin0, coin1],            # pool coin addresses
...     [1000e18, 500e18],         # total refuel amounts
...     86400,                     # period length: 1 day
...     7,                         # number of periods
...     0.001e18,                  # 0.001 ETH reward per period
...     value=0.007e18             # total ETH rewards
... )
0                                  # stream_id
```

</Example>

::::


### `cancel_stream`
::::description[`DonationStreamer.cancel_stream(stream_id: uint256)`]

:::guard[Guarded Method]

This function can only be called by the stream creator stored in `donor`.

:::

Cancels a stream and refunds all remaining tokens and ETH rewards to its creator. The stream storage is cleared after cancellation.

| Input       | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| `stream_id` | `uint256` | ID of the stream to cancel   |

Emits: `StreamCancelled` event.

<SourceCode>

```vyper
@external
@nonreentrant
def cancel_stream(stream_id: uint256):
    """
    @notice Cancel a stream and refund remaining balances.
    """
    stream: DonationStream = self.streams[stream_id]
    assert stream.donor == msg.sender, "donor only"

    pool: address = stream.pool
    coins: address[N_COINS] = stream.coins
    amounts_refund: uint256[N_COINS] = stream.amounts_remaining
    reward_refund: uint256 = stream.reward_remaining
    self.streams[stream_id] = empty(DonationStream)

    for i: uint256 in range(N_COINS):
        if amounts_refund[i] > 0:
            assert extcall IERC20(coins[i]).transfer(
                msg.sender, amounts_refund[i], default_return_value=True
            ), "refund failed"
    if reward_refund > 0:
        send(msg.sender, reward_refund)

    log StreamCancelled(
        stream_id=stream_id,
        donor=msg.sender,
        pool=pool,
        amounts=amounts_refund,
        reward_refund=reward_refund,
    )
```

</SourceCode>

<Example>

```shell
>>> DonationStreamer.cancel_stream(0)
```

</Example>

::::


---


## Stream Execution

### `execute`
::::description[`DonationStreamer.execute(stream_id: uint256) -> bool`]

Executes a single stream if it has due periods. The function calculates how many periods are due, adds the proportional refuel amounts through `add_liquidity(donation=True)`, and pays the caller the corresponding ETH reward. If all periods are completed, the stream storage is cleared. Returns `False` if no periods are due.

| Input       | Type      | Description                    |
| ----------- | --------- | ------------------------------ |
| `stream_id` | `uint256` | ID of the stream to execute    |

Returns: whether the stream was executed (`bool`).

Emits: `StreamExecuted` event.

<SourceCode>

```vyper
@external
@nonreentrant
def execute(stream_id: uint256) -> bool:
    """
    @notice Execute a single stream id.
    """
    return self._execute_stream(stream_id)


@internal
def _execute_stream(stream_id: uint256) -> bool:
    """
    @dev Execute a single stream if due and pay its reward.
    """
    stream: DonationStream = self.streams[stream_id]
    periods_due: uint256 = self._due_periods(stream)
    if periods_due == 0:
        return False

    is_final: bool = periods_due == stream.periods_remaining
    pool: address = stream.pool
    coins: address[N_COINS] = stream.coins

    # Compute the slice for this execution, using the remainder on the final call.
    amounts_to_donate: uint256[N_COINS] = empty(uint256[N_COINS])
    for j: uint256 in range(N_COINS):
        remaining: uint256 = stream.amounts_remaining[j]
        if remaining == 0:
            continue
        amount: uint256 = stream.amounts_per_period[j] * periods_due
        if is_final:
            amount = remaining
        amounts_to_donate[j] = amount
        stream.amounts_remaining[j] = remaining - amount

    stream.periods_remaining -= periods_due
    stream.next_ts += stream.period_length * periods_due

    # Rewards are prorated per period, with final execution paying the remainder.
    reward_paid: uint256 = stream.reward_per_period * periods_due
    if is_final:
        reward_paid = stream.reward_remaining
    stream.reward_remaining -= reward_paid

    # Clear storage once the stream is finished.
    if is_final:
        self.streams[stream_id] = empty(DonationStream)
    else:
        self.streams[stream_id] = stream

    # Only approve and add liquidity when there is a non-zero donation.
    if amounts_to_donate[0] > 0 or amounts_to_donate[1] > 0:
        balances_before: uint256[N_COINS] = empty(uint256[N_COINS])
        for j: uint256 in range(N_COINS):
            if amounts_to_donate[j] > 0:
                balances_before[j] = staticcall IERC20(coins[j]).balanceOf(self)
        for j: uint256 in range(N_COINS):
            if amounts_to_donate[j] > 0:
                self._safe_approve(coins[j], pool, amounts_to_donate[j])
        extcall DonationPoolTarget(pool).add_liquidity(
            amounts_to_donate,
            0,
            empty(address),
            True,
        )
        for j: uint256 in range(N_COINS):
            if amounts_to_donate[j] > 0:
                balance_after: uint256 = staticcall IERC20(coins[j]).balanceOf(self)
                assert balances_before[j] >= balance_after, "bad pool pull"
                assert balances_before[j] - balance_after == amounts_to_donate[j], "bad pool pull"
                self._safe_approve(coins[j], pool, 0)

    if reward_paid > 0:
        send(msg.sender, reward_paid)
    log StreamExecuted(
        stream_id=stream_id,
        caller=msg.sender,
        pool=pool,
        periods=periods_due,
        amounts=amounts_to_donate,
        reward_paid=reward_paid,
    )

    return True


@internal
def _safe_approve(token: address, spender: address, amount: uint256):
    """
    @dev Safely set allowance, resetting to zero when needed.
    """
    allowance: uint256 = staticcall IERC20(token).allowance(self, spender)
    if allowance == amount:
        return
    if allowance != 0 and amount != 0:
        assert extcall IERC20(token).approve(
            spender, 0, default_return_value=True
        ), "approve failed"
    assert extcall IERC20(token).approve(
        spender, amount, default_return_value=True
    ), "approve failed"


@internal
@view
def _due_periods(stream: DonationStream) -> uint256:
    """
    @dev Return the number of due periods for a stream.
    """
    if (
        stream.donor == empty(address)
        or stream.periods_remaining == 0
        or stream.period_length == 0
        or block.timestamp < stream.next_ts
    ):
        return 0

    return min(
        (block.timestamp - stream.next_ts) // stream.period_length + 1,
        stream.periods_remaining,
    )
```

</SourceCode>

<Example>

```shell
>>> DonationStreamer.execute(0)
True
```

</Example>

::::


### `execute_many`
::::description[`DonationStreamer.execute_many(stream_ids: DynArray[uint256, 32]) -> DynArray[bool, 32]`]

Executes a batch of streams in a single transaction. Each stream is processed independently — if a stream is not due, its result is `False`. The caller receives the combined ETH rewards for all successfully executed streams. Maximum batch size is 32.

| Input        | Type                    | Description                         |
| ------------ | ----------------------- | ----------------------------------- |
| `stream_ids` | `DynArray[uint256, 32]` | Array of stream IDs to execute      |

Returns: per-stream execution results in input order (`DynArray[bool, 32]`).

<SourceCode>

```vyper
@external
@nonreentrant
def execute_many(stream_ids: DynArray[uint256, N_MAX_EXECUTE]) -> DynArray[bool, N_MAX_EXECUTE]:
    """
    @notice Execute a batch of stream ids.
    @return Per-stream execution results in input order.
    """
    results: DynArray[bool, N_MAX_EXECUTE] = empty(DynArray[bool, N_MAX_EXECUTE])
    for i: uint256 in range(len(stream_ids), bound=N_MAX_EXECUTE):
        results.append(self._execute_stream(stream_ids[i]))
    return results
```

</SourceCode>

<Example>

```shell
>>> DonationStreamer.execute_many([0, 1, 2])
[True, True, False]
```

</Example>

::::


---


## View Methods

### `is_due`
::::description[`DonationStreamer.is_due(stream_id: uint256) -> bool: view`]

Returns `True` if the stream has one or more periods that can be executed now.

| Input       | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| `stream_id` | `uint256` | ID of the stream to check     |

Returns: whether the stream is due for execution (`bool`).

<SourceCode>

```vyper
@view
@external
def is_due(stream_id: uint256) -> bool:
    """
    @notice Return true if the stream can be executed now.
    """
    return self._due_periods(self.streams[stream_id]) > 0


@internal
@view
def _due_periods(stream: DonationStream) -> uint256:
    """
    @dev Return the number of due periods for a stream.
    """
    if (
        stream.donor == empty(address)
        or stream.periods_remaining == 0
        or stream.period_length == 0
        or block.timestamp < stream.next_ts
    ):
        return 0

    return min(
        (block.timestamp - stream.next_ts) // stream.period_length + 1,
        stream.periods_remaining,
    )
```

</SourceCode>

<Example>

<ContractCall
  address="0x2b786BB995978CC2242C567Ae62fd617b0eBC828"
  abi={["function is_due(uint256) view returns (bool)"]}
  method="is_due"
  args={["0"]}
  labels={["stream_id"]}
  contractName="DonationStreamer"
/>

</Example>

::::


### `streams_and_rewards_due`
::::description[`DonationStreamer.streams_and_rewards_due() -> (DynArray[uint256, 1024], DynArray[uint256, 1024]): view`]

Returns two arrays: the IDs of all due streams and their corresponding ETH rewards, ordered from newest to oldest. Iterates over up to 1024 streams starting from the most recent. This function is intended for off-chain use (e.g., by keeper bots) and should not be called on-chain.

Returns: a tuple of (due stream IDs, corresponding rewards) (`DynArray[uint256, 1024]`, `DynArray[uint256, 1024]`).

<SourceCode>

```vyper
@view
@external
def streams_and_rewards_due(
) -> (DynArray[uint256, N_MAX_VIEW], DynArray[uint256, N_MAX_VIEW]):
    """
    @notice Return due stream ids and rewards, newest first.
    @dev Not meant to be called onchain; iterates over up to N_MAX_VIEW streams starting from the newest.
    """
    due_ids: DynArray[uint256, N_MAX_VIEW] = empty(DynArray[uint256, N_MAX_VIEW])
    rewards: DynArray[uint256, N_MAX_VIEW] = empty(DynArray[uint256, N_MAX_VIEW])
    count: uint256 = self.stream_count
    if count == 0:
        return due_ids, rewards

    # Walk backward from newest to oldest, capped for view usage.
    limit: uint256 = min(count, N_MAX_VIEW)
    for i: uint256 in range(limit, bound=N_MAX_VIEW):
        stream_id: uint256 = count - 1 - i
        stream: DonationStream = self.streams[stream_id]
        periods_due: uint256 = self._due_periods(stream)
        if periods_due == 0:
            continue

        due_ids.append(stream_id)
        if periods_due == stream.periods_remaining:
            rewards.append(stream.reward_remaining)
        else:
            rewards.append(stream.reward_per_period * periods_due)

    return due_ids, rewards
```

</SourceCode>

<Example>

```shell
>>> DonationStreamer.streams_and_rewards_due()
([2, 0], [1000000000000000, 3000000000000000])
```

</Example>

::::


### `stream_count`
::::description[`DonationStreamer.stream_count() -> uint256: view`]

Returns the total number of streams that have been created. Stream IDs are sequential starting from 0.

Returns: total number of streams created (`uint256`).

<SourceCode>

```vyper
stream_count: public(uint256)
```

</SourceCode>

<Example>

<ContractCall
  address="0x2b786BB995978CC2242C567Ae62fd617b0eBC828"
  abi={["function stream_count() view returns (uint256)"]}
  method="stream_count"
  contractName="DonationStreamer"
/>

</Example>

::::


### `streams`
::::description[`DonationStreamer.streams(arg0: uint256) -> DonationStream: view`]

Returns the full `DonationStream` struct for a given stream ID. Completed or cancelled streams return a zeroed-out struct.

The `DonationStream` struct contains the following fields:

| Field                | Type           | Description                                              |
| -------------------- | -------------- | -------------------------------------------------------- |
| `donor`              | `address`      | Address of the stream creator; legacy field name         |
| `pool`               | `address`      | Target FXSwap pool address                               |
| `coins`              | `address[2]`   | Token addresses for the pool                             |
| `amounts_per_period` | `uint256[2]`   | Token amounts added as refuel per period                 |
| `period_length`      | `uint256`      | Duration of each period in seconds                       |
| `reward_per_period`  | `uint256`      | ETH reward paid per period execution                     |
| `next_ts`            | `uint256`      | Timestamp when the next period becomes due               |
| `reward_remaining`   | `uint256`      | Total ETH rewards still to be paid out                   |
| `amounts_remaining`  | `uint256[2]`   | Token amounts still scheduled for refueling              |
| `periods_remaining`  | `uint256`      | Number of periods left to execute                        |

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `uint256` | Stream ID     |

Returns: the stream data (`DonationStream`).

<SourceCode>

```vyper
struct DonationStream:
    # Static
    donor: address
    pool: address
    coins: address[N_COINS]
    amounts_per_period: uint256[N_COINS]
    period_length: uint256
    reward_per_period: uint256
    # Dynamic
    next_ts: uint256
    reward_remaining: uint256
    amounts_remaining: uint256[N_COINS]
    periods_remaining: uint256

streams: public(HashMap[uint256, DonationStream])
```

</SourceCode>

<Example>

<ContractCall
  address="0x2b786BB995978CC2242C567Ae62fd617b0eBC828"
  abi={["function streams(uint256) view returns (tuple(address donor, address pool, address[2] coins, uint256[2] amounts_per_period, uint256 period_length, uint256 reward_per_period, uint256 next_ts, uint256 reward_remaining, uint256[2] amounts_remaining, uint256 periods_remaining))"]}
  method="streams"
  args={["0"]}
  labels={["stream_id"]}
  contractName="DonationStreamer"
/>

</Example>

::::
