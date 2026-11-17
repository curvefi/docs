---
id: lst-lrt-btc-issuers
title: Curve for LST, LRT and Wrapped BTC Issuers
sidebar_label: LST, LRT & BTC Issuers
description: How liquid staking, restaking and wrapped BTC issuers use Curve for correlated-asset pools, rate-oracle and rebasing token support, high-LTV Llamalend markets and CRV incentives.
---

Curve is where issuers of liquid staking tokens (LSTs), liquid restaking tokens (LRTs) and wrapped BTC build deep liquidity against the asset they track, such as ETH or BTC, and let holders borrow against their token.

## What You Get

- **A pool for correlated assets.** Stableswap concentrates liquidity around the expected price ratio, so holders can exit to ETH or BTC with low slippage.
- **Support for how your token accrues value.** Stableswap-NG handles rebasing tokens, such as stETH, and tokens whose value grows against the base asset through a rate oracle, such as wstETH. The pool prices your token at its current rate instead of treating it as 1:1.
- **Exit liquidity that stays in place.** Liquidity providers don't manage ranges, so the pool keeps quoting through volatile markets.
- **A price oracle.** Every pool has a built-in EMA price oracle that lending protocols, including Llamalend, can read onchain.
- **Lending for your holders.** A Llamalend market lets holders borrow against your token, with high LTV when the borrowed asset tracks the same underlying.
- **One incentive system.** CRV emissions, your own rewards and vote incentives run through the same gauges.

## What Your Users Get

- **Holders** can exit to ETH or BTC on Curve at a price close to the token's rate.
- **Liquidity providers** earn trading fees with no range management, plus gauge rewards. Rebasing yield goes to them.
- **Borrowers** keep their staking or restaking yield while the token backs a loan, with LLAMMA liquidation protection.
- **Lenders** supply to an ERC-4626 vault and earn interest from borrowers.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| Rebasing LST (balance grows) | Stableswap-NG pool with ETH or WETH, using the rebasing asset type | Optional | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md#rebasing-tokens) |
| Value-accruing LST or LRT (rate grows) | Stableswap-NG pool with ETH or WETH, using the oracle asset type | Llamalend market against ETH or a stablecoin | [Deploy a Stableswap Pool](../pool/guides/deploy-stableswap.md#oracle-based-tokens) |
| Wrapped BTC | Stableswap pool with another BTC wrapper | Llamalend market against a stablecoin | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| Pair with a different asset, such as wrapped BTC against crvUSD | Cryptoswap or FXSwap pool | Optional | [Understanding FXSwap](../pool/understanding-fxswap.md) |

Then deploy a gauge and choose an incentive route. See [Incentivizing a Pool](../gauge/incentive-routes.md).

## Case Studies

Figures as of 17 November 2026, from the Curve Prices API.

- **Lido (stETH).** The [ETH/stETH pool](https://etherscan.io/address/0xDC24316b9AE028F1497c275EB9192a3Ea0f67022) holds about $67.4M.
- **ether.fi (weETH).** The [weETH/WETH pool](https://etherscan.io/address/0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5) holds about $7.7M.
- **Threshold (tBTC).** The [tBTC/WBTC pool](https://etherscan.io/address/0xB7ECB2AA52AA64a717180E030241bC75Cd946726) holds about $9.2M and traded about $8.6M in 24 hours.
- **YieldBasis.** Runs its BTC liquidity in FXSwap pools against crvUSD, such as crvUSD/WBTC and crvUSD/cbBTC.
- **Llamalend on Optimism.** Live v2 markets lend USDC against wstETH and WBTC, and WETH against wstETH.

## Requirements and Limits

- **Rate oracles.** An oracle-priced token needs a rate oracle that returns 18-decimal values, never decreases and never reads a spot price. Fast rate jumps can be exploited, so read the oracle risks in [Understanding Stableswap](../pool/understanding-stableswap.md) before you deploy.
- **CRV emissions need a DAO vote.** The DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).
- **Lending needs a reliable oracle and a DAO vote.** A Llamalend market needs a price for your token in the borrowed asset, and its borrow cap starts at zero until a Curve DAO vote raises it. See [Oracles & Parameters](../lending/oracles-and-parameters.md).
- **High LTV is not risk-free.** LLAMMA protection loses a little value on each conversion, and a long stay in liquidation protection can still end in hard liquidation.

## FAQ

**Should an LST pool use Stableswap or Cryptoswap?**
Stableswap, when the token tracks ETH. Use the rebasing or oracle asset type so the pool follows the token's rate.

**Can holders borrow against my LST or wrapped BTC on Curve?**
Yes, through a Llamalend market. Borrowing opens after a Curve DAO vote sets the borrow cap.

**Does the pool account for staking rewards?**
Yes. Rebasing yield goes to liquidity providers, and an oracle-priced token is valued at its current rate.

## Next Steps

- Follow the [Launch Playbook](../launch-playbook.md) from pool to lending market.
- Read [Pool Types](../pool/overview.md) for the supported asset types.
- Ask the Curve team in [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).
