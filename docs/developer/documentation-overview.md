import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# Documentation Overview
Curve is a **decentralized exchange (DEX) and automated market maker (AMM) on Ethereum and EVM-compatible sidechains/L2s**, designed for the **efficient trading of stablecoins and volatile assets**.

Additionally, Curve has launched its own stablecoin, **crvUSD**, and **Curve Lending**, both featuring a **unique liquidation mechanism** known as **LLAMMA**.

This documentation outlines the technical implementation of the core Curve protocol and related smart contracts. It may be useful for contributors to the Curve codebase, third-party integrators, or technically proficient users of the protocol.

:::warning[LlamaLend v1 is deprecated]

LlamaLend v1 markets are being phased out and no new v1 markets will be deployed. Use [LlamaLend v2](./llamalend-v2/overview.md) for all new markets and integrations.

:::

:::tip[Resources for Non-Technical Users]

Non-technical users might prefer the **[User Docs](/user/introduction)** site as it offers more general insights and information.

:::

---------

<DocCardGrid>
  <DocCard title="CRV & Governance" icon="crv" link="./curve-dao/crv-token" linkText="Getting started">

Core smart contracts include the Curve DAO Token, governance infrastructure governed by vote-escrowed CRV, mechanisms for fee collection and distribution, gauges, and many other components.

  </DocCard>
  <DocCard title="Gauges & Emissions" link="./gauges/overview" linkText="Getting started">

System of liquidity gauges and the `GaugeController` that directs CRV inflation to liquidity providers based on veCRV votes.

  </DocCard>
  <DocCard title="Curve AMM" link="./amm/curve-amm-overview" linkText="Getting started">

Implementation of StableSwap and CryptoSwap algorithms into on-chain exchange contracts, including Stableswap-NG, Twocrypto-NG, Tricrypto-NG, pool factories and routers.

  </DocCard>
  <DocCard title="crvUSD" icon="crvusd" link="./crvusd/overview" linkText="Getting started">

Over-collateralized USD stablecoin powered by a unique liquidating algorithm ([LLAMMA](./crvusd/amm.md)), which progressively converts the put-up collateral token into crvUSD when the loan health decreases to certain thresholds.

  </DocCard>
  <DocCard title="Savings crvUSD (scrvUSD)" icon="scrvusd" link="./scrvusd/overview" linkText="Getting started">

Savings version of crvUSD. An ERC-4626 compliant Vault that earns yield from crvUSD interest fees, with cross-chain oracle support.

  </DocCard>
  <DocCard title="LlamaLend v2" link="./llamalend-v2/overview" linkText="Getting started">

Permissionless isolated lending markets for any ERC-20 pair, with ERC-4626 vaults, a LendFactory, Configurator, and LLAMMA soft liquidations.

  </DocCard>
  <DocCard title="LlamaLend v1 (legacy)" link="./lending/overview" linkText="Legacy reference">

Historical reference for the earlier crvUSD-paired lending contracts. Use the v2 reference for new integrations.

  </DocCard>
  <DocCard title="Fees" link="./fees/overview" linkText="Getting started">

Fee collection, distribution, and burning architecture including the `FeeCollector`, `FeeSplitter`, `FeeDistributor`, and `CowSwapBurner`.

  </DocCard>
  <DocCard title="Integration" link="./integration/overview" linkText="Getting started">

Section targeted at integrators covering contracts like `AddressProvider`, `MetaRegistry`, and the public Curve API.

  </DocCard>
</DocCardGrid>
