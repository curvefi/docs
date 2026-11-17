---
id: defi-protocols
title: Building a DeFi Protocol on Curve
sidebar_label: DeFi Protocols & Treasuries
description: How DeFi protocols, DAO treasuries and incentive buyers build on Curve LP tokens, onchain pool oracles, Llamalend markets, gauges, veCRV and crvUSD.
---

Curve is a base layer for DeFi protocols. Its LP tokens, onchain price oracles, lending markets, gauges and governance are open contracts that other protocols build products on, without permission. This page also covers DAO treasuries and teams that buy incentives.

## What You Get

- **LP tokens you can compose with.** Every Curve LP position is a plain ERC-20 token with a defined value, so you can hold it, lend against it, wrap it or use it as collateral.
- **Onchain price oracles.** Every pool has a built-in EMA price oracle. Llamalend markets and crvUSD use Curve pool oracles, and your protocol can read them too.
- **Lending markets for your product.** Deploy a Llamalend market for your token or your LP token. LP tokens of 2-coin Stableswap-NG pools have a dedicated oracle, and borrowers can earn CRV on collateral on Ethereum.
- **ERC-4626 lending vaults.** Llamalend lender positions are standard vault shares that you can integrate, stake in a gauge or build on.
- **Permissionless gauges.** Anyone can deploy a gauge for a pool or lending vault and pay rewards through it.
- **A governance and incentive market.** veCRV holders direct CRV emissions every week, and protocols can earn, buy or pay for those votes.
- **A decentralized stablecoin.** crvUSD is backed by crypto collateral and governed by the Curve DAO, and it is the borrowed asset in the live Llamalend markets on Ethereum.

## For DAO Treasuries and Incentive Buyers

- **Own liquidity.** Provide liquidity from your treasury and stake it in your gauge.
- **Own votes.** Lock CRV for veCRV, or hold vlCVX, to direct CRV to your gauge yourself.
- **Rent votes.** Pay vote incentives to veCRV holders who vote for your gauge.
- **Pay LPs directly.** Fund direct gauge rewards or Merkl campaigns in your own token.

See [Incentivizing a Pool](../gauge/incentive-routes.md) for what each route needs and when it fits.

## What Your Users Get

- **Deep liquidity** for the tokens your product issues or accepts.
- **Yield on top of yield.** LP tokens keep earning trading fees while your product uses them.
- **Liquidation protection** when they borrow through Llamalend.
- **A neutral base.** The Curve DAO owns the contracts your product depends on, and changes need a public onchain vote.

## Recommended Setup

| Goal | Setup | Guide |
| --- | --- | --- |
| Use Curve prices in your contracts | Read a pool's EMA oracle | [Understanding Stableswap](../pool/understanding-stableswap.md) |
| Let users borrow against your token or LP token | Llamalend market | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| Integrate Llamalend vaults or loans | ERC-4626 vault and Controller interfaces | [Post-Deployment & Integration](../lending/post-deployment.md) |
| Direct CRV emissions to your pools | veCRV, vlCVX or vote incentives | [Incentivizing a Pool](../gauge/incentive-routes.md) |
| Run liquidity for an externally priced asset | FXSwap pool with refuels | [Understanding FXSwap](../pool/understanding-fxswap.md) |

## Case Studies

- **Convex and StakeDAO** build on veCRV: holders of vlCVX and sdCRV direct the veCRV these protocols hold.
- **YieldBasis** runs its BTC liquidity in FXSwap pools against crvUSD, using crvUSD minted for it, and a Cryptoswap pool for its YB token.
- **Resupply.** The reUSD/sfrxUSD Curve LP token is collateral in a Llamalend market on Ethereum, so its liquidity providers can borrow crvUSD against their LP position.

## Keepers, Liquidators and Curators

Curve also relies on operators. Liquidators and arbitrageurs keep Llamalend markets healthy and earn from doing so. Anyone can execute due FXSwap refuel streams and collect the bounty. Risk reviewers, such as SwissStake, help teams prepare lending market parameters.

## Requirements and Limits

- **Never read a spot price.** Use a pool's EMA oracle, not its current balances or a withdrawal simulation, which can be manipulated within one transaction.
- **CRV emissions follow votes.** A gauge needs a DAO whitelisting vote, then veCRV gauge weight votes that update weekly.
- **Locks are long.** veCRV comes from locking CRV for up to four years, and voting power decays as the lock runs down.
- **The DAO governs parameters.** Pool and lending parameters can change through DAO votes, so monitor the markets your product depends on.

## FAQ

**Can my protocol use a Curve LP token as collateral?**
Yes. LP tokens are standard ERC-20 tokens, and Llamalend supports 2-coin Stableswap-NG LP tokens as collateral.

**Can my contracts read Curve prices?**
Yes. Every pool exposes an EMA price oracle onchain. Use it instead of spot prices.

**How do treasuries get CRV emissions for their pools?**
Hold veCRV or vlCVX and vote, or pay vote incentives to veCRV holders.

## Next Steps

- Read the [developer documentation](/developer/documentation-overview) for contract interfaces.
- Compare incentive routes in [Incentivizing a Pool](../gauge/incentive-routes.md).
- Ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
