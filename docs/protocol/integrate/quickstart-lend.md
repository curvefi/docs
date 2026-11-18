---
id: quickstart-lend
title: "Quickstart: Deposit Into a Llamalend Vault"
sidebar_label: "Quickstart: Lend"
description: Supply the borrowed token to a Llamalend v2 market from code with viem, using the market's ERC-4626 vault, previewDeposit and deposit.
---

When you finish, your account holds shares of a Llamalend market's vault and earns the interest borrowers pay.

Two transactions: an approval and the deposit.

## Before You Start

You need viem, an account that holds the market's borrowed token, and the vault address. Get the address from the [Prices API](./quickstart-prices-api.md) or the [LendFactory](/developer/llamalend-v2/lend-factory).

It costs gas.

It takes two transactions.

Nobody approves it. Lenders supply a market through its vault, a standard ERC-4626 contract (the tokenized-vault standard) described in the [Vault reference](/developer/llamalend-v2/vault).

## Preview, Approve and Deposit

This example uses the sDOLA/crvUSD market's vault on Ethereum, which takes crvUSD.

```ts
import { createWalletClient, createPublicClient, http, parseAbi, parseUnits } from 'viem'
import { mainnet } from 'viem/chains'

const VAULT = '0x2b5a321C3cb1F33e1ABECD047C2649D0b4C47eBa'
const vaultAbi = parseAbi([
  'function asset() view returns (address)',
  'function previewDeposit(uint256 _assets) view returns (uint256)',
  'function deposit(uint256 _assets, address _receiver) returns (uint256)',
])
const erc20Abi = parseAbi(['function approve(address spender, uint256 amount) returns (bool)'])

const publicClient = createPublicClient({ chain: mainnet, transport: http() })
const walletClient = createWalletClient({ chain: mainnet, transport: http(), account })

const asset = await publicClient.readContract({ address: VAULT, abi: vaultAbi, functionName: 'asset' })
const amount = parseUnits('1000', 18) // crvUSD has 18 decimals
const shares = await publicClient.readContract({ address: VAULT, abi: vaultAbi, functionName: 'previewDeposit', args: [amount] })
console.log('vault shares for this deposit:', shares)

await walletClient.writeContract({ address: asset, abi: erc20Abi, functionName: 'approve', args: [VAULT, amount] })
await walletClient.writeContract({ address: VAULT, abi: vaultAbi, functionName: 'deposit', args: [amount, account.address] })
```

A deposit fails if it would push the vault past its supply cap. A withdrawal can only take what borrowers haven't borrowed. See [Llamalend Market Risk and Roles](../lending/risk-and-roles.md#what-lenders-and-borrowers-risk).

## Check It Worked

Read `balanceOf(account)` on the vault: it returns your vault shares, close to the value `previewDeposit` gave. The market's page at `https://www.curve.finance/lend/ethereum/markets/<controller>` shows your supplied position.

`asset` and `previewDeposit` were run against Ethereum mainnet on 17 November 2026. The `approve` and `deposit` transactions were not sent or simulated. Their signatures match the [Vault reference](/developer/llamalend-v2/vault).

## Next Step

The [Llamalend integration guide](/developer/llamalend-v2/integration-guide) covers withdrawals, supply caps and available liquidity.
