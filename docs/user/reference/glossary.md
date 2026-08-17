---
id: glossary
title: Glossary
sidebar_label: Glossary
---

A comprehensive glossary of terms used throughout Curve Finance documentation.

## A

**Amplification Coefficient (A)** - A parameter that controls how tightly liquidity is concentrated around the peg in Stableswap pools. Higher values create a flatter curve with lower slippage near the peg.

**AMM (Automated Market Maker)** - A protocol that uses mathematical formulas to price assets and enable trading without traditional order books.

## B

**Basepool** - A core liquidity pool that other pools (metapools) can be paired with to improve capital efficiency.

**Bonding Curve** - The mathematical function that determines exchange rates between assets in a liquidity pool.

## C

**CRV** - The governance token of Curve Finance, used for voting and earning protocol fees.

**crvUSD** - Curve's native decentralized stablecoin that maintains its peg through dynamic interest rates and LLAMMA liquidation mechanisms.

**Cryptoswap** - Curve's AMM algorithm designed for volatile or uncorrelated assets that automatically rebalances liquidity around market prices.

## F

**FXSwap** - Curve's AMM designed for low-volatility uncorrelated pairs like forex, combining Stableswap efficiency with Cryptoswap's rebalancing, along with the refuelling mechanism.

## G

**Gauge** - A smart contract that manages CRV token emissions (or other token rewards) for liquidity providers in specific pools.

**Gauge Weight** - The proportion of CRV emissions allocated to a specific gauge, determined by veCRV holder votes.

## I

**Impermanent Loss** - The temporary loss in value that liquidity providers experience when asset prices diverge from their deposit ratio.

**Invariant** - The mathematical equation that must remain constant in an AMM, determining how trades affect pool balances and prices.

## L

**Liquidity Provider (LP)** - A user who deposits assets into a pool to enable trading and earn fees in return.

**LP Token** - An ERC-20 token representing a user's share of a liquidity pool, which can be redeemed for the underlying assets plus accumulated fees.

**LLAMMA (Lending-Liquidating AMM Algorithm)** - Curve's lending market AMM that gradually converts collateral to stablecoins as prices drop, with the goal of reducing losses for borrowers and giving them more time to act before their loans are closed.

**Llamalend** - Curve's permissionless lending platform that uses LLAMMA for risk management.

**Liquidation Protection** - LLAMMA's gradual collateral conversion process that avoids liquidation at one specific price and gives borrowers more time to react. Conversions incur losses and can still lead to full liquidation. Previously called "soft liquidation."

## M

**Metapool** - A pool that pairs assets with an existing basepool, enabling efficient trading with multiple assets while reducing fragmentation.

## O

**Oracle** - A price feed mechanism. Curve pools have built-in oracles providing spot and EMA prices for other protocols to use.

## P

**Peg** - The target price relationship between two assets (e.g., 1:1 for stablecoins).

## S

**scrvUSD** - Savings crvUSD, an interest-bearing version of crvUSD that automatically accrues yield.

**Slippage** - The difference between expected and actual trade prices, typically larger for bigger trades relative to pool size.

**Soft Liquidation** - Old term for what is now called Liquidation Protection. See **Liquidation Protection**.

**Stableswap** - Curve's original AMM algorithm optimized for similarly-priced or pegged assets, providing extremely low slippage.

## V

**veCRV (Vote-Escrowed CRV)** - CRV tokens locked for voting that grant governance power, fee earnings, and gauge weight voting rights. Lock duration determines voting power.

**Volatility** - The degree of price fluctuation in an asset or asset pair.
