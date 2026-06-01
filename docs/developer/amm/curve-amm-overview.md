import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# Curve AMM

Curve's Automated Market Maker (AMM) is built around two core invariants — **StableSwap** for assets that trade near parity, and **CryptoSwap** for volatile asset pairs. Both algorithms have gone through multiple iterations, with the current generation ("-NG") contracts offering significant gas optimizations, built-in LP tokens, and improved oracle support.

For the mathematical foundations, see the [StableSwap whitepaper](/pdf/whitepapers/whitepaper_stableswap.pdf) and the [CryptoSwap whitepaper](/pdf/whitepapers/whitepaper_cryptoswap.pdf).

---

## Current Implementations

<DocCardGrid>
  <DocCard title="Stableswap-NG" link="./stableswap-ng/overview" linkText="Stableswap-NG">

Next-generation StableSwap pools for stablecoins and pegged assets. Supports plain pools and metapools with multiple asset types (standard ERC-20, rebasing, ERC-4626).

  </DocCard>
  <DocCard title="Twocrypto-NG" link="./twocrypto-ng/overview" linkText="Twocrypto-NG">

Optimized 2-coin CryptoSwap pools for volatile asset pairs with auto-rebalancing, built-in ERC-20 LP tokens, and a hardcoded 50% admin fee.

  </DocCard>
  <DocCard title="Tricrypto-NG" link="./tricrypto-ng/overview" linkText="Tricrypto-NG">

Optimized 3-coin CryptoSwap pools with native transfer support. Used for major volatile pairs like ETH/BTC/USD.

  </DocCard>
  <DocCard title="Pool Factory" link="./factory/overview" linkText="Pool Factory">

Permissionless deployment of liquidity pools, gauges, and LP tokens across all pool types and chains.

  </DocCard>
  <DocCard title="Router" link="./router/curve-router-ng" linkText="CurveRouter-NG">

On-chain router that finds optimal swap routes across Curve pools, supporting up to five tokens in a single transaction.

  </DocCard>
  <DocCard title="Legacy Contracts" link="./stableswap-overview" linkText="StableSwap Legacy">

Earlier implementations of StableSwap and CryptoSwap pools, factory contracts, LP tokens, and deposit contracts. Superseded by the NG versions above.

  </DocCard>
</DocCardGrid>
