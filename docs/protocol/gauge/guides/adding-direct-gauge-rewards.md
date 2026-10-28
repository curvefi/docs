---
id: adding-direct-gauge-rewards
title: Adding Direct Gauge Rewards
sidebar_label: Adding Direct Gauge Rewards
---

Direct gauge rewards are token rewards that can simply be added to a Curve gauge. They don't require any DAO approval as they are not based on gauge weights and CRV emissions but rather use external rewards provided by someone else. While conceptually permissionless, only the **gauge manager** (typically the deployer) can authorize and deposit these rewards. This is done to prevent malicious actors from spamming the gauge with fake scam tokens. 

Currently, there is no UI for this process. This guide explains how to add direct gauge rewards using **Etherscan**. On other chains, use that chain's block explorer; the functions are the same.

## Before You Start

To add direct gauge rewards:

- You must be the **manager** of the gauge (typically the address that deployed it)
- The reward token must be transferable and follow standard behavior
- You need a token balance and must approve the gauge contract to spend it
- You will interact directly with **Etherscan**

You can check the `manager` or `admin` address under the **Read Contract** tab of your gauge contract.

Only a maximum of **8 unique reward tokens** can be added to a single gauge. Once added, a reward token cannot be removed.

## Understanding the Gauge Manager Role

The gauge deployer is automatically assigned as the **manager**. This role allows:

- Transferring manager status to another address
- Calling `add_reward` to register a reward token and assign a distributor address

For example, if you want to add USDC as a direct gauge reward, the `manager` would call `add_reward` with the USDC token address and the address that will act as the distributor. The distributor is the only address allowed to deposit that token to the gauge.

Only the **manager** can call `add_reward`, and only the assigned **distributor** can deposit rewards.

## Step 1: Set Distributor for a Token

Go to your **Gauge Contract** on [Etherscan](https://etherscan.io), connect your wallet, and open the **Write Contract** tab. Make sure you are connected with the `manager` wallet.

Call `add_reward` and input:

- `_reward_token`: the address of the reward token you want to add
- `_distributor`: the address that will fund the gauge with this token

This function can only be called once per reward token.

## Step 2: Approve the Reward Token

Go to the **reward token's contract** (e.g. USDC) on Etherscan. Under **Write Contract**, call `approve`:

- `_spender`: the gauge contract address
- `_value`: the number of tokens you want to approve for deposit

This grants the gauge permission to transfer the reward tokens from the distributor.

## Step 3: Deposit the Reward Tokens

Return to the gauge contract's **Write Contract** tab and call `deposit_reward_token`:

- `_reward_token`: the token address previously added
- `_amount`: the amount of tokens to deposit
- `_epoch`: the number of seconds over which the tokens will be distributed  
  *(Optional – if omitted, defaults to one week or 604800 seconds)*

Rewards are streamed evenly over the specified time period. If more tokens are added during an ongoing epoch, the remaining balance and the new deposit are combined, and a new epoch begins.

Once the reward tokens are deposited, Curve LPs will:

- See the reward token listed in the Curve UI
- Receive the reward automatically when claiming CRV or other incentives

There is no additional setup needed on the user side.

## Claiming and Viewing Rewards

From a user side, rewards can simply be claimed via the UI. More here: [Claiming Rewards](/user/dex/guides/claim-rewards).
