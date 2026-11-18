---
id: glossary
title: Glossary
sidebar_label: Glossary
description: Plain definitions of the terms used across Build on Curve, from pools, LP tokens and gauges to lending markets, soft liquidation, veCRV and oracles.
---

Each term is defined in one or two sentences and links to the page that explains it.

### AMM {#amm}

An automated market maker: a pool contract that prices trades from its token balances instead of an order book. See [Curve vs Concentrated-Liquidity AMMs](./pool/compare-amm.md).

### Amplification (A) {#amplification}

How tightly a Stableswap pool holds its tokens near the peg. A higher A means deeper liquidity near the peg. See [Understanding Stableswap](./pool/understanding-stableswap.md#amplification-factor-a).

### APR and APY {#apr}

Annual percentage rate and annual percentage yield: the yearly rate without and with compounding. See [Quickstart: Read Curve Pool and Lending Market Data](./integrate/quickstart-prices-api.md).

### Base Pool {#base-pool}

A Stableswap pool the Curve DAO has approved for metapools to pair against. See [Deploy a Pool: Choose Stableswap, Cryptoswap or FXSwap](./pool/overview.md#base-pools-and-metapools).

### Borrow Cap {#borrow-cap}

The most a lending market lets borrowers take out. A new market starts at zero until a Curve DAO vote raises it. See [Llamalend Parameters and Access Control](./lending/parameters-and-access-control.md#changed-after-deployment).

### Configurator {#configurator}

The contract that changes a lending market's settings, such as its borrow cap, after deployment. See [Llamalend Parameters and Access Control](./lending/parameters-and-access-control.md).

### CRV Emissions {#crv-emissions}

CRV paid to a gauge each week, in proportion to the votes veCRV holders give it. See [Get CRV Emissions](./gauge/guides/getting-crv-emissions.md).

### Cryptoswap {#cryptoswap}

Curve's pool design for volatile pairs, which concentrates liquidity around a moving internal price. See [Understanding Cryptoswap](./pool/understanding-cryptoswap.md).

### Curve DAO {#curve-dao}

The veCRV holders who govern Curve's contracts through onchain votes on Ethereum. See [Overview](/user/dao/overview).

### Curve Lite {#curve-lite}

A Curve deployment for new chains with the core pool factories, a router and gauges, owned by the Curve DAO. See [Curve for Chains and L2s](./use-cases/chains.md).

### Direct Rewards {#direct-rewards}

Tokens you deposit in a gauge for its stakers. They need no vote. See [Add Direct Gauge Rewards](./gauge/guides/adding-direct-gauge-rewards.md).

### EMA {#ema}

Exponential moving average: an average of recent prices that weights the latest ones most. See [Understanding Cryptoswap](./pool/understanding-cryptoswap.md#rebalancing).

### Emergency DAO {#emergency-dao}

A 5-of-9 multisig that can make a fixed set of risk-reducing changes without a full vote. It cannot move user funds. See [Emergency DAO](/user/dao/emergency-dao).

### ERC-4626 {#erc-4626}

The standard for yield-bearing vault tokens, such as savings stablecoins. See [Understanding Stableswap](./pool/understanding-stableswap.md#supported-asset-types).

### Flash Loan {#flash-loan}

A loan borrowed and repaid within one transaction. See [Troubleshooting Curve Pools](./pool/troubleshooting.md).

### FXSwap {#fxswap}

Curve's pool design for pairs whose price is set on a deeper external venue, such as FX pairs. It recenters with refuels. See [Understanding FXSwap](./pool/understanding-fxswap.md).

### Gauge {#gauge}

The contract that pays incentives to liquidity providers who stake their LP tokens in it. See [Incentivize Liquidity With Curve Gauges](./gauge/overview.md).

### Impermanent Loss {#impermanent-loss}

A liquidity provider's shortfall versus holding the tokens, caused by price moves. See [Understanding Cryptoswap](./pool/understanding-cryptoswap.md#rebalancing).

### Incentives {#incentives}

What you fund to attract liquidity: direct rewards, CRV emissions, vote incentives or campaigns. See [Incentivize a Curve Pool](./gauge/incentive-routes.md).

### Issuer {#issuer}

Anyone who issues the token that a pool or lending market is built around. See [Curve Use Cases by Builder Type](./use-cases/overview.md).

### Lender Vault {#lender-vault}

The ERC-4626 vault where lenders deposit the asset borrowers take. It is the only thing these docs call a vault. See [Quickstart: Deposit Into a Llamalend Vault](./integrate/quickstart-lend.md).

### LendFactory {#lendfactory}

The contract that deploys and registers Llamalend markets. See [Deploy a Lending Market](./lending/guides/deploy-lending-market.md).

### Lending Market {#lending-market}

An isolated Llamalend market: one collateral token, one borrowed token and its own risk settings. See [Deploy and Run a Lending Market for Your Token](./lending/launch-isolated-lending-market.md).

### LendingOwnerProxy {#lendingownerproxy}

The admin contract that the Curve DAO and the Emergency DAO act through to change Llamalend markets. See [Llamalend Parameters and Access Control](./lending/parameters-and-access-control.md#who-the-admins-are).

### Liquidity Provider (LP) {#liquidity-provider}

Anyone who deposits tokens into a pool to earn trading fees. See [Deploy a Pool: Choose Stableswap, Cryptoswap or FXSwap](./pool/overview.md).

### Llamalend {#llamalend}

Curve's lending protocol. See [Deploy and Run a Lending Market for Your Token](./lending/launch-isolated-lending-market.md).

### LLAMMA {#llamma}

Llamalend's liquidation AMM, which runs soft liquidation. See [Llamalend Market Risk and Roles](./lending/risk-and-roles.md).

### LP Token {#lp-token}

The token that represents a share of the pool. See [Deploy a Pool: Choose Stableswap, Cryptoswap or FXSwap](./pool/overview.md).

### LST and LRT {#lst}

Liquid staking token and liquid restaking token: tokens that represent staked or restaked assets, such as staked ETH. See [Curve Pool Parameter Presets by Asset Class](./pool/presets.md).

### LTV {#ltv}

Loan-to-value: the size of a loan relative to the value of its collateral. See [Deploy and Run a Lending Market for Your Token](./lending/launch-isolated-lending-market.md).

### Metapool {#metapool}

A Stableswap pool that pairs one token with a base pool's LP token. See [Deploy a Pool: Choose Stableswap, Cryptoswap or FXSwap](./pool/overview.md#base-pools-and-metapools).

### Monetary Policy {#monetary-policy}

The contract that sets a lending market's borrow rate. See [Llamalend Oracles & Parameters](./lending/oracles-and-parameters.md#monetary-policy).

### Multisig {#multisig}

A wallet that needs several signers to act. See [Llamalend Market Risk and Roles](./lending/risk-and-roles.md).

### Peg {#peg}

The price a token targets, such as $1 for a USD stablecoin. See [Curve for Stablecoin Issuers](./use-cases/stablecoin-issuers.md).

### Pool Oracle {#pool-oracle}

The pool's own moving-average price, recorded onchain. See [Curve vs Concentrated-Liquidity AMMs](./pool/compare-amm.md#price-oracles).

### Price Oracle {#price-oracle}

The price a lending market uses to value collateral. See [Llamalend Oracles & Parameters](./lending/oracles-and-parameters.md#price-oracle).

### Rate Oracle {#rate-oracle}

A contract that reports the redemption rate of a yield-bearing token, used by Stableswap pools. See [Deploy a Stableswap Pool](./pool/guides/deploy-stableswap.md#oracle-based-tokens).

### Rebasing {#rebasing}

A token whose balance grows in your wallet as yield accrues. See [Understanding Stableswap](./pool/understanding-stableswap.md#supported-asset-types).

### Refuel {#refuel}

Tokens added to an FXSwap pool to pay for rebalancing. Contracts and some UI fields call them donations. See [Understanding FXSwap](./pool/understanding-fxswap.md#refuels).

### RWA {#rwa}

Real-world asset: a token that represents an offchain asset, such as a treasury bill. See [Curve for RWA and Tokenized-Asset Issuers](./use-cases/rwa-issuers.md).

### Seed {#seed}

To make the first deposit into a new pool or lender vault. See [After Deploying a Pool](./pool/post-deployment.md#seed-initial-liquidity).

### Slippage {#slippage}

The price impact of a trade: how far the price moves against you as you trade. See [Understanding Stableswap](./pool/understanding-stableswap.md).

### Soft Liquidation {#soft-liquidation}

Collateral converting gradually as the price falls, instead of being sold at one price. See [Llamalend Market Risk and Roles](./lending/risk-and-roles.md#what-lenders-and-borrowers-risk).

### Stableswap {#stableswap}

Curve's pool design for assets that trade near the same price, such as two USD stablecoins. See [Understanding Stableswap](./pool/understanding-stableswap.md).

### Supply Cap {#supply-cap}

The most a lender vault accepts in deposits. See [Llamalend Parameters and Access Control](./lending/parameters-and-access-control.md#changed-after-deployment).

### TVL {#tvl}

Total value locked: the value of the tokens deposited in a pool or market. See [Quickstart: Read Curve Pool and Lending Market Data](./integrate/quickstart-prices-api.md).

### veCRV {#vecrv}

CRV locked for voting power in the Curve DAO. See [veCRV](/user/curve-tokens/vecrv).

### vlCVX {#vlcvx}

CVX locked for Convex voting power. Convex votes its large veCRV holding as vlCVX holders direct. See [Incentivize a Curve Pool](./gauge/incentive-routes.md#holding-vlcvx).

### Vote Incentives {#vote-incentives}

Payments to veCRV or vlCVX holders who vote for your gauge, often called bribes. See [Incentivize a Curve Pool](./gauge/incentive-routes.md#vote-incentives).

### Whitelist {#whitelist}

The Curve DAO vote that makes a gauge eligible for CRV emissions. See [Whitelist a Gauge](./gauge/whitelisting-gauge.md).

### yRisk {#yrisk}

The risk manager the Curve DAO elected to review Llamalend markets. See [Llamalend Market Risk and Roles](./lending/risk-and-roles.md).
