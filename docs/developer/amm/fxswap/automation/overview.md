---
title: Automating FXSwap Refuels
sidebar_label: Automation
---

# Automating FXSwap Refuels

The permissionless refuel-automation contracts let a provider escrow token amounts and ETH execution rewards, release refuels on a schedule, and pay any account that executes due periods. The deployed contract names retain the earlier `DonationStreamer` terminology; the product mechanism remains a **refuel**.

Use the [DonationStreamer reference](./donation-streamer.md) to create, inspect, execute, or cancel individual streams. [StreamExecutor](./stream-executor.md) is an optional batching helper for keeper bots.

## Contract roles

| Party or contract | Responsibility | Risk borne |
| --- | --- | --- |
| Refuel provider | Chooses pool, amounts, schedule, and reward; funds tokens and ETH upfront | Token custody, pool/refuel failures, and an underpriced execution reward |
| `DonationStreamer` | Escrows funds, tracks periods, calls the pool, refunds cancellation balances, and pays executors | No admin or upgrade authority; behavior is fixed by deployed code |
| Executor | Submits due streams and receives the funded ETH reward | Gas, failed execution, competition, and reward profitability |
| `StreamExecutor` | Finds due streams, batches up to 32 IDs per streamer call, and forwards earned ETH | A failing stream can revert the batch; the caller bears the transaction cost |
| FXSwap pool | Applies the refuel cap, unlock schedule, protection, fee, and recentering rules | Can reject a scheduled period when live pool guards are not satisfied |

There is no owner or admin on `DonationStreamer`. A stream can be cancelled only by the address stored in its immutable `donor` field. Anyone can execute a due stream.

## Lifecycle

1. **Approve tokens.** The provider approves `DonationStreamer` for each non-zero total amount.
2. **Create the stream.** `create_stream` pulls the full token totals and escrows `reward_per_period * n_periods` in ETH.
3. **Wait until due.** The stream starts with `next_ts` equal to the creation timestamp; later periods advance by `period_length`.
4. **Execute one or more periods.** Any caller can execute. The streamer approves the pool, calls `add_liquidity(..., donation=True)`, and pays the proportional ETH reward.
5. **Complete or cancel.** The final execution clears storage. Before completion, only the creator can cancel and recover remaining tokens and reward.

Integer division determines `amounts_per_period`. Any token remainder is included in the final period.

## Custody and approvals

Creating a stream transfers the full scheduled token amounts into `DonationStreamer`; the provider no longer holds them. Approve the streamer address, not the pool, for stream creation. During execution, the streamer grants the target pool only the amount needed for that call and resets the allowance afterward.

The contract checks that:

- `coins[0]` and `coins[1]` match the target pool;
- at least one amount is non-zero;
- `period_length` and `n_periods` are positive;
- token balance changes exactly match requested transfers;
- the ETH value covers all configured rewards.

Fee-on-transfer and rebasing tokens therefore require explicit compatibility testing and can fail the exact-balance checks.

## Execution economics and failure recovery

Executors decide whether the funded reward covers gas and transaction risk. The protocol does not top up an underpriced stream, and no keeper is obligated to execute it.

A due execution can fail because the FXSwap refuel cap is reached, token approval or transfer behavior changes, the target pool is incompatible, or another state-dependent pool guard reverts. Funds remain in stream storage after a reverted transaction. Recovery options are:

- retry after the pool state or cap allows the refuel;
- execute the stream directly instead of through a batch to isolate the failure; or
- have the creator cancel the stream and recover remaining escrow.

`execute(stream_id)` returns `False` when no period is due. A reverted pool call is different: it reverts the transaction and pays no reward.

`StreamExecutor.execute()` is atomic. If a streamed pool call reverts, the helper transaction reverts and does not forward rewards from that attempt. Keeper implementations should be able to fall back to individual `DonationStreamer.execute(id)` calls to isolate the failing stream.

## Discover and monitor streams

Index these events:

- `StreamCreated` to discover the stream ID, creator, pool, token totals, period length, period count, and reward;
- `StreamExecuted` to record periods completed, token amounts added, and reward paid;
- `StreamCancelled` to close the stream and record token and reward refunds.

Read `stream_count()` to bound enumeration and `streams(id)` for current storage. `is_due(id)` checks one stream. `streams_and_rewards_due()` returns up to the contract's view bound of due IDs and rewards for keeper discovery.

Completed or cancelled stream IDs are not reused; their `streams(id)` getter returns a zeroed struct. Indexers should derive lifecycle status from events plus current storage rather than treating an empty struct as proof of which terminal action occurred.

## Operational checklist

- Verify the deployed automation address and source on each supported chain.
- Confirm the target pool and exact coin ordering before approval.
- Size executor rewards against realistic gas and competition.
- Monitor due-but-unexecuted periods and pool cap utilization.
- Alert on repeated execution failures and keep creator cancellation access available.
- Reconcile streamer token and ETH escrow with indexed stream state.
- Remember that automation schedules refuels; it does not guarantee recentering or prevent depletion.
