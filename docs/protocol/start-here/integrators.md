---
id: integrators
title: Integrating Curve
sidebar_label: Integrators
description: Where aggregators, wallets, frontends and data providers find Curve's contract references, router, registries, APIs and onchain price oracles.
---

Aggregators, wallets, frontends and data providers can route through Curve pools, read Curve prices and integrate Curve contracts without permission. This page points you to the right references. The technical details live in the developer documentation.

## Where to Start

| You want to | Start here |
| --- | --- |
| Find every Curve contract on a chain | [Address Provider](/developer/integration/address-provider) |
| List pools and their coins | [Meta Registry](/developer/integration/meta-registry) |
| Route trades across pools | [Router NG](/developer/amm/router/curve-router-ng) |
| Integrate a specific pool type | [Integration overview](/developer/integration/overview) |
| Integrate Llamalend vaults and loans | [Llamalend integration guide](/developer/llamalend-v2/integration-guide) |
| Read onchain prices | Each pool's built-in EMA price oracle. See [Understanding Stableswap](../pool/understanding-stableswap.md#oracles) |
| Find contract addresses | [Deployments](/developer/deployments) |

## APIs

- **[Curve Prices API](../api/curve-prices.md)** serves pool, lending market, token and chain data, including TVL, volume and rates.
- **[Curve API](../api/curve-api.md)** (`api.curve.finance`) serves pool lists and pool data. Prefer the Prices API for new integrations.

## Next Steps

- Browse the [developer documentation](/developer/documentation-overview).
- Ask integration questions in Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
