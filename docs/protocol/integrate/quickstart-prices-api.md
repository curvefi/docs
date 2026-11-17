---
id: quickstart-prices-api
title: "Quickstart: Read Curve Pool and Lending Market Data"
sidebar_label: "Quickstart: Read Data"
description: Fetch a Curve pool's TVL, volume and coins, and list Llamalend markets with their rates, from the Curve Prices API with curl or TypeScript.
---

The [Curve Prices API](../api/curve-prices.md) at `prices.curve.finance` needs no API key. These requests return a pool's current state and the Llamalend markets on a chain.

## Read a Pool

```bash
curl -s https://prices.curve.finance/v1/pools/ethereum/0x625E92624Bc2D88619ACCc1788365A69767f6200
```

The response includes `name`, `tvl_usd`, `trading_volume_24h`, `coins` and per-coin `balances`. Replace the chain name and pool address for any other pool.

## List Llamalend Markets

```bash
curl -s "https://prices.curve.finance/v1/lending/markets/ethereum?page=1&per_page=100"
```

Each market includes its `controller` and `vault` addresses, `borrow_apr`, `lend_apr`, `total_assets`, `total_debt` and the collateral and borrowed tokens. The `version` field is `2` for Llamalend v2 markets.

## Read Both in TypeScript

```ts
const base = 'https://prices.curve.finance/v1'

const pool = await fetch(`${base}/pools/ethereum/0x625E92624Bc2D88619ACCc1788365A69767f6200`).then((r) => r.json())
console.log(pool.name, pool.tvl_usd)

const { data: markets } = await fetch(`${base}/lending/markets/ethereum?page=1&per_page=100`).then((r) => r.json())
for (const m of markets.filter((m: { version: number }) => m.version === 2)) {
  console.log(m.name, m.controller, m.borrow_apr)
}
```

These requests were run against the live API on 17 November 2026. Rates and TVL in the API are computed offchain. Read the contracts directly when a value must be exact at a given block.

## Related

- [Curve Prices API Reference](../api/curve-prices.md)
- [Integrate With Curve](./overview.md)
