---
title: Understanding Stableswap
sidebar_label: Understanding Stableswap
description: How Curve's Stableswap AMM concentrates liquidity around a peg, its amplification factor and dynamic fees, base pools and metapools, and how rate oracles work for yield-bearing tokens.
---

import ThemedImage from '@theme/ThemedImage'
import ThemedVideo from '@site/src/components/ThemedVideo';
import StableswapAmplificationChart from '@site/src/components/Charts/StableswapAmplification';
import StableswapDynamicFeeChart from '@site/src/components/Charts/StableswapDynamicFee';

Stableswap is Curve's AMM for assets that trade near the same price, such as two USD stablecoins or an [LST](/protocol/glossary#lst) (liquid staking token) and ETH. It concentrates liquidity around the [peg](/protocol/glossary#peg) (the shared target price), so trades near the peg have low [slippage](/protocol/glossary#slippage) (price impact of a trade), and it keeps quoting prices when a pool moves away from the peg.

## Historical Background

Curve’s Stableswap algorithm was invented by Michael Egorov, the founder of Curve, in November 2019.

It was introduced in the paper [“StableSwap: Efficient Mechanism for Stablecoin Liquidity”](../../../static/pdf/whitepapers/whitepaper_stableswap.pdf), which proposed a new type of Automated Market Maker (AMM) optimized for trading assets pegged to the same value, such as stablecoins (e.g., USDC/USDT) or tokenized versions of the same asset (e.g., wBTC/cbBTC).

The algorithm **combines features of both constant sum (fixed swap price) and constant product (`x*y=k`) curves**, allowing for **low-slippage trades near the peg while maintaining deep liquidity and arbitrage incentives when prices drift**.

:::info
In October 2023, the initial Stableswap implementation was reworked into **Stableswap-NG**, introducing crucial features to further enhance efficiency. More: Evolution Stableswap-NG
:::

## How it Works

Stableswap was designed for pools of similarly priced assets, such as stablecoins of the same denomination (e.g., USD), to concentrate liquidity around their pegged price (e.g., USDC/USDT at 1.0). Unlike concentrated liquidity AMMs (CLAMMs) where [liquidity providers](/protocol/glossary#liquidity-provider) (LPs) must actively set price ranges, **Stableswap's liquidity concentration is fully passive**: users deposit tokens, and the protocol automatically concentrates liquidity around the peg through a **single continuous bonding curve**. No range management or active position adjustments are required.

<figure style={{ textAlign: 'center' }}>
  <ThemedImage
    sources={{
      light: '/img/protocol/amm/stableswap-swap-light.svg',
      dark: '/img/protocol/amm/stableswap-swap-dark.svg',
    }}
    style={{ 
      width: "1000px",
      height: 'auto',
      border: '1px solid var(--Layer-2-Outline)',
    }}
  />
</figure>

In this example most of the pool's liquidity (e.g., \$40M out of \$80M total) is concentrated in a very tight range around the \$1.00 price.  Each block represents 1 million tokens (1M) of either crvUSD or USDC.

**Swap Example**:

1. A Stableswap pool has 40M of both crvUSD and USDC, the pool is perfectly balanced, so each asset is $1.
2. A user wants to swap \$20M USDC for crvUSD:

    - The user's 20M USDC is deposited to the pool
    - Approx. 19.98M crvUSD is withdrawn
    - The price increases to 1.002 USDC per crvUSD

3.  The pool is now imbalanced, it would only take a user selling 9M USDC to push the price up another 0.002.  The imbalance also creates an **arbitrage opportunity**: traders are now incentivized to swap crvUSD back into the pool to get USDC at a slight discount, which naturally pushes the pool back toward a 50/50 balance.  *Assuming the USDC can be redeemed for its underlying $1 of value*.

Stableswap pools function effectively even when heavily imbalanced. Depending on the **Amplification Coefficient** (`A`, how tightly liquidity concentrates around the peg), pools can maintain close to 1:1 pricing even under significant imbalance. If the imbalance causes a price deviation from the peg, it creates an arbitrage opportunity. This incentivizes traders to rebalance the pool, with each swap generating fees for LPs.

While the blocks offer a helpful visual, Stableswap's liquidity is more accurately represented by a bonding curve:

<figure style={{ textAlign: 'center' }}>
  <ThemedImage
    sources={{
      light: '/img/protocol/amm/stableswap-liquidity-curve-light.svg',
      dark: '/img/protocol/amm/stableswap-liquidity-curve-dark.svg',
    }}
    style={{ 
      width: "1000px",
      height: 'auto',
      border: '1px solid var(--Layer-2-Outline)',
    }}
  />
</figure>

## Supported Asset Types

Stableswap pools support up to 8 assets in a single pool. These can be a range of different types:

- **Standard**: Normal stable assets. For a USD pool, this includes tokens like crvUSD or USDC. For a BTC pool, this includes WBTC, tBTC, or cbBTC.
- **Rebasing**: Assets where yield is distributed by automatically increasing the token balance in the user's wallet (e.g., stETH).
- **Oracle**: Assets whose underlying value increases relative to the peg, utilizing a [rate oracle](/protocol/glossary#rate-oracle) (a contract that reports the token's redemption rate) to track the exchange rate. This is used for yield-bearing assets that are not ERC-4626 tokens (e.g., wstETH).
- **ERC-4626**: Also known as **Tokenized Vaults**. These tokens increase in value over time and utilize the standard `convertToAssets` function to track value. They function similarly to Oracle assets but require no configuration due to their standardized structure.  *Note: these tokens should be strictly increasing in value over time.*

Curve allows these different asset types to be integrated into a single pool seamlessly. For example, a valid pool could contain:

- WETH (Standard)
- stETH (Rebasing)
- wstETH (Oracle)
- sfrxETH (ERC-4626)

This configuration creates a highly efficient Stableswap pool. The integration process is streamlined and can be performed directly via the official Curve UI.

---

## Parameters

### Amplification Factor (`A`)

The shape of this liquidity bonding curve and the degree to which a pool can become imbalanced before the price significantly deviates from 1:1 is controlled by the **Amplification Factor** (`A`).

<figure style={{ textAlign: 'center' }}>
  <ThemedVideo
    alt="changing A"
    sources={{
      light: '/img/protocol/amm/stableswap-a-buckets-light.mp4',
      dark: '/img/protocol/amm/stableswap-a-buckets-dark.mp4',
    }}
    style={{ maxWidth: '1280px', width: '100%', display: 'block', margin: '0 auto' }}
  />
</figure>

For a high-level understanding of `A`:

- **High `A` values** (e.g., 500–10,000) concentrate liquidity tightly around the peg. This provides deeper liquidity for swaps and allows pools to become very imbalanced before the price deviates significantly. The trade-off is that if an asset moves far from the peg, liquidity and pricing drop off sharply.
- **Lower `A` values** (e.g., 10–100) distribute liquidity more evenly. The price deviates more gradually from the peg as the pool becomes imbalanced, avoiding sharp cliffs.

By definition, the `A` parameter is a multiplier; it amplifies liquidity around the fair price (usually 1:1) compared to the [constant product formula (`x*y=k`)](https://www.reddit.com/r/ethereum/comments/55m04x/lets_run_onchain_decentralized_exchanges_the_way/)

This behavior shows in a theoretical pool containing **crvUSD** (pegged at exactly $1.00) and **newUSD**, where the price of newUSD fluctuates based on the ratio of assets in the pool:

<StableswapAmplificationChart />

### Offpeg Fee Multiplier and Dynamic Fees

The **Offpeg Fee Multiplier increases the pool swapping fee if the pool becomes imbalanced** (e.g., 90% newUSD and 10% crvUSD). The concept is straightforward:

- When pools become imbalanced, liquidity is in high demand, and LPs should be rewarded for remaining in the pool.
- Swaps that increase the imbalance should incur a higher fee than swaps that rebalance the pool.

The Offpeg Fee Multiplier represents the maximum factor by which the base fee can be multiplied. The **dynamic fee is calculated based on the average balance of the pool before and after the swap**; consequently, it is cheaper to perform a swap that balances the pool compared to one that increases imbalance.

The chart below demonstrates how this mechanism functions. Note that base fees and offpeg multipliers are fully customizable; the examples below illustrate a range of potential configurations:

<StableswapDynamicFeeChart />

---

## Base Pools and Metapools {#basepools-and-metapools}
Base pools form a foundational liquidity layer on Curve, composed of widely-used, highly-liquid stablecoins. Anyone can permissionlessly deploy new pools, called metapools, on top of a base pool.

A **Metapool combines an asset with the LP tokens of an existing base pool**. This structure allows metapools to instantly benefit from the liquidity and stability provided by the underlying base pool.

See the image below for a visual representation of the [Curve.fi Strategic USD Reserves base pool](https://curve.finance/dex/ethereum/pools/factory-stable-ng-355/deposit/?ref=news.curve.finance) and the [DOLA Strategic Reserves metapool](https://curve.finance/dex/ethereum/pools/factory-stable-ng-396/deposit/?ref=news.curve.finance):

<figure style={{ textAlign: 'center' }}>
  <ThemedImage
    alt="Base pools and metapools"
    sources={{
      light: '/img/user/dex/dex-basepools-light.svg',
      dark: '/img/user/dex/dex-basepools-dark.svg',
    }}
    style={{
      maxWidth: '600px',
      width: '100%',
      height: 'auto',
      border: '1px solid var(--Layer-2-Outline)',
    }}
  />
  <figcaption></figcaption>
</figure>

In the above structure:

- **Base pool**: When USDC and USDT have equal value, liquidity will naturally balance to 50% USDC and 50% USDT.
- **Metapool**: When DOLA, USDC, and USDT all have equal value, liquidity will naturally balance to 50% DOLA, 25% USDC, and 25% USDT (via base pool LP tokens).

#### Benefits of Base Pools and Metapools

Curve's base pool and metapool architecture offers distinct benefits for LPs, stablecoin issuers, and traders:

- **Deep Liquidity & Low Slippage**: Metapools directly benefit from the liquidity of base pools, resulting in lower slippage even for newly issued or less liquid stablecoins.
- **Risk Isolation**: LPs in base pools aren’t directly exposed to tokens within the metapools, minimizing their risk. Metapools are also isolated from each other; the only shared risk is de-pegging risk of base pool assets, which is why adding new base pools requires a Curve DAO vote.
- **Positive Liquidity Loop (Reflexivity)**: Deposits into metapools also increase liquidity within base pools. This creates a positive feedback loop that enhances overall liquidity and trading efficiency across all pools.
- **Built-in Yield Generation**: base pool LP tokens continuously earn trading fees. Since metapools hold these LP tokens, metapool LPs automatically receive a portion of the base pool’s trading yield, providing immediate organic returns even before trading volumes pick up.
- **Seamless Stablecoin Integration**: Stablecoin issuers can permissionlessly pair their tokens with a base pool, accelerating their token’s liquidity and adoption within the Curve ecosystem.

#### Base Pool List {#basepool-list}
| Network | Base pool |
| :--- | :--- |
| <img src="/img/logos/ethereum.svg" alt="ETH" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [**DAI/USDC/USDT**](https://curve.finance/dex/#/ethereum/pools/3pool/deposit) |
| <img src="/img/logos/ethereum.svg" alt="ETH" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [**PYUSD/USDC**](https://curve.finance/dex/#/ethereum/pools/factory-stable-ng-43/deposit) |
| <img src="/img/logos/ethereum.svg" alt="ETH" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [**FRAX/USDC**](https://curve.finance/dex/#/ethereum/pools/fraxusdc/deposit) |
| <img src="/img/logos/ethereum.svg" alt="ETH" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [**USDC/USDT**](https://curve.finance/dex/#/ethereum/pools/factory-stable-ng-355/deposit) |
| <img src="/img/logos/arbitrum.svg" alt="ARB" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Arbitrum** | [**USDC.e/USD₮**](https://curve.finance/dex/#/arbitrum/pools/2pool/deposit) |
| <img src="/img/logos/arbitrum.svg" alt="ARB" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Arbitrum** | [**FRAX/USDC.e**](https://curve.finance/dex/#/arbitrum/pools/factory-v2-41/deposit) |
| <img src="/img/logos/optimism.svg" alt="OP" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Optimism** | [**DAI/USDC.e/USDT**](https://curve.finance/dex/#/optimism/pools/3pool/deposit) |
| <img src="/img/logos/gnosis.svg" alt="GNO" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Gnosis** | [**WXDAI/USDC/USDT**](https://curve.finance/dex/xdai/pools/3pool/deposit/) |

---

## ERC-4626 Assets & Assets with Rate Oracles {#vault-assets--assets-with-oracles}

These asset types are to allow the assets with underlying accruing interest to be added and work natively in a Stableswap pool.  The ERC-4626 rate or rate oracle lets the pool know the true value of the underlying asset against other assets in the pool, so as it accrues interest, the pool stays balanced around the true value price of each asset.

:::tip-green
Swiss Stake, the service provider developing Curve's technology, offers consulting services to guide issuers in the design and integration of rate oracles for Stableswap liquidity pools. Additionally, Swiss Stake provides thorough audits of client-implemented oracle solutions to ensure correctness and security. Inquiries: [inquiries@curve.finance](mailto:inquiries@curve.finance).
:::

To achieve this, the Stableswap pool needs to shift its center of liquidity (balanced price) over time as the oracle or ERC-4626 asset accrues interest. Here is how Stableswap handles this in practice, in the live [crvUSD/sUSDe pool](https://www.curve.finance/dex/ethereum/pools/factory-stable-ng-169/deposit) over the past year, note how as the fundamental value of sUSDe increases, Stableswap changes the center of liquidity to this new price:

<figure style={{ textAlign: 'center' }}>
  <ThemedVideo
    alt="crvUSD-sUSDe Pool"
    sources={{
      light: '/img/protocol/amm/stableswap-changing-center-light.mp4',
      dark: '/img/protocol/amm/stableswap-changing-center-dark.mp4',
    }}
    style={{ maxWidth: '960px', width: '100%', display: 'block', margin: '0 auto' }}
  />
</figure>

---

## Rate Oracles {#oracles}

### Specification Example

While ERC-4626 tokens need no rate oracle setup, the **Oracle** asset type requires manual setup. This allows any token to be used, provided an accompanying rate oracle is specified that reports the asset’s **value per token** relative to the pool’s base unit (must return **18-decimal precision**).

For example, in a WETH/wstETH pool, the rate oracle reads the `stEthPerToken()` function. This tells the pool that **1 wstETH represents a fixed amount of underlying ETH**, ensuring liquidity is centered around the correct value (for example, ~1.12 ETH) rather than 1.0.

**Configuration Example (wstETH):**

* **Token:** [0x7f39…](https://etherscan.io/token/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0) (wstETH)
* **Oracle:** [0x7f39…](https://etherscan.io/token/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0) (same contract)
* **Function:** `stEthPerToken()`

---

### Best Practices for Rate Oracles {#best-practices-for-oracles}

When integrating a rate oracle, the safety of the pool depends entirely on the oracle’s resistance to manipulation and the behavior of its updates.


**Best Practices:**

:::tip-green

* **Prefer value-accruing assets**: Assets whose value per token increases slowly and predictably (such as most ERC-4626 tokens or liquid staking derivatives, e.g., wstETH, scrvUSD) are best suited for oraclized Stableswap pools.
* **Use rate smoothing or limits**: If the underlying asset value can change, the oracle should apply smoothing or enforce a maximum change per update so that large jumps are spread over time.  See [The Sandwich Rule](#1-the-oracle-sandwich-2-fee-rule).
* **Ensure consistent units**: Oracle outputs must be normalized to the same base unit as the rest of the pool (for example, ETH or USD) and returned with exactly 18 decimals.

:::

**Dangers:**

:::danger

* **Never Use Spot Prices:** Do not use the spot price from any DeFi pool, these are highly manipulatable.  TWAPs/MAs of the spot price can be OK.
* **Never use withdrawal simulations**: Functions such as `calc_withdraw_one_coin()` or similar balance-based simulations are manipulable and must never be used as oracle inputs.
* **Never Use Spot Balances:** Do not rely on spot token balances to calculate value.
* **Avoid low-liquidity sources**: Do not derive a rate oracle from a price source with less value than the Curve pool it secures.
:::

---

## Rate Oracle Risks & Limitations {#oracle-risks--limitations}

Since Stableswap centers liquidity around a specific value `p`, any update to that value directly shifts the pool’s pricing. If oracle updates are too large or too fast, LPs will incur guaranteed losses.

### 1. The Oracle Sandwich (2× Fee Rule)

The most critical risk in Stableswap-NG rate oracles is the "Oracle Sandwich." When an oracle updates the price `p` onchain, the pool's internal exchange rate shifts instantly. 

If the price shift is larger than the cost of swapping (fees), an attacker can guarantee a profit and cause a loss for LPs by: 

1. **Front-running:** Buying the asset *before* the oracle update.
2. **Oracle Update:** The oracle transaction executes, shifting the price up. 
3. **Back-running:** Selling the asset *after* the update at the new higher price. 

To prevent this, you must adhere to the **Safe Limit Rule**: 

$$
\Delta P_{oracle} \le 2 \times Fee_{pool}
$$ 

**The oracle price used by the pool should never change by more than 2x the pool fee in a single block.** For example, if your pool's base fee is 0.04%, the oracle should not shift by more than 0.08% per block. If the price moves 5%, your oracle contract should "smooth" this movement over many blocks.

### 2. Dynamic Fees Do Not Protect Against Oracle Attacks

Stableswap-NG includes dynamic fees that increase when token balances become imbalanced. These fees are **not designed to protect against oracle-driven price shifts**.

Oracle updates change the **value** of balances, not the **token amounts**. As a result, the pool may appear perfectly balanced to the fee logic while still being exploitable.

### 3. Unsuitability for Volatile Assets

Stableswap-NG is optimized for assets whose relative value changes slowly. It is not recommended for volatile asset pairs.

Frequent oracle updates force the pool to repeatedly re-center its liquidity, which mathematically causes LPs to sell the appreciating asset at a discount. Over time, this leads to persistent LP losses unless offset by higher fee generation or incentives.

For volatile pairs, prefer **[Cryptoswap](understanding-cryptoswap.md)** or **[FXSwap](understanding-fxswap.md)** pools, which are designed specifically for such use cases.

:::info
Read more about best oracle practices and risks here: [MixBytes: Safe Stableswap-NG Deployment: How to Avoid Risks from Volatile Oracles](https://mixbytes.io/blog/safe-stableswap-ng-deployment-how-to-avoid-risks-from-volatile-oracles)
:::

:::tip-green
Swiss Stake, the service provider developing Curve's technology, offers consulting services to guide issuers in the design and integration of rate oracles for Stableswap liquidity pools. Additionally, Swiss Stake provides thorough audits of client-implemented oracle solutions to ensure correctness and security. Inquiries: [inquiries@curve.finance](mailto:inquiries@curve.finance).
:::