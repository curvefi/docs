---
id: launch-isolated-lending-market
title: Launch an Isolated Lending Market for Your Token
sidebar_label: Launch a Market
description: Llamalend lets anyone deploy a permissionless, isolated lending market for any ERC-20 pair, including yield-bearing tokens and Curve LP tokens, with soft liquidation for borrowers.
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

Let holders borrow against your token in its own isolated market. You deploy it; a 7-day Curve DAO vote sets the borrow cap.

Llamalend is Curve's lending protocol, on Ethereum and Optimism. Each market has one collateral token and one borrowed token, so its risk stays inside that market. When the collateral price falls, soft liquidation converts collateral gradually across a price range, instead of selling it at one price.

:::info[About Llamalend v1]

Llamalend v1 is deprecated. New markets and integrations should use the v2 contracts described here.

:::

<GuideCardGrid guideKeys={['LendingOraclesAndParameters', 'deployLendingMarket']} />

## Should You Launch a Lending Market? {#is-llamalend-right-for-your-token}

| Check | Ready | Not yet |
| --- | --- | --- |
| Price oracle | A manipulation-resistant oracle prices your token in the borrowed token | The only price you have is a spot price, pool balances or trading liquidity thinner than the market it would secure ([Oracles & Parameters](./oracles-and-parameters.md#price-oracle)) |
| Collateral liquidity | Liquidators and arbitrageurs can sell the collateral into deep trading liquidity when prices fall | Liquidity is thin, so soft liquidation may not convert enough collateral and lenders could take the loss ([Risk and Roles](./risk-and-roles.md)) |
| Token behavior | A standard ERC-20 | Transfer taxes, rebasing or callbacks, which are not guaranteed to work in a market ([Token Pair](./oracles-and-parameters.md#token-pair)) |
| Demand and support | Holders want to borrow, and you can seed lender liquidity and watch the market | Nobody owns monitoring or the response to a problem ([Running a Llamalend Market](./running-a-market.md)) |

## Why Launch a Lending Market for Your Token

**For you, the issuer:**

- **More uses for your token.** Holders can borrow against it, so the token earns a place in leverage, looping and treasury strategies.
- **Holders borrow instead of selling.** A holder who needs liquidity can take a loan against your token and keep their position.
- **One venue for liquidity and credit.** Your Curve pool and your lending market share the same protocol, the same Curve DAO and the same gauge system for incentives.
- **No risk from other markets.** A bad oracle or a crash in another market does not touch yours.

**For your users:**

- **Time to react.** Soft liquidation sells collateral gradually as the price falls, instead of seizing it all at one price.
- **High LTV (loan-to-value) on correlated pairs.** Live markets for yield-bearing stablecoins allowed a maximum LTV of up to about 98% as of 17 November 2026, per the Curve Prices API.
- **They keep their yield.** Yield-bearing collateral, such as ERC-4626 tokens (the standard for yield-bearing deposit tokens), keeps earning while it backs a loan.
- **Leverage in one transaction.** The Controller accepts a callback that builds a leveraged position in a single transaction.
- **Lenders get a standard vault.** Lenders deposit into an ERC-4626 vault and earn interest paid by borrowers.

## Supported Collateral

Any ERC-20 token can be collateral if you can give the market a reliable price for it in the borrowed token. Llamalend provides reusable price oracle contracts for these collateral types:

| Collateral type | How the price oracle prices it |
| --- | --- |
| **Tokens with a Curve pool** | Reads the pool oracle, the pool's built-in EMA (exponential moving average) price, chained across several pools if needed. |
| **Tokens with a Chainlink feed** | An EMA of the Chainlink price. |
| **Yield-bearing ERC-4626 tokens**, such as sDOLA, sfrxUSD, syrupUSDC and svZCHF | The underlying asset's price times the token's share price. |
| **Curve LP tokens**, such as reUSD/sfrxUSD | The LP token of a 2-coin Stableswap-NG pool, priced from the pool's virtual price. |

Price oracles can be stacked, for example a Curve pool price multiplied by an ERC-4626 share price. See [Oracles & Parameters](./oracles-and-parameters.md#price-oracle) and the [oracle reference](/developer/llamalend-v2/oracles) for the full list.

## How Llamalend Works With the Curve DEX

A Curve pool and a Llamalend market strengthen each other:

- **The pool prices the market.** Every Curve pool has a built-in pool oracle, an EMA price. A Llamalend price oracle can read it directly, so a token with a deep Curve pool already has a price source.
- **The pool supports liquidations.** Soft liquidation relies on arbitrageurs to buy and sell collateral as prices move. Deep liquidity for your token on Curve makes that trading cheaper and safer.
- **LP tokens become collateral.** Liquidity providers can borrow against their Curve LP tokens and keep earning trading fees on the liquidity underneath.
- **Borrowers can earn CRV on collateral.** On Ethereum, a market can have a collateral gauge that pays CRV to borrowers based on the collateral they hold, once the gauge receives gauge weight.
- **One incentive system.** You can direct CRV emissions and your own rewards to your pool, your lending vault and your collateral through the same [gauge system](/protocol/gauge/overview).

## Launch Steps

1. Prepare the token pair, price oracle, monetary policy (the contract that sets the borrow rate) and parameters, then propose the market on the [Curve governance forum](https://gov.curve.finance/). See [Oracles & Parameters](./oracles-and-parameters.md).
2. yRisk, the risk manager elected by the Curve DAO, reviews the oracle, the parameters and the proposed borrow cap.
3. Deploy the market with `LendFactory.create()`. Deployment is permissionless and does not make you the market's admin. See [Deploy a Lending Market](./guides/deploy-lending-market.md).
4. A DAO vote raises the borrow cap from zero. Until it passes, nobody can borrow.
5. Seed lender liquidity by depositing the borrowed token into the market's Vault.
6. Optionally, deploy a gauge to pay rewards to lenders. See [Curve Gauges and Incentives](/protocol/gauge/overview).

![A Llamalend market deploys on day 0 with a zero borrow cap; borrowing opens once a 7-day DAO vote raises the cap.](/img/protocol/lending/lending-market-go-live.png)

Once the market is live, parameter changes, wind-down and emergencies go through yRisk and the Curve DAO. See [Running a Llamalend Market](./running-a-market.md).

The factory deploys three contracts for each market:

| Contract | Role |
| --- | --- |
| **Vault** | ERC-4626 vault where lenders deposit the borrowed token. |
| **LendController** | Entry point for borrowers and liquidators. Holds the borrow cap. |
| **AMM (LLAMMA)** | Llamalend's liquidation AMM. Holds collateral in price bands and runs soft liquidation. |

For contract interfaces, see the [developer reference](/developer/llamalend-v2/overview). After launch, use [After Deploying a Lending Market](./post-deployment.md) to monitor and grow the market.

:::warning[Soft liquidation is not free]

Each soft-liquidation conversion loses a little value to fees and arbitrage, even when the price recovers. A position that stays in its bands for a long time can still reach hard liquidation. Most borrowers should close or reset a position once soft liquidation starts.

:::

## Live Examples

| Market | Chain | Collateral type | Supplied | Borrowed | Borrow APR (annual percentage rate) | Max LTV |
| --- | --- | --- | --- | --- | --- | --- |
| [sfrxUSD / crvUSD](https://www.curve.finance/lend/ethereum/markets/0x3cD4d86a2c65e57ce4b4121b67E2D2224BA41bbe) | Ethereum | ERC-4626 vault share | 13.97M crvUSD | 12.46M crvUSD | 4.97% | 98.0% |
| [sDOLA / crvUSD](https://www.curve.finance/lend/ethereum/markets/0xC77d97cF01737EB7aCE46cAb7cd9F60eC51a40c0) | Ethereum | ERC-4626 vault share | 11.27M crvUSD | 9.01M crvUSD | 4.65% | 98.0% |
| [syrupUSDC / crvUSD](https://www.curve.finance/lend/ethereum/markets/0x2fb54c8eae57767A9A509A395b9C4FA0702e2675) | Ethereum | ERC-4626 vault share | 1.46M crvUSD | 0.79M crvUSD | 2.91% | 95.9% |
| [reUSD/sfrxUSD LP / crvUSD](https://www.curve.finance/lend/ethereum/markets/0x4922995d8CbF9e1f368B2EE521bD2fa2F49eADb1) | Ethereum | Curve LP token | 0.50M crvUSD | 0.46M crvUSD | 5.96% | 96.6% |
| [svZCHF / crvUSD](https://www.curve.finance/lend/ethereum/markets/0xFd85e847cDd2549f213E276e4B57B0690169F043) | Ethereum | ERC-4626 vault share | 0.29M crvUSD | 0.24M crvUSD | 6.04% | 94.1% |
| [wstETH / USDC](https://www.curve.finance/lend/optimism/markets/0xb5EC7A3D591877A66BE4f3eafdC4205E98A1BCAA) | Optimism | Volatile asset | 90.2K USDC | 78.5K USDC | 5.84% | 83.9% |
| [WBTC / USDC](https://www.curve.finance/lend/optimism/markets/0x9fC15ac3EF97093832f49B7997A58E29b49C56dE) | Optimism | Volatile asset | 37.1K USDC | 32.9K USDC | 6.66% | 90.1% |

Figures as of 2026-11-17, from the Curve Prices API for [Ethereum](https://prices.curve.finance/v1/lending/markets/ethereum) and [Optimism](https://prices.curve.finance/v1/lending/markets/optimism). Open a market for current values.

## How It Compares

- **Llamalend:** anyone deploys the market; the DAO-elected risk manager reviews it and a DAO vote opens borrowing; soft liquidation protects borrowers from instant liquidation.
- **Morpho:** anyone creates a market with no vote; curated Morpho vaults allocate lender funds across markets.
- **Euler:** anyone deploys an Euler vault; its governor sets collateral and LTVs; liquidations use a reverse Dutch auction.

See [Llamalend vs Morpho vs Euler](./llamalend-vs-morpho-vs-euler.md) for the full comparison.

## FAQ

**Can I deploy a Llamalend market without permission?**
Yes. Anyone can deploy a market through the factory. Borrowing starts after a DAO vote raises the market's borrow cap.

**Can a Curve LP token be collateral?**
Yes. LP tokens of 2-coin Stableswap-NG pools have a dedicated oracle, and a reUSD/sfrxUSD LP market is live on Ethereum.

**Which tokens can be borrowed?**
Each market lends one ERC-20 token of your choice. Live markets lend crvUSD on Ethereum and USDC or WETH on Optimism.

**Which chains support Llamalend?**
Ethereum and Optimism.

## Get Help

For help reviewing an oracle, parameter set, deployment, or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
