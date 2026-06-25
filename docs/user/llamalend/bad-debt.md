---
id: bad-debt
title: Bad Debt & Market Solvency
sidebar_label: Bad Debt
---

This article explains what bad debt is in Llamalend, how it can occur, and what it means for lenders and borrowers in an affected market.

## What Is Bad Debt?

Bad debt means a market has suffered a shortfall and cannot fully recover all outstanding loans from available collateral.

In Llamalend, this can arise only in extreme market conditions, when a position enters liquidation and the collateral is not converted into enough of the borrowed asset to fully repay the debt. If the remaining collateral is worth less than the outstanding loan, the market is left with bad debt.

Bad debt is always specific to the affected market. Llamalend markets are isolated, so any shortfall in a market does not spread to other Curve lending markets.

## How Can Bad Debt Happen?

Llamalend is designed to reduce liquidation risk through over-collateralization and LLAMMA, which gradually converts collateral while a position is in the liquidation range. This can make liquidations less abrupt than traditional hard-liquidation systems.

However, these protections do not eliminate risk entirely.

Bad debt can still arise in extreme scenarios, including:

- Sharp declines in collateral prices
- Unusually high market volatility
- Low onchain liquidity during liquidation
- Network congestion or high gas costs that make liquidations less effective
- Market configurations that are not resilient to stressed conditions

In such cases, a loan may become undercollateralized faster than the market can recover enough of the borrowed asset through soft liquidation and final liquidation.

## What Does Bad Debt Mean For Users?

The effects of bad debt are limited to the market where the shortfall occurred.

### For Lenders

Lenders in the affected market are exposed to the shortfall.

This may result in:

- Reduced withdrawability
- Temporary or persistent illiquidity
- A market solvency ratio below 100%
- Partial loss of supplied funds in severe cases

If a market is not fully solvent, lenders may be unable to withdraw their full balance even if the interface still shows an account balance.

### For Borrowers

Borrowers in an affected market may still be able to manage their positions if the market remains operational. Depending on the market state, they may still be able to:

- Repay debt
- Close positions
- Withdraw collateral that remains available
- Be soft-liquidated or liquidated if applicable

Bad debt does not automatically mean a market is fully shut down, but it does mean the market has already suffered a loss that lenders are exposed to.

## What Is Market Solvency?

Market solvency is a measure of whether total market assets are sufficient to cover total lender claims.

A fully solvent market has enough assets to cover all supplier balances.

A market with bad debt has a solvency shortfall, meaning total recoverable assets are below total lender claims.

This is why a market can remain visible and partially operational while still limiting lender withdrawals.

## Can a Market Recover Bad Debt?

Sometimes, yes.

A market with bad debt is below full solvency, but that does not always mean the shortfall is permanently irrecoverable. Recovery can still depend on later collateral values, liquidation outcomes, borrower actions, and broader market conditions.

For example, if collateral prices recover, positions that were previously unprofitable may become economically recoverable again. In those cases, market solvency can improve over time.

This does not mean recovery is guaranteed. Some shortfalls may remain unresolved, and the pace or extent of recovery can vary depending on the market.

Users should therefore understand a solvency level below 100% as a sign of current shortfall, not necessarily a final outcome.

## Does Bad Debt Affect All Llamalend Markets?

No.

Llamalend markets are isolated. Bad debt remains within the affected market and does not automatically impact all other lending markets on Curve.

Each market has its own collateral, parameters, liquidity conditions, and risk profile. Users should evaluate each market independently rather than assuming all markets carry the same risk.

## Can LLAMMA Prevent Bad Debt?

LLAMMA is designed to reduce liquidation risk by gradually converting collateral while a position moves through its liquidation range.

This can help limit losses compared with systems that rely only on hard liquidations at a single threshold.

However, LLAMMA is not a guarantee against bad debt. In fast or disorderly markets, collateral may still lose value faster than the liquidation process can recover the borrowed asset. In those cases, bad debt can still emerge.

## Why Might Withdrawals Be Limited?

Lender withdrawals depend on available liquidity and overall market solvency.

Withdrawals may be limited if:

- Most available liquidity is already borrowed
- Lenders are trying to exit at the same time
- The market has accumulated bad debt
- The remaining assets in the market are not enough to cover all claims

A market may therefore appear active while still preventing some lenders from withdrawing in full.

## Deprecated Markets

In some cases, the interface may flag a market as deprecated or elevated risk.

This does not remove the market onchain, but it may limit or discourage new deposits and new borrow positions through the interface. Existing users may still be able to manage, repay, or close positions depending on the state of the market.

If the market also has bad debt, withdrawals may remain limited by market solvency.

## Risk Reminder

Supplying assets to a lending market involves risk.

Curve Lending is designed to reduce risk through over-collateralization, isolated markets, and the LLAMMA liquidation mechanism, but these are risk mitigation tools, not guarantees.

Users should understand the collateral asset, liquidity conditions, market configuration, and the possibility of partial or total loss before supplying funds to any market. See also the [Curve Lending disclaimers](https://www.curve.finance/dex/ethereum/legal?tab=disclaimers&subtab=lend).
