---
id: post-deployment
title: LlamaLend v2 Post-Deployment & Integration
sidebar_label: Post-Deployment & Integration
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

Deploying a LlamaLend v2 market creates its contracts, but a useful market also needs deliberate activation, lender liquidity, integrations, monitoring, and distribution.

## Activation Checklist

Before announcing a market:

1. Verify the Vault, Controller, and AMM against the factory's `markets(index)` result.
2. Confirm the token pair, oracle, monetary policy, supply limit, discounts, and AMM fee.
3. Confirm who controls the Configurator, the factory, and the market's fee receiver.
4. Have an authorized Configurator administrator set a reviewed borrow cap. New markets start at zero.
5. Seed or attract enough borrowed-token liquidity for the intended borrowing demand.
6. Test lender deposits and withdrawals, borrower previews, and loan lifecycle operations on a fork before production use.

## Discover Markets Programmatically

Use the v2 `LendFactory` as the market registry:

- `market_count()` returns the number of registered markets.
- `markets(index)` returns the Vault, Controller, AMM, token pair, oracle, and monetary policy.
- `vaults_index(vault)` resolves a registered Vault back to its market index.

Read factory addresses from the [canonical deployment table](/developer/llamalend-v2/overview#deployments). Do not combine data from factories on different chains or from older protocol versions.

## Integrate the Lender Side

Each market's Vault is an ERC-4626 vault whose asset is the borrowed token.

### Deposits and Withdrawals

Use the standard methods:

- `deposit(assets, receiver)` and `mint(shares, receiver)` to supply assets;
- `withdraw(assets, receiver, owner)` and `redeem(shares, receiver, owner)` to exit;
- the corresponding `preview*` methods to estimate conversions;
- `maxDeposit`, `maxMint`, `maxWithdraw`, and `maxRedeem` to respect caps and available liquidity.

Integrators should approve the Vault to spend the borrowed token before deposits. Use the Vault's conversion and preview functions rather than assuming a 1:1 asset-to-share exchange rate.

### Caps and Available Liquidity

The Vault's supply limit caps total managed assets. A value of `max(uint256)` is unlimited, while `0` disables new deposits.

Withdrawals are also limited by borrowed tokens currently available in the Controller. `maxWithdraw` and `maxRedeem` account for that liquidity; an integration should handle a temporarily lower withdrawable amount without treating it as an accounting failure.

Interest accrues into the value of vault shares. Use `pricePerShare()`, `lend_apr()`, and `borrow_apr()` for display, while preserving integer precision until the presentation boundary.

See the [Vault Integration Guide](/developer/llamalend-v2/integration-guide) for code examples and edge cases.

## Integrate the Borrower Side

Borrowers interact with the market's LendController to:

- create a loan;
- add or remove collateral;
- borrow more;
- repay debt;
- exit soft liquidation through the supported repay path.

Before constructing a transaction, use `max_borrowable`, `min_collateral`, and the operation-specific health preview matching the intended action. These calculations account for market state, available lender liquidity, and the borrow cap. Do not reproduce LLAMMA health or band math in an integration when the Controller's view methods are available.

Treat negative health, oracle failures, insufficient available balance, cap exhaustion, and changing preview results as expected failure modes. Re-read state immediately before submitting a transaction and apply explicit user-facing slippage or minimum-output protection where the called method supports it.

See the [LendController](/developer/llamalend-v2/lend-controller) and [LendControllerView](/developer/llamalend-v2/lend-controller-view) references for exact interfaces.

## Frontend and Token Metadata

Confirm that the intended application discovers the new v2 factory entry. Contract deployment alone does not guarantee a curated name, token icon, risk label, or promoted placement in every interface.

If a token icon is missing from Curve interfaces, follow the contribution instructions in the [curve-assets repository](https://github.com/curvefi/curve-assets#adding-a-token-icon). Provide the chain, token addresses, market index, transaction hash, and verified contract triplet when requesting integration support.

## Monitor the Market

Monitor at least:

- Vault total assets, available liquidity, supply cap, and lender APR;
- total debt, borrow cap, utilization, and borrow APR;
- oracle freshness, deviation, dependencies, and failed updates;
- borrower health distribution and positions in soft liquidation;
- collateral market depth, liquidation profitability, and bad-debt risk;
- admin percentage, accrued fees, and fee receiver;
- Configurator, factory-owner, and emergency-governance changes.

Define alert thresholds and an owner for each response before raising caps materially. Parameter changes should be simulated and reviewed with the same care as the initial deployment.

## Grow Lender Liquidity

Vault shares can be paired with a Curve gauge. A newly deployed gauge can distribute external ERC-20 rewards; eligibility for CRV emissions additionally requires Curve DAO approval and ongoing gauge weight.

Avoid promising a fixed APR or emissions level. Incentives can change, and users may need to stake their Vault shares in the gauge to earn them.

<GuideCardGrid guideKeys={['GaugesAndIncentives']} />
