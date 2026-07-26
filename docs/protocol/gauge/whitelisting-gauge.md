---
id: whitelisting-gauge
title: Whitelisting a Gauge
sidebar_label: Whitelisting a Gauge
---

For a gauge to be eligible to receive CRV emissions, it must be **whitelisted** via a DAO vote. More technically, the gauge needs to be added to the `GaugeController` contract through a governance vote. If the vote successfully passes, veCRV holders can direct their voting power to the gauge. The gauge receives CRV emissions proportional to the votes it receives relative to total votes. For example, if a gauge receives 1% of all veCRV votes, it will receive 1% of CRV inflation for that week.

The whitelisting process is fully decentralized and governed by the DAO. This guide walks through how to request approval from veCRV holders and get gauges added to the emissions system.

:::warning
Gauges for pool or lending markets including tokens with transfer restrictions, tax mechanisms, blacklists, or other non-standard behavior are generally **not approved** by the DAO. Only freely transferable, openly accessible tokens are considered eligible for CRV emissions.

While final decisions are made through governance, the DAO historically prioritizes protecting LPs and the protocol from potential value extraction or misuse. Ensure your token meets standard ERC-20 requirements before submitting a gauge proposal.
:::

---

## Step 1: Post a Governance Forum Proposal (Recommended)

Before submitting an on-chain vote, it's good practice to post a proposal on the <a href="https://gov.curve.finance/" target="_blank" rel="noopener noreferrer">Curve Governance Forum</a>. This allows the community and veCRV holders to review your request and ask questions.

The post should include:

- A short explanation of your protocol or pool
- Why you're requesting CRV emissions
- How the pool benefits Curve (e.g. volume, stickiness, new use cases)
- A link to the gauge contract (already deployed)
- Any supporting audits or docs

This step is not required, but it increases transparency and support — especially for lesser-known protocols or assets. The more people know about the project, the higher the chance it passes.

## Step 2: Submit an On-Chain Vote

Once your gauge is deployed and you've shared your proposal, go to the <a href="https://www.curve.finance/dao/ethereum/gauges" target="_blank" rel="noopener noreferrer">Curve Governance UI</a> to start the DAO approval process by clicking the `Create Gauge Vote` button.

To submit a whitelisting vote:

- Connect your wallet
- Enter your deployed gauge address
- Enter a description text
- Enter your pinata JWT
- Sign and confirm the transaction

:::info
To actually create an on-chain vote for the Curve DAO to vote on, you will need 2,500 veCRV. If you don't have any, feel free to reach out in public channels. There are more than enough people willing to create a proposal for you.
:::

:::warning
The vote description is uploaded to IPFS via Pinata. You need a Pinata API key to proceed. <a href="https://docs.pinata.cloud/account-management/api-keys" target="_blank" rel="noopener noreferrer">Here's an explanation on how to create one</a>.

IMPORTANT: You must enable the "pinFileToIPFS" legacy endpoint when creating your API key, otherwise it will not work.
:::

After a few minutes, your proposal will appear on the <a href="https://www.curve.fi/dao/ethereum/proposals/" target="_blank" rel="noopener noreferrer">Curve DAO proposals page</a>, where veCRV holders can vote **yes** or **no**.

This begins a 7-day on-chain vote to whitelist your gauge to the `GaugeController`.

## Step 3: Promote the Vote

Once the vote is live, share it in Curve's <a href="https://discord.gg/rgrfS7W" target="_blank" rel="noopener noreferrer">Discord</a> and <a href="https://t.me/curvefi" target="_blank" rel="noopener noreferrer">Telegram</a> to notify veCRV holders. Engaging the community increases your chances of success.

## Step 4: After the Vote

If the vote passes:

- Your gauge will be whitelisted and added to the GaugeController
- It becomes eligible to receive CRV emissions starting from the next epoch onwards
- Emissions begin with the next epoch (**Thursdays at 00:00 UTC**)

> CRV emissions are not automatic — veCRV holders must still vote for your gauge to assign weight and receive emissions.

---

## Next Steps

todo
