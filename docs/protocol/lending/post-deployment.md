---
id: post-deployment
title: LlamaLend v1 Post Deployment (Legacy)
sidebar_label: v1 Post Deployment (Legacy)
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

:::warning

This operational guide applies to **LlamaLend v1** markets. For LlamaLend v2 market contracts and permissions, use the [v2 LendFactory](/developer/llamalend-v2/lend-factory) and [Configurator](/developer/llamalend-v2/configurator) references.

:::

After deploying a lending market, there are a few important steps to ensure it’s visible in the UI, functional, and capable of attracting liquidity and rewards.

## Seed Initial Liquidity

To attract the first borrowers, the lending market (more precisely the lending vault) needs supplied assets to borrow from. It makes sense to implement a strategy to get the market going by either supplying some own liquidity or getting some gauge weight on the lending vault.

## Token Logo Submission

Curve maintains a comprehensive list of token icons. If your pool's assets are not included in this list, they will display default logos in the Curve UI. To submit custom logos for your tokens, open a pull request to the [curve-assets repository](https://github.com/curvefi/curve-assets?tab=readme-ov-file#adding-a-token-icon).

## Monitor Performance and Update Parameters

After deployment, it definitely makes sense to monitor the markets on a constant basis. Check parameters like market utilization and borrow rates and adjust them accordingly to make it an optimal experience for borrowers and lenders.

For markets with low liquid tokens, it's crucial to measure the overall liquidity of the asset to ensure liquidations can be facilitated without any problems when needed. This includes monitoring trading volumes, price impact, and available liquidity across different exchanges and AMMs.

## Grow Liquidity Using Incentives

After deploying your lending market, you can boost liquidity and attract more users through various incentive mechanisms:

- **Gauge Integration** - Put up a DAO vote for your lending vault to be eligible to receive CRV emissions in order to attract more suppliers
- **External Rewards** - Add your own token incentives to make borrowing more attractive
- **Vote Incentives** - Provide rewards to veCRV holders who vote for your gauge

These strategies help bootstrap initial liquidity and create sustainable demand for your lending market.

<GuideCardGrid guideKeys={['GaugesAndIncentives']} />
