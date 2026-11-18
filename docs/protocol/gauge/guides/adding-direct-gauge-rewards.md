---
id: adding-direct-gauge-rewards
title: Adding Direct Gauge Rewards
sidebar_label: Adding Direct Gauge Rewards
description: How the gauge manager registers a reward token and deposits rewards into a Curve gauge, in the Curve app or on a block explorer.
---

When you finish, your gauge streams your reward token to staked LPs.

Each deposit streams over a period you choose, from 3 days to 48 weeks.

[Curve Gauges and Incentives](../overview.md#direct-gauge-rewards) explains what direct gauge rewards are and their limits.

## Before You Start

You need the pool's gauge, the wallet that deployed it, and the reward tokens.

It costs your reward budget plus gas for three transactions: register, approve and deposit.

Rewards start streaming from the deposit transaction.

Nobody approves it, since direct rewards need no Curve DAO vote.

## Register the Reward Token {#step-1-register-the-reward-token}

The deploying wallet is the gauge's `manager`, and only the manager or the Curve DAO can register a reward token. For each token, the manager names one distributor, the only address that can deposit that token. The distributor can be the manager or any other address.

1. Open your pool on [curve.finance](https://www.curve.finance/dex/ethereum/pools) and connect the manager wallet.
2. Open the **Gauge** tab, then **Add Reward**. The **Gauge** tab only shows for the gauge manager or a reward distributor.
3. Pick the reward token under **Token**.
4. Enter the distributor's address under **Distributor**. It defaults to your connected wallet.
5. Select **Add Reward** and confirm the transaction.

<img src="/img/protocol/gauge/direct-rewards/app-add-reward.png" alt="In the Gauge tab, Add Reward: pick the token, enter the distributor address and click Add Reward" width="425" />

You can register each reward token once.

## Deposit the Rewards {#step-2-deposit-the-rewards}

1. Connect the distributor wallet and open **Gauge**, then **Deposit Reward**.
2. Pick the registered token and enter the **Amount to deposit**.
3. Set the **Distribution duration (in weeks)**. It defaults to 1 week.
4. Select **Approve** to let the gauge transfer the token, and confirm.
5. Select **Deposit** and confirm.

<img src="/img/protocol/gauge/direct-rewards/app-deposit-reward.png" alt="In the Gauge tab, Deposit Reward: enter the amount and the distribution duration in weeks, then approve and deposit" width="425" />

The gauge streams the tokens evenly over the period. A deposit during a running period combines the remaining balance with the new amount and starts a new period.

## Use a Block Explorer Instead {#using-etherscan-instead}

On Ethereum, use [Etherscan](https://etherscan.io). On other chains, use that chain's block explorer, where the functions are the same.

1. Open the gauge contract, go to **Write Contract** and connect the manager wallet.
2. Call `add_reward` with `_reward_token` (the token address) and `_distributor` (the address that will fund the gauge).

   <img src="/img/protocol/gauge/direct-rewards/etherscan-add-reward.png" alt="Etherscan Write Contract: add_reward with the reward token and distributor addresses" width="520" />

3. Connect the distributor wallet. On the reward token's contract, call `approve` with `_spender` (the gauge address) and `_value` (the amount the gauge may transfer).
4. On the gauge, call `deposit_reward_token` with `_reward_token`, `_amount` and, optionally, `_epoch`.

   <img src="/img/protocol/gauge/direct-rewards/etherscan-deposit-reward-token.png" alt="Etherscan Write Contract: deposit_reward_token with the token, amount and epoch in seconds" width="520" />

`_epoch` is in seconds, while the app asks for weeks: 3 days (259200 seconds) to 48 weeks (29030400 seconds), 1 week (604800 seconds) by default.

## Check It Worked

- The reward token shows on the pool page in the Curve app.
- The deposit transaction appears on the chain's block explorer.
- On the gauge's **Read Contract** tab, `reward_data(<token address>)` returns your distributor and a `period_finish` in the future.

## Next Step {#claiming-and-viewing-rewards}

Staked LPs claim the rewards themselves. Point them to [Claiming LP Rewards](/user/dex/guides/claim-rewards).
