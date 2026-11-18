---
id: running-a-market
title: "Run a Lending Market"
sidebar_label: "Run a Lending Market"
description: How a live Llamalend market is monitored, how its parameters change through yRisk review and Curve DAO votes, how it is wound down, and what the Emergency DAO can do.
---

When you finish, a change you proposed for your live market has passed yRisk review and a Curve DAO vote and is set onchain.

Each change takes a 7-day DAO ownership vote, unless the DAO has assigned your market a market-specific admin.

## Before You Start

You need the market's Controller and Vault addresses and a fork simulation of the change.

It costs gas to create and execute the vote. [Governance Proposals](/user/dao/proposals) explains who can create one.

It takes a 7-day DAO vote for each change.

yRisk, the Curve DAO's elected risk manager, reviews the change, and the Curve DAO approves it.

## Monitor the Market {#monitor-the-market}

1. Track the values listed in [After Deploying a Lending Market](./post-deployment.md#monitor-the-market).
2. Set alert thresholds and an owner for each before you raise the borrow cap.

## Change a Parameter {#change-parameters}

1. Find the setting and its function in [Parameters and Access Control](./parameters-and-access-control.md#changed-after-deployment).
2. Simulate the call on a fork.
3. Propose the change on the [Curve governance forum](https://gov.curve.finance/) and wait for yRisk's review.
4. Submit a DAO ownership vote that makes the call through the `LendingOwnerProxy`'s `execute` function.
5. When the vote passes, execute it.

A market-specific admin calls the [Configurator](/developer/llamalend-v2/configurator) directly and skips the vote.

## Wind Down a Market

1. Propose a vote that calls `Configurator.set_borrow_cap(controller, 0)`. New borrowing stops.
2. Add a call to `Vault.set_max_supply(0)` to the same vote. New deposits stop.
3. When the vote passes, execute it.

Existing loans can still be repaid or liquidated, and lenders withdraw as borrowers repay.

## Emergencies

The [Emergency DAO](/user/dao/emergency-dao), a 5-of-9 [multisig](/protocol/glossary#multisig) (a wallet that needs several signers to act), can make a fixed set of changes through the `LendingOwnerProxy` without a vote, such as setting a borrow cap to zero. It cannot move user funds. [Parameters and Access Control](./parameters-and-access-control.md#changed-after-deployment) lists each change it can make, and [Who the Admins Are](./parameters-and-access-control.md#who-the-admins-are) shows the addresses.

## Check It Worked

- `borrow_cap()` on the Controller returns the cap the vote set.
- `Vault.maxDeposit()` returns zero after a wind-down.
- The market page at `https://www.curve.finance/lend/<network>/markets/<controller>` shows the new values.
- The Curve Prices API reflects the change at `https://prices.curve.finance/v1/lending/markets/<network>`.

## Next Step

[Llamalend Market Risk and Roles](./risk-and-roles.md) explains what lenders and borrowers carry while the market runs. To attract more lenders or borrowers, see [Incentivize a Lending Market](/protocol/gauge/incentive-routes#incentivize-a-lending-market).

For help reviewing a parameter change or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
