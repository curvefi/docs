---
id: parameters-and-access-control
title: Llamalend Parameters and Access Control
sidebar_label: Parameters and Access Control
description: Every Llamalend v2 market parameter, its units, whether it is set at deployment or later, and who can change it, from the Curve DAO ownership agent to a market-specific admin and the LendFactory owner.
---

This page lists each Llamalend v2 market parameter and who controls it. Function details are in the developer reference for the [Configurator](/developer/llamalend-v2/configurator), [LendFactory](/developer/llamalend-v2/lend-factory) and [Vault](/developer/llamalend-v2/vault).

## Set at Deployment

These values are passed to `LendFactory.create()`.

| Parameter | Units and constraints | Effect |
| --- | --- | --- |
| `borrowed_token` | ERC-20 address | Asset supplied to the Vault and borrowed from the market |
| `collateral_token` | A different ERC-20 address | Asset securing borrower debt |
| `A` | Integer from 2 to 10,000 | LLAMMA (Llamalend's liquidation AMM) band width; larger values create narrower bands |
| `fee` | WAD-scaled, `10^18` = 100% | Swap fee inside the AMM; its allowed range depends on `A` |
| `loan_discount` | WAD-scaled, below `10^18` | Discount used to calculate maximum borrowing power |
| `liquidation_discount` | WAD-scaled, above zero and below `loan_discount` | Discount used for hard-liquidation calculations |
| `price_oracle` | Initialized contract address | Collateral price in borrowed-token units |
| `monetary_policy` | Initialized contract address | Per-second borrow rate |
| `supply_limit` | Raw borrowed-token units | Maximum assets the Vault accepts; `max(uint256)` means unlimited, `0` disables deposits |

The factory and the AMM reject invalid combinations. Passing those checks does not make a parameter set safe.

## Changed After Deployment

| Setting | Initial value | Function | Changed by |
| --- | --- | --- | --- |
| Borrow cap | `0`, no new debt | `Configurator.set_borrow_cap` | Curve DAO vote; the Emergency DAO can set it to zero |
| Admin share of interest | `0` | `Configurator.set_admin_percentage` | DAO vote |
| Loan and liquidation discounts | From deployment | `Configurator.set_borrowing_discounts` | DAO vote; the Emergency DAO can only raise the loan discount |
| Monetary policy | From deployment | `Configurator.set_monetary_policy` | DAO vote or Emergency DAO |
| Price oracle | From deployment | `Configurator.set_price_oracle`, with a deviation check of at most 50% unless skipped | DAO vote; the Emergency DAO only when the current oracle fails |
| AMM fee | From deployment | `Configurator.set_amm_fee` | DAO vote |
| Liquidity-mining callback | None | `Configurator.set_callback` | DAO vote or Emergency DAO |
| Vault supply cap | From `supply_limit` | `Vault.set_max_supply` | DAO vote; the Emergency DAO can set it to zero |
| Fee receiver | Factory default | `LendFactory.set_custom_fee_receiver` | DAO vote |
| New market deployment | Open | `LendFactory.pause` | DAO vote or Emergency DAO |

A DAO vote can also assign a market-specific admin with `Configurator.set_custom_admin`. That admin can then call the Configurator functions above for its market. The Emergency DAO can remove a custom admin but cannot assign one.

## Who the Admins Are

On Ethereum and Optimism, the Configurator's `default_admin` and the LendFactory's `admin` are both a `LendingOwnerProxy` contract at [`0xeDA0…80d1`](https://etherscan.io/address/0xeDA020b067872717901916a3B8C724C21f6080d1), read onchain on 17 November 2026. The proxy accepts calls from two addresses:

| Chain | `dao` | `emergency_dao` |
| --- | --- | --- |
| Ethereum | Curve DAO Ownership Agent [`0x4090…9968`](https://etherscan.io/address/0x40907540d8a6C65c637785e8f8B742ae6b0b9968) | Emergency DAO [`0x4679…1E0c`](https://etherscan.io/address/0x467947EE34aF926cF1DCac093870f613C96B1E0c) |
| Optimism | Curve DAO ownership agent [`0x28c4…8267`](https://optimistic.etherscan.io/address/0x28c4A1Fa47EEE9226F8dE7D6AF0a41C62Ca98267) | Emergency DAO [`0x6d44…ffeD`](https://optimistic.etherscan.io/address/0x6d447e544D01a59cb0774763bf15526574CffFeD) |

The `dao` can make any call through the proxy, so every setting above can change by DAO vote. On Optimism, the vote is relayed through Curve's cross-chain governance. The `emergency_dao` can only make the specific calls listed above, and the DAO can replace or remove it. The address that deploys a market gets no admin rights. The proxy's source is verified on [Sourcify](https://sourcify.dev/#/lookup/0xeDA020b067872717901916a3B8C724C21f6080d1).

## Related

- [Llamalend Market Risk and Roles](./risk-and-roles.md)
- [Running a Llamalend Market](./running-a-market.md)
- [Oracles & Parameters](./oracles-and-parameters.md)
