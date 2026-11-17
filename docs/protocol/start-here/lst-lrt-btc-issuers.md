---
id: lst-lrt-btc-issuers
title: Curve for LST, LRT and Wrapped BTC Issuers
sidebar_label: LST, LRT & BTC Issuers
description: How liquid staking, restaking and wrapped BTC issuers use Curve for correlated-asset pools, rate-oracle and rebasing token support, high-LTV Llamalend markets and CRV incentives.
---

Issuers of liquid staking tokens (LSTs), liquid restaking tokens (LRTs) and wrapped BTC use Curve for exit liquidity against ETH or BTC and for lending markets where holders borrow against the token.

## What Curve Provides

A [Stableswap](../pool/understanding-stableswap.md) pool concentrates liquidity around the expected price ratio between your token and the asset it tracks. Holders can exit to ETH or BTC with low slippage, and liquidity providers don't have to manage ranges when the market moves.

Stableswap-NG follows how your token accrues value. A rebasing token such as stETH uses the rebasing asset type. A token whose rate grows against ETH, such as wstETH, uses the oracle asset type, and the pool prices it at its current rate.

Every pool has a built-in EMA price oracle that lending protocols, including Llamalend, can read.

A [Llamalend](../lending/launch-isolated-lending-market.md) market lets holders borrow against your token. When the borrowed asset tracks the same underlying, as in wstETH against WETH, the market can allow a high LTV. Gauges pay incentives on the pool and the market.

## What Your Users Get

- Holders exit to ETH or BTC on Curve at a price close to the token's rate.
- Liquidity providers earn trading fees and gauge rewards, and rebasing yield goes to them.
- Borrowers keep earning staking or restaking yield on their collateral, and LLAMMA converts it gradually if the price falls.
- Lenders supply to an ERC-4626 vault and earn the interest borrowers pay.

## Recommended Setup

| Your token | Pool | Lending | Guide |
| --- | --- | --- | --- |
| Rebasing LST | Stableswap-NG with ETH or WETH, rebasing asset type | Optional | [Rebasing tokens](../pool/guides/deploy-stableswap.md#rebasing-tokens) |
| LST or LRT with a growing rate | Stableswap-NG with ETH or WETH, oracle asset type | Against ETH or a stablecoin | [Oracle-based tokens](../pool/guides/deploy-stableswap.md#oracle-based-tokens) |
| Wrapped BTC | Stableswap with another BTC wrapper | Against a stablecoin | [Launch a Lending Market](../lending/launch-isolated-lending-market.md) |
| Wrapped BTC against crvUSD | FXSwap or Cryptoswap | Optional | [Understanding FXSwap](../pool/understanding-fxswap.md) |

## Case Studies

Figures are from the Curve Prices API as of 17 November 2026.

ether.fi's [weETH/WETH pool](https://etherscan.io/address/0xDB74dfDD3BB46bE8Ce6C33dC9D82777BCFc3dEd5) held about $7.7M.

Lido's [ETH/stETH pool](https://etherscan.io/address/0xDC24316b9AE028F1497c275EB9192a3Ea0f67022) held about $67.4M.

Threshold's [tBTC/WBTC pool](https://etherscan.io/address/0xB7ECB2AA52AA64a717180E030241bC75Cd946726) held about $9.2M and traded about $8.6M in 24 hours.

YieldBasis runs its BTC liquidity in FXSwap pools against crvUSD, such as crvUSD/WBTC and crvUSD/cbBTC.

On Optimism, Llamalend v2 markets lend USDC against wstETH and WBTC, and WETH against wstETH.

## Requirements and Limits

A rate oracle must return 18-decimal values, must never decrease and must not read a spot price. If one rate update moves the price by more than the cost of a swap, a trader can buy before it and sell after it at the liquidity providers' expense. Read the oracle risks in [Understanding Stableswap](../pool/understanding-stableswap.md) before you deploy.

CRV emissions need a Curve DAO vote. The DAO generally rejects gauges for tokens with transfer restrictions, transfer taxes or blacklists. See [Whitelisting a Gauge](../gauge/whitelisting-gauge.md).

A Llamalend market needs a manipulation-resistant price for your token in the borrowed asset. Its borrow cap starts at zero until a Curve DAO vote raises it. See [Oracles & Parameters](../lending/oracles-and-parameters.md).

A high LTV still carries risk. Each LLAMMA conversion loses some value to fees and arbitrage, and a long stay in liquidation protection can end in hard liquidation.

## FAQ

### Should an LST pool use Stableswap or Cryptoswap?

Stableswap, with the rebasing or oracle asset type so the pool follows the token's rate.

### Can holders borrow against my LST or wrapped BTC?

Yes, through a Llamalend market. Borrowing opens after a Curve DAO vote sets the borrow cap.

### Who receives the staking yield of tokens in the pool?

Liquidity providers. Rebasing yield accrues to the pool, and an oracle-priced token is valued at its current rate.

## Related

- [Why Build on Curve](../why-curve.md)
- [Launch Playbook](../launch-playbook.md)
- [Pool Types](../pool/overview.md)
- [Launch a Lending Market](../lending/launch-isolated-lending-market.md)
- Curve [Telegram](https://t.me/curvefi) and [Discord](https://discord.gg/twUngQYz85)
