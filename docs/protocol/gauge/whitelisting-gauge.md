---
id: whitelisting-gauge
title: Whitelisting a Gauge
sidebar_label: Whitelisting a Gauge
---

A gauge can receive CRV emissions only after the Curve DAO whitelists it: a 7-day on-chain vote adds the gauge to the `GaugeController` contract. Creating that vote needs a deployed gauge and 2,500 veCRV. Once whitelisted, the gauge earns a share of weekly CRV equal to its share of veCRV gauge weight votes. A gauge on another chain is whitelisted through its root gauge on Ethereum.

:::warning
The DAO generally rejects gauges for pools or lending markets with tokens that have transfer restrictions, transfer taxes, blacklists or other non-standard behavior. Only freely transferable, openly accessible tokens are considered.

The DAO decides each vote, but it has historically put protecting LPs and the protocol from value extraction first. Check that your token behaves as a standard ERC-20 before you propose a gauge.
:::

## Step 1: Post a Governance Forum Proposal (Recommended)

Before the on-chain vote, post a proposal on the [Curve Governance Forum](https://gov.curve.finance/). veCRV holders can review it and ask questions there.

Include:

- A short explanation of your protocol or pool
- Why you're asking for CRV emissions
- What the pool brings to Curve (for example volume, sticky liquidity or a new use case)
- A link to the deployed gauge contract
- Any audits or supporting docs

The post is optional, but voters are more likely to support a project they know, especially a newer one.

## Step 2: Submit an On-Chain Vote

Once your gauge is deployed and your proposal is posted, open the [Curve Governance UI](https://www.curve.finance/dao/ethereum/gauges) and click **Create Gauge Vote**.

To submit a whitelisting vote:

- Connect your wallet
- Enter your deployed gauge address
- Enter a description
- Enter your Pinata JWT
- Sign and confirm the transaction

:::info
Creating the vote needs 2,500 veCRV. If you don't hold that much, ask on the [Curve Governance Forum](https://gov.curve.finance/); veCRV holders regularly create votes for others.
:::

:::warning
The vote description is uploaded to IPFS through Pinata, so you need a Pinata API key. See [how to create one](https://docs.pinata.cloud/account-management/api-keys).

Enable the legacy `pinFileToIPFS` endpoint when you create the key. Without it, the upload fails.
:::

After a few minutes, your vote appears on the [Curve DAO proposals page](https://www.curve.finance/dao/ethereum/proposals/), where veCRV holders vote yes or no for 7 days.

## Step 3: Promote the Vote

Share the live vote in Curve's [Discord](https://discord.gg/rgrfS7W) and [Telegram](https://t.me/curvefi) so veCRV holders see it.

## Step 4: After the Vote

If the vote passes, the gauge is added to the `GaugeController`. veCRV holders can then vote for it, and those votes count from the next weekly update, every Thursday at 00:00 UTC. A gauge with no votes receives no CRV.

## Next Steps

- [Getting CRV Emissions](./guides/getting-crv-emissions.md): how gauge weight votes turn into CRV for your gauge.
- [Incentivizing a Pool](./incentive-routes.md): every way to attract votes and fund LP yield.
