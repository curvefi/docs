---
id: post-deployment
title: Post Deployment
sidebar_label: Post Deployment
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

After deploying a pool, there are a few important steps to ensure it’s visible, functional, and capable of attracting liquidity and rewards.

## Seed Initial Liquidity

Before a pool can process any trades, it must be seeded with initial liquidity. To get the pool going, it's highly recommended to add liquidity in proportional balances. For two-coin pools 50/50, three-coin pools 33/33/33, etc.

The frontend filters out liquidity pools with less than $10k TVL. The pool will be hidden by default from the pool list. Users can still search for the pool using its name or contract address, or simply disable the "Hide very small pools" filter.

## Integrations

Liquidity pools deployed via the Curve UI are automatically picked up by major aggregators like 1inch, Odos, CowSwap, etc. No need to hustle for integrations!

## Token Logo Submission

Curve maintains a comprehensive list of token icons. If your pool's assets are not included in this list, they will display default logos in the Curve UI. To submit custom logos for your tokens, open a pull request to the [curve-assets repository](https://github.com/curvefi/curve-assets?tab=readme-ov-file#adding-a-token-icon).

## Monitor Performance and Update Parameters

After deployment, it's important to monitor your pool's performance regularly. Check trading volumes, TVL, and token balances to ensure healthy operation. Heavily skewed token balances could indicate incorrect parameterization, such as an amplification coefficient that's too high.

Some pools are later optimized by external contributors or protocols. However, **it's still a good idea to monitor your own pool** and explore whether tuning the parameters could improve performance.

If you'd like help evaluating or optimizing your pool, feel free to reach out in the official Curve channels.

## Add Refuels (FXSwap Pools)

If you deployed an **FXSwap pool**, consider adding refuels to subsidize rebalancing and keep liquidity tight around the current price. Refuels can be added manually via [crvhub.com/refuel](https://crvhub.com/refuel), or automated with the [`DonationStreamer` contract](./guides/donation-streamer.md). For more on how refuels work, see [Understanding FXSwap — Refuels](./understanding-fxswap.md#refuels).

## Grow Liquidity Using Incentives

Curve offers various ways for protocols or asset issuers to sustainably grow liquidity and asset proliferation. Examples include attracting gauge weight to receive CRV emissions or providing external incentives and points.

<GuideCardGrid guideKeys={['GaugesAndIncentives']} />
