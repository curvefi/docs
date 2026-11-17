---
id: post-deployment
title: After Deploying a Curve Pool
sidebar_label: Post Deployment
description: "What to do after deploying a Curve pool: seed initial liquidity, check integrations, submit the token logo, monitor parameters, add refuels and plan incentives."
---

import GuideCardGrid from '@site/src/components/GuideCardGrid';

A new pool can't trade until it holds liquidity. After seeding it, check that it appears in the Curve app and aggregators, submit your token logo and plan incentives.

## Seed Initial Liquidity

Before a pool can process any trades, it must be seeded with initial liquidity. To get the pool going, it's highly recommended to add liquidity in proportional balances. For two-coin pools 50/50, three-coin pools 33/33/33, etc.

The frontend filters out liquidity pools with less than $10k TVL. The pool will be hidden by default from the pool list. Users can still search for the pool using its name or contract address, or simply disable the "Hide very small pools" filter.

## Integrations

Aggregators such as [0x](https://docs.0x.org/evm/need-help/faq), 1inch, [CoW Swap](https://docs.cow.fi/cow-protocol), [KyberSwap](https://docs.kyberswap.com/getting-started/supported-exchanges-and-networks), Odos and ParaSwap route swaps through Curve pools, and they pick up new pools without a listing step.

## Token Logo Submission

Curve maintains a comprehensive list of token icons. If your pool's assets are not included in this list, they will display default logos in the Curve UI. To submit custom logos for your tokens, open a pull request to the [curve-assets repository](https://github.com/curvefi/curve-assets?tab=readme-ov-file#adding-a-token-icon).

## Monitor Performance and Update Parameters

After deployment, it's important to monitor your pool's performance regularly. Check trading volumes, TVL, and token balances to ensure healthy operation. Heavily skewed token balances could indicate incorrect parameterization, such as an amplification coefficient that's too high.

Some pools are later optimized by external contributors or protocols. However, **it's still a good idea to monitor your own pool** and explore whether tuning the parameters could improve performance.

Compare your pool with [Pool Parameter Presets](./presets.md), and see [Troubleshooting Curve Pools](./troubleshooting.md) for skewed or stale pools. The Curve team answers parameter questions in [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85).

## Add Refuels (FXSwap Pools)

If you deployed an **FXSwap pool**, consider adding refuels to subsidize rebalancing and keep liquidity tight around the current price. Refuels can be added manually via [crvhub.com/refuel](https://crvhub.com/refuel), or automated with the [`DonationStreamer` contract](./guides/donation-streamer.md). For more on how refuels work, see [Understanding FXSwap — Refuels](./understanding-fxswap.md#refuels).

## Grow Liquidity Using Incentives

Curve offers various ways for protocols or asset issuers to sustainably grow liquidity and asset proliferation. Options include CRV emissions through gauge weight votes, direct gauge rewards and Merkl campaigns.

<GuideCardGrid guideKeys={['GaugesAndIncentives', 'IncentivizingAPool']} />
