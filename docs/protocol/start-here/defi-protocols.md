---
id: defi-protocols
title: Building a DeFi Protocol on Curve
sidebar_label: DeFi Protocols & Treasuries
description: How DeFi protocols, DAO treasuries and incentive buyers build on Curve LP tokens, onchain pool oracles, Llamalend markets, gauges, veCRV and crvUSD.
---

DeFi protocols build on Curve's LP tokens, price oracles, lending markets and gauges, all open contracts that need no permission to use. DAO treasuries and teams that buy incentives use the same gauges and veCRV votes to direct liquidity.

## What Curve Provides

Every Curve LP position is a plain ERC-20 token with a defined value. Your protocol can hold it, wrap it, lend against it or accept it as collateral.

Every pool has a built-in EMA price oracle. crvUSD and Llamalend use Curve pool oracles, and your contracts can read them too.

You can deploy a [Llamalend](../lending/launch-isolated-lending-market.md) market for your token or for a Curve LP token. LP tokens of 2-coin Stableswap-NG pools have a dedicated oracle, and on Ethereum a market can pay CRV to borrowers on their collateral. Lender positions are ERC-4626 vault shares, which your protocol can integrate or stake in a gauge.

Anyone can deploy a gauge for a pool or lending vault. veCRV holders direct CRV emissions with weekly votes, and protocols can hold, rent or pay for those votes.

crvUSD is Curve's stablecoin, backed by crypto collateral and governed by the Curve DAO. It is the borrowed asset in the live Llamalend markets on Ethereum.

## For DAO Treasuries and Incentive Buyers

A treasury can provide liquidity itself and stake it in its gauge. To direct CRV emissions, it can lock CRV for veCRV or hold vlCVX and vote for its own gauge. Teams without voting power pay vote incentives to veCRV holders instead. Direct gauge rewards and Merkl campaigns pay liquidity providers in your own token.

[Incentivizing a Pool](../gauge/incentive-routes.md) compares what each route needs and when it fits.

## What Your Users Get

- Liquidity for the tokens your product issues or accepts.
- Trading fees on LP tokens that keep accruing while your product uses them.
- Gradual conversion of collateral through LLAMMA when they borrow on Llamalend.
- Contracts owned by the Curve DAO, where any parameter change needs a public onchain vote.

## Recommended Setup

| Goal | Setup | Guide |
| --- | --- | --- |
| Use Curve prices in your contracts | Read a pool's EMA oracle | [Understanding Stableswap](../pool/understanding-stableswap.md#oracles) |
| Let users borrow against your token or LP token | Llamalend market | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| Integrate Llamalend vaults or loans | ERC-4626 vault and Controller | [Post-Deployment & Integration](../lending/post-deployment.md) |
| Direct CRV emissions to your pools | veCRV, vlCVX or vote incentives | [Incentivizing a Pool](../gauge/incentive-routes.md) |

## Case Studies

Convex and StakeDAO hold veCRV. Holders of vlCVX and sdCRV direct how that veCRV votes.

Resupply's reUSD/sfrxUSD Curve LP token is collateral in a Llamalend market on Ethereum. Its liquidity providers borrow crvUSD against their LP position.

YieldBasis runs its BTC liquidity in FXSwap pools against crvUSD, with crvUSD minted for it, and trades its YB token in a Cryptoswap pool.

## Keepers, Liquidators and Curators

Liquidators and arbitrageurs keep Llamalend markets solvent and earn from it. Anyone can execute due FXSwap refuel streams and collect the bounty. Risk reviewers, such as SwissStake, help teams prepare lending market parameters.

## Requirements and Limits

Read a pool's EMA oracle, never its balances or a withdrawal simulation. Spot values can be manipulated within one transaction.

A gauge earns CRV only after a Curve DAO whitelisting vote, and then only in proportion to its weekly veCRV votes.

veCRV comes from locking CRV for up to four years, and voting power decays as the lock runs down.

The Curve DAO can change pool and market parameters by vote. Monitor the markets your product depends on.

## FAQ

### Can a protocol use a Curve LP token as collateral?

Yes. LP tokens are standard ERC-20 tokens, and Llamalend supports 2-coin Stableswap-NG LP tokens as collateral.

### Can contracts read Curve prices?

Yes. Every pool exposes an EMA price oracle onchain.

### How does a treasury get CRV emissions for its pool?

It votes with veCRV or vlCVX it holds, or pays vote incentives to veCRV holders.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Developer documentation](/developer/documentation-overview)
- [Incentivizing a Pool](../gauge/incentive-routes.md)
- [Launch a Lending Market](../lending/launch-isolated-lending-market.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
