---
id: adding-direct-gauge-rewards
title: Adding Direct Gauge Rewards
sidebar_label: Adding Direct Gauge Rewards
---

**Direct gauge rewards** are tokens you deposit into a Curve gauge, which streams them to staked LPs. They need no DAO vote, but only the gauge manager can register a reward token, which keeps scam tokens out of gauges.

You can add them in the Curve app or directly on a block explorer. Both call the same gauge functions.

## Before You Start

- **Gauge:** the pool already has a gauge. Anyone can deploy one, and the factory allows one gauge per pool.
- **Manager:** you use the wallet that deployed the gauge, which is its `manager`. Only the manager (or the Curve DAO) can register a reward token. The manager can also transfer the role to another address.
- **Distributor:** for each reward token, the manager names one distributor, the only address that can deposit that token. It can be the manager or any other address, and it needs the tokens it will deposit.
- **Token:** a standard, transferable ERC-20. A gauge holds at most 8 reward tokens, and a token can't be removed once added.

## Step 1: Register the Reward Token

Open your pool on [curve.finance](https://www.curve.finance/dex/ethereum/pools) and connect the manager wallet. Go to the **Gauge** tab, then **Add Reward**. The tab only shows for the gauge manager or a reward distributor.

1. Pick the reward token under **Token**.
2. Enter the distributor's address under **Distributor**. It defaults to your connected wallet.
3. Click **Add Reward** and confirm the transaction.

<img src="/img/protocol/gauge/direct-rewards/app-add-reward.png" alt="In the Gauge tab, Add Reward: pick the token, enter the distributor address and click Add Reward" width="425" />

You can register each reward token once.

## Step 2: Deposit the Rewards

Connect the distributor wallet and open **Gauge**, then **Deposit Reward**.

1. Pick the registered token and enter the **Amount to deposit**.
2. Set the **Distribution duration (in weeks)**. It defaults to 1 week.
3. Click **Approve** to let the gauge transfer the token, then **Deposit**.

<img src="/img/protocol/gauge/direct-rewards/app-deposit-reward.png" alt="In the Gauge tab, Deposit Reward: enter the amount and the distribution duration in weeks, then approve and deposit" width="425" />

The gauge streams the tokens evenly over the period. If you deposit more during a running period, the remaining balance and the new deposit combine and a new period starts.

Once the deposit lands, the reward token shows in the Curve UI and staked LPs receive it when they claim. LPs don't need to do anything else.

## Using Etherscan Instead

On Ethereum, use [Etherscan](https://etherscan.io). On other chains, use that chain's block explorer; the functions are the same. Open the gauge contract, go to **Write Contract** and connect the right wallet for each call.

1. **Register the token (manager wallet).** Call `add_reward` with `_reward_token` (the token address) and `_distributor` (the address that will fund the gauge).

   <img src="/img/protocol/gauge/direct-rewards/etherscan-add-reward.png" alt="Etherscan Write Contract: add_reward with the reward token and distributor addresses" width="520" />

2. **Approve the token (distributor wallet).** On the reward token's contract, call `approve` with `_spender` (the gauge address) and `_value` (the amount the gauge may transfer).
3. **Deposit (distributor wallet).** On the gauge, call `deposit_reward_token` with `_reward_token`, `_amount` and, optionally, `_epoch`.

   <img src="/img/protocol/gauge/direct-rewards/etherscan-deposit-reward-token.png" alt="Etherscan Write Contract: deposit_reward_token with the token, amount and epoch in seconds" width="520" />

`_epoch` is in seconds, while the app asks for weeks. It defaults to one week (604800 seconds). Gauges on chains other than Ethereum require between 3 days (259200 seconds) and 48 weeks (29030400 seconds).

## Claiming and Viewing Rewards

LPs claim rewards in the Curve UI. See [Claiming Rewards](/user/dex/guides/claim-rewards).
