---
id: donation-streamer
title: Automating FXSwap Refuels
sidebar_label: "Automating Refuels"
description: How to schedule FXSwap refuels with the DonationStreamer contract, so tokens reach a pool's refuel buffer each period without manual top-ups.
---

When you finish, a refuel stream sends tokens to your FXSwap pool's refuel buffer on a schedule you set, and executes without your involvement.

Creating a stream takes one approval per token and one transaction. An automated bot executes due refuels every 8 hours.

## Before You Start

You need a wallet on a chain where the `DonationStreamer` contract is deployed (Ethereum, Gnosis, Base or Polygon, listed in the [contract reference](/developer/amm/fxswap/automation/donation-streamer)), the FXSwap pool's address and the tokens you want to stream.

It costs the tokens you stream, a small ETH bounty per period for whoever executes it, and gas.

It takes three transactions at most: an approval for each token you stream, then the stream itself.

Nobody approves it. You can cancel the stream at any time and recover what is left.

The contract and the UI use the legacy name **donation**. The mechanism is a refuel: tokens go into a finite buffer that the pool uses to rebalance. [Understanding FXSwap](../understanding-fxswap.md#refuels) explains how refuels are spent.

## Load the Pool

1. Open the [Donation Streamer UI](https://curvefi.github.io/refuel-automation/) and select **Connect Wallet**. Check that your wallet is on the pool's chain.
2. Leave the pre-filled **DonationStreamer Address** as it is.
3. Enter the FXSwap pool's **Pool Address** and select **Load Pool**. The **Coin 0** and **Coin 1** boxes show each token, your balance and your allowance.

<figure>
  <img src={require('@site/static/img/protocol/automate-donations/overview.png').default} alt="Donation Streamer UI overview" style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }} />
  <figcaption></figcaption>
</figure>

## Configure the Stream

1. Enter **Amount Coin 0** and **Amount Coin 1**, the total of each token to stream across all periods. Set one to `0` to stream a single token.
2. Set **Period Length (sec)**, how often a refuel happens. The default `86400` is once a day.
3. Set **Number of Periods**, how many refuels to run. The default is `7`.
4. Set **Reward per Period (ETH)**, the bounty for whoever executes each refuel. The default is `0.01`.

The UI shows the **Total Reward**, the bounty per period times the number of periods, which you send with the transaction.

<figure>
  <img src={require('@site/static/img/protocol/automate-donations/overview-filled.png').default} alt="Donation Streamer UI with filled values" style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }} />
  <figcaption></figcaption>
</figure>

The example above streams 30 crvUSD into a crvUSD/ZCHF pool over 3 daily periods, with a 0.001 ETH bounty per period.

## Create the Stream

1. Select **Approve Coin 0** and **Approve Coin 1** for each token with an amount above zero. The status bar confirms each approval.
2. Select **Create Stream** and confirm the transaction. The tokens and the ETH bounty are now locked in the contract.

## Check It Worked

1. In **Pool Streams**, set **Lookback (count)** and select **Load Pool Streams**. Your stream is marked **(you)**, with its remaining periods, amounts and time to the next execution.
2. Track refuels for the pool on the [Refuel Monitor](https://refuel.curvemonitor.com/ethereum). Its legacy labels show **Donation Shares**, the total refuel buffer, and **Unlocked Shares**, the part released for use.

<figure>
  <img src={require('@site/static/img/protocol/automate-donations/pool-streams.png').default} alt="Pool Streams showing active refuel streams" style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }} />
  <figcaption></figcaption>
</figure>

<figure>
  <img src={require('@site/static/img/protocol/automate-donations/donation-stats.png').default} alt="Refuel shares and daily refuel activity" style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }} />
  <figcaption></figcaption>
</figure>

<figure>
  <img src={require('@site/static/img/protocol/automate-donations/top-donors.png').default} alt="Top refuel providers leaderboard" style={{ width: '100%', maxWidth: '800px', display: 'block', margin: '0 auto' }} />
  <figcaption></figcaption>
</figure>

## Execute or Cancel a Stream {#execution}

The [automated bot](https://github.com/curvefi/refuel-automation) executes all due streams every 8 hours. To execute due streams yourself and collect the bounties, select **Execute via Executor** in the **Stream Executor** section.

To stop a stream, find it in **Pool Streams** and select **Cancel**. You get back the remaining tokens and the unspent bounty.

## Next Step

[Troubleshooting Curve Pools](../troubleshooting.md#an-fxswap-pool-drifts-from-the-market-price) covers what to do if the pool still drifts from the market price.
