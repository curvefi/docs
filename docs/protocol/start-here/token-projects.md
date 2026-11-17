---
id: token-projects
title: Curve for Project and Governance Tokens
sidebar_label: Project & Governance Tokens
description: How project and governance token teams use Curve Cryptoswap pools, gauge incentives, vote incentives and Llamalend lending markets to build liquidity for a volatile token.
---

Project and governance token teams use Curve to run an onchain market for a volatile token, reward its liquidity providers and let holders borrow against it.

## What Curve Provides

A [Cryptoswap](../pool/understanding-cryptoswap.md) pool concentrates liquidity around the current price and moves it as the price moves. Liquidity providers don't manage ranges. The pool can serve as a main onchain market for your token, and its EMA price oracle gives other contracts a price to read.

Gauges cover every incentive route. You can pay rewards in your own token with no vote, request CRV emissions through a Curve DAO vote, or pay vote incentives to veCRV holders. Holding veCRV or vlCVX lets you vote for your own gauge.

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your token and keep their position. A Curve pool's oracle can be one input to the market's price.

Deploying a pool costs only gas and needs no approval.

## What Your Users Get

- Traders get an onchain market with liquidity at every price.
- Liquidity providers earn trading fees and gauge rewards without managing a position.
- Holders can borrow against the token, and LLAMMA converts collateral gradually if the price falls.
- veCRV holders earn vote incentives when they direct CRV to your gauge.

## Recommended Setup

| Goal | Setup | Guide |
| --- | --- | --- |
| Launch the main market for your token | Cryptoswap pool against ETH or crvUSD | [Deploy a Cryptoswap Pool](../pool/guides/deploy-cryptoswap.md) |
| Reward liquidity providers from day one | Gauge paying your token | [Adding Direct Gauge Rewards](../gauge/guides/adding-direct-gauge-rewards.md) |
| Add CRV emissions | Whitelisting vote, then gauge weight votes | [Whitelisting a Gauge](../gauge/whitelisting-gauge.md) |
| Let holders borrow against the token | Llamalend market with your token as collateral | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |

[Incentivizing a Pool](../gauge/incentive-routes.md) compares every way to fund liquidity.

## Case Studies

Figures are from the Curve Prices API as of 17 November 2026.

Convex's [CVX/ETH Cryptoswap pool](https://etherscan.io/address/0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4) held about $4.3M.

YieldBasis uses a Cryptoswap pool for [YB/crvUSD](https://etherscan.io/address/0xec977F46467a3021785Cff88894886E617abd65b), where the Curve pool is part of the token's main market. Its BTC pools, priced on external markets, use FXSwap instead.

## Requirements and Limits

Cryptoswap rebalances only when the cost is less than half of the trading fees liquidity providers have earned. A pool with little volume can go stale, with its liquidity away from the market price. See [Understanding Cryptoswap](../pool/understanding-cryptoswap.md).

A whitelisted gauge receives CRV in proportion to its share of veCRV gauge weight votes, which update weekly. A gauge with no votes receives no CRV. See [Getting CRV Emissions](../gauge/guides/getting-crv-emissions.md).

The Curve DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists.

Lending against a volatile token needs a manipulation-resistant oracle and enough liquidity for liquidations. A Curve DAO vote sets the market's borrow cap. See [Oracles & Parameters](../lending/oracles-and-parameters.md).

## FAQ

### Should a governance token use Cryptoswap or FXSwap?

Cryptoswap, when the Curve pool is a main market for the token. FXSwap suits pairs priced on a deeper external market.

### How does a pool get CRV emissions?

Deploy a gauge, pass a Curve DAO whitelisting vote, then attract veCRV gauge weight votes.

### Can I pay rewards in my own token?

Yes. Direct gauge rewards need no vote and can start once the gauge exists.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Gauges & Incentives](../gauge/overview.md)
- [Understanding Cryptoswap](../pool/understanding-cryptoswap.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
