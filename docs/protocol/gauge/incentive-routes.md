---
id: incentive-routes
title: Incentivizing a Pool
sidebar_label: Incentivizing a Pool
---

Liquidity providers deposit where the yield is. This page lists the ways a token issuer can fund or attract that yield on a Curve pool, what each route needs and when it fits. Routes appear in alphabetical order, and many issuers combine several.

## Before You Start

Most routes pay LPs through the pool's **gauge**, a contract that rewards LPs who stake their LP tokens in it. Anyone can deploy a gauge for any pool, and it can pay your own token rewards as soon as it exists.

CRV emissions take more. The Curve DAO must first whitelist the gauge in a 7-day on-chain vote, and creating that vote needs 2,500 veCRV. After that, the gauge earns a share of weekly CRV inflation equal to its share of veCRV gauge votes, updated every Thursday at 00:00 UTC. CRV emissions cost you nothing directly, but their value to LPs moves with the CRV price. A gauge on another chain receives CRV through a root gauge on Ethereum, so whitelisting and voting both happen there. Its CRV arrives about a week later than on Ethereum: CRV accumulates in the root gauge for one week, then is bridged and streamed to LPs on the other chain ([Gauge Weights on L2s](/user/dao/gauge-weights#gauge-weights-on-l2s)). See [Whitelisting a Gauge](./whitelisting-gauge.md) and [Getting CRV Emissions](./guides/getting-crv-emissions.md).

| Route | Needs a gauge | Needs DAO whitelist | Who pays LPs |
| ----- | ------------- | ------------------- | ------------ |
| Direct gauge rewards | Yes | No | You, in any standard token |
| Holding veCRV | Yes | Yes | Curve, in CRV |
| Holding vlCVX | Yes | Yes | Curve, in CRV |
| Merkl campaigns | No | No | You, in any standard token |
| Vote incentives | Yes | Yes | Curve, in CRV; you pay the voters |

![How each route reaches LPs: holding veCRV or vlCVX (your own votes) and vote incentives (votes you pay for) both go through the gauge weight vote and pay LPs in CRV; direct gauge rewards (through the pool gauge) and Merkl campaigns (through Merkl) pay LPs in your token. Routes through the gauge weight vote need a DAO-whitelisted gauge.](/img/protocol/gauge/incentive-routes.png)

## Routes

### Direct Gauge Rewards

You deposit reward tokens into the gauge and it streams them to staked LPs. Each deposit streams over a period the distributor sets, 1 week by default. On other chains the gauge accepts 3 days to 48 weeks; Ethereum gauges set no limit.

**What it needs:** a deployed gauge, the gauge manager's wallet to register the token and a distributor, and a standard transferable token. A gauge holds at most 8 reward tokens, and a token can't be removed once added. Rebasing tokens lose their rebases inside the gauge.

Only the gauge manager or the Curve DAO can register a reward token, so a third party needs the manager to call `add_reward` with their token and distributor address. The factory allows one gauge per pool: if someone else deployed your pool's gauge, they hold the manager role.

**When it fits:** you want rewards live on day one, in your own token or a stablecoin, with a budget you control. No vote is involved, so it works on any chain with Curve gauges.

Guide: [Adding Direct Gauge Rewards](./guides/adding-direct-gauge-rewards.md).

### Holding veCRV

You lock CRV on Curve for up to four years and vote for your gauge yourself, at any time. Your vote stays in place until you change it, its weight decays as the lock runs down, and you can change your vote on a gauge once every 10 days. See [How to Lock CRV](/user/vecrv/how-to-lock).

To hold veCRV voting power indirectly, use a liquid locker such as [StakeDAO](https://www.stakedao.org): holders of its liquid token, sdCRV, direct StakeDAO's veCRV votes, which it casts every 2 weeks.

**What it needs:** a whitelisted gauge and enough locked CRV for your votes to matter against the total.

**When it fits:** you plan to stay on Curve for years and prefer owning votes to renting them each round. The emissions you direct cost you nothing beyond the capital tied up in the lock.

### Holding vlCVX

You lock CVX on [Convex](https://www.convexfinance.com) for 16 weeks. Convex holds a large share of veCRV and votes it every 2 weeks as vlCVX holders direct.

**What it needs:** a whitelisted gauge and enough vlCVX for your share of Convex's votes to matter.

**When it fits:** you want owned votes with a shorter lock than veCRV, and voting every 2 weeks suits you.

### Merkl Campaigns

[Merkl](https://merkl.xyz) runs incentive campaigns that pay LPs off-chain-computed rewards, which they claim from Merkl. The Curve app shows live Merkl campaigns on Curve pools.

**What it needs:** a reward budget. No gauge and no DAO vote. Merkl takes a fee from the budget, 3% for standard campaigns at the time of writing, with lower rates at higher volumes. Check the current [fee model](https://docs.merkl.xyz/distribute-with-merkl/fee-model) before launching.

**When it fits:** you want rewards without deploying or managing a gauge, or you want campaign rules a gauge can't express.

### Vote Incentives

You pay veCRV or vlCVX holders to vote for your gauge. They earn your tokens, and your LPs earn the CRV their votes direct. People also call these bribes.

Your budget buys votes, and those votes direct CRV emissions to your gauge, so LPs can receive more in CRV than you paid voters. How much more depends on the CRV price and the price per vote. Historically, issuers have often got more value for LPs this way than from direct gauge rewards.

- **[Votemarket](https://www.votemarket.org/curve)** by StakeDAO: you fund a campaign for a gauge over a set number of weekly periods, cap the price per vote, and can blacklist addresses such as your own. StakeDAO's own liquid locker votes every 2 weeks.
- **[Votium](https://votium.app/curve):** incentives paid to vlCVX holders for the way Convex votes its veCRV. Rounds run every 2 weeks, matching Convex's vote.

**What it needs:** a whitelisted gauge and a budget. Both platforms charge a fee; check it before funding.

**When it fits:** you want CRV emissions without locking capital, and the CRV your votes direct is worth more to LPs than paying them the same budget directly. The price of a vote moves from round to round, so compare before each one.

## Combining Routes

The routes stack on the same pool. A common pattern starts with direct gauge rewards or a Merkl campaign while the whitelist vote runs, then adds vote incentives or owned votes once the gauge can receive CRV.

![A common launch sequence: direct gauge rewards or a Merkl campaign from day 0, the 7-day DAO gauge whitelist vote on Ethereum, votes cast for the gauge (Convex and StakeDAO vote every 2 weeks), then CRV on Ethereum from the Thursday 00:00 UTC weight update after that vote round, and on other chains one week later through the root gauge.](/img/protocol/gauge/incentive-timeline.png)

Background: [Gauge Weights](/user/dao/gauge-weights).
