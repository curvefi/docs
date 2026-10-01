---
id: faq
title: FAQ
sidebar_label: FAQ
---

# Frequently Asked Questions

## General Questions

### What is the minimum lock time for CRV?
The minimum lock time is **1 week**.

### What is the maximum lock time for CRV?
The maximum lock time is **4 years**.

### Can I transfer my veCRV tokens?
No, veCRV tokens are **non-transferable**. They are locked to your address and cannot be sent to other wallets.

### Can I have multiple locks?
No, you can only have **one active lock per address**. However, you can extend your existing lock or add more CRV to it.

### Can I withdraw my CRV before the lock expires?
No, CRV locks are **irreversible**. You can only withdraw your original CRV tokens after the lock period ends.
 
## Boosting Questions

### What is the maximum boost I can get?
The maximum boost is **2.5x** on your liquidity rewards.

### How do I check my current boost?
Open your Ethereum pool from **Your Positions** on the [Pools page](https://www.curve.finance/dex/ethereum/pools/). Select **Liquidity Details** on the pool page to see **veCRV Boost**.

### Why isn't my boost updating?
Boosts are only updated when you make a withdrawal, deposit, or claim from a liquidity gauge. Try claiming your CRV rewards to update the boost.

## Revenue Questions

### How often are rewards distributed?
Rewards are distributed **weekly** and can be claimed within 24 hours after Thursday 00:00 UTC.

### What token are rewards paid in?
Currently, rewards are paid in **crvUSD**. Previously, they were paid in 3CRV.

### Do I need to claim rewards every week?
No, rewards accumulate and can be claimed at any time without forfeiting any rewards.

## Technical Questions

### How is veCRV calculated?
veCRV is calculated using the formula: $veCRV = \frac{CRV_{locked} \times {locktime_{left}}}{4}$

### How does the boost formula work?
The boost formula is: $B = \min\left(2.5, 0.4 + 2.5 \times \frac{\text{veCRV}_\text{user}}{\text{veCRV}_\text{total}} \times \frac{\text{Value}_\text{pool}}{\text{Value}_\text{user}}\right)$

### Where can I find the total veCRV supply?
You can find the current total veCRV supply on the [calculator page](https://dao-old.curve.finance/minter/calc).

## Locking & Management Questions

### How do I lock my CRV tokens?
Visit the [CRV Locker](https://www.curve.finance/dao/ethereum/vecrv/) and connect your wallet. Enter the amount of CRV you want to lock and choose the duration (1 week to 4 years).

### Can I extend my lock duration?
Yes, you can extend your lock duration at any time. This resets your lock to a later expiry date and increases your veCRV balance.

### Can I add more CRV to my existing lock?
Yes, you can deposit additional CRV into your existing lock at any time. The new CRV will be locked until your current expiry date.

### How do I withdraw my CRV after the lock expires?
Once your lock period ends and your veCRV balance reaches zero, you can withdraw your original CRV tokens through the Curve UI under the "Withdraw" tab.

### What happens to my veCRV balance over time?
Your veCRV balance decays linearly as time passes, reflecting the decreasing time left on your lock. This means your voting power and benefits decrease gradually.

### How much veCRV do I get for locking CRV?
The amount depends on both the quantity of CRV locked and the lock duration. For example:
- 1 CRV locked for 4 years = 1 veCRV
- 1 CRV locked for 1 year = 0.25 veCRV
- 1 CRV locked for 6 months = 0.125 veCRV

## Governance Questions

### What voting power does veCRV give me?
veCRV gives you voting power in the Curve DAO, including on proposals and gauge weight votes that determine CRV emissions.

### How does veCRV prevent short-term manipulation?
By requiring users to commit their tokens for a set period, only those with long-term interest can influence important decisions. Voting power is directly tied to the duration of your commitment.

### Can I vote on multiple proposals?
Yes, you can vote on all active proposals with your veCRV balance. Your voting power is proportional to your veCRV amount.

## Revenue & Rewards Questions

### What sources generate revenue for veCRV holders?
- **Trading fees:** A portion of every swap fee on Curve
- **crvUSD interest:** Parts of the interest from Curve's stablecoin markets

### I locked last week, why didn't I receive any revenue?
You have to be locked for a FULL week before you are eligible, Thursday-Thursday. The system takes a snapshot on Thursday at 00:00 UTC to see who has veCRV, then distributes the weekly revenue to those users the following Thursday at 00:00 UTC.

### How is my revenue share calculated?
Your revenue share depends on your veCRV balance relative to the total veCRV supply at the time of distribution. The more veCRV you hold, the larger your share.

### When are rewards distributed?
Rewards are distributed weekly and can be claimed within 24 hours after Thursday 00:00 UTC.

### How do I claim my revenue?
Connect your wallet on Ethereum to the DAO app's [Lock CRV page](https://www.curve.finance/dao/ethereum/vecrv/), select **Claim Fees**, and click **Claim** beside crvUSD. Legacy 3CRV rewards can be claimed separately from the same tab. See [Claiming veCRV Revenue Share](./revenue.md).

### Do I lose rewards if I don't claim weekly?
No, rewards accumulate and can be claimed at any time without forfeiting any rewards.

### What was the original reward token before crvUSD?
Previously, revenue was distributed using 3CRV tokens (LP tokens of the 3pool). The DAO later decided to switch to crvUSD.
