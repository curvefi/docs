---
title: FXSwap
sidebar_label: Overview
---

import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# FXSwap

FXSwap is Curve's two-asset AMM for markets whose relative price changes, but whose primary price discovery happens elsewhere: foreign-exchange pairs, liquid wrappers of the same macro asset, and other highly liquid, comparatively low-volatility pairs.

It combines:

- **StableSwap-style concentration** around a variable `price_scale`;
- an **exponential moving-average oracle** that guides gradual recentering;
- **refuels**, external liquidity buffers that pay part of the recentering cost and are depleted as the pool uses them;
- passive, full-range LP positions and the familiar Curve swap interface.

The result is a pool that route aggregators can treat much like a two-coin Curve pool while protocols can budget refuels as a transparent market-liquidity cost instead of assigning capital to an active market maker. Deployed examples include the YieldBasis WBTC, cbBTC, and tBTC pools listed below.

:::info[Names used in this documentation]

**FXSwap** is the product and pool family. A **refuel** is liquidity added to the pool's finite rebalancing buffer. Refuel shares unlock over time and are burned as the pool uses them to recenter liquidity. The deployed Vyper interface predates this product name and uses `donation_*`, the `Donation` event, and a `donation` flag. Use **refuel** in product-facing language and the deployed names only when referring to code.

:::

## Choose the right Curve AMM

| Market | Prefer | Why |
| --- | --- | --- |
| Assets expected to stay near a fixed ratio | [Stableswap-NG](../stableswap-ng/overview.md) | Concentration around a fixed or rate-provider-adjusted peg |
| Two volatile assets where the pool helps discover price | [Twocrypto-NG](../twocrypto-ng/overview.md) | CryptoSwap invariant and self-funded recentering |
| Two externally priced assets with moderate relative moves | **FXSwap** | Variable-price StableSwap concentration plus subsidized recentering |
| Three volatile assets | [Tricrypto-NG](../tricrypto-ng/overview.md) | Three-coin CryptoSwap |

FXSwap is not a general replacement for CryptoSwap. A highly volatile or thinly traded asset that depends on the pool for primary price discovery is usually a poor fit.

## How the mechanism fits together

Swaps use a StableSwap invariant centered on `price_scale`. The pool records recent prices in an EMA oracle. When the oracle moves far enough from `price_scale`, a state-changing pool operation can recenter liquidity toward it.

Recentering has a cost. FXSwap first burns refuel shares that have unlocked and passed the protection rules. If those shares are insufficient, the normal profit buffer provides the remainder. Regular LP balances are not burned.

`gamma()` remains in the deployed ABI for Twocrypto compatibility, but the FXSwap invariant does not use it. Do not infer FXSwap behavior from the ordinary Twocrypto implementation solely because both share a factory and much of their interface.

## Start by role

<DocCardGrid>
  <DocCard title="Route aggregators" link="./integration" linkText="Integrate swaps">

Discover pools, verify the FXSwap interface, quote exact-input and exact-output routes, execute safely, and index swap events.

  </DocCard>
  <DocCard title="Protocol teams" link="./refuels" linkText="Understand refuels">

Decide whether FXSwap suits a market, inspect refuel state, fund a pool directly, or automate recurring refuels.

  </DocCard>
  <DocCard title="Contract researchers" link="./reference" linkText="Read the interface">

Review the complete deployed `v2.1.0d` public surface, units, guards, events, and the boundary with newer development versions.

  </DocCard>
</DocCardGrid>

## Deployed version and source of truth

The callable Ethereum pools reviewed for this documentation report `version() == "v2.1.0d"`. Representative pools include:

| Pool | Address | Coins |
| --- | --- | --- |
| YieldBasis WBTC | [`0xD9FF…8373`](https://etherscan.io/address/0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373#code) | crvUSD / WBTC |
| YieldBasis cbBTC | [`0x83f2…Eb32`](https://etherscan.io/address/0x83f24023d15d835a213df24fd309c47dAb5BEb32#code) | crvUSD / cbBTC |
| YieldBasis tBTC | [`0xf1F4…6127`](https://etherscan.io/address/0xf1F435B05D255a5dBdE37333C0f61DA6F69c6127#code) | crvUSD / tBTC |
| ZCHF | [`0x027B…2ca9`](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9#code) | crvUSD / ZCHF |

The first pool's verified similar-match source has SHA-256 `5b4c3e0cf8a23c0e16d5d3c4d0a2d06ebd39220fa71c6300a72dec5159b3dfad` and was compiled with Vyper `0.4.3`. It is closest to [`curvefi/twocrypto-ng@387fbe5`](https://github.com/curvefi/twocrypto-ng/commit/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d), with three deployment-specific constructor defaults: the Views address, Math address, and initial `admin_fee`.

The live WBTC pool currently points to Views [`0x3504…D31f`](https://etherscan.io/address/0x35048188c02cbc9239e1e5ecb3761eF9dfDcD31f), Math [`0x7983…2e51`](https://etherscan.io/address/0x79839c2D74531A8222C0F555865aAc1834e82e51), and the Ethereum Twocrypto factory [`0x98EE…AF7F`](https://etherscan.io/address/0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F). Read `VIEW()`, `MATH()`, and `factory()` from the pool because the admin can update periphery addresses and other implementations may differ.

:::warning[Development interfaces are not deployed interfaces]

Branches in the source repository contain a later v3 design with `set_donation_parameters`, policy/allowlist controls, and `reserved_profit_fraction`. Those methods are **not callable on the reviewed `v2.1.0d` pools**. This section documents deployed behavior; future implementations must be identified and documented separately.

:::

For addresses by chain, see [Contract Deployments](../../deployments.md). Pool parameters are mutable, so integrations must read the target pool rather than copying example values.
