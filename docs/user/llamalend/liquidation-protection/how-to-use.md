---
title: How to properly use Liquidation Protection
sidebar_label: How to properly use Liquidation Protection
---

import ThemedVideo from '@site/src/components/ThemedVideo';

Liquidation protection replaces liquidation at one specific price with gradual conversions that can give borrowers more time to act. It does not make a position safe: conversions erode collateral value and health and can still end in full liquidation.

This section showcases two different strategies: a conservative and aggressive approach, on how to use liquidation protection:

## Conservative Approach: Treat Entry as Your Liquidation Price

This approach is **recommended for most users**: treat the entry point into liquidation protection as your effective liquidation price. Acting before or immediately after entry limits exposure to repeated conversion losses.

**What to do:**
- **Before entering protection**: Repay some debt or add more collateral to push the range further away
- **If already in protection**: Fully repay and open a new position, or use the reset path when the market is LlamaLend v2.

---

## Aggressive Approach: Stay in Protection

You can choose to stay in liquidation protection, but this approach includes **higher risk and requires active monitoring**.

Once a position enters liquidation protection, the protection mechanism incurs losses which continuously reduce your loan's health, regardless of whether the price moves up or down within the liquidation protection range. These losses occur during every conversion, so even if the price goes up and your position appears to be recovering, the accumulated losses from the protection mechanism can still outweigh the health gained from price appreciation. This means positions can very well be fully liquidated even if the collateral price is rising within the liquidation protection range, if the incurred losses are bigger than the health gained through the price appreciation. If health reaches 0%, the loan is fully liquidated. While the system will automatically help restore your position if prices recover above the range (crvUSD converts back to collateral), your total collateral value will still be reduced by accumulated losses.

While in liquidation protection, you face strict restrictions: you cannot add or remove collateral, and you cannot move the liquidation protection range once you're inside it. Even repaying 99% of your debt will not get the position out of liquidation protection or move the range. Your only available actions are to repay debt to improve health (the only action possible while in protection) or wait for price recovery above the liquidation protection range to automatically exit.

This strategy requires constant vigilance. You must continuously monitor your loan's health, and if it approaches zero, you must repay some debt to improve it. Remember: repaying debt improves health but does not move the liquidation protection range or exit protection—only full repayment closes the position.

<figure>
  <ThemedVideo
    alt="Liquidation Protection (repay and no full liquidation)"
    sources={{
      light: require('@site/static/img/user/llamalend/15_chart.mp4').default,
      dark: require('@site/static/img/user/llamalend/15_chart.mp4').default,
    }}
    style={{ width: '750px', maxWidth: '100%', display: 'block', margin: '0 auto' }}
  />
  <figcaption>
    This loan continuously entered and exited liquidation protection and stayed in it for quite some time (around 4 hours). The user constantly monitored its health and repaid some debt as soon as health got closer to 0%.
  </figcaption>
</figure>
