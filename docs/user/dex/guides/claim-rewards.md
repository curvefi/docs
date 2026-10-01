---
id: claim-rewards
title: 'Guide: Claiming LP Rewards'
sidebar_label: Claim Rewards
---

import ThemedImage from '@theme/ThemedImage';
import ButtonGrid from '@site/src/components/ButtonGrid';

Connect your wallet and find the pool in **Your Positions** on the [Pools page](https://www.curve.finance/dex/ethereum/pools/) for the relevant network. This list shows your LP positions and claimable rewards.

To claim your earned `CRV` and other token rewards, go to your pool's page, select `Withdraw`, then `Claim Rewards`, you should see a box like the following:

<figure style={{ textAlign: 'center' }}>
  <ThemedImage
    alt="Claim Rewards"
    sources={{
      light: require('@site/static/img/ui/dex/claim-light.png').default,
      dark: require('@site/static/img/ui/dex/claim-dark.png').default,
    }}
    style={{
      maxWidth: '300px',
      width: '100%'
    }}
  />
  <figcaption></figcaption>
</figure>

You may see 2 claim buttons, or just a single one, depending on the rewards you have to claim:

- `Claim CRV`: This will claim ***only*** `CRV` rewards.
- `Claim Rewards`: This will claim everything ***except*** any `CRV` rewards.

By confirming the transactions within your wallet, you will claim each separate reward.  Congratulations on your earnings!