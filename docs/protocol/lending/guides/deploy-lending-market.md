---
id: deploy-lending-market
title: "Deploy a Lending Market"
sidebar_label: "Deploy a Lending Market"
description: Step-by-step guide to deploying a Llamalend v2 market through the LendFactory, verifying it and activating borrowing through a Curve DAO vote.
---

When you finish, your Llamalend v2 market is registered in the LendFactory and open to borrowers.

Deploying the market is one transaction. Opening it to borrowers adds a 7-day Curve DAO ownership vote that raises its borrow cap from zero.

## Before You Start

You need a wallet on Ethereum or Optimism, the two token addresses, an initialized price oracle and monetary policy, and a parameter set yRisk has reviewed.

It costs gas for the `create()` transaction.

It takes one transaction to deploy and a 7-day Curve DAO ownership vote to open borrowing.

yRisk, the Curve DAO's elected risk manager, reviews the market, and a Curve DAO vote approves its borrow cap.

## Propose the Market

1. Prepare the token pair, oracle, monetary policy and parameters. [Oracles & Parameters](../oracles-and-parameters.md) covers each choice.
2. Propose the market on the [Curve governance forum](https://gov.curve.finance/).
3. Wait for yRisk to review the oracle, the parameters and the proposed borrow cap.

[Llamalend Market Risk and Roles](../risk-and-roles.md) explains who does what.

## Prepare the Transaction

1. Pick the LendFactory for your chain from the [deployment table](/developer/llamalend-v2/overview#deployments). Never use an address from another network.
2. Call `version()` on the factory and confirm it returns `2.0.0`.
3. Encode each `create()` argument as an integer in the units listed in [Parameters and Access Control](../parameters-and-access-control.md#set-at-deployment).
4. Simulate `LendFactory.create()` from your deploying account on a fork.

## Deploy the Market

1. Send `LendFactory.create()` with the simulated arguments.
2. Decode the `NewVault` event from the receipt and note the market index.
3. Record the returned addresses in their order: `[vault, controller, amm]`.

The [LendFactory reference](/developer/llamalend-v2/lend-factory#create) lists the full signature and the checks the factory runs. Deploying gives your address no admin rights over the market.

## Activate the Market {#activate-the-market}

1. Submit a Curve DAO ownership vote that calls `Configurator.set_borrow_cap(controller, cap)` through the `LendingOwnerProxy`'s `execute` function.
2. To delegate later changes for this market, add a call to `Configurator.set_custom_admin(controller, admin)` to the same vote.
3. When the 7-day vote passes, execute it. On Optimism, the action is relayed through Curve's cross-chain governance.

[Parameters and Access Control](../parameters-and-access-control.md#who-the-admins-are) lists the proxy and DAO addresses on each chain.

## Check It Worked

- `LendFactory.markets(i)`, with the index from `NewVault`, returns your Vault, Controller, AMM, token pair, oracle and monetary policy.
- `borrow_cap()` on the Controller reads zero before the vote and your approved cap after it executes.
- The market page opens on curve.finance at `https://www.curve.finance/lend/<network>/markets/<controller>`.
- Once indexed, the Curve Prices API lists the market at `https://prices.curve.finance/v1/lending/markets/<network>`.

## Next Step

[After Deploying a Lending Market](../post-deployment.md) covers lender liquidity, monitoring and incentives.

For help reviewing an oracle, parameter set, deployment or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
