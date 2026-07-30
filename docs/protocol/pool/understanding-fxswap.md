---
title: Understanding FXSwap
sidebar_label: Understanding FXSwap
---

import ThemedImage from '@theme/ThemedImage'
import ThemedVideo from '@site/src/components/ThemedVideo';
import FXSwapAmplificationChart from '@site/src/components/Charts/FXSwapAmplification';
import FXSwapDynamicFeeChart from '@site/src/components/Charts/FXSwapDynamicFee';

FXSwap is a specialized Automated Market Maker (AMM) designed for uncorrelated but low-volatility asset pairs (such as Forex pairs `crvUSD` and `EURC`). It leverages the mathematical efficiency of [Stableswap](understanding-stableswap.md) within the dynamic rebalancing framework of [Cryptoswap](understanding-cryptoswap.md), along with some new innovations.

For contract interfaces and integration guidance, see the [FXSwap developer documentation](/developer/amm/fxswap/overview).

As with all Curve AMM pools, providing liquidity in FXSwap is completely passive. All liquidity is full-range (no active range management required), so anyone can participate easily.

<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
  <iframe
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    src="https://www.youtube.com/embed/9p_xDGC3IKA"
    title="FXSwap Explainer"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>

## Why FXSwap?

**Cryptoswap** pools are designed to be entirely self-sufficient, relying on trading volumes and swap fees to naturally rebalance liquidity around the market price. This model works well for assets where the Cryptoswap pool is the dominant liquidity pool for tokens, and where price discovery happens (e.g., CVX, YB, RSUP, etc).

However, for asset pairs where price discovery is mostly happening elsewhere, (e.g., forex, BTC, ETH, etc) the pool needs to quickly rebalance and stay balanced around the current market price.  This is why **FXSwap** pools were created.

**FXSwap** does this by introducing **Refuels**. This mechanism allows projects to "fast-track" the rebalancing process using external incentives rather than waiting for accumulated trading profits. This ensures the pool remains efficient and balanced around the current price even during periods of low volatility.

:::info
**Note:** As FXSwap architecture is derived from these two predecessors, we recommend reviewing their documentation first. See [Stableswap explainer](understanding-stableswap.md) and [Cryptoswap explainer](understanding-cryptoswap.md).
:::

## How it works

FXSwap was created to provide efficient, fully passive forex-style liquidity on-chain. It achieves this by taking specific components from its predecessors:

- **Stableswap Invariant:** To keep spreads tight, FXSwap utilizes the Stableswap invariant for pricing. This is ideal for assets where liquidity should remain highly concentrated near the current oracle price.
- **Hybrid Rebalancing:** Like Cryptoswap, a pool-configured portion of trading profit supports rebalancing. However, FXSwap introduces a **Refuelling mechanism**. Refuels act as an external buffer to cover rebalancing costs, protecting LP profitability and enabling faster price alignment.
- **Dynamic Fees:** The pool utilizes a dynamic fee model, increasing fees during periods of high volatility and imbalance to protect LPs and capture value.

Let's look at how an FXSwap pool prioritizes these resources while moving liquidity:

<figure style={{ textAlign: 'center' }}>
  <ThemedVideo
    alt="crvUSD-wBTC YB Pool"
    sources={{
      light: '/img/protocol/amm/fxswap-crvusd-wbtc-donations-buckets-light.mp4',
      dark: '/img/protocol/amm/fxswap-crvusd-wbtc-donations-buckets-dark.mp4',
    }}
    style={{ maxWidth: '960px', width: '100%', display: 'block', margin: '0 auto' }}
  />
</figure>

You can see from the video above that if refuels are available, they are used first, however a small amount of profit is always consumed.  

## Recommended Assets

Because FXSwap pools can use refuels to maintain efficiency, they are best suited for **highly liquid assets with lower relative volatility**.

It is generally not recommended to use FXSwap for primary price discovery. For example, YieldBasis utilizes FXSwap for its `BTC/crvUSD` pools (established assets tracking external prices), but uses a standard Cryptoswap pool for `YB/crvUSD` (the primary market for its governance token).

## Refuels

Refuels are assets added to a finite pool buffer specifically to subsidize rebalancing. The contract accounts for them as refuel shares, but does not assign those shares to the provider. As shares unlock, the pool can burn them to help move liquidity toward the external market price.

Protocols can treat refuels as a transparent market-liquidity budget: the balance, unlock schedule, and depletion are visible on-chain. The provider receives no direct claim or guaranteed return. The potential benefit is indirect—a better-centered pool may offer tighter execution, attract more routing, and improve the market for the provider's asset.

**Key Mechanics:**

- **Open Access:** Refuels can be added by anyone.
- **Unlock Period:** Refuel shares are initially locked and unlock linearly over a set duration (default is 7 days, configurable via `donation_duration`) to prevent immediate depletion.
- **Priority Usage:** Unlocked refuel shares are available to be burned first when recentering needs a subsidy. Unlocking makes shares available; only a rebalance burns and depletes them.
- **Finite Buffer:** Refuel shares can decline to zero as the pool uses them. Refuels do not guarantee a fixed price, volume, or LP return.

### How much do Refuels cost?

Three main factors influence the cost of Refuels:

1.  **Volatility:** Higher volatility requires more frequent rebalancing.
2.  **Liquidity Concentration (`A`):** Higher `A` values create deeper liquidity, but increase the cost to move that liquidity when prices change.
3.  **Swap Fees:** Higher volume generates more fees. A pool with more trading profit generally requires fewer external Refuels; the configured allocation must be read from that pool.

**Case Study: YB Pools (BTC/crvUSD)**
*Data analyzed for ~45 days after TVL reached $100M.*

- **TVL:** ~$100M per pool
- **Total Fees Paid:** ~$86k / day
- **Swap Fees used to Rebalance:** ~$43k / day (50% of total fees)
- **Refuels Consumed:** ~$10k / day
- **LP Returns (Net):** ~$43k / day (~12% APY)

In this scenario, refuels represent **3.6% of TVL per year** (approximately 23% of the reported rebalancing costs). This feeds into the FXSwap liquidity cycle:

<figure>
  <ThemedImage
    sources={{
      light: '/img/protocol/amm/fxswap-liquidity-cycle-light.svg',
      dark: '/img/protocol/amm/fxswap-liquidity-cycle-dark.svg',
    }}
    style={{ 
      width: "80%",
      minWidth: "600px",
      display: "block",
      margin: "0 auto",
      height: 'auto',
      border: '1px solid var(--Layer-2-Outline)',
    }}
  />
</figure>

### How Can I Refuel a Pool?

Refuels are added through the standard `add_liquidity` function using the deployed `donation = true` flag. A community UI is available at [crvhub.com/refuel](https://crvhub.com/refuel).

To set up **recurring automated refuels**, use the [**Donation Streamer**](./guides/donation-streamer.md) — deposit tokens once and have them streamed into the pool on a schedule.

### Can I add another Refuel while one is unlocking?

Yes. FXSwap pools track the total refuel amount within an unlock period (default 7 days) and calculate a continuous unlock rate.

**Example** (with 7 day unlock time):

1. **Day 0:** A \$700 refuel is added, with an initial unlock rate of \$100 per day.
2. **Day 3:** \$300 has unlocked and \$400 remains locked. If no recentering has burned shares, the full \$700 is still outstanding.
3. **Day 3:** A new \$1,400 refuel is added.

    - **New Total:** \$2,100 of refuel shares are outstanding.
    - **Preserved Availability:** The \$300 that had already unlocked remains unlocked.
    - **New Schedule:** The remaining \$1,800 unlocks over the next six days, an effective rate of \$300 per day.
4. **Days 4–9:** More shares become available according to the new schedule. Any available shares burned during rebalancing reduce the outstanding refuel balance separately.

### Can I use FXSwap without Refuels, or use Refuels only as a last resort instead of a Cryptoswap pool?

Yes, but be aware that FXSwap pools use the simpler Stableswap invariant (no `gamma`), so there is less fine tuning of the liquidity bonding curve available.

---

## Parameters

### Amplification Factor (`A`)

The amplification factor in FXSwap pools works similarly to the [amplification factor in Stableswap pools](understanding-stableswap.md#amplification-factor-a), with one key distinction: the liquidity centers around a variable called `price_scale` rather than a fixed 1.0 peg.

Let's have a look at what this means in terms of balance in the pools and prices:

<FXSwapAmplificationChart />

### Gamma (`gamma`)

Gamma is **unused** in FXSwap logic. While the parameter exists in the smart contract ABIs, it is retained solely for backward compatibility, allowing integrators to use existing Cryptoswap patterns to interface with FXSwap pools.

---

## Dynamic Fees

Dynamic fees adjust based on the pool's balance. **Fees are lower when a swap helps balance the pool, and higher when a swap unbalances it.** This is controlled by three parameters:

-   **Mid Fee:** The base fee charged when the pool is perfectly balanced (e.g., 50/50 value ratio).
-   **Out Fee:** The maximum fee, charged when the pool is entirely tilted toward one asset.
- **Fee Gamma**: Controls the steepness of the fee increase. A lower gamma results in a sharper rise from Mid Fee to Out Fee as imbalance grows.

Below you can see how these three parameters affect the shape of the dynamic fee that will be charged based on the value ratio of assets in a pool (e.g., \$550k in ETH and \$450k in crvUSD equals a 55/45 value ratio)

<FXSwapDynamicFeeChart />
