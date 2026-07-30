# StreamExecutor

The `StreamExecutor` is a convenience contract that batch-executes all due donation streams in a single call and forwards the earned ETH rewards to the caller. It queries the [`DonationStreamer`](./donation-streamer.md) for due streams, executes them in chunks of 32, and sends the accumulated ETH balance to `msg.sender`.

This contract is designed for keeper bots that want to claim all available rewards with a single transaction. Streams can also be executed via the [frontend UI](https://curvefi.github.io/refuel-automation/).

:::vyper[`StreamExecutor.vy`]

The source code for the `StreamExecutor.vy` contract can be found on [GitHub](https://github.com/curvefi/refuel-automation). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed at the same address on all chains (via CREATE3):

- :logos-ethereum: Ethereum: [`0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A`](https://etherscan.io/address/0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A)
- :logos-gnosis: Gnosis: [`0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A`](https://gnosisscan.io/address/0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A)
- :logos-polygon: Polygon: [`0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A`](https://polygonscan.com/address/0x4a8Cc5Cb8f7242be9944E1313793c2E5411c462A)

<ContractABI>


```json
[{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"execute","outputs":[],"stateMutability":"nonpayable","type":"function"}]
```

</ContractABI>

:::


## Execution

### `execute`
::::description[`StreamExecutor.execute()`]

Queries all due streams from the [`DonationStreamer`](./donation-streamer.md), executes them in batches of 32 via `execute_many`, and sends the accumulated ETH rewards to the caller. If no streams are due, the call succeeds but no ETH is sent.

<SourceCode>

```vyper
STREAMER: constant(address) = 0x2b786BB995978CC2242C567Ae62fd617b0eBC828

@external
def execute():
    self._execute_due()


@internal
def _execute_due():
    due_ids: DynArray[uint256, N_MAX_VIEW] = empty(DynArray[uint256, N_MAX_VIEW])
    rewards: DynArray[uint256, N_MAX_VIEW] = empty(DynArray[uint256, N_MAX_VIEW])
    due_ids, rewards = staticcall DonationStreamer(STREAMER).streams_and_rewards_due()

    chunk: DynArray[uint256, N_MAX_EXECUTE] = empty(DynArray[uint256, N_MAX_EXECUTE])
    for i: uint256 in range(len(due_ids), bound=N_MAX_VIEW):
        chunk.append(due_ids[i])
        if len(chunk) == N_MAX_EXECUTE:
            extcall DonationStreamer(STREAMER).execute_many(chunk)
            chunk = empty(DynArray[uint256, N_MAX_EXECUTE])

    if len(chunk) > 0:
        extcall DonationStreamer(STREAMER).execute_many(chunk)

    if self.balance > 0:
        send(msg.sender, self.balance)
```

</SourceCode>

<Example>

```shell
>>> StreamExecutor.execute()
```

</Example>

::::


### `__default__`
::::description[`StreamExecutor.__default__()`]

Payable fallback function that allows the contract to receive ETH from the `DonationStreamer` during stream execution. The `DonationStreamer` sends ETH rewards to `msg.sender` (the `StreamExecutor`) which are then forwarded to the original caller in the `execute` function.

<SourceCode>

```vyper
@external
@payable
def __default__():
    pass
```

</SourceCode>

<Example>

```shell
# ETH is received automatically when DonationStreamer pays rewards
# No direct user interaction needed
```

</Example>

::::
