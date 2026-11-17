---
id: llamalend-vs-morpho-vs-euler
title: Llamalend vs Morpho vs Euler
sidebar_label: Llamalend vs Morpho vs Euler
description: A side-by-side comparison of how Llamalend, Morpho and Euler handle market creation, borrowing activation, liquidations, oracles, rates, curation, incentives and chains.
---

All three protocols let you launch an isolated lending market for your token without asking a central team. They differ in who opens borrowing, how liquidations work, and who manages risk after launch.

As of 17 November 2026.

| | Llamalend | Morpho | Euler |
| --- | --- | --- | --- |
| **Who can create a market** | Anyone, through `LendFactory.create()` ([guide](./guides/deploy-lending-market.md)). | Anyone; creating a market needs no governance vote ([docs](https://docs.morpho.org/learn/concepts/blue/)). | Anyone can deploy a vault with the Euler Vault Kit ([docs](https://docs.euler.finance/introduction/)). |
| **What it takes to activate borrowing** | A Curve DAO vote raises the borrow cap from zero ([guide](./guides/deploy-lending-market.md#activate-the-market)). | No vote. The LLTV and interest rate model must come from a governance-approved set ([docs](https://docs.morpho.org/learn/concepts/blue/)). | No DAO vote. The vault's governor sets a borrow LTV for each accepted collateral ([docs](https://docs.euler.finance/learn/curators/)). |
| **Liquidation model** | LLAMMA soft liquidation converts collateral gradually across price bands; hard liquidation follows if health runs out ([overview](./launch-isolated-lending-market.md#launch-steps)). | Hard liquidation by anyone once LTV exceeds LLTV, with a bonus set by the market's LLTV ([docs](https://docs.morpho.org/learn/concepts/blue/liquidation/)). | Hard liquidation through a reverse Dutch auction: the discount starts at zero and grows with the health shortfall up to a configured maximum ([docs](https://docs.euler.finance/learn/liquidations/)). |
| **Oracle requirements** | Any contract that implements `price()` and `price_w()`; the DAO can replace it later ([parameters](./oracles-and-parameters.md#price-oracle)). | Oracle-agnostic; the creator picks the oracle at market creation ([docs](https://docs.morpho.org/learn/concepts/oracle/)). | Per-vault oracle route built from adapters such as Chainlink, Chronicle, Pyth and RedStone ([docs](https://docs.euler.finance/learn/price-oracles/)). |
| **Interest rate model** | A monetary-policy contract chosen at deployment ([parameters](./oracles-and-parameters.md#monetary-policy)). | AdaptiveCurveIRM, the only governance-approved model ([docs](https://docs.morpho.org/learn/concepts/blue/irm/)). | Set per vault, usually based on utilization ([docs](https://docs.euler.finance/learn/interest-rates/)). |
| **Risk curation** | yRisk, the risk manager elected by the Curve DAO, reviews markets; Curve DAO votes set the borrow cap and later changes ([roles](./risk-and-roles.md)). | Vault curators set caps and allocators move lender funds across markets ([docs](https://docs.morpho.org/learn/concepts/vault-v2/)). | Vault governors or curators set collateral, LTVs and caps; a vault can also be finalized with no governor ([docs](https://docs.euler.finance/curate/vaults/evk/overview/)). |
| **Incentives** | Curve gauges: CRV emissions after DAO approval, or direct rewards in your own token with no vote ([gauges](/protocol/gauge/overview)). | MORPHO rewards for whitelisted markets, plus custom reward programs ([docs](https://docs.morpho.org/curate/)). | Reward campaigns from Merkl, Incentra, Fuul and Turtle, plus rEUL ([docs](https://docs.euler.finance/learn/rewards/)). |
| **Chains** | Ethereum and Optimism ([deployments](/developer/llamalend-v2/overview#deployments)). | Many EVM networks ([addresses](https://docs.morpho.org/developers/contracts/addresses/)). | Many EVM networks ([addresses](https://docs.euler.finance/build/contract-addresses/)). |

## Who Manages Risk

Llamalend follows the model of Aave more than Morpho. The Curve DAO elects one risk manager, currently yRisk, to review markets and advise on changes, and DAO votes apply them. See [Llamalend Market Risk and Roles](./risk-and-roles.md).

Aave's DAO onboards risk service providers by governance vote, and they propose parameter changes for its markets ([Aave](https://aave.com/help/governance/aave-community), [onboarding vote](https://governance.aave.com/t/arfc-onboard-new-risk-service-provider/17348)).

Morpho has no protocol-level risk manager. Independent curators run vaults, set caps and choose which markets receive lender funds ([Morpho](https://docs.morpho.org/learn/concepts/vault-v2/)).

## When Morpho or Euler Fits Better

- You want borrowing to start without a governance vote.
- You need a chain where Llamalend is not deployed.
- You want a curator or your own team to control risk parameters directly.
- You want several collateral tokens connected to one borrowable asset, which Euler supports through linked vaults ([docs](https://docs.euler.finance/introduction/)).

## When Llamalend Fits Better

- You want borrowers protected from instant liquidation by LLAMMA.
- You want a Curve DAO review before borrowing opens.
- You want CRV emissions through a Curve gauge.
- Your collateral is a Curve LP token or a yield-bearing token, and you want borrowers to earn CRV on it ([collateral types](./launch-isolated-lending-market.md#supported-collateral)).
- Your token already has deep liquidity on Curve.
