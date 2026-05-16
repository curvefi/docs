---
id: faq
title: FAQ
sidebar_label: FAQ
---

import ThemedImage from '@theme/ThemedImage';
import ThemedVideo from '@site/src/components/ThemedVideo';


## Quick Start: Key Concepts

Before diving into the details, here are the essential concepts you need to understand:

**Liquidation Protection Range**: A price zone where your loan enters protection mode. If your collateral price falls into this range, the system automatically starts protecting your position.

**Health**: The most critical metric - represents how much buffer you have before full liquidation. Health decreases from price drops, conversion losses, and interest. When health reaches 0%, your loan is fully liquidated.

**Bands**: Small price ranges that make up your liquidation protection range. More bands = wider range = lower risk but lower LTV. Fewer bands = narrower range = higher risk but higher LTV.

**Liquidation Protection vs Full Liquidation**: 
- **Liquidation Protection** = Your loan is being protected, you can still repay debt, position can recover
- **Full Liquidation** = Your loan is closed, collateral used to repay debt, position cannot be recovered

**Key Rule**: Monitor your health constantly. Health can decrease even when prices are rising if you're in liquidation protection due to conversion losses.

---

## Glossary

**LTV (Loan-To-Value Ratio)**: The ratio of your debt to your collateral value. Higher LTV = higher risk but more borrowing power.

**Liquidation Protection Range**: The price range where your loan enters protection mode. Defined by a higher and lower price of your collateral asset.

**Bands**: Small price ranges where collateral is grouped. The number of bands determines the width of your liquidation protection range.

**Health**: A percentage representing how close your loan is to full liquidation. Health = 0% means your loan can be fully liquidated.

**Full Liquidation**: When health reaches 0%, your loan is closed and collateral is used to repay debt.

**Mint Markets**: Markets where crvUSD is minted (created) when you borrow. Interest rates depend on crvUSD price, PSR size, and other parameters.

**Lending Markets**: Permissionless markets where you borrow from supplied liquidity. Interest rates depend solely on utilization of supplied assets.

**LLAMMA**: Lending-Liquidating AMM Algorithm - the mechanism that powers automatic collateral conversion.

---

## Liquidation Protection Range & Bands

### What is the Liquidation Protection Range?

A user's **liquidation protection range** is defined by a higher and a lower price of the collateral asset. Their loan enters liquidation protection if the market price of their collateral drops into this zone.

:::example
**Example:** ETH is currently trading at around \$3000. The liquidation protection range is between \$2000 and \$1500. If the price of ETH drops within this range, the loan enters liquidation protection.
:::

### How is the liquidation range defined?

The range's position (at which price it starts) and size (how big it is) are dependent on the following factors:

**Where the Range Sits (Position)** is set by the **Loan-To-Value Ratio** (LTV):

* A **higher LTV** moves the protection range **closer** to the current market price.
* A **lower LTV** keeps the range **further away**, giving users a larger safety margin before protection mode kicks in.

**The Width of the Range (Size)** is set by the number of **bands** users choose when opening a loan:

* **More bands** (e.g., 20-50) = **Wider** protection range = Lower risk.
* **Fewer bands** (e.g., 4-10) = **Narrower** protection range = Higher risk.

### What are Bands?

Bands are small price ranges where all user collateral is grouped together. The number of bands a loan uses can be set when creating a loan. Using bands makes Llamalend more efficient, because it can convert one piece of collateral for all users at a single time, instead of each user requiring their own separate conversion. The full liquidation range is made up by the number of bands used in the loan.

### How do I calculate my LTV?

LTV (Loan-To-Value Ratio) is calculated as:

**LTV = (Debt / Collateral Value) × 100%**

For example, if you have \$10,000 worth of ETH as collateral and borrow \$7,000 of crvUSD, your LTV is 70%.

You can see your current LTV in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets) when viewing your loan position.

### What's the maximum LTV I can use?

The maximum LTV depends on the collateral asset and market parameters:

- **BTC and ETH**: Up to 91% LTV
- **Yield-bearing and low-volatility tokens** (like sDAI or sUSDe): Up to 98% LTV

The exact maximum LTV for each market is determined by the number of bands and band width factor used when the market was created. Fewer bands generally allow for higher LTV, while more bands generally provide greater safety by spreading liquidation over a wider range.

### Can I change the number of bands after opening a loan?

No, the number of bands is set when you create your loan and cannot be changed afterward. If you want to use a different number of bands, you would need to close your current loan and open a new one with your preferred band configuration.

### Can I Move my Liquidation Range?

Under the right conditions, yes. First, the user has full influence on the initial liquidation range when creating the loan ([see above](#how-is-the-liquidation-range-defined)). The liquidation protection range can only be changed if a loan is currently not in liquidation protection. If a loan IS in liquidation protection, the only option is to fully repay the loan and create a new one or wait for prices to recover.

**Collateral Actions:**
- **Adding more collateral**: Pushes the liquidation ranges down (e.g., from $1000-$900 to $800-$700)
- **Removing collateral**: Pushes the liquidation range further up (e.g., from $1000-$900 to $1100-$1000)

**Debt Actions:**
- **Borrowing more**: Pushes the liquidation range further up
- **Repaying some debt**: Pushes the liquidation range down
- **Repay all debt**: Fully closes the loan (no liquidation range anymore)

**Rule of Thumb**: The higher the LTV of the loan gets, the closer the liquidation range gets to the current market price.

---

## Liquidation Protection & Health

### How Does Liquidation Protection work?

Liquidation protection is a mechanism which protects the collateral of your loan. Once a loan enters the [liquidation protection range](#what-is-the-liquidation-protection-range), the loan enters liquidation protection. In this price range, the system automatically converts your volatile collateral asset into stable crvUSD tokens when prices go down. This reduces the collateral exposure of the loan when collateral prices decline and preserves the total value of the collateral (minus some [losses](#what-are-the-losses-during-liquidation-protection)). If the price of the collateral asset goes up again, the system automatically converts back the previously obtained crvUSD back into the original collateral asset to restore the initial collateral composition.

TLDR: The system kind of derisks your collateral position on the way down and restores your exposure on the way up.

:::example
**Example:** Price of ETH is at \$3000 and liquidation protection range is between \$2000 and \$1500. ETH price now drops below \$2000 all the way to \$1750 and therefore enters liquidation protection range. The system now starts converting ETH into crvUSD. As the price moves through different bands, a portion of your collateralized ETH will be converted into crvUSD (the exact percentage depends on how far the price moves through your bands). Your loan is now backed by a mix of ETH and crvUSD which reduces the exposure to the volatile asset. Now, the price of ETH recovers and goes back to \$2000. In that case, the system automatically converts the crvUSD back into ETH. Once you exit liquidation protection once ETH goes above \$2000, your loan will be fully collateralized by ETH again.
:::

### When Does a Loan Enter Liquidation Protection?

A loan enters liquidation protection once the price of the collateral asset falls into the liquidation protection range.

<figure>
<ThemedImage
    alt="Liquidation protection range visualization"
    sources={{
        light: require('@site/static/img/user/llamalend/education/liquidation/liq_range_light.png').default,
        dark: require('@site/static/img/user/llamalend/education/liquidation/liq_range_dark.png').default,
    }}
    style={{ width: '500px', display: 'block', margin: '0 auto' }}
/>
</figure>

### What's the Difference Between Liquidation Protection and Full Liquidation?

**Liquidation Protection** occurs when the collateral price falls into the liquidation protection range. During this phase:
- Your collateral is automatically converted between volatile assets and stable crvUSD to protect your position
- You cannot add/remove collateral or borrow more, but you can repay debt
- Your loan remains active and can recover if prices improve
- Health can still decrease due to losses from conversions and interest

**Full Liquidation** occurs when your loan's health reaches 0%. At this point:
- Your loan is completely closed
- Your collateral is used to repay the debt
- Any remaining collateral (if any) is returned to you
- You cannot recover the position - you would need to open a new loan

The key difference is that liquidation protection is a protective mechanism that gives you time and flexibility, while full liquidation is the final closure of your loan.

### What Can Users Do When Their Loan is in Liquidation Protection?

While a loan is in liquidation protection, the actions users can take are limited. The most important metric to watch is the loan's health. If a loan is NOT in liquidation protection, users have all possibilities and there are no restrictions at all.

**Restricted Actions:**
- **Collateral actions**: Users cannot add or remove any collateral
- **Borrowing**: Users cannot borrow any more funds

**Available Actions:**
- **Debt repayment**: Users can repay some or all of the debt

:::info
Only repaying all of the debt and therefore fully closing the loan will get users out of liquidation protection. Repaying some debt (even if it's 99% of all their debt) will only increase the health of the loan, but will not get the loan out of liquidation protection nor change the liquidation range.
:::

### What happens if I repay partial debt while in liquidation protection?

Repaying partial debt while in liquidation protection will:
- **Increase your health** - This is the main benefit, giving you more buffer before full liquidation
- **NOT get you out of liquidation protection** - Even repaying 99% of your debt won't exit liquidation protection mode
- **NOT change your liquidation range** - The range remains the same until you fully repay or prices recover

The only way to exit liquidation protection is to fully repay all debt and close the loan, or wait for the collateral price to rise above your liquidation protection range.

### Why Are Actions Restricted in Liquidation Protection Mode?

Users are not able to add or remove collateral because the loan is already in liquidation protection and the collateral is currently being protected through Llamalend. The nature of the system does not allow any collateral actions when the position is in liquidation range, as this is a unique situation where the collateral is being actively protected.

### How to get out of liquidation protection

Once in liquidation protection, there are only two ways to get out: 
1. Fully repay your loan and create a new one
2. Wait for the collateral price to rise above your liquidation protection range

**Key Points:**
- Adding collateral is restricted
- Even repaying 99% of the debt will not get the loan out of liquidation protection
- Only full debt repayment and loan closure will exit liquidation protection mode

Reminder: collateral actions are prohibited in liquidation protection so adding more collateral to your loan is not an option.

:::info Recovery and Time Flexibility
**Important Understanding**: If prices recover while users are in liquidation protection, they can theoretically return to their original state (minus some losses due to the liquidation protection process). The system gives users more time to act because there's no instant liquidation, but there's actually no need to act at all.

**Key Point**: Users can theoretically stay in liquidation protection forever as long as they ensure their health stays above 0. The system will continue protecting their position automatically, and if market conditions improve, their position can recover without any manual intervention.
:::

<figure>
  <ThemedVideo
    alt="Liquidation Protection"
    sources={{
      light: require('@site/static/img/user/llamalend/liq-prot-recover-light.mp4').default,
      dark: require('@site/static/img/user/llamalend/liq-prot-recover-dark.mp4').default,
    }}
    style={{ minWidth: '550px', width: '75%', display: 'block', margin: '0 auto' }}
  />
</figure>

:::warning Important Note
When collateral is swapped during liquidation protection, users lose health, regardless of whether prices are increasing or decreasing. So health can go to 0 even if prices are increasing. This is why monitoring health is crucial while in liquidation protection.
:::

### When Am I Liquidated (HEALTH = 0)

Unlike on other protocols, Curve does not have a specific price where a position is liquidated. Instead, a loan is liquidated once the health of the loan reaches 0%. There are different factors which decrease the health of a loan:
- Price going down
- Losses in Liquidation Protection
- Interest accumulation

:::info
To understand Loan Health and Losses in Liquidation Protection please check: [Losses & Loan Health](#losses--loan-health)
:::

To avoid a full liquidation which closes your loan, users are advised to either make sure to not enter liquidation range at all or constantly monitor health while being in liquidation protection and make sure it's not going to 0. More on how to properly use the system [here](#how-can-users-monitor-and-prevent-problems).

### How Is the System Automated?

When talking about "automatically converting between collateral asset and crvUSD", it's actually being done by arbitrageurs. Curve's liquidation mechanism works in a way that a small arbitrage opportunity is created to convert assets accordingly. So, the entire system is relying on arbitrage.

### How Quickly Does the System Convert Collateral?

The speed of collateral conversion depends on several factors:
- **Price movement speed**: Faster price movements may require quicker conversions
- **Number of bands**: More bands spread conversions over a wider range, allowing for more gradual conversions
- **Arbitrage efficiency**: How quickly arbitrageurs take advantage of the opportunities created by the system

The system creates arbitrage opportunities that incentivize conversions, but the actual speed depends on market participants taking these opportunities.

### What Happens If Arbitrageurs Don't Act?

Technically, arbitrageurs might not act if gas costs are very high and they prioritize other arbitrage opportunities first. In this case, nothing would really happen because your collateral is not being converted. Your position would remain in its current state until arbitrageurs take the opportunity or market conditions change. This is a rare scenario, as arbitrage opportunities are typically taken quickly when profitable.

### What happens if the price goes below the liquidation protection range?

If the price goes lower than the Liquidation Protection range with positive health and fully converted collateral, users are completely safe from further price declines. While underneath the range, health will only decline from debt increasing from interest on the loan.

If users get here, it's normally best to repay the loan and reopen it, because there is a very high chance of liquidation from collateral conversion losses if they go back up through the Liquidation Protection range.

<figure>
  <ThemedVideo
    alt="Liquidation Protection"
    sources={{
      light: require('@site/static/img/user/llamalend/liq-prot-under-range-light.mp4').default,
      dark: require('@site/static/img/user/llamalend/liq-prot-under-range-dark.mp4').default,
    }}
    style={{ minWidth: '550px', width: '75%', display: 'block', margin: '0 auto' }}
  />
</figure>

### What happens when a market encounters bad debt?

Bad debt means a market cannot fully recover some loans from available collateral.

In Llamalend, this can happen in extreme conditions if liquidation does not recover enough of the borrowed asset before a position becomes undercollateralized. When that happens, the shortfall remains inside that market.

For users, this usually means:
- Lenders in that market are exposed to the shortfall
- Withdrawals may be limited
- Borrowers may still be able to repay or close positions if the market remains operational

Llamalend markets are isolated, so bad debt in one market does not automatically affect other markets.

---

## Losses & Loan Health

### What is Loan Health and How Does It Decrease?

**Health is the most important metric to monitor** because it determines when a loan will be fully liquidated. Users should always keep track of their loan's health, regardless of market conditions.

**Health decreases due to:**

- **Collateral price drops**: Above the Liquidation Protection range, health will decrease as the range gets closer.
- **Losses in Liquidation Protection**: Selling the collateral asset for crvUSD and vice versa results in losses which decrease the health of the loan.
- **Borrowing more funds**: Taking on additional debt reduces health.
- **Interest accumulation**: Interest is paid on the debt you've taken on. Debt is accrued by constantly increasing your total debt, which can over time decrease your health (albeit very slowly).

For tips on monitoring and preventing health issues, see [How Can Users Monitor and Prevent Problems?](#how-can-users-monitor-and-prevent-problems).

### How is health calculated?

Health is calculated using a formula that takes into account your collateral value, debt amount, and liquidation discount:

**Health = (Estimated Collateral Value × (1 - Liquidation Discount) + Price Above Bands) / Debt - 1**

Where:
- **Estimated Collateral Value**: An estimation of how much crvUSD you would have after converting all collateral through your bands in liquidation protection
- **Liquidation Discount**: A safety margin applied during liquidation calculations
- **Price Above Bands**: The value of collateral above your highest band
- **Debt**: Your current debt amount

Health is displayed as a percentage in the UI. Health > 0% means your loan is safe. Health = 0% means your loan can be fully liquidated.

You can view your current health percentage in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets) when viewing your loan position.

### What's a safe health percentage to maintain?

While there's no universal "safe" health percentage, here are some general guidelines:

- **Above 50%**: Generally considered safe, but still monitor regularly
- **30-50%**: Moderate risk - consider taking action to improve health
- **10-30%**: High risk - strongly recommended to repay debt or add collateral (if not in liquidation protection)
- **Below 10%**: Critical - immediate action required to avoid full liquidation
- **0%**: Full liquidation can occur

**Important**: If you're in liquidation protection, health can decrease even when prices are rising due to conversion losses. Always monitor health closely while in liquidation protection.

### Can I see my current health percentage in the UI?

Yes! You can view your loan position, health percentage, LTV, and liquidation protection range directly in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets). Simply connect your wallet and navigate to your active loan position.

### Band Choice Impact

- **More bands = Bigger Range = Fewer losses**: Spreading collateral across many bands creates a wide protection range. This gives the system more time to gradually convert collateral during a price drop, which typically results in **smaller losses**.
- **Fewer bands = Smaller Range = Higher losses**: Fewer bands concentrates collateral over a very small protection range. This works fine when prices move very slowly. However, a sudden price drop can force the system to sell collateral very quickly, leading to **higher losses** and increasing the risk of full liquidation.

Learn more about bands and how to customize them when creating a position [here](./guides/borrow/custom-bands.md).

:::info Do losses always occur?
No. Losses occur **only** when a position is within the liquidation protection zone. As long as a position remains outside this zone, no losses are incurred, regardless of market conditions.
:::

:::warning Important Note
These losses are not temporary - they are permanent reductions in collateral value that occur during the liquidation protection process. The key is to monitor a position's health and take action before losses accumulate too much.
:::

### What are the Losses During Liquidation Protection?

When a position enters the liquidation protection, losses occur due to the constant change of collateral composition. The system gradually converts volatile collateral into stable crvUSD and vice versa. This results in losses.

The exact amount of losses is hard to predict as it depends on external factors like market volatility and liquidity. However, the most significant factor is one users can control: **the number of bands they select for their loan.**

---

## Loan Management

### How do I close my loan?

To close your loan, you need to fully repay all of your debt. Here's how:

1. Go to the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets)
2. Connect your wallet
3. Navigate to your loan position
4. Click "Repay" and repay the full amount of your debt
5. Once all debt is repaid, your loan will be closed and you'll receive your collateral back

**Note**: If you're in liquidation protection, you can only repay debt - you cannot add collateral. Once you fully repay, the loan closes and you exit liquidation protection.

### What happens if I don't repay my loan?

If you don't repay your loan, interest will continue to accrue on your debt, gradually increasing your total debt amount. This will slowly decrease your health over time.

If your health reaches 0%, your loan will be eligible for full liquidation. At that point, anyone can repay your debt and claim your collateral. Your loan will be closed and you'll lose your collateral (minus any amount returned if there's excess after repaying the debt).

**Important**: Always monitor your loan's health to avoid this scenario. Consider setting up the [Telegram Bot](https://news.curve.fi/llamalend-telegram-bot/) for automated monitoring.

### Can I Have Multiple Loans?

One wallet can only have one loan per market. However, you can open multiple loans across multiple markets. For example, you could have one loan on Ethereum and another on Arbitrum, or one loan for ETH collateral and another for a different collateral asset.

### Are There Any Fees?

No fees at all besides the borrow rate. There are no opening fees, no closing fees, and no minimum loan amounts. You only pay interest on the debt you borrow.

### Can I use the borrowed crvUSD for anything?

Yes! Once you borrow crvUSD, it's yours to use however you want. Common use cases include:

- **Yield farming**: Use borrowed crvUSD to earn yield in other DeFi protocols
- **Leverage trading**: Increase your exposure to assets
- **Working capital**: Access liquidity without selling your collateral
- **Arbitrage opportunities**: Take advantage of price differences across protocols
- **Any other DeFi activity**: The borrowed crvUSD is a standard ERC-20 token you can use anywhere

Remember: You'll need to repay the debt (plus interest) eventually, so make sure you have a plan for repayment.

---

## Markets & Collateral

### What collateral assets are supported?

Llamalend supports various collateral assets across different markets. Markets can be either:

- **Mint Markets**: Where you borrow crvUSD against collateral (like ETH, BTC, etc.)
- **Lending Markets**: Permissionless markets where any asset can be used as collateral or borrowable token (as long as crvUSD is one of them)

To see all available markets and supported collateral assets, visit the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets).

### What's the difference between mint markets and lending markets?

**Mint Markets**:
- crvUSD is **minted** (created) when you borrow
- Interest rates depend on crvUSD price, Peg Stabilization Reserve (PSR) size, and other parameters
- Used for borrowing crvUSD against collateral

**Lending Markets**:
- Assets are **borrowed from supplied liquidity** (not minted)
- Interest rates depend **solely on utilization** of supplied assets
- Permissionless - anyone can create markets for any asset (with crvUSD) if there's a proper oracle
- Can be used for borrowing crvUSD or other assets, or lending assets to earn yield

Both market types use the same liquidation protection mechanism and health system.

---

## Interest & Rates

### How are interest rates determined?

Interest rates work differently depending on the market type:

**Mint Markets**:
- Interest rates depend on multiple factors:
  - crvUSD price (peg stability)
  - Size of the Peg Stabilization Reserve (PSR)
  - Market utilization
  - Other protocol parameters

**Lending Markets**:
- Interest rates depend **solely on utilization** of supplied assets
- Higher utilization = higher interest rates
- Lower utilization = lower interest rates
- This creates a dynamic rate that adjusts based on supply and demand

You can see current interest rates for each market in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets).

### How often is interest charged?

Interest is charged **continuously every second** by gradually increasing your total debt amount. This means your debt grows slightly every second, which slowly decreases your health over time.

The interest rate you see (e.g., 5% APY) is the annualized rate. The actual amount charged per second is calculated from this annual rate.

---

## How To Use The System

### How Can Users Monitor and Prevent Problems?

While Curve's liquidation mechanism offers greater flexibility and safety, it is still crucial to monitor the health of a loan. **Positions can be fully liquidated once health reaches 0.** To avoid this outcome, it is highly recommended to monitor loan status regularly and take action when needed.

You can view your loan position, health, and liquidation protection range directly in the [Llamalend UI](https://www.curve.finance/llamalend/ethereum/markets).

To simplify monitoring, a dedicated [Telegram Bot](https://news.curve.fi/llamalend-telegram-bot/) has been developed to continuously track and monitor loan positions.

**Bot Features:**
- **Multi-Address Monitoring**: Track multiple wallet addresses simultaneously
- **Cross-Chain Coverage**: Monitor positions across Ethereum, Arbitrum, Fraxtal, and Optimism
- **Automated Health Checks**: Perform regular position checks every 5–10 minutes
- **Prompt Alerts**: Receive notifications when a loan enters liquidation protection or becomes eligible for full liquidation
- **On-Demand Information**: Access current on-chain data for monitored positions

Check out this article for more information on how to set up the Telegram Bot: [Llamalend Telegram Bot](https://news.curve.fi/llamalend-telegram-bot/)

---

## Advanced Topics

### What happens underneath the Liquidation Protection Range?

If the price goes lower than the Liquidation Protection range with positive health and fully converted collateral, users are completely safe from further price declines. While underneath the range, health will only decline from debt increasing from interest on the loan.

<figure>
  <ThemedVideo
    alt="Liquidation Protection"
    sources={{
      light: require('@site/static/img/user/llamalend/liq-prot-under-range-light.mp4').default,
      dark: require('@site/static/img/user/llamalend/liq-prot-under-range-dark.mp4').default,
    }}
    style={{ minWidth: '550px', width: '75%', display: 'block', margin: '0 auto' }}
  />
</figure>

If users get here, it's normally best to repay the loan and reopen it, because there is a very high chance of liquidation from collateral conversion losses if they go back up through the Liquidation Protection range.