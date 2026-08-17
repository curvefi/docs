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

Review the [FXSwap Pool](./pools/fxswap.md#deployed-version-and-source) for the exact source boundary and [Contract Deployments](../../deployments.md) for addresses.

:::

:::info[Names used in this documentation]

**FXSwap** is the product and pool family. A **refuel** is liquidity added to the pool's finite rebalancing buffer. Refuel shares unlock over time and are burned as the pool uses them to recenter liquidity. The deployed Vyper interface predates this product name and uses `donation_*`, the `Donation` event, and a `donation` flag. Use **refuel** in product-facing language and the deployed names only when referring to code.

:::

## Where FXSwap fits

| Market | Prefer | Why |
| --- | --- | --- |
| Assets expected to stay near a fixed ratio | [Stableswap-NG](../stableswap-ng/overview.md) | Concentration around a fixed or rate-provider-adjusted peg |
| Two volatile assets where the Curve pool supports primary price discovery | [Twocrypto-NG](../twocrypto-ng/overview.md) | CryptoSwap invariant and self-funded recentering |
| Two externally priced assets that need passive concentrated liquidity | **FXSwap** | Variable-price StableSwap concentration and a configurable recentering budget |

FXSwap is not a general replacement for CryptoSwap. A pair is a poor fit when it lacks a reliable external reference market, arbitrage cannot keep the pool connected to that market, or no sustainable budget exists for the desired concentration and recentering frequency.

## How the mechanism fits together

Swaps use a StableSwap invariant centered on `price_scale`. The pool records recent prices in an exponential moving-average oracle. When the oracle moves far enough from `price_scale`, a state-changing pool operation can recenter liquidity toward it.

Recentering has a cost. FXSwap first burns refuel shares that have unlocked and passed the protection rules. If those shares are insufficient, the normal profit buffer provides the remainder. Regular LP balances are not burned.

`gamma()` remains in the deployed ABI for interface compatibility, but the FXSwap invariant does not use it. Read [Mechanism and Parameter Design](./pools/mechanism.md) for the interactions between concentration, fees, oracle smoothing, refuel budgets, and external market depth.

## Find what you need

FXSwap documentation covers the work of market operators and capital managers, trade-execution integrators, protocol builders, and researchers or infrastructure providers. The pages are organized by task so teams with overlapping responsibilities share the same source of truth.

| If you need to… | Start with |
| --- | --- |
| Quote or execute swaps | [Integrating Swaps](./guides/integration.md) |
| Search for arbitrage opportunities | [Searcher and arbitrage considerations](./guides/integration.md#searcher-and-arbitrage-considerations) |
| Build a vault, strategy, or protocol | [Building on FXSwap](./guides/building.md) |
| Understand recentering and parameters | [Mechanism & Parameters](./pools/mechanism.md) |
| Interpret pool prices and oracle state | [Oracles](./pools/oracles.md) |
| Fund the recentering buffer | [Refuels](./pools/refuels.md) |
| Schedule recurring refuels | [Automation](./automation/overview.md) |
| Inspect the deployed interface | [FXSwap Pool](./pools/fxswap.md) |

## FXSwap infrastructure

<DocCardGrid>
  <DocCard title="FXSwap Pool" icon="vyper" link="./pools/fxswap" linkText="FXSwap Pool">

The two-coin AMM, LP token, oracle, fee logic, recentering state, and refuel accounting are exposed through one pool contract.

  </DocCard>
  <DocCard title="Factory & Discovery" icon="vyper" link="#factory-and-pool-discovery" linkText="Identify FXSwap Pools">

FXSwap pools were deployed through shared two-coin factory infrastructure. Integrators must identify and allowlist the deployed pool version explicitly.

  </DocCard>
  <DocCard title="Price Oracles" link="./pools/oracles" linkText="FXSwap Oracles">

The pool's observed price, exponential moving average, and moving liquidity center.

  </DocCard>
  <DocCard title="Views Contract" icon="vyper" link="./utility-contracts/views" linkText="TwocryptoView.vy">

Quote swaps and liquidity operations, estimate input requirements, and inspect fee components.

  </DocCard>
  <DocCard title="Math Contract" icon="vyper" link="./utility-contracts/math" linkText="StableswapMath.vy">

The StableSwap-style invariant and EMA math used by the deployed FXSwap pool.

  </DocCard>
  <DocCard title="Refuel Automation" link="./automation/overview" linkText="Automation Overview">

Permissionless automation contracts can schedule recurring refuels and reward executors that submit due periods.

  </DocCard>
</DocCardGrid>

## Factory and pool discovery

The documented Ethereum pools were deployed through factory [`0x98EE…AF7F`](https://etherscan.io/address/0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F). The pool exposes this address through `factory()`.

The shared factory can enumerate pools and coin pairs, but its current implementation slots do not prove which historical implementation deployed a pool. A production integration should:

1. discover candidate addresses from Curve's deployment references, API, or registry;
2. verify `factory()`, `version()`, `coins(0)`, and `coins(1)`;
3. allowlist the exact pool runtime code or a verified implementation version; and
4. read `VIEW()` and `MATH()` from that pool.

The factory's `find_pool_for_coins` result is not a best-route guarantee, and sharing a factory does not make a pool FXSwap. The [Twocrypto-NG factory reference](../factory/twocrypto-ng/overview.md) is optional reading for the shared factory's complete administrative and deployment API; nothing in the FXSwap integration path requires it.

## Representative deployed pools

| Pool | Address | Coins |
| --- | --- | --- |
| YieldBasis WBTC | [`0xD9FF…8373`](https://etherscan.io/address/0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373#code) | crvUSD / WBTC |
| YieldBasis cbBTC | [`0x83f2…Eb32`](https://etherscan.io/address/0x83f24023d15d835a213df24fd309c47dAb5BEb32#code) | crvUSD / cbBTC |
| YieldBasis tBTC | [`0xf1F4…6127`](https://etherscan.io/address/0xf1F435B05D255a5dBdE37333C0f61DA6F69c6127#code) | crvUSD / tBTC |
| ZCHF | [`0x027B…2ca9`](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9#code) | crvUSD / ZCHF |

Pool parameters are mutable. Read the target pool rather than copying values from an example.

:::warning[Deployed and future interfaces]

The deployed `v2.1.0d` pools use `set_donation_duration` and `set_donation_protection_params`. Later development designs add policy, allowlist, and `set_donation_parameters` interfaces that are not callable on the pools documented here. Treat a future version as a separate implementation until its deployed bytecode and ABI are verified.

:::

## Evidence and further reading

- [FXSwap](https://news.curve.finance/fxswap/) summarizes a dated execution-quality study and explains the passive-liquidity design.
- [FXSwap Simulations: Behind the Scenes](https://news.curve.finance/fxswap-simulations/) explains the historical backtesting and parameter-search workflow, including its limitations.
- [Understanding FXSwap](/protocol/pool/understanding-fxswap) provides a protocol-level explanation and interactive parameter charts.
