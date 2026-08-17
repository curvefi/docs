---
title: Liquidation Protection & Loan Health
sidebar_label: Liquidation Protection & Health
---

import ThemedImage from '@theme/ThemedImage';
import CollateralConversion from '@site/src/components/CollateralConversion';
import ThemedVideo from '@site/src/components/ThemedVideo';

## Replacing a Single Liquidation Price with a Range

Volatile markets are one of the biggest risks when taking out onchain loans. Prices can collapse in seconds, and on many lending platforms, a single sharp move can liquidate a user before they even have time to respond.

Llamalend's **liquidation protection** changes how this risk unfolds; it does not remove it.

Instead of liquidating a position the moment it reaches a specific price, LLAMMA converts collateral gradually across a range. This can give borrowers more time to repay, close, or reset a position before hard liquidation.

The tradeoff is that every conversion can reduce collateral value and health. With Llamalend, borrowers can:

- see a range rather than one fixed liquidation price
- gain time to adjust or repay before health reaches 0
- monitor how band conversions affect collateral and health
- choose to close or reset instead of remaining exposed to repeated conversions

---

## Quick Reference

| Concept | What It Means |
|---------|---------------|
| **Liquidation Protection** | Your loan enters liquidation protection mode when collateral price moves into its band range. LLAMMA gradually converts collateral; the direction can reverse during a recovery, but conversion losses do not. |
| **Health** | A value showing how close you are to full liquidation. Think of it like a fuel gauge: when it hits 0, your loan is closed. |
| **Liquidation Protection Range** | A price zone (e.g., ETH \$3,000-$2,500). When price enters this zone, liquidation protection activates. |
| **Full Liquidation** | When health reaches 0, your loan is fully closed. |
| **Bands** | Small price ranges that make up your protection range. More bands = wider range = lower risk. |
| **Protection ≠ Full Liquidation** | The loan remains open while health is above 0, but conversion losses are already occurring and can lead to full liquidation. |
| **Losses in Liquidation Protection** | Losses from conversions reduce your total collateral value permanently. If you enter with 10 ETH and exit protection later, you'll have less than 10 ETH (10 ETH minus losses). This reduction doesn't recover even if prices fully recover. |

:::important
**The Golden Rule**: Treat entry into liquidation protection as a signal to act. Health above 0 only means the position has not yet been fully liquidated; conversions can continue reducing it.

For answers to common questions, see the [FAQ](../faq.md).
:::


## The Simple Idea

:::info
**Analogy for Liquidation Protection:**  
Fixed-price liquidation is like a step: crossing one price can close the loan immediately. LLAMMA is more like a ramp: it exchanges collateral in stages across the liquidation protection range, giving the borrower time to react. Each step down or back up the ramp has friction in the form of conversion losses. If those losses push health to 0, the position is fully liquidated.
:::

Liquidation protection in Llamalend works differently from systems that use a fixed liquidation price. There is **no single price** at which your loan suddenly disappears. A position is only liquidated when its **health reaches 0**. Important notice: in Llamalend, health is not a direct correlation of LTV.

To prevent health from collapsing to zero during volatility, every loan is given a **liquidation range**, defined by two price points. When the market price enters this range, the system begins **gradually adjusting your collateral** to keep the loan stable.

The liquidation range is defined by:

- the **Liquidation Threshold**, which is the price below which liquidation begins — essentially the start of the liquidation range.

- the **Bottom of the Liquidation Range**, where collateral has been fully converted. Important: this is **not** the price at which a position becomes fully liquidated.

<figure>
<ThemedImage
    alt="Llamalend Markets"
    sources={{
        light: require('@site/static/img/user/llamalend/LLAMMA/liquidation-range.png').default,
        dark: require('@site/static/img/user/llamalend/LLAMMA/liquidation-range.png').default,
    }}
    style={{ width: '700px', display: 'block', margin: '0 auto' }}
/>
</figure>

So, what happens when the price of the collateral falls within the liquidation range?
- **When prices fall**, the system automatically and **gradually sells off parts of your collateral asset (for example ETH) for crvUSD**. This reduces exposure to the falling asset and helps preserve the value supporting loans.
- **When prices rise** again, the system uses the **previously obtained crvUSD to buy back the initial collateral**, restoring part of the original asset balance.

These adjustments happen continuously and automatically (no need for user interaction) while the price moves up and down inside the liquidation range. Instead of a sudden liquidation at a single price, the loan is stabilized through **small, ongoing conversions** that give users more time to act.

However, these **conversions come with a cost**. Because the system needs to incentivize arbitrage traders to perform them, each conversion incurs a slight **loss**. When the market moves up and down inside the range, these **losses accumulate and gradually reduce your health**. **These losses happen in both directions, on the way down and on the way back up**. The more volatility and the less liquidity in the liquidation zone, the faster health gets eroded. More about these losses here: [Understanding Losses](#understanding-losses).

But as long as **health stays above 0**, the loan survives. Only when health reaches 0 — regardless of the current price — is the position fully liquidated.

Users can influence health by managing collateral and debt when those actions are available, but price movement, interest, and conversion losses also affect it. For details on what actions you can take, see [I'm in Liquidation Protection. What Now?](#im-in-liquidation-protection-what-now).


---

## Understanding Health: Your Safety Measurement

Health is like a fuel gauge for your loan. It shows how much buffer you have before full liquidation.

- **High health (e.g., 10 or higher)**: You have a large safety buffer
- **Medium health (e.g., 5)**: Moderate risk. Consider taking action
- **Low health (e.g., sub 2)**: Critical: immediate action needed
- **0 health**: Full liquidation occurs

Health decreases from four main factors:

1. **Price drops**: When your collateral becomes less valuable
2. [**Losses in liquidation protection**](#understanding-losses): When you're in liquidation protection and collateral swaps occur
3. **Interest**: Charged continuously every second (very slowly)
4. **Borrowing more or removing collateral**: Taking on additional debt or removing collateral obviously decreases your health as well

:::important
Even if price is rising, health can still fall while you're inside the protection range because losses from conversions continue until you exit the range completely. A rising price does not guarantee improving health unless price moves above the full protection range.
:::

Health can be monitored:

- **In the UI**: View your health in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets)
- **Telegram Bot**: Get automated alerts via the [Llamalend Telegram Bot](https://news.curve.fi/llamalend-telegram-bot/)

---

## How It Works: Two Stages

### Stage 1: Liquidation Protection

When your collateral price drops into the liquidation protection range (see [The Simple Idea](#the-simple-idea) for how the range is defined), your position enters **liquidation protection**.

**What happens:**
- The system gradually converts your volatile collateral (ETH) into stable crvUSD as prices drop, and converts crvUSD back into ETH as prices recover
- This protects you from further price drops
- Losses occur while in protection (see [Understanding Losses](#understanding-losses))
- **Restricted**: You cannot add collateral or borrow more while in liquidation protection

The range is determined by your Loan-To-Value Ratio (LTV) and the number of bands you selected when opening your loan. For example, if ETH is trading at \$3,000, your liquidation protection range might be between \$3,200 (liquidation threshold) and \$2,900 (bottom of the range).

The illustration below is a real example where the price of the collateral (ETH) dropped into the liquidation range between \$3,200 and \$2,900 where the collateral protection was active. As can be seen, the loan was not fully liquidated because the health always stayed above zero. Once the health of the position approached closer to 0, the user repaid some debt to increase it again to avoid full liquidation.

:::example
For a more detailed illustration which shows how the collateral of the loan is actually converted, see here: [How the System Works (Technical Details)](#how-the-system-works-technical-details).
:::

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
    This loan continuously entered and exited liquidation protection and stayed in it for quite some time (around 4 hours). The user constantly monitored its health and repaid some debt as soon as health got closer to 0.
  </figcaption>
</figure>

### Stage 2: Full Liquidation

Full liquidation happens when **health reaches 0**, not at a fixed price. At that point, the loan is closed. Health above 0 means the loan is still open, not that it is safe: further conversions, interest, or price movement can still push it to 0.

Full liquidation can still happen during a price recovery if health is already critically low when inside the range.

The illustration below shows how a full liquidation works. The position entered liquidation protection where losses started occurring. Because the health of the loan reached 0 eventually, the position was fully liquidated. The user could have avoided it by repaying some debt to increase the health.

<figure>
  <ThemedVideo
    alt="Liquidation Protection (full liquidation)"
    sources={{
      light: require('@site/static/img/user/llamalend/27_chart.mp4').default,
      dark: require('@site/static/img/user/llamalend/27_chart.mp4').default,
    }}
    style={{ width: '750px', maxWidth: '100%', display: 'block', margin: '0 auto' }}
  />
  <figcaption>
    This liquidation occurred during an extremely volatile market event. BTC price dropped around 15% in an hour. Because Llamalend uses smooth oracles, prices did not drop as sharply compared to the general market. Even though the position ended up being fully liquidated, liquidation protection gave the user around 40 minutes (200 blocks) to repay some debt to increase health again.
  </figcaption>
</figure>

---

## I'm in Liquidation Protection. What Now?

Being in liquidation protection does not mean the loan is already fully liquidated, but it does mean the position is actively incurring conversion risk. For most users, entry should be treated as a signal to close or reset the position. Remaining in the bands is an aggressive strategy that requires continuous health monitoring; reaching 0 triggers full liquidation.

### What You Can Do

**Available Actions:**
- **Repay partial debt**: Increases health but doesn't exit protection
- **Repay full debt**: Closes loan and exits protection

**Repaying 99% of your debt does NOT exit liquidation protection. Only full repayment does.**

**Restricted Actions:**
- **Add/remove collateral**: Not possible in protection
- **Borrow more**: Not possible in protection

### How to Exit

You have two options:
1. **Wait for price recovery**: Price must rise above your protection range
2. **Fully repay debt**: Close the loan and open a new one

Repaying debt improves health but doesn't change the protection range boundaries. The range only adjusts when you're not in protection.

For more details, see the [FAQ](/user/llamalend/faq#how-to-get-out-of-liquidation-protection).

---

## What Happens in Different Scenarios?

### Scenario 1: Price Above Protection Range

ETH at \$3,200, protection range is \$3,000-\$2,500

- **Safe**: No losses in liquidation protection
- **Warning**: Health still decreases if ETH price drops or from interest
- **Full control**: You can add/remove collateral, borrow more

### Scenario 2: Price Inside Protection Range

ETH at \$2,750, protection range is \$3,000-\$2,500

- **Warning**: You're in liquidation protection
- **Warning**: System is converting ETH to crvUSD to protect you (as price drops)
- **Warning**: Losses occur while in protection (see [Understanding Losses](#understanding-losses))
- **Warning**: Health decreases from both price drops AND losses in liquidation protection
- **Recovery**: If price recovers, system automatically converts crvUSD back to ETH, helping restore your position
- **Restricted**: You cannot add/remove collateral or borrow more
- **Available**: You can still repay debt to improve health

**Why losses still occur during recovery:** Until price climbs above the protection range, up-and-down price movements cause repeated conversions, which accumulate losses.

### Scenario 3: Price Below Protection Range

ETH at \$2,400, protection range is \$3,000-\$2,500. This is a special case where your loan was fully protected while moving through the entire liquidation range. At this point, all of your collateral would have been converted to crvUSD.

- **Protected**: No more losses in liquidation protection (if fully converted)
- **Protected**: Protected from further ETH price declines (because your entire collateral is now crvUSD)

Being below the protection range does NOT mean you're "safe". It means your entire position is now in crvUSD.

- **Warning**: Health only decreases from interest
- **Warning**: If price recovers back into range, you re-enter protection
- **Warning**: If price stays far below the range for a long time, interest alone can eventually push health to 0

### Scenario 4: Health Reaches 0

- **Liquidated**: Your loan is fully liquidated
- **Closed**: Loan is closed, collateral used to repay debt
- **Final**: Cannot recover the position

---

## Understanding Losses

While in liquidation protection, every conversion can incur losses. The mechanism avoids liquidation at one specific price and can give you time to react, but it is not guaranteed to produce a better outcome than an immediate liquidation.

**Important: Losses reduce your total collateral value permanently.** If your loan enters liquidation protection with 10 ETH as collateral, stays in protection and takes losses, then exits protection, your total collateral will be less than 10 ETH (10 ETH minus the losses incurred during protection). This reduction in collateral value is permanent and does not recover even if prices fully recover.

**Losses depend on:**
- **Market volatility**: More volatility = more conversions = more losses
- **Time in range**: Longer time = more accumulated losses
- **Number of bands**: More bands typically mean fewer losses
- **Sideways volatility**: Repeated up-and-down price movement inside the range causes multiple conversions and increases losses

:::info
Losses in liquidation protection only occur when you're inside the protection range. Outside the range, no losses in liquidation protection occur, though health still decreases from price drops and interest. However, once losses have occurred, your total collateral value remains reduced even after exiting protection.
:::

For more on losses, see the [FAQ](/user/llamalend/faq#what-are-the-losses-during-liquidation-protection).

---

## How the System Works (Technical Details)

### The Conversion Mechanism

The conversion process is powered by **LLAMMA** (Lending-Liquidating AMM Algorithm). Here's how it works technically:

- Collateral is deposited into **price bands** (small price ranges)
- As price moves through bands, collateral in those bands gets converted
- Each conversion involves a small discount to incentivize arbitrageurs, which creates the losses mentioned earlier

<figure>
  <ThemedVideo
    alt="Liquidation Protection"
    sources={{
      light: require('@site/static/img/user/llamalend/12_chart.mp4').default,
      dark: require('@site/static/img/user/llamalend/12_chart.mp4').default,
    }}
    style={{ width: '750px', maxWidth: '100%', display: 'block', margin: '0 auto' }}
  />
</figure>

See how the collateral composition of bands changes based on the collateral price:

<CollateralConversion />

### Why Losses Occur

Losses occur because the system offers collateral at a small discount to incentivize arbitrageurs to perform the conversions. This discount ensures swaps happen, but means you receive slightly less value than market price. For more details on losses, see [Understanding Losses](#understanding-losses).

---

## Common Misconceptions

- **"Being in liquidation protection means I'm already fully liquidated."** → False. The loan remains open, but conversion losses are already reducing its collateral value and can still lead to full liquidation (see [Understanding Losses](#understanding-losses)).

- **"If price goes up, health always goes up."** → False. Health can decrease even when prices are rising if you're still inside the protection range, because losses from conversions continue.

- **"Repaying part of my debt lets me exit protection."** → False. Only full repayment exits liquidation protection. Repaying 99% of your debt only increases health but doesn't exit protection.

- **"Below the protection range means I'm safe."** → False. While below the range, health only decreases from interest, but if price stays far below for a long time, interest alone can eventually push health to 0.

- **"Losses stop when price goes up."** → False. Losses continue until you exit the protection range completely. Up-and-down price movements inside the range cause repeated conversions and accumulate losses.

---

For answers to common questions, see the [FAQ](/user/llamalend/faq).
