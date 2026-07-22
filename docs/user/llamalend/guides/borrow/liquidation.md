---
id: liquidation
title: What to Do During Liquidation
sidebar_label: Loan in Liquidation
---

import ThemedImage from '@theme/ThemedImage';

If your loan enters liquidation protection, LLAMMA's gradual conversions can give you more time to act than liquidation at one specific price. The conversions also reduce collateral value and health, even while price is recovering.

For most users, the recommended response is to close or reset the position. Keeping it open is an aggressive strategy for users who understand LLAMMA, monitor health continuously, and accept the risk of hard liquidation.

You have two main options:

- **Close your loan**: Stop further losses by closing the position
- **Keep your loan open**: Accept continuing conversion losses and monitor health closely to avoid reaching 0%

## Close Your Loan

You can close your loan in two ways:

- **Repay your full debt**: [See how to do that here.](./open-and-close.md#fully-repaying)
- **Self-liquidate**: Only available when in liquidation range. Closes your position without liquidation penalty.

## How to Get Out of Liquidation Protection

**Important**: You cannot exit liquidation protection by repaying debt, because the liquidation range does not move when actions happen in liquidation (see the [loan management table](./loan-management.md#loan-management-overview)).

You can only get out of liquidation protection by:

1. **Repay the full loan and create a new one**
2. **Wait for price recovery**: If the collateral price moves above or below the liquidation range, you'll exit liquidation protection

:::info[LlamaLend v2 reset]

LlamaLend v2 adds a repay-and-shrink path that can cut the converted part and reset a position out of liquidation protection. This reset is not available in LlamaLend v1.

:::

:::warning Monitor Your Health
Watch your health closely—even an appreciating collateral price can coincide with falling health while conversions continue. If health reaches 0%, your loan will be fully liquidated.
:::

## Keep Your Loan Open

Keeping a position open in liquidation protection is high risk. Repeated movement through the bands compounds conversion losses, so monitor health continuously and be prepared to repay or close.

Use the [Llamalend Telegram bot](https://news.curve.fi/llamalend-telegram-bot/) to track your loan health and receive alerts.

<figure>
<ThemedImage
    alt="Telegram monitoring bot"
    sources={{
        light: require('@site/static/img/user/llamalend/guides/borrow/open-close/monitor_bot.png').default,
        dark: require('@site/static/img/user/llamalend/guides/borrow/open-close/monitor_bot.png').default,
    }}
    style={{ width: '400px', display: 'block', margin: '0 auto' }}
/>
</figure>
