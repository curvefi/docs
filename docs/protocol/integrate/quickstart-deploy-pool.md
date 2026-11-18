---
id: quickstart-deploy-pool
title: "Quickstart: Deploy a Stableswap Pool Onchain"
sidebar_label: "Quickstart: Deploy a Pool"
description: Deploy a Curve Stableswap-NG plain pool and its gauge from code with viem, using the factory's deploy_plain_pool and deploy_gauge functions on Ethereum.
---

When you finish, a Stableswap-NG pool and its gauge exist onchain, deployed from your script or multisig.

Two transactions: one for the pool and one for the gauge.

## Before You Start

You need viem, an account that can sign on Ethereum, and the addresses of the tokens for the pool. The Curve app's pool creation wizard calls the same factory function; use code when you deploy from a script or a multisig.

It costs gas. Curve charges no fee to deploy a pool.

It takes two transactions.

Nobody approves it. The full function reference is in the [Stableswap-NG factory deployer API](/developer/amm/factory/stableswap-ng/deployer-api#deploy_plain_pool).

## Deploy the Pool

The Stableswap-NG factory on Ethereum is [`0x6A8c…21bf`](https://etherscan.io/address/0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf). Fees and the off-peg fee multiplier use `1e10` precision, so `1000000` is a 0.01% fee.

```ts
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'

const FACTORY = '0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf'
const abi = parseAbi([
  'function deploy_plain_pool(string _name, string _symbol, address[] _coins, uint256 _A, uint256 _fee, uint256 _offpeg_fee_multiplier, uint256 _ma_exp_time, uint256 _implementation_idx, uint8[] _asset_types, bytes4[] _method_ids, address[] _oracles) returns (address)',
  'function deploy_gauge(address _pool) returns (address)',
])

const publicClient = createPublicClient({ chain: mainnet, transport: http() })
const walletClient = createWalletClient({ chain: mainnet, transport: http(), account })

const { request, result: pool } = await publicClient.simulateContract({
  account,
  address: FACTORY,
  abi,
  functionName: 'deploy_plain_pool',
  args: [
    'TOKEN/USDC',                  // name, up to 32 characters
    'tokenusdc',                   // symbol, up to 10 characters
    [TOKEN, USDC],                 // 2 to 8 coins, up to 18 decimals each
    1000n,                         // A
    1000000n,                      // fee: 0.01%
    100000000000n,                 // off-peg fee multiplier: 10
    866n,                          // EMA time: 600 s half-life / ln 2
    0n,                            // implementation index
    [0, 0],                        // asset types: 0 standard, 1 oracle, 2 rebasing, 3 ERC-4626
    ['0x00000000', '0x00000000'],  // rate oracle method IDs, zero for standard tokens
    ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'], // rate oracles
  ],
})
await walletClient.writeContract(request)
```

The values above match the Curve app's fiat-redeemable stablecoin preset. See [Pool Parameter Presets](../pool/presets.md) for other asset classes.

## Deploy the Gauge

```ts
const { request: gaugeRequest } = await publicClient.simulateContract({
  account, address: FACTORY, abi, functionName: 'deploy_gauge', args: [pool],
})
await walletClient.writeContract(gaugeRequest)
```

The account that deploys the gauge becomes its manager. See [Adding Direct Gauge Rewards](../gauge/guides/adding-direct-gauge-rewards.md).

## Check It Worked

The pool address returned by the simulation is the address of your new pool. Open it at `https://www.curve.finance/dex/ethereum/pools/<pool address>` and seed it in the **Seed pool** tab.

The `deploy_plain_pool` call above was simulated with `eth_call` against Ethereum mainnet on 17 November 2026, with PYUSD and USDC as the coins, and returned a pool address. No transaction was sent. The `deploy_gauge` call was not simulated. Simulate both with your own coins before sending.

## Next Step

[After Deploying a Curve Pool](../pool/post-deployment.md) covers seeding, the token logo and incentives.
