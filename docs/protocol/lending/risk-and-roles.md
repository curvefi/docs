---
id: risk-and-roles
title: Llamalend Market Risk and Roles
sidebar_label: Risk and Roles
description: Who reviews, approves and changes a Llamalend market, including the market team, the Curve DAO's elected risk manager yRisk, the Curve DAO and the Emergency DAO, and the risks lenders and borrowers carry.
---

A Llamalend market is permissionless to deploy, but it can't lend until the Curve DAO raises its borrow cap. Risk oversight follows the model of Aave more than Morpho: the Curve DAO elects a risk manager to review markets, and the DAO's votes decide. There are no independent curators.

## Who Does What

| Role | What it does |
| --- | --- |
| Market team (the issuer or protocol proposing the market) | Prepares the token pair, oracle, monetary policy and parameters, deploys the market, proposes it to the DAO and seeds lender liquidity |
| yRisk, the Curve DAO's elected risk manager | Reviews a market's oracle, parameters and caps, and advises on changes while the market runs |
| Curve DAO | Votes to set the borrow cap and change market parameters. Its ownership agent controls the `LendingOwnerProxy` that administers the Configurator and LendFactory |
| [Emergency DAO](/user/dao/emergency-dao) | A 5-of-9 multisig that can make a fixed set of emergency changes through the same proxy, such as setting a borrow cap to zero. It cannot move user funds |
| Liquidators and arbitrageurs | Trade against LLAMMA as prices move and close unhealthy loans |

A Curve DAO vote can also assign a market-specific admin, who can then change that market's settings without a vote each time. See [Llamalend Parameters and Access Control](./parameters-and-access-control.md).

For help preparing an oracle, parameter set, deployment or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).

## What Lenders Risk

A market's losses stay in that market. Bad debt in one market does not reach other Llamalend markets, Curve pools or crvUSD.

Bad debt appears when LLAMMA can't convert enough collateral into the borrowed token before a loan has to be liquidated, so the collateral left can't repay the debt. The shortfall falls on the lenders in that market's vault.

Lenders can withdraw only what borrowers haven't borrowed. When utilization is high, a vault share can be worth more than a lender can withdraw at that moment.

## What Borrowers Risk

When the collateral price falls into a loan's liquidation range, LLAMMA converts collateral to the borrowed token gradually. Each conversion loses some value to fees and arbitrage, even if the price later recovers. A loan that stays in its range long enough can still be hard-liquidated.

The borrow rate comes from the market's monetary policy and rises with utilization. The Curve DAO can change the monetary policy by vote.

## What the Oracle Decides

The oracle prices the collateral in the borrowed token, and liquidation follows that price. A manipulable, stale or failing oracle puts both lenders and borrowers at risk. The DAO can replace a market's oracle by vote, within a deviation check. See [Oracles & Parameters](./oracles-and-parameters.md#price-oracle).

## Related

- [Running a Llamalend Market](./running-a-market.md)
- [Llamalend Parameters and Access Control](./parameters-and-access-control.md)
- [Llamalend vs Morpho vs Euler](./llamalend-vs-morpho-vs-euler.md)
