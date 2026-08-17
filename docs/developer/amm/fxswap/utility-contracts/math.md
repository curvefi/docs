---
title: FXSwap Math Contract
sidebar_label: Math
---

# Math Contract

The FXSwap Math contract implements the two-coin StableSwap-style invariant used by deployed FXSwap pools. It is not the `TwocryptoMath.vy` contract used by ordinary Twocrypto-NG pools.

:::deploy[Contract Source & Deployment]

The deployed FXSwap pool returns its Math address from `MATH()`. The verified source is closest to [`StableswapMath.vy` at commit `387fbe5`](https://github.com/curvefi/twocrypto-ng/blob/387fbe5f12473ef0e1f0c6a76bc38f1ca0da669d/contracts/main/StableswapMath.vy), compiled with Vyper `0.4.3`.

Read `MATH()` from the target pool. The reviewed contract reports `version() == "v0.1.0"`.

:::

The pool normalizes its two balances to common precision before calling these methods. Unless reproducing the invariant for research or simulation, integrations should use pool and Views methods rather than call Math directly.

## AMM Math Functions

### `get_y`

::::description[`Math.get_y(_amp: uint256, _gamma: uint256, xp: uint256[2], D: uint256, i: uint256) -> uint256[2]: pure`]

Solves the StableSwap invariant for normalized balance `xp[i]` while holding `D` and the other balance constant.

| Input | Meaning |
| --- | --- |
| `_amp` | Amplification value in the pool's contract precision |
| `_gamma` | Unused compatibility argument |
| `xp` | Two normalized balances in common precision |
| `D` | Current invariant |
| `i` | Balance index to solve; must be `0` or `1` |

The first return element is the solved balance. The second is always `0` and exists for Twocrypto interface compatibility. The function iterates up to 255 times and reverts with `Did not converge` if it does not reach one-unit precision.

::::

### `newton_D`

::::description[`Math.newton_D(_amp: uint256, gamma: uint256, _xp: uint256[2], K0_prev: uint256 = 0) -> uint256: pure`]

Calculates invariant `D` for two normalized balances and the supplied amplification.

`gamma` and `K0_prev` are unused compatibility arguments. The function returns `0` when both balances sum to zero. For non-zero supply it iterates up to 255 times and reverts with `Did not converge` if convergence fails.

::::

### `get_p`

::::description[`Math.get_p(_xp: uint256[2], _D: uint256, _A_gamma: uint256[2]) -> uint256: pure`]

Returns the normalized derivative `dx₀/dx₁` with 1e18 precision. `_A_gamma[0]` supplies amplification; the compatibility gamma value is not used by this StableSwap-style calculation.

The pool multiplies the result by `price_scale` and divides by 1e18 to store `last_prices`.

::::

### `wad_exp`

::::description[`Math.wad_exp(x: int256) -> uint256: pure`]

Returns `eˣ` where `x` and the result use 1e18 fixed-point precision. The pool uses it to calculate the EMA decay factor for `price_oracle`.

::::

### `version`

::::description[`Math.version() -> String[8]: view`]

Returns `"v0.1.0"` for the reviewed deployed Math contract.

::::

## Compatibility boundary

FXSwap retains the Twocrypto-compatible Math call shape so the pool can use shared periphery interfaces. That compatibility does not make the algorithms interchangeable:

- `gamma` does not shape the deployed FXSwap invariant;
- `get_y` returns `[y, 0]` rather than a Cryptoswap solver result;
- `newton_D` ignores `gamma` and `K0_prev`; and
- the invariant concentrates around a variable `price_scale` using StableSwap-style math.

Allowlist the pool version together with its `MATH()` and `VIEW()` addresses. Do not substitute an ordinary Twocrypto-NG Math contract because the ABI appears compatible.
