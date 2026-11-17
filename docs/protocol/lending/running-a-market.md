---
id: running-a-market
title: Running a Llamalend Market
sidebar_label: Running a Market
description: How a live Llamalend market is monitored, how its parameters change through yRisk review and Curve DAO votes, how it is wound down, and what the Emergency DAO can do.
---

After launch, a Llamalend market's settings change only through the Curve DAO, or through a market-specific admin the DAO has assigned. The market team watches the market, yRisk reviews proposed changes, and DAO votes apply them.

## Monitor the Market

Watch lender liquidity and utilization, borrow rates, oracle behavior, borrower health and positions in soft liquidation, and collateral liquidity on external markets. [Post-Deployment & Integration](./post-deployment.md#monitor-the-market) lists every value to track. Set alert thresholds and decide who responds to each before you raise the borrow cap.

## Change Parameters

These settings can change after launch, each through the [Configurator](/developer/llamalend-v2/configurator):

- the borrow cap;
- loan and liquidation discounts;
- the monetary policy;
- the price oracle, within a deviation check;
- the AMM fee;
- the admin share of interest;
- the liquidity-mining callback, which pays CRV on collateral.

The vault's supply limit and the fee receiver are set through the LendFactory's admin, the same proxy the Curve DAO controls.

Every change goes through the Curve DAO by default. Simulate it and have yRisk review it before you propose it. [Llamalend Parameters and Access Control](./parameters-and-access-control.md) lists who can call each function.

## Wind Down a Market

To stop new risk entering a market, the borrow cap is set to zero, which halts new borrowing, and the vault supply limit is set to zero, which halts new deposits. Existing loans can still be repaid or liquidated, and lenders withdraw as borrowers repay.

## Emergencies

The [Emergency DAO](/user/dao/emergency-dao), a 5-of-9 multisig, can act without waiting for a DAO vote. Through the `LendingOwnerProxy` that administers Llamalend v2, it can:

- set a market's borrow cap to zero;
- set a vault's supply limit to zero;
- raise a market's loan discount;
- change a market's monetary policy or liquidity-mining callback;
- replace a market's oracle, only when the current oracle fails;
- remove a market-specific admin;
- pause the LendFactory.

It cannot move user funds, and the Curve DAO can replace or remove it. [Llamalend Parameters and Access Control](./parameters-and-access-control.md#who-the-admins-are) shows the addresses.

## Related

- [Llamalend Market Risk and Roles](./risk-and-roles.md)
- [Llamalend Parameters and Access Control](./parameters-and-access-control.md)
- [Post-Deployment & Integration](./post-deployment.md)
