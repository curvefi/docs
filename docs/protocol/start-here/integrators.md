---
id: integrators
title: Integrating Curve
sidebar_label: Integrators
description: Where aggregators, wallets, frontends and data providers find Curve's contract references, router, registries, APIs and onchain price oracles.
---

Aggregators, wallets, frontends and data providers can route through Curve pools, read Curve prices and call Curve contracts without permission. The technical references are in the developer documentation.

## Where to Start

| You want to | Start here |
| --- | --- |
| Find every Curve contract on a chain | [Address Provider](/developer/integration/address-provider) |
| List pools and their coins | [Meta Registry](/developer/integration/meta-registry) |
| Route trades across pools | [Router NG](/developer/amm/router/curve-router-ng) |
| Integrate a specific pool type | [Integration overview](/developer/integration/overview) |
| Integrate Llamalend vaults and loans | [Llamalend integration guide](/developer/llamalend-v2/integration-guide) |
| Read onchain prices | [Pool oracles](../pool/understanding-stableswap.md#oracles) |
| Look up contract addresses | [Deployments](/developer/deployments) |

## APIs

The [Curve Prices API](../api/curve-prices.md) serves data on pools, lending markets, tokens and chains, including TVL, volume and rates.

The [Curve API](../api/curve-api.md) at `api.curve.finance` serves pool lists and pool data. Use the Prices API for new integrations.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Developer documentation](/developer/documentation-overview)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
