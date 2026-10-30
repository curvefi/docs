---
id: emergency-dao
title: Emergency DAO
sidebar_label: Emergency DAO
---

The EmergencyDAO is a **5-of-9 multisig** authorized for emergency interventions. To keep crvUSD safe from any unknowns and ensure strong checks and balances, the Emergency DAO's authority has been expanded to include shared control with the DAO over several critical risk parameters to ensure fast, safe responses to market stress. These expanded permissions were granted through [proposal 1252](https://www.curve.finance/dao/ethereum/proposals/1252-ownership?ref=news.curve.finance).

:::important Security Design
The Emergency DAO is designed very conservatively and **cannot move or withdraw any  user funds**. Its permissions are strictly limited to reducing risk from unexpected events through parameter adjustments and pausing mechanisms. The Emergency DAO cannot access user funds under any circumstances.
:::

## Scope of the Emergency DAO

- **Peg Stability Reserve (PSR)**: Pause the Peg Stabilization Reserve's associated contracts to stop them from depositing or withdrawing crvUSD (this pause does not affect the pool level).
- **Mint Factory:** Reduce, but never increase, debt ceilings for any component relying on crvUSD minting (including YieldBasis, FlashMinter, etc.).
- **Controller (Llamalend markets):** Adjust AMM fees, modify monetary policy, update the liquidity-mining callback, and manage borrowing discounts (without triggering liquidation for any users).
- **Lending Vaults:** Set deposit limits.

## Deployments

The original EmergencyDAO is deployed on :logos-ethereum: Ethereum at [`0x467947EE34aF926cF1DCac093870f613C96B1E0c`](https://etherscan.io/address/0x467947EE34aF926cF1DCac093870f613C96B1E0c).

Additionally, the Emergency DAO multisig is deployed at `0x6d447e544D01a59cb0774763bf15526574CffFeD` on all chains where Curve is active (except Moonbeam, which is incompatible with Safe).

## EmergencyDAO Members

The EmergencyDAO consists of the following members:

<div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }} markdown="block">
| Name            | Telegram Handle              |
| --------------- | ---------------------------- |
| `banteg`        | `Yearn, @banteg`             |
| `Calvin`        | `@calchulus`                 |
| `C2tP`          | `Convex, @c2tp_eth`          |
| `Winthorpe`     | `Convex, @CryptoWinthorpe`   |
| `Ga3b_node`     | `@ga3b_node`                 |
| `Naga King`     | `@nagakingg`                 |
| `Peter MM`      | `@PeterMm`                   |
| `Chago`         | `StakeDAO, @chago0x`         |
| `Quentin Milne` | `StakeDAO, @Kii_iu`          |
</div>
