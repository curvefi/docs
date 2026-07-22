---
id: oracles-and-parameters
title: LlamaLend v1 Oracles & Parameters (Legacy)
sidebar_label: v1 Oracles & Parameters (Legacy)
---

import SemiLogChart from '@site/src/components/SemiLogChart';

:::warning

This guide documents **LlamaLend v1** oracle and parameter assumptions, including crvUSD-denominated collateral oracles. LlamaLend v2 allows any ERC-20 pair; its contract configuration is documented in the [v2 Configurator reference](/developer/llamalend-v2/configurator).

:::

When deploying a Llamalend lending market, two critical components must be carefully configured: **price oracles** and **market parameters**. These form the foundation for a secure, efficient, and profitable lending market.

For Llamalend's liquidation engine to work optimally, the system requires a smooth price oracle for the collateral asset. **Spot oracles are not recommended** as they can cause significant losses due to price jumps during liquidations. Proper parameter selection is equally important for market security and efficiency.

:::info
**Parameter paralysis and oracle confusion?** Don't let uncertainty hold you back! The [LlamaRisk](https://www.llamarisk.com/) wizards are here to save the day!

Jump into their <a href="https://t.me/llamarisk" target="_blank" rel="noopener noreferrer">Telegram</a> and let them work their risk management magic. From oracles to liquidation thresholds, they've got your back!
:::

## Oracles

LlamaLend v1 markets require smooth (exponential moving average) oracles to price the collateral asset. Spot oracles do not work well as the liquidation mechanism requires smooth price feeds to ensure maximum efficiency. The easiest way to obtain this is through deploying a **liquidity pool** on Curve, which already comes with built-in oracles that can be used for lending markets.

Every Curve pool includes a direct built-in oracle that can be used for lending markets, provided the pool has sufficient TVL. Curve offers pools for all sorts of assets. Learn more here: [Curve Liquidity Pool Oracles](../pool/compare-amm.md#built-in-price-oracles).

:::important
**Critical**: The collateral asset oracle must be priced against **crvUSD**, not other stablecoins. If the Curve pool contains crvUSD (e.g., ETH/crvUSD), the oracle can be used directly. If the pool doesn't contain crvUSD (e.g., ETH/USDC), the oracle must be chained with a USDC/crvUSD oracle to create an ETH/crvUSD price feed.
:::

For assets without suitable Curve pools, you can deploy custom oracles using the [custom oracle deployment guide](https://paragraph.com/@curvefi/llamalend_market_deploy#h-deploying-a-custom-priceoracle-contract). If this sounds complicated, the Curve team is happy to help with deployment - simply reach out on Telegram.

:::tip-green
Llamalend price oracles are particularly complex due to the requirements of the liquidation engine (smooth EMA feeds, crvUSD-denominated pricing, etc.). Swiss Stake, the service provider developing Curve's technology, offers consulting services to guide protocols in the design and integration of these oracles, and thorough audits of client-implemented oracle solutions to ensure correctness and security. Inquiries: [inquiries@curve.finance](mailto:inquiries@curve.finance).
:::

## Parameters

Parameter selection when creating a new lending market is the foundation for an optimally working liquidation engine and secure lending market. The process of finding optimal parameters requires a thorough analysis of historical price data for the collateral asset.

### A, fee, loan- and liquidation discount

The following parameters need to be simulated and set at market deployment:
- **Band width factor (A)**: Determines the range of prices where liquidations can occur
- **Fee**: Fee for exchanging tokens inside the AMM (LLAMMA)
- **Liquidation discount**: Price discount applied during liquidations
- **Loan discount**: Collateral discount for loan-to-value calculations

A dedicated GitHub repository was set up for running these simulations: [LLAMMA Simulator](https://github.com/curvefi/llamma-simulator). An in-depth explainer can be found here: [Parameter Analysis Guide](https://paragraph.com/@curvefi/llamma-simulator).

### Borrow Rate Parameters

Each lending market requires configurable minimum and maximum borrow rate values that adjust dynamically based on market utilization. The interest rate model ensures efficient capital allocation by charging:

- **Minimum rate** when utilization is 0% (no borrowing activity)
- **Maximum rate** when utilization reaches 100% (fully utilized market)
- **Semi-Logarithmic scaling** between these bounds based on current utilization

Rates are bounded by system constants: `MIN_RATE` at 1% and `MAX_RATE` at 1000%.

**Optimal Rate Configuration:**
Most markets target approximately 80% utilization as the optimal point where competitive market rates should be charged. This provides lenders with sufficient buffer to withdraw assets while maintaining healthy utilization levels.

For example, if the current market rate for borrowing crvUSD is 10%, configure minimum and maximum rates so that the 80% utilization point equals 10%. This ensures lenders can exit positions without facing fully utilized markets.

**Rate Calculation:**
Borrow rates are calculated per second and must be converted from annual percentage rates (APR) using this formula:

$$
APR = \frac{rate}{10^{18}} \times (60 \times 60 \times 24 \times 365)
$$

**Example**: To achieve 1% APR, set the rate parameter to `317097919`.


## Name

The market name can be chosen freely. While the UI currently doesn't use the name variable from the contract for display, it's still good practice to give it a clear, understandable name.

**Naming Convention**: Usually follows the pattern of the collateral token name appended by the market direction (long/short).

**Examples**:

- **ETH-long**: ETH as collateral token, crvUSD as borrowable token
- **BTC-short**: crvUSD as collateral token, BTC as borrowable token
