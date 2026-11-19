---
id: whitelisting-gauge
title: "Whitelist a Gauge"
sidebar_label: "Whitelist a Gauge"
description: How to get a Curve gauge whitelisted for CRV emissions through a Curve DAO vote, what the vote needs and which tokens the DAO generally rejects.
---

When you finish, your gauge is in the `GaugeController` and holders of [veCRV](/protocol/glossary#vecrv) (CRV locked for voting power) can vote CRV emissions to it.

The Curve DAO vote runs for 7 days, and creating it needs 2,500 veCRV.

:::warning
The DAO generally rejects gauges for pools or lending markets with tokens that have transfer restrictions, transfer taxes, blacklists or other non-standard behavior. Only freely transferable, openly accessible tokens are considered.

The DAO decides each vote, but it has historically put protecting [liquidity providers](/protocol/glossary#liquidity-provider) (LPs) and the protocol from value extraction first. Check that your token behaves as a standard ERC-20 before you propose a gauge.
:::

[Incentivize Liquidity](./overview.md) explains what a gauge does, and [Governance Proposals](/user/dao/proposals) explains how a vote passes.

## Before You Start

You need a deployed pool or lending market, a wallet on Ethereum and a Pinata API key.

It costs gas for the gauge deployment and the vote transaction, and creating the vote needs 2,500 veCRV.

The vote stays open for 7 days once it is created.

veCRV holders approve it by voting yes in the Curve DAO.

## Deploy the Gauge

Skip this section if your pool or market already has a gauge. The wallet that deploys a gauge becomes its manager.

1. Open [Deploy Gauge](https://www.curve.finance/dex/ethereum/deploy-gauge) in the Curve app and connect your wallet.
2. For a pool on Ethereum, leave the switch on **Deploy Mainnet Gauge**. Choose the pool type under **Set Pool Type** and enter the **Pool Address**.
3. Select **Deploy Gauge** and confirm the transaction.

A gauge on another chain takes two deployments from the same wallet:

1. Turn on the switch so the title reads **Deploy Sidechain Gauge**, and connect to the pool's chain.
2. Under **Step 1**, choose the pool type under **Set Pool Type**, enter the **LP Token Address** and select **Deploy Sidechain Gauge**.
3. Switch your wallet to Ethereum and open **Step 2**.
4. Select the same network under **Select Network**, the same pool type and the same **LP Token Address**, then select **Deploy Mirror Gauge**.

The DAO whitelists the mirror gauge on Ethereum, which is the root gauge for the other chain.

## Post a Forum Proposal {#step-1-post-a-governance-forum-proposal-recommended}

1. Open the [Curve Governance Forum](https://gov.curve.finance/) and start a new topic.
2. Describe your protocol or pool and why you ask for CRV emissions.
3. Say what the pool brings to Curve, such as volume, sticky liquidity or a new use case.
4. Link the deployed gauge contract and any audits.

The post is optional. Voters are more likely to support an issuer they know, and a newer one gains the most from it.

## Create the Vote {#step-2-submit-an-on-chain-vote}

1. Create a Pinata API key with the legacy `pinFileToIPFS` endpoint enabled. [Pinata's guide](https://docs.pinata.cloud/account-management/api-keys) shows how. Without that endpoint, the upload of the vote description fails.
2. Open the [Gauges page](https://www.curve.finance/dao/ethereum/gauges) of the Curve DAO and connect a wallet holding at least 2,500 veCRV.
3. On the **Gauges** tab, select **Create gauge vote**.
4. Enter the **Gauge Address**: the gauge on Ethereum, or the mirror gauge for another chain.
5. Enter a **Vote Description** and your **Pinata JWT**.
6. Select **Create vote** and confirm the transaction.

The vote appears on the [Proposals page](https://www.curve.finance/dao/ethereum/proposals/) a few minutes later.

If you hold less than 2,500 veCRV, ask on the [Curve Governance Forum](https://gov.curve.finance/). veCRV holders regularly create votes for others.

## Promote the Vote {#step-3-promote-the-vote}

1. Share the vote link in Curve's [Discord](https://discord.gg/twUngQYz85) and [Telegram](https://t.me/curvefi).
2. Link it from your forum post so veCRV holders find the context.

## Execute the Vote {#step-4-after-the-vote}

1. When the 7 days end and the vote has passed, open the proposal and select **Execute**. Anyone can execute it.
2. Ask veCRV holders to vote for the gauge. A whitelisted gauge with no votes receives no CRV.

## Check It Worked

- The gauge appears in the gauge list on the [Gauges page](https://www.curve.finance/dao/ethereum/gauges), and its own page shows its **Relative Weight**.
- The proposal on the [Proposals page](https://www.curve.finance/dao/ethereum/proposals/) shows **Executed**.
- On Etherscan, the `GaugeController` returns your gauge's type from `gauge_types(<gauge address>)` instead of reverting.

## Next Step

[Get CRV Emissions](./guides/getting-crv-emissions.md) shows how to win the gauge weight votes that send CRV to your gauge.
