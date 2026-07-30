---
title: Integrating FXSwap
sidebar_label: Integration Guide
---

# Integrating FXSwap

FXSwap keeps the common two-coin Curve routing surface: `coins`, `get_dy`, `get_dx`, `exchange`, `exchange_received`, and `TokenExchange`. The important integration work is identifying the implementation correctly, preserving raw token units, and choosing the correct token-transfer flow.

## 1. Discover and identify pools

Use the [Curve API](../../integration/api/curve-api.md) or [MetaRegistry](../../integration/meta-registry.md) to discover registered pools. Do not use the API's generic `implementation` label as the only FXSwap classifier: an FXSwap pool may be described as a Twocrypto implementation.

:::warning[Identify the implementation explicitly]

Registry membership and interface probing establish compatibility, not provenance. Do not route through an unknown pool only because it exposes familiar Twocrypto methods.

:::

For a newly encountered address:

1. Confirm it is a registered Curve pool.
2. Read `coins(0)` and `coins(1)`.
3. Probe `version()` and the FXSwap-specific getters such as `donation_shares()` and `user_supply()`.
4. Maintain a versioned allowlist for production routing. Interface probing establishes compatibility, not provenance.

The Twocrypto factory does not expose a reliable pool-to-implementation getter. Its current implementation slots also do not describe historical pools. This is why the deployment index does not offer an interactive FXSwap implementation scanner.

```ts
import { getAddress, parseAbi } from 'viem'

const fxswapReadAbi = parseAbi([
  'function version() view returns (string)',
  'function coins(uint256) view returns (address)',
  'function donation_shares() view returns (uint256)',
  'function user_supply() view returns (uint256)',
])

const pool = getAddress('0xD9FF8396554A0d18B2CFbeC53e1979b7ecCe8373')
const [version, coin0, coin1, refuelShares] = await Promise.all([
  publicClient.readContract({ address: pool, abi: fxswapReadAbi, functionName: 'version' }),
  publicClient.readContract({ address: pool, abi: fxswapReadAbi, functionName: 'coins', args: [0n] }),
  publicClient.readContract({ address: pool, abi: fxswapReadAbi, functionName: 'coins', args: [1n] }),
  publicClient.readContract({ address: pool, abi: fxswapReadAbi, functionName: 'donation_shares' }),
])

if (version !== 'v2.1.0d') throw new Error(`Unsupported FXSwap version: ${version}`)
```

`coins` and swap indices use `uint256`; valid indices are `0` and `1`.

## 2. Preserve coin ordering and units

All amounts passed to or returned by swap methods are in the token's **raw ERC-20 units**. `get_dy(0, 1, 1e18)` on a crvUSD/WBTC pool returns WBTC satoshi units, not a 1e18-normalized amount.

Read `decimals()` from each coin and parse user amounts against the input token. Never assume both coins use 18 decimals. `price_scale()` and `price_oracle()` are normalized to 1e18 and express the price of `coins(1)` in `coins(0)` units.

## 3. Quote a route

### Exact input

Call:

```solidity
get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256 dy);
```

The return value already reflects the pool's dynamic swap fee. Compute a non-zero `min_dy` from the quote and the user's slippage tolerance immediately before submission.

```ts
const swapAbi = parseAbi([
  'function get_dy(uint256 i, uint256 j, uint256 dx) view returns (uint256)',
  'function exchange(uint256 i, uint256 j, uint256 dx, uint256 minDy, address receiver) returns (uint256)',
])

const amountIn = 1_000n * 10n ** 18n
const quotedOut = await publicClient.readContract({
  address: pool,
  abi: swapAbi,
  functionName: 'get_dy',
  args: [0n, 1n, amountIn],
})
const minOut = quotedOut * 9_950n / 10_000n // example: 0.50% tolerance
```

### Exact output

Call `get_dx(i, j, dy)` or `get_dx(i, j, dy, n_iter)`. It is an **iterative approximation**, not a promise of exact execution; the three-argument overload uses five iterations. Add an input buffer, simulate the complete transaction, and enforce your router's maximum input.

The pool has no exact-output swap method. A router implements exact output by estimating with `get_dx`, then executing an exact-input `exchange` with appropriate bounds and refund logic at the router layer.

## 4. Execute safely

### Approval flow: `exchange`

`exchange` pulls `dx` from `msg.sender`.

1. Approve the **pool address** to spend the input token.
2. Call `exchange(i, j, dx, min_dy, receiver)`.
3. Use the receiver overload when output should go somewhere other than the caller.

```ts
await walletClient.writeContract({
  address: inputToken,
  abi: parseAbi(['function approve(address,uint256) returns (bool)']),
  functionName: 'approve',
  args: [pool, amountIn],
})

await walletClient.writeContract({
  address: pool,
  abi: swapAbi,
  functionName: 'exchange',
  args: [0n, 1n, amountIn, minOut, account],
})
```

### Pre-transfer flow: `exchange_received`

`exchange_received` measures tokens already transferred to the pool. Transfer exactly `dx` to the pool, then call it **atomically in the same router transaction**.

```solidity
IERC20(input).transfer(pool, dx);
dy = IFXSwap(pool).exchange_received(i, j, dx, minDy, receiver);
```

:::warning[Keep the pre-transfer atomic]

Do not send tokens in one transaction and settle them in a later transaction. Another caller can change balances first, and unsolicited pool balances are not reserved for the sender. Fee-on-transfer and rebasing tokens require explicit compatibility testing; the interface assumes the amount received matches the stated `dx`.

:::

FXSwap pool methods are nonpayable and operate on ERC-20 tokens. Wrap native currency before routing unless another router step handles wrapping.

## Fees, slippage, and state changes

- `fee()` returns the current dynamic fee at **1e10 precision**.
- `mid_fee()` and `out_fee()` are the configured bounds, also at 1e10 precision.
- A quote can become stale when balances, the oracle, or `price_scale` changes.
- A swap can trigger oracle updates, recentering, and the burn of available refuel shares. This is expected and does not change the swap ABI.
- Never submit `min_dy = 0` for user trades.

For multi-pool routes, simulate the full route against the intended block state. Apply protection to the final user outcome as well as any per-hop limits required by the router.

## Events and indexing

Successful swaps emit:

```solidity
event TokenExchange(
    address indexed buyer,
    uint256 sold_id,
    uint256 tokens_sold,
    uint256 bought_id,
    uint256 tokens_bought,
    uint256 fee,
    uint256 price_scale
);
```

`buyer` is the caller, not necessarily the output receiver. Amounts are raw token units. Index `Donation`, `AddLiquidity`, and the removal events if your application also displays LP or refuel state.

## Integration checklist

- Verify registry membership, code/version support, coin addresses, and token decimals.
- Use `uint256` indices and raw token units.
- Quote with `get_dy`; treat `get_dx` as an iterative estimate.
- Set a non-zero output floor and deadline at the router or transaction layer.
- Keep pre-transfer and `exchange_received` in one atomic call.
- Simulate unusual token behavior and the entire multi-hop route.
- Decode `TokenExchange` by pool address and versioned ABI.
- Monitor implementation and periphery changes instead of assuming all FXSwap pools are identical forever.

See the [complete pool interface](./reference.md) for overloads and getters.
