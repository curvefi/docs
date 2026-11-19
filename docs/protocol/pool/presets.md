---
id: presets
title: Curve Pool Parameter Presets by Asset Class
sidebar_label: Presets by Asset Class
description: The Stableswap, Cryptoswap and FXSwap parameter presets offered in the Curve app for stablecoins, LSTs, LRTs, BTC, volatile and FX pairs, with the parameters of live pools for comparison.
---

The Curve app offers parameter presets for each pool type. A preset is a starting point: compare it with live pools that hold similar assets, and simulate before you deploy. Every parameter is explained in [Curve Pool Parameters](./pool-parameters.md).

Preset values below are from the Curve app's pool creation code (`apps/main/src/dex/components/PageCreatePool/constants.ts` in [curvefi/curve-frontend](https://github.com/curvefi/curve-frontend)) as of 17 November 2026.

## Stableswap Presets

| Preset | Fee | `A` | Off-peg fee multiplier |
| --- | --- | --- | --- |
| Fiat-redeemable stablecoins | 0.01% | 1000 | 10 |
| Crypto-collateralized stablecoins | 0.04% | 100 | 20 |
| Liquid restaking tokens | 0.01% | 500 | 10 |

All three use a 600-second [exponential moving average](/protocol/glossary#ema) (EMA) half-life for the pool oracle. The contract stores it as `ma_exp_time` = 866 (600 / ln 2).

## Cryptoswap and FXSwap Presets

| Preset | Suited to | Mid fee | Out fee |
| --- | --- | --- | --- |
| Crypto | Most volatile pairs, such as LDO/ETH | 0.26% | 0.45% |
| Low volatility | Pairs with low relative volatility | 0.05% | 0.45% |
| Liquid staking derivatives | [LSTs](/protocol/glossary#lst) (liquid staking tokens) soft-pegged to their underlying | 0.03% | 0.45% |
| Liquid restaking tokens | LRTs | 0.005% | 0.08% |
| Tricrypto | USD stablecoin, BTC and ETH | 0.01% | 1.4% |
| Three coin volatile | A volatile token with ETH and a USD stablecoin | 0.03% | 0.8% |
| FXSwap V1 and V2 | FX tokens with low volatility | 0.25% | 0.50% |
| FXSwap V3 | FX tokens with low volatility | 0.01% | 0.30% |

| Preset | `A` | `gamma` | `adjustment_step` |
| --- | --- | --- | --- |
| Crypto | 400,000 | 0.000145 | 0.000146 |
| Low volatility | 20,000,000 | 0.001 | 0.0000055 |
| Liquid staking derivatives | 40,000,000 | 0.002 | 0.0000055 |
| Liquid restaking tokens | 20,000,000 | 0.02 | 0.0000055 |
| Tricrypto | 540,000 | 0.0000805 | 0.0000001 |
| Three coin volatile | 2,700,000 | 0.0000013 | 0.0000001 |
| FXSwap V1 and V2 | 100,000 | not used | 0.005 |
| FXSwap V3 | 250,000 | not used | 0.005 |

`A` is the value the contract stores. All Cryptoswap and FXSwap presets use a 600-second EMA half-life.

## Live Pools for Comparison

Parameters read onchain from Ethereum on 17 November 2026.

| Stableswap pool | Asset class | `A` | Fee |
| --- | --- | --- | --- |
| [pyUSD/crvUSD](https://etherscan.io/address/0x625E92624Bc2D88619ACCc1788365A69767f6200) | Fiat-redeemable stablecoin | 2,000 | 0.01% |
| [USDtb/USDC](https://etherscan.io/address/0xC2921134073151490193AC7369313c8e0b08e1E7) | Stablecoin backed by real-world assets | 800 | 0.01% |
| [DOLA/sUSDe](https://etherscan.io/address/0x744793B5110f6ca9cC7CDfe1CE16677c3Eb192ef) | Crypto-collateralized and yield-bearing stablecoins | 750 | 0.01% |
| [sfrxUSD/frxUSD](https://etherscan.io/address/0xF292eB6c5dcb693Eaaf392D0562a01C3710E5978) | Savings token and its base stablecoin | 10,000 | 0.01% |
| [ETH/stETH](https://etherscan.io/address/0xDC24316b9AE028F1497c275EB9192a3Ea0f67022) | Rebasing LST (balance grows in the wallet) | 900 | 0.01% |
| [weETH/WETH](https://etherscan.io/address/0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5) | LRT | 5,000 | 0.005% |
| [tBTC/WBTC](https://etherscan.io/address/0xB7ECB2AA52AA64a717180E030241bC75Cd946726) | Wrapped BTC | 300 | 0.01% |
| [cbBTC/WBTC](https://etherscan.io/address/0x839d6bDeDFF886404A6d7a788ef241e4e28F4802) | Wrapped BTC | 800 | 0.02% |

The off-peg fee multiplier ranges from 1 in sfrxUSD/frxUSD to 20 in DOLA/sUSDe. The older ETH/stETH and tBTC/WBTC pools predate it.

| Cryptoswap or FXSwap pool | Asset class | `A` | Mid fee / out fee |
| --- | --- | --- | --- |
| [CVX/ETH](https://etherscan.io/address/0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4) | Governance token | 400,000 | 0.26% / 0.45% |
| [YB/crvUSD](https://etherscan.io/address/0xec977F46467a3021785Cff88894886E617abd65b) | Governance token | 400,000 | 0.26% / 0.45% |
| [ZCHF/crvUSD](https://etherscan.io/address/0x027B40F5917FCd0eac57d7015e120096A5F92ca9) | CHF stablecoin against USD | 600,000 | 0.025% / 0.25% |
| [YieldBasis cbBTC](https://etherscan.io/address/0x83f24023d15d835a213df24fd309c47dAb5BEb32) | BTC against crvUSD, FXSwap | 90,000 | 1% / 1% |

CVX/ETH and YB/crvUSD use the Crypto preset unchanged.

## Related

- [Curve Pool Parameters](./pool-parameters.md)
- [Troubleshooting Curve Pools](./troubleshooting.md)
- [Deploy a Pool](./overview.md)
