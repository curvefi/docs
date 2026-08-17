---
id: oracles-and-parameters
title: LlamaLend v2 Oracles & Parameters
sidebar_label: Oracles & Parameters
---

A LlamaLend v2 market combines independently supplied contracts and risk parameters. Deployment is permissionless, but that does not make every configuration safe. Validate the token pair, oracle, monetary policy, and liquidation assumptions together before creating a market.

:::warning[Risk review required]

There is no universal safe parameter set. Model the assets' volatility, market depth, oracle failure modes, and expected utilization, and independently review every custom oracle or monetary policy before deployment.

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

The oracle reports the price of one unit of collateral in units of the borrowed token, multiplied by `10^18`. It must implement:

```vyper
def price() -> uint256: view
def price_w() -> uint256: nonpayable
```

When a market is created, the factory calls both functions and requires the returned prices to be equal and nonzero. The oracle should also be robust against manipulation, stale data, abrupt discontinuities, and failures in any underlying liquidity source.

A Curve pool oracle can be one input to an oracle design, but the v2 factory does not automatically derive an oracle from a pool. The address passed to `create()` must already be a complete, initialized oracle implementing the required interface.

The Configurator can later replace the oracle through a deviation-checked update. On the current deployments, this requires a Curve DAO ownership vote unless the DAO has assigned a controller-specific administrator. Upgradability helps respond to changing conditions, but it also makes the market's administration and monitoring model part of the risk assessment.

## Monetary Policy

The monetary-policy contract determines the market's borrow rate. It is passed to the factory at deployment and is queried through the Controller as debt and utilization change.

LlamaLend v2 does not take minimum and maximum rates directly in `LendFactory.create()`. Those rules belong to the selected monetary-policy implementation. Confirm its rate units, bounds, initialization, and behavior under low and high utilization before using it.

## Deployment-Time Parameters

| Parameter | Units and contract constraints | Effect |
| --- | --- | --- |
| `borrowed_token` | ERC-20 address | Asset supplied to the Vault and borrowed from the market. |
| `collateral_token` | Different ERC-20 address | Asset securing borrower debt. |
| `A` | Integer from 2 to 10,000 | Controls LLAMMA band width; larger values create narrower bands. |
| `fee` | WAD-scaled, where `10^18 = 100%` | Swap fee charged inside the AMM. Its allowed range also depends on `A`. |
| `loan_discount` | WAD-scaled and less than `10^18` | Discount used when calculating maximum borrowing power. |
| `liquidation_discount` | WAD-scaled, greater than zero and less than `loan_discount` | Discount used for hard-liquidation calculations. |
| `price_oracle` | Initialized contract address | Supplies the collateral price in borrowed-token units. |
| `monetary_policy` | Initialized contract address | Supplies the per-second borrow rate used by the market. |
| `supply_limit` | Raw borrowed-token units | Maximum assets the Vault accepts. `max(uint256)` means unlimited; `0` disables deposits. |

The factory and AMM reject invalid combinations, but passing contract validation is not a substitute for economic analysis.

## Post-Deployment Parameters

The following settings are not controlled by the account that happens to deploy the market:

| Setting | Initial behavior | Who can change it? |
| --- | --- | --- |
| **Borrow cap** | Starts at `0`, which prevents new debt | Curve DAO ownership agent by default; a controller-specific admin only after DAO assignment |
| **Admin percentage** | Starts at `0` | Curve DAO ownership agent by default; assigned custom admin if configured |
| **Supply limit** | Set from `supply_limit`; `max(uint256)` leaves it unlimited | LendFactory owner, directly through the Vault |
| **Discounts, monetary policy, oracle, and AMM fee** | Set from deployment inputs | Curve DAO ownership agent by default; assigned custom admin if configured |
| **Fee receiver** | Factory default unless a Controller-specific receiver is set | LendFactory owner |

Values representing token amounts use the relevant token's native decimals. Percentages and discounts use WAD precision unless the referenced contract states otherwise.

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
