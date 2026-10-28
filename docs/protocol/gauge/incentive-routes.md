---
id: incentive-routes
title: Incentivizing a Pool
sidebar_label: Incentivizing a Pool
---

Liquidity providers deposit where the yield is. This page lists the ways a token issuer can fund or attract that yield on a Curve pool, what each route needs and when it fits. Routes appear in alphabetical order, and many issuers combine several.

## Before You Start

Most routes pay LPs through the pool's **gauge**, a contract that rewards LPs who stake their LP tokens in it. Anyone can deploy a gauge for any pool, and it can pay your own token rewards as soon as it exists.

CRV emissions take more. The Curve DAO must first whitelist the gauge in a 7-day on-chain vote, and creating that vote needs 2,500 veCRV. After that, the gauge earns a share of weekly CRV inflation equal to its share of veCRV gauge votes, updated every Thursday at 00:00 UTC. A gauge on another chain receives CRV through a root gauge on Ethereum, so whitelisting and voting both happen there. See [Whitelisting a Gauge](./whitelisting-gauge.md) and [Getting CRV Emissions](./guides/getting-crv-emissions.md).

| Route | Needs a gauge | Needs DAO whitelist | Who pays LPs |
| ----- | ------------- | ------------------- | ------------ |
| Direct gauge rewards | Yes | No | You, in any standard token |
| Holding veCRV or vlCVX | Yes | Yes | Curve, in CRV |
| Merkl campaigns | No | No | You, in any standard token |
| Vote incentives | Yes | Yes | Curve, in CRV; you pay the voters |

![How each route reaches LPs: direct gauge rewards pay your token through the pool gauge; holding veCRV or vlCVX directs CRV through the gauge weight vote; Merkl campaigns pay your token through Merkl; vote incentives pay veCRV and vlCVX voters, who direct CRV. Routes through a gauge weight vote need a DAO-whitelisted gauge.](/img/protocol/gauge/incentive-routes.png)

## Routes

### Direct Gauge Rewards

You deposit reward tokens into the gauge and it streams them to staked LPs, by default over one week.

**What it needs:** a deployed gauge, the gauge manager's wallet to register the token and a distributor, and a standard transferable token. A gauge holds at most 8 reward tokens, and a token can't be removed once added. Rebasing tokens lose their rebases inside the gauge.

**When it fits:** you want rewards live on day one, in your own token or a stablecoin, with a budget you control. No vote is involved, so it works on any chain with Curve gauges.

Guide: [Adding Permissionless Rewards](./guides/adding-permissionless-rewards.md).

### Holding veCRV or vlCVX

You hold voting power yourself and point it at your gauge every week. The emissions you direct cost you nothing beyond the capital tied up in the lock.

- **veCRV:** lock CRV on Curve for up to four years. Voting power decays as the lock runs down, and each address can change its vote on a gauge once every 10 days. See [How to Lock CRV](/user/vecrv/how-to-lock).
- **vlCVX:** lock CVX on [Convex](https://www.convexfinance.com) for 16 weeks. Convex holds a large share of veCRV and votes it as vlCVX holders direct.
- **Liquid lockers:** protocols such as [StakeDAO](https://www.stakedao.org) hold veCRV and let holders of their liquid token, like sdCRV, direct its votes.

**What it needs:** a whitelisted gauge and enough locked capital for your votes to matter against the total.

**When it fits:** you plan to stay on Curve for years and prefer owning votes to renting them each week.

### Merkl Campaigns

[Merkl](https://merkl.xyz) runs incentive campaigns that pay LPs off-chain-computed rewards, which they claim from Merkl. The Curve app shows live Merkl campaigns on Curve pools.

**What it needs:** a reward budget. No gauge and no DAO vote. Merkl takes a fee from the budget, 3% for standard campaigns at the time of writing, with lower rates at higher volumes. Check the current [fee model](https://docs.merkl.xyz/distribute-with-merkl/fee-model) before launching.

**When it fits:** you want rewards without deploying or managing a gauge, or you want campaign rules a gauge can't express.

### Vote Incentives

You pay veCRV or vlCVX holders to vote for your gauge. They earn your tokens, and your LPs earn the CRV their votes direct. People also call these bribes.

- **[Votemarket](https://www.votemarket.org/curve)** by StakeDAO: you fund a campaign for a gauge over a set number of weekly periods, cap the price per vote, and can blacklist addresses such as your own.
- **[Votium](https://votium.app/curve):** incentives paid to vlCVX holders for the way Convex votes its veCRV.

**What it needs:** a whitelisted gauge and a budget. Both platforms charge a fee; check it before funding.

**When it fits:** you want CRV emissions without locking capital, and the CRV your votes direct is worth more to LPs than paying them the same budget directly. The price of a vote moves every week, so compare before each round.

## Combining Routes

The routes stack on the same pool. A common pattern starts with direct gauge rewards or a Merkl campaign while the whitelist vote runs, then adds vote incentives or owned votes once the gauge can receive CRV.

![A common launch sequence: direct gauge rewards or a Merkl campaign from day 0, the 7-day DAO whitelist vote on Ethereum, votes cast for the gauge, then CRV from the next Thursday 00:00 UTC weight update.](/img/protocol/gauge/incentive-timeline.png)

Background: [Incentives: CRV Emissions vs. Permissionless Rewards](./incentives.md) and [Gauge Weights](/user/dao/gauge-weights).
