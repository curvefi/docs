---
id: oracles-and-parameters
title: Llamalend Oracles & Parameters
sidebar_label: Oracles & Parameters
description: How to choose the token pair, price oracle, monetary policy and risk parameters for a Llamalend market before deployment.
---

A Llamalend v2 market combines independently supplied contracts and risk parameters. Deployment is permissionless, but that does not make every configuration safe. Validate the token pair, price oracle, monetary policy (the contract that sets the borrow rate), and liquidation assumptions together before deploying a market.

:::warning[Risk review required]

There is no universal safe parameter set. Model the assets' volatility, trading liquidity depth, price oracle failure modes, and expected utilization, and independently review every custom oracle or monetary policy before deployment.

:::

## Token Pair

Each market has two distinct assets:

- **Borrowed token:** deposited by lenders and received by borrowers.
- **Collateral token:** deposited by borrowers to secure their debt.

The pair does not need to contain crvUSD. The factory does, however, rely on ERC-20 metadata and precision conversions:

- the token addresses must be different;
- both tokens must expose `decimals()`, and the deployed factory supports decimals from 0 through 18;
- the Vault also reads the borrowed token's `symbol()` when it is initialized;
- transfer-tax, rebasing, callback, or otherwise non-standard token behavior is not guaranteed to work safely and must be tested explicitly.

## Price Oracle

The price oracle reports the price of one unit of collateral in units of the borrowed token, multiplied by `10^18`. It must implement:

```vyper
def price() -> uint256: view
def price_w() -> uint256: nonpayable
```

When a market is deployed, the factory calls both functions and requires the returned prices to be equal and nonzero. The oracle should also be robust against manipulation, stale data, abrupt discontinuities, and failures in any underlying liquidity source.

A Curve pool oracle (the pool's own moving-average price) can be one input to a price oracle design, but the v2 factory does not automatically derive a price oracle from a pool. The address passed to `create()` must already be a complete, initialized oracle implementing the required interface.

You don't need to write an oracle from scratch. Llamalend provides reusable price oracle contracts that price tokens from Curve pools, Chainlink feeds, ERC-4626 tokens (the standard for yield-bearing deposit tokens) and 2-coin Stableswap-NG LP tokens, and you can stack them. See the [oracle reference](/developer/llamalend-v2/oracles).

The Configurator can later replace the oracle through a deviation-checked update. This requires a Curve DAO ownership vote unless the DAO has assigned a controller-specific administrator. The Emergency DAO can replace an oracle only when the current one fails. Upgradability helps respond to changing conditions, but it also makes the market's administration and monitoring model part of the risk assessment.

## Monetary Policy

The monetary-policy contract determines the market's borrow rate. It is passed to the factory at deployment and is queried through the Controller as debt and utilization change.

Llamalend v2 does not take minimum and maximum rates directly in `LendFactory.create()`. Those rules belong to the selected monetary-policy implementation. Confirm its rate units, bounds, initialization, and behavior under low and high utilization before using it.

## Parameters and Who Changes Them

[Llamalend Parameters and Access Control](./parameters-and-access-control.md) lists every deployment-time parameter with its units and constraints, every setting that can change after deployment, and whether the Curve DAO, the Emergency DAO or a market-specific admin can change it.

## Review Checklist

Before deployment, document:

1. The intended lender, borrower, and liquidation use cases.
2. Token behavior and decimal compatibility.
3. Oracle pricing direction, precision, update path, and failure handling.
4. Monetary-policy behavior across the expected utilization range.
5. Simulated `A`, fee, discounts, and liquidation outcomes using v2-compatible tooling.
6. Initial and emergency supply and borrow caps.
7. The DAO proposal, any delegated administrator, fee receiver, monitoring owner, and activation process.

For exact ABI details and enforced bounds, use the [LendFactory](/developer/llamalend-v2/lend-factory) and [Configurator](/developer/llamalend-v2/configurator) references.
