---
id: risk-and-roles
title: Llamalend Market Risk and Roles
sidebar_label: Risk and Roles
description: Who reviews, approves and changes a Llamalend market, including the issuer, the Curve DAO's elected risk manager yRisk, the Curve DAO and the Emergency DAO, and the risks lenders and borrowers carry.
---

A Llamalend market is permissionless to deploy, but it can't lend until the Curve DAO raises its borrow cap. Risk oversight follows the model of Aave more than Morpho: the Curve DAO elects a risk manager to review markets, and the DAO's votes decide. There are no independent curators.

## Who Does What

| Role | What it does |
| --- | --- |
| Issuer (you, when you propose the market) | Prepares the token pair, price oracle, monetary policy (the contract that sets the borrow rate) and parameters, deploys the market, proposes it to the DAO and seeds lender liquidity |
| yRisk, the Curve DAO's elected risk manager | Reviews a market's oracle, parameters and caps, and advises on changes while the market runs |
| Curve DAO | Votes to set the borrow cap and change market parameters. Its ownership agent controls the `LendingOwnerProxy`, the admin contract the Curve DAO and Emergency DAO act through. The proxy administers the Configurator, the contract that changes a market's settings, and the LendFactory, the contract that deploys and registers markets |
| [Emergency DAO](/user/dao/emergency-dao) | A 5-of-9 multisig (a wallet that needs several signers to act) that can make a fixed set of emergency changes through the same proxy, such as setting a borrow cap to zero. It cannot move user funds |
| Liquidators and arbitrageurs | Trade against LLAMMA (Llamalend's liquidation AMM) as prices move and close unhealthy loans |

A Curve DAO vote can also assign a market-specific admin, who can then change that market's settings without a vote each time. See [Llamalend Parameters and Access Control](./parameters-and-access-control.md).

For help preparing an oracle, parameter set, deployment or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).

## What Lenders and Borrowers Risk

A market's losses stay in that market. Soft liquidation converts collateral gradually as the price falls, instead of selling it at one price. If it can't convert enough collateral before a loan is liquidated, the shortfall falls on that market's lenders, and lenders can only withdraw what borrowers haven't borrowed. Borrowers lose some value on each soft-liquidation conversion and can still be hard-liquidated. The user docs explain both in full: [Bad Debt & Market Solvency](/user/llamalend/bad-debt) and [How Liquidation Protection Works](/user/llamalend/liquidation-protection/how-it-works).

## What the Oracle Decides

The price oracle prices the collateral in the borrowed token, and liquidation follows that price. A manipulable, stale or failing oracle puts both lenders and borrowers at risk. The DAO can replace a market's oracle by vote, within a deviation check. See [Oracles & Parameters](./oracles-and-parameters.md#price-oracle).

## Related

- [Running a Llamalend Market](./running-a-market.md)
- [Llamalend Parameters and Access Control](./parameters-and-access-control.md)
- [Llamalend vs Morpho vs Euler](./llamalend-vs-morpho-vs-euler.md)
