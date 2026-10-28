---
id: adding-direct-gauge-rewards
title: Adding Direct Gauge Rewards
sidebar_label: Adding Direct Gauge Rewards
---

**Direct gauge rewards** are tokens you deposit into a Curve gauge, which streams them to staked LPs. They need no DAO vote, but only the gauge manager can register a reward token, which keeps scam tokens out of gauges.

There is no UI for this yet. This guide uses Etherscan on Ethereum. On other chains, use that chain's block explorer; the functions are the same.

## Before You Start

- **Manager:** the address that deployed the gauge becomes its `manager`. Only the manager can call `add_reward`, which registers a reward token and the distributor allowed to deposit it. The manager can also transfer the role to another address. Check the `manager` address under the gauge's **Read Contract** tab.
- **Distributor:** the one address that can deposit a given reward token. It can be the manager or any other address.
- **Token:** a standard, transferable ERC-20. A gauge holds at most 8 reward tokens, and a token can't be removed once added.
- **Balance:** the distributor needs the tokens it will deposit.

For example, to add USDC as a reward, the manager calls `add_reward` with the USDC address and the distributor's address. From then on, only that distributor can deposit USDC to the gauge.

## Step 1: Set the Distributor for a Token

Open your gauge contract on [Etherscan](https://etherscan.io), go to **Write Contract** and connect the manager wallet.

Call `add_reward` with:

- `_reward_token`: the address of the reward token
- `_distributor`: the address that will fund the gauge with this token

You can call `add_reward` once per reward token.

## Step 2: Approve the Reward Token

Open the reward token's contract (for example USDC). Under **Write Contract**, connect the distributor wallet and call `approve` with:

- `_spender`: the gauge contract address
- `_value`: the amount the gauge may transfer

## Step 3: Deposit the Reward Tokens

Back on the gauge's **Write Contract** tab, call `deposit_reward_token` from the distributor wallet with:

- `_reward_token`: the token address you added
- `_amount`: the amount to deposit
- `_epoch`: the number of seconds to stream the tokens over (optional; defaults to one week, 604800 seconds)

The gauge streams the tokens evenly over the period. If you deposit more during a running period, the remaining balance and the new deposit combine and a new period starts.

Once the deposit lands, the reward token shows in the Curve UI and staked LPs receive it when they claim. LPs don't need to do anything else.

## Claiming and Viewing Rewards

LPs claim rewards in the Curve UI. See [Claiming Rewards](/user/dex/guides/claim-rewards).
