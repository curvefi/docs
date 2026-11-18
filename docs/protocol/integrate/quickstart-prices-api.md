---
id: quickstart-prices-api
title: "Quickstart: Read Curve Pool and Lending Market Data"
sidebar_label: "Quickstart: Read Data"
description: Fetch a Curve pool's TVL, volume and coins, and list Llamalend markets with their rates, from the Curve Prices API with curl or TypeScript.
---

When you finish, you can read a Curve pool's [TVL](/protocol/glossary#tvl) (total value locked), volume and balances, and list the Llamalend markets on a chain, with curl or TypeScript.

Two requests, with no API key or sign-up.

## Before You Start

You need curl, or Node 18 or later for `fetch`.

It costs nothing. The [Curve Prices API](../api/curve-prices.md) at `prices.curve.finance` needs no API key.

It takes two requests.

Nobody approves it.

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

## Check It Worked

The pool request returns `"name": "pyUSD/crvUSD"` with a `tvl_usd` value, and the market request returns a `data` array with a `count` of markets. These requests were run against the live API on 17 November 2026.

Rates and TVL in the API are computed offchain. Read the contracts directly when a value must be exact at a given block.

## Next Step

The [Curve Prices API Reference](../api/curve-prices.md) lists every endpoint, including history, OHLC prices and trades.
