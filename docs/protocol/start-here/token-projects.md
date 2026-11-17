---
id: token-projects
title: Curve for Project and Governance Tokens
sidebar_label: Project & Governance Tokens
description: How project and governance token teams use Curve Cryptoswap pools, gauge incentives, vote incentives and Llamalend lending markets to build lasting liquidity for a volatile token.
---

Curve is where project and governance token teams launch liquidity for a volatile token, reward liquidity providers through gauges and let holders borrow against the token.

## What You Get

- **A pool for volatile pairs.** Cryptoswap concentrates liquidity around the current price and moves it as the price moves, so liquidity providers don't manage ranges.
- **A market of record.** A Cryptoswap pool can be the main onchain market for your token, and its built-in EMA price oracle gives other protocols an onchain price.
- **Every incentive route in one place.** Pay your own token as direct gauge rewards, request CRV emissions through a DAO vote, pay vote incentives to veCRV holders, or hold veCRV and vlCVX to vote for your own gauge.
- **Lending for your holders.** A Llamalend market lets holders borrow against your token instead of selling it. A Curve pool oracle can feed the market's price.
- **No listing fee.** Deploying a pool costs only gas and needs no approval.

## What Your Users Get

- **Traders** get an onchain market with liquidity at every price.
- **Liquidity providers** earn trading fees and gauge rewards without managing a position.
- **Holders** can borrow against the token with LLAMMA liquidation protection, which converts collateral gradually as the price falls.
- **veCRV holders** earn vote incentives when they direct CRV to your gauge.

## Recommended Setup

| Goal | Setup | Guide |
| --- | --- | --- |
| Launch the main market for your token | Cryptoswap pool against ETH or a stablecoin such as crvUSD | [Deploy a Cryptoswap Pool](../pool/guides/deploy-cryptoswap.md) |
| Reward liquidity providers from day one | Gauge with direct rewards in your token | [Adding Direct Gauge Rewards](../gauge/guides/adding-direct-gauge-rewards.md) |
| Add CRV emissions | Gauge whitelisting vote, then gauge weight votes or vote incentives | [Whitelisting a Gauge](../gauge/whitelisting-gauge.md) |
| Let holders borrow against your token | Llamalend market with your token as collateral | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |

Compare every way to fund liquidity in [Incentivizing a Pool](../gauge/incentive-routes.md).

## Case Studies

Figures as of 17 November 2026, from the Curve Prices API.

- **Convex (CVX).** The [CVX/ETH Cryptoswap pool](https://etherscan.io/address/0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4) holds about $4.3M.
- **YieldBasis (YB).** Uses a standard Cryptoswap pool for [YB/crvUSD](https://etherscan.io/address/0xec977F46467a3021785Cff88894886E617abd65b), where the Curve pool is part of the governance token's main market.

## Requirements and Limits

- **Volatile pools cost something to rebalance.** Cryptoswap rebalances only when the cost is less than half of the trading fees liquidity providers earned. A pool with little volume can go stale, with liquidity away from the market price. See [Understanding Cryptoswap](../pool/understanding-cryptoswap.md).
- **CRV emissions need a DAO vote and votes.** A whitelisted gauge gets CRV only in proportion to veCRV gauge weight votes, which update weekly. See [Getting CRV Emissions](../gauge/guides/getting-crv-emissions.md).
- **Standard tokens only for CRV.** The DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists.
- **Lending against a volatile token is a risk decision.** A market needs a manipulation-resistant oracle and enough liquidity for liquidations, and a Curve DAO vote sets its borrow cap. See [Oracles & Parameters](../lending/oracles-and-parameters.md).

## FAQ

**Should my governance token use Cryptoswap or FXSwap?**
Cryptoswap, when the Curve pool is a main market for your token. FXSwap suits pairs whose price is set on a deeper external market.

**How do I get CRV emissions for my pool?**
Deploy a gauge, pass a Curve DAO whitelisting vote, then attract veCRV gauge weight votes.

**Can I pay rewards in my own token?**
Yes. Direct gauge rewards need no vote and can start as soon as the gauge exists.

## Next Steps

- Follow the [Launch Playbook](../launch-playbook.md) from pool to lending market.
- Read [Gauges & Incentives](../gauge/overview.md).
- Ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
