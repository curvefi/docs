---
title: FXSwap
sidebar_label: Overview
---

import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# FXSwap

FXSwap is Curve's two-asset automated market maker (AMM) for markets whose primary price discovery happens elsewhere. It is designed to keep passive liquidity concentrated around a moving external market price, from fiat FX pairs to markets such as BTC/USD.

It combines:

- **StableSwap-style concentration** around a variable `price_scale`;
- an **exponential moving-average oracle** that guides gradual recentering;
- **refuels**, finite external liquidity buffers that help pay for recentering and are depleted as the pool uses them;
- passive, full-range LP positions and the familiar Curve swap interface.

The distinguishing question is not volatility alone. FXSwap fits a market when the paired assets have reliable external price discovery, arbitrage can connect the pool to that market, and the pool can sustain the cost of moving concentrated liquidity as prices change.

:::deploy[Contract Source & Deployment]

This section documents callable Ethereum pools reporting `version() == "v2.1.0d"`. The verified pool source was compiled with Vyper `0.4.3` and is closest to [`curvefi/twocrypto-ng@387fbe5`](https://github.com/curvefi/twocrypto-ng/commit/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d).

Review the [deployed pool reference](./reference.md#deployed-version-and-source) for the exact source boundary and [Contract Deployments](../../deployments.md) for addresses.

:::

:::info[Names used in this documentation]

**FXSwap** is the product and pool family. A **refuel** is liquidity added to the pool's finite rebalancing buffer. Refuel shares unlock over time and are burned as the pool uses them to recenter liquidity. The deployed Vyper interface predates this product name and uses `donation_*`, the `Donation` event, and a `donation` flag. Use **refuel** in product-facing language and the deployed names only when referring to code.

:::

## Choose the right Curve AMM

| Market | Prefer | Why |
| --- | --- | --- |
| Assets expected to stay near a fixed ratio | [Stableswap-NG](../stableswap-ng/overview.md) | Concentration around a fixed or rate-provider-adjusted peg |
| Two volatile assets where the Curve pool supports primary price discovery | [Twocrypto-NG](../twocrypto-ng/overview.md) | CryptoSwap invariant and self-funded recentering |
| Two externally priced assets that need passive concentrated liquidity | **FXSwap** | Variable-price StableSwap concentration and a configurable recentering budget |
| Three volatile assets | [Tricrypto-NG](../tricrypto-ng/overview.md) | Three-coin CryptoSwap |

FXSwap is not a general replacement for CryptoSwap. A pair is a poor fit when it lacks a reliable external reference market, arbitrage cannot keep the pool connected to that market, or no sustainable budget exists for the desired concentration and recentering frequency.

## How the mechanism fits together

Swaps use a StableSwap invariant centered on `price_scale`. The pool records recent prices in an exponential moving-average oracle. When the oracle moves far enough from `price_scale`, a state-changing pool operation can recenter liquidity toward it.

Recentering has a cost. FXSwap first burns refuel shares that have unlocked and passed the protection rules. If those shares are insufficient, the normal profit buffer provides the remainder. Regular LP balances are not burned.

`gamma()` remains in the deployed ABI for Twocrypto compatibility, but the FXSwap invariant does not use it. Read [Mechanism and Parameter Design](./mechanism.md) for the interactions between concentration, fees, oracle smoothing, refuel budgets, and external market depth.

## Start by role

<DocCardGrid>
  <DocCard title="Route aggregators" link="./integration" linkText="Integrate swaps">

Discover pools, verify the FXSwap interface, quote exact-input and exact-output routes, execute safely, and index swap events.

  </DocCard>
  <DocCard title="Protocol teams" link="./mechanism" linkText="Design a market">

Decide whether FXSwap suits a pair, evaluate parameter interactions, budget refuels, and plan monitoring.

  </DocCard>
  <DocCard title="Contract researchers" link="./reference" linkText="Read the interface">

Review the complete deployed `v2.1.0d` public surface, units, guards, events, and the boundary with newer development versions.

  </DocCard>
</DocCardGrid>

## FXSwap infrastructure

<DocCardGrid>
  <DocCard title="Pool Contract" icon="vyper" link="./reference" linkText="FXSwap Pool Reference">

The two-coin AMM, LP token, oracle, fee logic, recentering state, and refuel accounting are exposed through one pool contract.

  </DocCard>
  <DocCard title="Twocrypto Factory" icon="vyper" link="../factory/twocrypto-ng/overview" linkText="Factory Reference">

FXSwap pools use the Twocrypto factory infrastructure. Integrators must identify the deployed pool version explicitly because the factory does not reliably map historical pools to implementations.

  </DocCard>
  <DocCard title="Views and Math" link="../twocrypto-ng/utility-contracts/views" linkText="Shared Periphery">

FXSwap retains compatible periphery interfaces. Read `VIEW()` and `MATH()` from the target pool because these addresses can change.

  </DocCard>
  <DocCard title="Refuels" link="./refuels" linkText="Refuel Lifecycle">

Refuels supply a finite, transparent buffer that unlocks over time and can be burned when the pool recenters.

  </DocCard>
  <DocCard title="Automation" link="./donation-streamer" linkText="DonationStreamer">

Permissionless automation contracts can schedule recurring refuels and reward executors that submit due periods.

  </DocCard>
</DocCardGrid>

## Representative deployed pools

| Pool | Address | Coins |
| --- | --- | --- |
| YieldBasis WBTC | [`0xD9FF…8373`](https://etherscan.io/address/0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373#code) | crvUSD / WBTC |
| YieldBasis cbBTC | [`0x83f2…Eb32`](https://etherscan.io/address/0x83f24023d15d835a213df24fd309c47dAb5BEb32#code) | crvUSD / cbBTC |
| YieldBasis tBTC | [`0xf1F4…6127`](https://etherscan.io/address/0xf1F435B05D255a5dBdE37333C0f61DA6F69c6127#code) | crvUSD / tBTC |
| ZCHF | [`0x027B…2ca9`](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9#code) | crvUSD / ZCHF |

Pool parameters are mutable. Read the target pool rather than copying values from an example.

## Evidence and further reading

- [FXSwap](https://news.curve.finance/fxswap/) summarizes a dated execution-quality study and explains the passive-liquidity design.
- [FXSwap Simulations: Behind the Scenes](https://news.curve.finance/fxswap-simulations/) explains the historical backtesting and parameter-search workflow, including its limitations.
- [Understanding FXSwap](/protocol/pool/understanding-fxswap) provides a protocol-level explanation and interactive parameter charts.
