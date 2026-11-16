# HyperbolicDynamicMP

`HyperbolicDynamicMP` is a utilization-based monetary policy for Llamalend v2 markets with **yield-bearing collateral** (e.g. sfrxUSD/crvUSD). It uses the same hyperbolic rate curve as [`HyperbolicMP`](./hyperbolic-mp.md), but instead of a fixed target rate, the target rate is read from an external **rate calculator** contract that reports the current yield of the collateral. At target utilization, borrowing therefore costs exactly what the collateral earns, and the borrow rate follows the collateral's yield up and down without any governance action.

Each market has its own `HyperbolicDynamicMP` instance. The policy is bound to a single controller (`CONTROLLER`) and a single rate calculator (`RATE_CALCULATOR`) at deployment. It reads the controller's debt and reserves to compute utilization, and only accepts `rate_write` calls from that controller.

:::vyper[`HyperbolicDynamicMP.vy`]

The source code for the `HyperbolicDynamicMP.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/81b3bea490e9b45221c82e78387920ccfeb05b33/curve_stablecoin/mpolicies/v2/HyperbolicDynamicMP.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed once per market. On :logos-ethereum: Ethereum, the following markets use it:

| Market | Monetary Policy | Rate Calculator |
| ------ | --------------- | --------------- |
| sfrxUSD/crvUSD | [`0xfF9b210877F122b0cd301DB6DFaD30597e64950a`](https://etherscan.io/address/0xfF9b210877F122b0cd301DB6DFaD30597e64950a) | [`0x696A3ef2855e56DbB6A3492ac8bD41Fc5567D6B8`](https://etherscan.io/address/0x696A3ef2855e56DbB6A3492ac8bD41Fc5567D6B8) |
| sDOLA/crvUSD | [`0xE02C02FCeeF5608762058bFe79BFb4064DcAA7b8`](https://etherscan.io/address/0xE02C02FCeeF5608762058bFe79BFb4064DcAA7b8) | [`0x2BC89Ef5Fa2916bB63960be90B4F224a148450b8`](https://etherscan.io/address/0x2BC89Ef5Fa2916bB63960be90B4F224a148450b8) |
| syrupUSDC/crvUSD | [`0xb64e89976c428E3B7DCA027089fb529F25716b75`](https://etherscan.io/address/0xb64e89976c428E3B7DCA027089fb529F25716b75) | [`0xe6A7bF45F6468f4e938b4A70DFEc51f80f2b4526`](https://etherscan.io/address/0xe6A7bF45F6468f4e938b4A70DFEc51f80f2b4526) |

The policy currently used by any market can be read from its controller with `LendController.monetary_policy()`.

<ContractABI>

```json
[{"name":"SetParameters","inputs":[{"name":"u_inf","type":"uint256","indexed":false},{"name":"A","type":"uint256","indexed":false},{"name":"r_minf","type":"int256","indexed":false},{"name":"target_utilization","type":"uint256","indexed":false},{"name":"low_ratio","type":"uint256","indexed":false},{"name":"high_ratio","type":"uint256","indexed":false},{"name":"rate_shift","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"view","type":"function","name":"target_rate","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"target_apr","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"rate","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"rate_write","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"set_parameters","inputs":[{"name":"_target_utilization","type":"uint256"},{"name":"_low_ratio","type":"uint256"},{"name":"_high_ratio","type":"uint256"},{"name":"_rate_shift","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"future_rate","inputs":[{"name":"_d_reserves","type":"int256"},{"name":"_d_debt","type":"int256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"CONTROLLER","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"RATE_CALCULATOR","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"parameters","inputs":[],"outputs":[{"name":"","type":"tuple","components":[{"name":"u_inf","type":"uint256"},{"name":"A","type":"uint256"},{"name":"r_minf","type":"int256"},{"name":"target_utilization","type":"uint256"},{"name":"low_ratio","type":"uint256"},{"name":"high_ratio","type":"uint256"},{"name":"rate_shift","type":"uint256"}]}]},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_controller","type":"address"},{"name":"_rate_calculator","type":"address"},{"name":"_target_utilization","type":"uint256"},{"name":"_low_ratio","type":"uint256"},{"name":"_high_ratio","type":"uint256"},{"name":"_rate_shift","type":"uint256"}],"outputs":[]}]
```

</ContractABI>

:::

---

## Rate Curve

All rates are **per second**, scaled by $10^{18}$. The annualized rate (APR) is the per-second rate multiplied by $365 \cdot 86400$.

### Target Rate

The target rate $r_0$ is the per-second yield reported by the rate calculator, clamped to a fixed range:

$$r_0 = \min\left(\max\left(\text{RATE\_CALCULATOR.rate()},\ 317097920\right),\ 47564687975\right)$$

The lower bound corresponds to about 1% APR and the upper bound to about 150% APR. The bounds keep the borrow rate within a sane range even if the collateral's yield drops to zero or the calculator reports an extreme value.

The calculator is queried with a low-level call that does not revert on failure. If the call fails or returns no data, the reported rate is treated as $0$ and the target rate falls back to the lower bound. A broken rate calculator can therefore never block the controller from saving its rate.

### Rate Calculators

A rate calculator is a small adapter contract that converts the yield of a specific collateral token into a per-second rate. It must implement two methods:

```vyper
def rate_w() -> uint256:
    ...

@view
def rate() -> uint256:
    ...
```

- `rate()` returns the current per-second yield, scaled by $10^{18}$. It is used by all view methods of the policy.
- `rate_w()` returns the same value but may write state. It is called from [`rate_write`](#rate_write), which gives calculators that need history (for example, to derive a yield from the change of a vault's share price over time) a chance to record a fresh sample on every controller interaction. For stateless calculators, `rate_w()` simply returns the same value as `rate()`.

:::example[Example: sfrxUSD rate calculator]

The sfrxUSD/crvUSD market uses the `SfrxUSDRateCalculator`, deployed at [`0x696A3ef2855e56DbB6A3492ac8bD41Fc5567D6B8`](https://etherscan.io/address/0x696A3ef2855e56DbB6A3492ac8bD41Fc5567D6B8). It derives the yield from the sfrxUSD vault's current reward cycle: the rewards of the cycle are divided by its duration and by the vault's stored total assets, and the result is capped at the vault's own maximum distribution rate. If the cycle data is not valid (the cycle end is not after the last sync), it reports `0`, in which case the policy falls back to its lower bound for the target rate.

This calculator is stateless, so `rate_w()` returns exactly the same value as `rate()` and writes nothing.

<SourceCode>

```vyper
interface IFraxVault:
    def rewardsCycleData() -> (uint256, uint256, uint256): view
    def storedTotalAssets() -> uint256: view
    def maxDistributionPerSecondPerAsset() -> uint256: view


SFRXUSD: public(immutable(IFraxVault))


@internal
@view
def _rate() -> uint256:
    """
    @notice Calculates the current per-second rate for sfrxUSD
    @return rate Yield per second, scaled by 1e18
    """
    cycle_end: uint256 = 0
    last_sync: uint256 = 0
    reward_amt: uint256 = 0
    cycle_end, last_sync, reward_amt = staticcall SFRXUSD.rewardsCycleData()

    # Prevent division by zero
    if cycle_end <= last_sync:
        return 0

    assets: uint256 = staticcall SFRXUSD.storedTotalAssets()
    if assets == 0:
        assets = 1

    max_distro: uint256 = staticcall SFRXUSD.maxDistributionPerSecondPerAsset()
    duration: uint256 = cycle_end - last_sync

    frax_per_second: uint256 = reward_amt // duration
    frax_per_second = frax_per_second * 10**18 // assets

    return min(frax_per_second, max_distro)


@external
@view
def rate() -> uint256:
    """
    @notice Read-only current per-second rate for sfrxUSD
    @return rate Yield per second, scaled by 1e18
    """
    return self._rate()


@external
def rate_w() -> uint256:
    """
    @notice Current per-second rate for sfrxUSD
    @dev Provided for interface compatibility with rate calculators that record
         state. sfrxUSD's rate is stateless, so this returns exactly the same value
         as `rate()` and writes nothing.
    @return rate Yield per second, scaled by 1e18
    """
    return self._rate()
```

</SourceCode>

Other calculators do keep state. The `SyrupUSDCRateCalculator` used by the syrupUSDC/crvUSD market derives the yield from the growth of the vault's price per share: each `rate_w()` call stores a new price-per-share record once a day has passed since the last one (up to 7 records), and the rate is the growth between the oldest and newest record divided by the time between them. Until two records exist it reports `0`.

:::

Each calculator is specific to one collateral token and is fixed for the lifetime of the policy. To switch to a different calculator, a new policy must be deployed and set on the market through the [`Configurator`](./configurator.md).

### Utilization

Utilization is the share of the market's lendable funds that is currently borrowed. It is read from the bound controller:

$$u = \frac{\text{total\_debt}}{\text{available\_balance} + \text{total\_debt} - \text{admin\_fees}}$$

The result is capped at $1$ ($10^{18}$). If the denominator is zero, utilization is $0$.

### Borrow Rate

The borrow rate is a hyperbola in $u$, scaled by the target rate $r_0$ and shifted by a constant:

$$r(u) = r_0 \cdot \left(r_{-\infty} + \frac{A}{u_{\infty} - u}\right) + \text{rate\_shift}$$

The three curve coefficients are derived from three intuitive inputs so that the curve passes through three fixed points:

| Utilization | Rate (before `rate_shift`) | Set by |
| :---------: | :------------------------: | ------ |
| $0$ | $\alpha \cdot r_0$ | `low_ratio` ($\alpha$) |
| $u_0$ | $r_0$ | `target_utilization` ($u_0$) |
| $1$ | $\beta \cdot r_0$ | `high_ratio` ($\beta$) |

Solving for the coefficients gives:

$$u_{\infty} = \frac{(\beta - 1) \cdot u_0}{(\beta - 1) \cdot u_0 - (1 - u_0) \cdot (1 - \alpha)}$$

$$A = (1 - \alpha) \cdot \frac{u_{\infty} \cdot (u_{\infty} - u_0)}{u_0}$$

$$r_{-\infty} = \alpha - \frac{A}{u_{\infty}}$$

- $u_{\infty}$ (`u_inf`) is the utilization at which the hyperbola diverges. It must be strictly above $1$, so the rate stays finite over the whole range $0 \le u \le 1$.
- $A$ (`A`) controls how sharply the curve bends.
- $r_{-\infty}$ (`r_minf`) is the rate multiplier the curve approaches as $u \to -\infty$. It can be negative.

The resulting rate is never negative. In the unexpected case that the computation yields a negative number, it is clamped to $0$ instead of reverting.

:::example[Example: sfrxUSD/crvUSD]

The sfrxUSD/crvUSD market was deployed with `target_utilization = 0.9`, `low_ratio = 0.5`, `high_ratio = 5` and `rate_shift = 0`. This gives $u_{\infty} \approx 1.0141$, $A \approx 0.0643$ and $r_{-\infty} \approx 0.4366$. The borrow rate as a multiple of the sfrxUSD yield is then:

| Utilization | Multiple of collateral yield |
| :---------: | :--------------------------: |
| 0% | 0.50x |
| 50% | 0.56x |
| 80% | 0.74x |
| 90% | 1.00x |
| 95% | 1.44x |
| 99% | 3.11x |
| 100% | 5.00x |

:::

### Parameter Bounds

`set_parameters` and the constructor validate all inputs:

| Parameter | Bounds |
| --------- | ------ |
| `target_utilization` | $10^{16} \le u_0 \le 99 \cdot 10^{16}$ (1% to 99%) |
| `low_ratio` | $10^{16} \le \alpha < 10^{18}$ (0.01x to below 1x) |
| `high_ratio` | $10^{18} < \beta \le 100 \cdot 10^{18}$ (above 1x to 100x) |
| `rate_shift` | $\le 100 \cdot 10^{18}$ |

In addition, the combination of inputs must describe a valid curve. A call reverts with `"invalid curve"` if $(\beta - 1) \cdot u_0 < (1 - u_0) \cdot (1 - \alpha) + 10^{-18}$ and with `"u_inf <= 100%"` if the resulting $u_{\infty}$ does not sit strictly above $1$.

Independently of the policy, the controller caps the rate it applies at its own `MAX_RATE`.

---

## Interest Rates

### `rate`
::::description[`HyperbolicDynamicMP.rate() -> uint256: view`]

Getter for the current borrow rate per second, based on the current utilization of the bound controller and the current target rate from the rate calculator.

Returns: current borrow rate per second (`uint256`).

<SourceCode>

```vyper
@view
@external
def rate() -> uint256:
    """
    @notice View function to compute the current borrow rate
    @return rate Computed interest rate
    """
    return self._calculate_rate(0, 0, self._target_rate())


@internal
@view
def _target_rate() -> uint256:
    """
    @notice Reads the current base rate from the rate calculator, clamped to bounds
    @return rate Rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    raw_result: Bytes[32] = empty(Bytes[32])
    success: bool = False

    success, raw_result = raw_call(
        RATE_CALCULATOR.address,
        method_id("rate()"),
        max_outsize=32,
        is_static_call=True,
        revert_on_failure=False
    )

    r: uint256 = 0
    if success and len(raw_result) > 0:
        r = convert(raw_result, uint256)

    return min(max(r, MIN_TARGET_RATE), MAX_TARGET_RATE)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256, _r0: uint256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @param _r0 Base rate
    @return rate Final rate based on utilization
    """
    p: IHyperbolicDynamicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(_r0, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * _r0 // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is _r0*low_ratio/WAD + rate_shift > 0). Clamp rather than revert so an
    # unforeseen edge case can never brick the Controller's rate_write.
    return convert(max(rate, 0), uint256)


@internal
@view
def _get_utilization(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes market utilization under simulated reserve/debt changes
    @dev Both guards are for future_rate() calls only
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return u Utilization ratio (total_debt / total_reserves) scaled and capped by 1e18
    """
    total_debt: int256 = convert(staticcall CONTROLLER.total_debt(), int256)
    total_reserves: int256 = (
        convert(staticcall CONTROLLER.available_balance(), int256)
        + total_debt
        - convert(staticcall CONTROLLER.admin_fees(), int256)
        + _d_reserves
    )
    total_debt += _d_debt
    # CONTROLLER.total_debt() is a uint256, so the sum can only go negative if _d_debt does
    if _d_debt < 0:
        assert total_debt >= 0, "Negative debt"
    # Only an action that takes liquidity out (_d_reserves < 0) or draws on it
    # (_d_debt > 0) can over-draw the market -- see @dev above before unguarding
    if _d_reserves < 0 or _d_debt > 0:
        assert total_reserves >= total_debt, "Reserves too small"

    u: uint256 = 0
    if total_reserves > 0:
        u = convert(total_debt * SWAD // total_reserves, uint256)

    return min(u, WAD)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function rate() view returns (uint256)"]}
  method="rate"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

### `future_rate`
::::description[`HyperbolicDynamicMP.future_rate(_d_reserves: int256, _d_debt: int256) -> uint256: view`]

Function to estimate the borrow rate after a hypothetical change in the market's reserves and debt, using the current target rate. This is useful for previewing the rate after a deposit, withdrawal, borrow or repayment. Reserves are the total lendable funds (idle balance plus outstanding debt, net of admin fees), so a deposit of `x` is `_d_reserves = x`, a withdrawal is `_d_reserves = -x`, a new borrow is `_d_debt = x` and a repayment is `_d_debt = -x`.

The call reverts with `"Negative debt"` if a negative `_d_debt` exceeds the current debt, and with `"Reserves too small"` if a withdrawal (`_d_reserves < 0`) or a borrow (`_d_debt > 0`) would leave less reserves than debt.

| Input         | Type     | Description                                |
| ------------- | -------- | ------------------------------------------ |
| `_d_reserves` | `int256` | Simulated change in reserves               |
| `_d_debt`     | `int256` | Simulated change in debt                   |

Returns: estimated borrow rate per second (`uint256`).

<SourceCode>

```vyper
@view
@external
def future_rate(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice View function to estimate future rate under reserve/debt changes
    @param _d_reserves Simulated reserve change
    @param _d_debt Simulated debt change
    @return rate Estimated future rate
    """
    return self._calculate_rate(_d_reserves, _d_debt, self._target_rate())


@internal
@view
def _target_rate() -> uint256:
    """
    @notice Reads the current base rate from the rate calculator, clamped to bounds
    @return rate Rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    raw_result: Bytes[32] = empty(Bytes[32])
    success: bool = False

    success, raw_result = raw_call(
        RATE_CALCULATOR.address,
        method_id("rate()"),
        max_outsize=32,
        is_static_call=True,
        revert_on_failure=False
    )

    r: uint256 = 0
    if success and len(raw_result) > 0:
        r = convert(raw_result, uint256)

    return min(max(r, MIN_TARGET_RATE), MAX_TARGET_RATE)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256, _r0: uint256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @param _r0 Base rate
    @return rate Final rate based on utilization
    """
    p: IHyperbolicDynamicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(_r0, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * _r0 // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is _r0*low_ratio/WAD + rate_shift > 0). Clamp rather than revert so an
    # unforeseen edge case can never brick the Controller's rate_write.
    return convert(max(rate, 0), uint256)


@internal
@view
def _get_utilization(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes market utilization under simulated reserve/debt changes
    @dev Both guards are for future_rate() calls only
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return u Utilization ratio (total_debt / total_reserves) scaled and capped by 1e18
    """
    total_debt: int256 = convert(staticcall CONTROLLER.total_debt(), int256)
    total_reserves: int256 = (
        convert(staticcall CONTROLLER.available_balance(), int256)
        + total_debt
        - convert(staticcall CONTROLLER.admin_fees(), int256)
        + _d_reserves
    )
    total_debt += _d_debt
    # CONTROLLER.total_debt() is a uint256, so the sum can only go negative if _d_debt does
    if _d_debt < 0:
        assert total_debt >= 0, "Negative debt"
    # Only an action that takes liquidity out (_d_reserves < 0) or draws on it
    # (_d_debt > 0) can over-draw the market -- see @dev above before unguarding
    if _d_reserves < 0 or _d_debt > 0:
        assert total_reserves >= total_debt, "Reserves too small"

    u: uint256 = 0
    if total_reserves > 0:
        u = convert(total_debt * SWAD // total_reserves, uint256)

    return min(u, WAD)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function future_rate(int256, int256) view returns (uint256)"]}
  method="future_rate"
  args={["0", "0"]}
  labels={["_d_reserves", "_d_debt"]}
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

### `rate_write`
::::description[`HyperbolicDynamicMP.rate_write() -> uint256`]

:::guard[Guarded Method]
This function is only callable by the `CONTROLLER` the policy is bound to. The controller calls it whenever it saves a new rate to its AMM.
:::

Returns the current borrow rate per second. This is the entry point used by the controller. Unlike [`rate`](#rate), it reads the target rate through the calculator's state-changing `rate_w()` method, so that a stateful rate calculator can record a fresh sample. The policy itself stores nothing.

Returns: current borrow rate per second (`uint256`).

<SourceCode>

```vyper
@external
def rate_write() -> uint256:
    """
    @notice Records a fresh sample from the rate calculator and returns current rate
    @return rate Updated rate
    """
    assert CONTROLLER.address == msg.sender, "Controller only"
    return self._calculate_rate(0, 0, self._target_rate_w())


@internal
def _target_rate_w() -> uint256:
    """
    @notice Mutating variant of `_target_rate`: calls the calculator's `rate_w` so a
            stateful calculator can record a fresh sample, then clamps the result
    @dev Uses a non-reverting call so a failing rate calculator cannot brick the
         Controller's `rate_write`; on failure it falls back to a rate of 0 (clamped
         up to MIN_TARGET_RATE).
    @return rate Current rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    raw_result: Bytes[32] = empty(Bytes[32])
    success: bool = False

    success, raw_result = raw_call(
        RATE_CALCULATOR.address,
        method_id("rate_w()"),
        max_outsize=32,
        revert_on_failure=False
    )

    r: uint256 = 0
    if success and len(raw_result) > 0:
        r = convert(raw_result, uint256)

    return min(max(r, MIN_TARGET_RATE), MAX_TARGET_RATE)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256, _r0: uint256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @param _r0 Base rate
    @return rate Final rate based on utilization
    """
    p: IHyperbolicDynamicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(_r0, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * _r0 // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is _r0*low_ratio/WAD + rate_shift > 0). Clamp rather than revert so an
    # unforeseen edge case can never brick the Controller's rate_write.
    return convert(max(rate, 0), uint256)


@internal
@view
def _get_utilization(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes market utilization under simulated reserve/debt changes
    @dev Both guards are for future_rate() calls only
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return u Utilization ratio (total_debt / total_reserves) scaled and capped by 1e18
    """
    total_debt: int256 = convert(staticcall CONTROLLER.total_debt(), int256)
    total_reserves: int256 = (
        convert(staticcall CONTROLLER.available_balance(), int256)
        + total_debt
        - convert(staticcall CONTROLLER.admin_fees(), int256)
        + _d_reserves
    )
    total_debt += _d_debt
    # CONTROLLER.total_debt() is a uint256, so the sum can only go negative if _d_debt does
    if _d_debt < 0:
        assert total_debt >= 0, "Negative debt"
    # Only an action that takes liquidity out (_d_reserves < 0) or draws on it
    # (_d_debt > 0) can over-draw the market -- see @dev above before unguarding
    if _d_reserves < 0 or _d_debt > 0:
        assert total_reserves >= total_debt, "Reserves too small"

    u: uint256 = 0
    if total_reserves > 0:
        u = convert(total_debt * SWAD // total_reserves, uint256)

    return min(u, WAD)
```

</SourceCode>

<Example>

```shell
>>> HyperbolicDynamicMP.rate_write()
```

</Example>

::::

### `target_rate`
::::description[`HyperbolicDynamicMP.target_rate() -> uint256: view`]

Getter for the current target rate per second, i.e. the borrow rate at target utilization (before `rate_shift`). This is the rate reported by the rate calculator, clamped to the range `[317097920, 47564687975]` (about 1% to 150% APR).

Returns: clamped target rate per second (`uint256`).

<SourceCode>

```vyper
@external
@view
def target_rate() -> uint256:
    """
    @notice View function to get the clamped per-second base rate
    @return rate The base rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    return self._target_rate()


@internal
@view
def _target_rate() -> uint256:
    """
    @notice Reads the current base rate from the rate calculator, clamped to bounds
    @return rate Rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    raw_result: Bytes[32] = empty(Bytes[32])
    success: bool = False

    success, raw_result = raw_call(
        RATE_CALCULATOR.address,
        method_id("rate()"),
        max_outsize=32,
        is_static_call=True,
        revert_on_failure=False
    )

    r: uint256 = 0
    if success and len(raw_result) > 0:
        r = convert(raw_result, uint256)

    return min(max(r, MIN_TARGET_RATE), MAX_TARGET_RATE)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function target_rate() view returns (uint256)"]}
  method="target_rate"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

### `target_apr`
::::description[`HyperbolicDynamicMP.target_apr() -> uint256: view`]

Getter for the annualized target rate, i.e. the borrow APR at target utilization (before `rate_shift`). It is computed as the clamped target rate multiplied by `365 * 86400`, so `5 * 10**16` corresponds to 5% APR.

Returns: annualized target rate (`uint256`).

<SourceCode>

```vyper
@external
@view
def target_apr() -> uint256:
    """
    @notice View function to get the annualized clamped base rate (APR)
    @return apr The clamped base rate annualized
    """
    return self._target_rate() * (365 * 86400)


@internal
@view
def _target_rate() -> uint256:
    """
    @notice Reads the current base rate from the rate calculator, clamped to bounds
    @return rate Rate, clamped to [MIN_TARGET_RATE, MAX_TARGET_RATE]
    """
    raw_result: Bytes[32] = empty(Bytes[32])
    success: bool = False

    success, raw_result = raw_call(
        RATE_CALCULATOR.address,
        method_id("rate()"),
        max_outsize=32,
        is_static_call=True,
        revert_on_failure=False
    )

    r: uint256 = 0
    if success and len(raw_result) > 0:
        r = convert(raw_result, uint256)

    return min(max(r, MIN_TARGET_RATE), MAX_TARGET_RATE)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function target_apr() view returns (uint256)"]}
  method="target_apr"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

---

## Parameters

### `parameters`
::::description[`HyperbolicDynamicMP.parameters() -> Parameters: view`]

Getter for the current curve parameters. The struct holds both the three derived coefficients used in the rate formula and the inputs they were computed from. The target rate is not part of the struct, as it is read from the rate calculator.

Returns: `Parameters` struct (`tuple`) containing:

| Field                | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| `u_inf`              | `uint256` | Utilization at which the curve diverges (always above `1e18`) |
| `A`                  | `uint256` | Curvature coefficient                                         |
| `r_minf`             | `int256`  | Rate multiplier the curve approaches for very low utilization |
| `target_utilization` | `uint256` | Utilization at which the rate equals the target rate          |
| `low_ratio`          | `uint256` | Multiplier on the target rate at 0% utilization               |
| `high_ratio`         | `uint256` | Multiplier on the target rate at 100% utilization             |
| `rate_shift`         | `uint256` | Constant rate per second added on top of the curve            |

<SourceCode>

<Tabs>
<TabItem value="HyperbolicDynamicMP.vy" label="HyperbolicDynamicMP.vy">

```vyper
parameters: public(IHyperbolicDynamicMP.Parameters)
```

</TabItem>
<TabItem value="IHyperbolicDynamicMP.vyi" label="IHyperbolicDynamicMP.vyi">

```vyper
struct Parameters:
    u_inf: uint256
    A: uint256
    r_minf: int256
    target_utilization: uint256
    low_ratio: uint256
    high_ratio: uint256
    rate_shift: uint256
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function parameters() view returns (tuple(uint256 u_inf, uint256 A, int256 r_minf, uint256 target_utilization, uint256 low_ratio, uint256 high_ratio, uint256 rate_shift))"]}
  method="parameters"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

### `set_parameters`
::::description[`HyperbolicDynamicMP.set_parameters(_target_utilization: uint256, _low_ratio: uint256, _high_ratio: uint256, _rate_shift: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `admin` of the factory the bound controller was deployed from (`CONTROLLER.factory().admin()`). The factory admin is the Curve DAO, so changing the rate curve of a market requires a successful DAO vote.
:::

Function to set a new rate curve. All four inputs are replaced at once; the derived coefficients `u_inf`, `A` and `r_minf` are recomputed and stored. Inputs must be within the [parameter bounds](#parameter-bounds), otherwise the call reverts. The target rate cannot be set, as it always comes from the rate calculator.

| Input                 | Type      | Description                                                   |
| --------------------- | --------- | ------------------------------------------------------------- |
| `_target_utilization` | `uint256` | Utilization at which the rate equals the target rate          |
| `_low_ratio`          | `uint256` | Multiplier on the target rate at 0% utilization               |
| `_high_ratio`         | `uint256` | Multiplier on the target rate at 100% utilization             |
| `_rate_shift`         | `uint256` | Constant rate per second added on top of the curve            |

Emits: `SetParameters` event.

<SourceCode>

```vyper
@external
def set_parameters(
    _target_utilization: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Admin function to change curve parameters
    @param _target_utilization Target utilization where rate = base
    @param _low_ratio Ratio of rate/base at 0% utilization
    @param _high_ratio Ratio of rate/base at 100% utilization
    @param _rate_shift Constant shift on the curve
    """
    assert msg.sender == staticcall (staticcall CONTROLLER.factory()).admin(), "Not factory admin"

    self._set_parameters(_target_utilization, _low_ratio, _high_ratio, _rate_shift)


@internal
def _set_parameters(
    _target_utilization: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Validates, computes and stores the rate curve parameters
    @dev Shared by the constructor and set_parameters; performs no access control
    @param _target_utilization Target utilization where rate = base
    @param _low_ratio Ratio of rate/base at 0% utilization
    @param _high_ratio Ratio of rate/base at 100% utilization
    @param _rate_shift Constant shift on the curve
    """
    assert _target_utilization >= MIN_TARGET_UTIL, "target_utilization too low"
    assert _target_utilization <= MAX_TARGET_UTIL, "target_utilization too high"
    assert _low_ratio >= MIN_LOW_RATIO, "low_ratio too low"
    assert _low_ratio < WAD, "low_ratio too high"
    assert _high_ratio > WAD, "high_ratio too low"
    assert _high_ratio <= MAX_HIGH_RATIO, "high_ratio too high"
    assert _rate_shift <= MAX_RATE_SHIFT, "rate_shift too high"

    p: IHyperbolicDynamicMP.Parameters = self._get_params(_target_utilization, _low_ratio, _high_ratio, _rate_shift)
    self.parameters = p

    log IHyperbolicDynamicMP.SetParameters(
        u_inf=p.u_inf,
        A=p.A,
        r_minf=p.r_minf,
        target_utilization=p.target_utilization,
        low_ratio=p.low_ratio,
        high_ratio=p.high_ratio,
        rate_shift=p.rate_shift,
    )


@internal
@pure
def _get_params(_u_0: uint256, _alpha: uint256, _beta: uint256, _rate_shift: uint256) -> IHyperbolicDynamicMP.Parameters:
    """
    @notice Computes the internal rate curve parameters
    @param _u_0 Target utilization
    @param _alpha Low-end ratio
    @param _beta High-end ratio
    @return p Struct containing computed parameters (shift is set by the caller)
    """
    p: IHyperbolicDynamicMP.Parameters = empty(IHyperbolicDynamicMP.Parameters)

    numerator: uint256 = (_beta - WAD) * _u_0
    subtrahend: uint256 = (WAD - _u_0) * (WAD - _alpha)
    # We need numerator >= subtrahend + WAD, not just numerator > subtrahend
    # to prevent A and r_minf computations overflow.
    assert numerator >= subtrahend + WAD, "invalid curve"

    p.u_inf = numerator * WAD // (numerator - subtrahend)
    # u_inf is the rate curve's utilization asymptote; it must sit strictly above
    # 100%, else the rate diverges (and p.u_inf - u underflows) as u approaches WAD.
    # Integer flooring can collapse u_inf to exactly WAD even when inner >= WAD.
    assert p.u_inf > WAD, "u_inf <= 100%"
    p.A = (WAD - _alpha) * p.u_inf // WAD * (p.u_inf - _u_0) // _u_0
    p.r_minf = convert(_alpha, int256) - convert(p.A * WAD // p.u_inf, int256)
    p.target_utilization = _u_0
    p.low_ratio = _alpha
    p.high_ratio = _beta
    p.rate_shift = _rate_shift
    return p
```

</SourceCode>

<Example>

This example sets a curve with 90% target utilization, 0.5x of the target rate at 0% utilization and 5x at 100% utilization.

```shell
>>> HyperbolicDynamicMP.set_parameters(900000000000000000, 500000000000000000, 5000000000000000000, 0)
```

</Example>

::::

---

## Contract Info Methods

### `CONTROLLER`
::::description[`HyperbolicDynamicMP.CONTROLLER() -> address: view`]

Getter for the controller this policy is bound to. The address is set at deployment and cannot be changed. It is the only address allowed to call [`rate_write`](#rate_write), and its debt and balances are used to compute utilization.

Returns: controller address (`address`).

<SourceCode>

```vyper
CONTROLLER: public(immutable(IController))

@deploy
def __init__(
    _controller: IController,
    _rate_calculator: IRateCalculator,
    _target_utilization: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Initializes the monetary policy with given parameters
    @param _controller Address of the market's controller contract (for access control)
    @param _rate_calculator Address of the external rate calculator (e.g. for sfrxUSD)
    @param _target_utilization Utilization (0–1e18) where borrow rate equals base rate
    @param _low_ratio Multiplier on base rate at 0% utilization (≥1e16)
    @param _high_ratio Multiplier on base rate at 100% utilization (≤100e18)
    @param _rate_shift Flat shift to apply to the resulting rate curve (can be 0)
    """
    CONTROLLER = _controller
    RATE_CALCULATOR = _rate_calculator

    self._set_parameters(_target_utilization, _low_ratio, _high_ratio, _rate_shift)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function CONTROLLER() view returns (address)"]}
  method="CONTROLLER"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::

### `RATE_CALCULATOR`
::::description[`HyperbolicDynamicMP.RATE_CALCULATOR() -> address: view`]

Getter for the rate calculator that provides the target rate. The address is set at deployment and cannot be changed.

Returns: rate calculator address (`address`).

<SourceCode>

```vyper
RATE_CALCULATOR: public(immutable(IRateCalculator))

@deploy
def __init__(
    _controller: IController,
    _rate_calculator: IRateCalculator,
    _target_utilization: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Initializes the monetary policy with given parameters
    @param _controller Address of the market's controller contract (for access control)
    @param _rate_calculator Address of the external rate calculator (e.g. for sfrxUSD)
    @param _target_utilization Utilization (0–1e18) where borrow rate equals base rate
    @param _low_ratio Multiplier on base rate at 0% utilization (≥1e16)
    @param _high_ratio Multiplier on base rate at 100% utilization (≤100e18)
    @param _rate_shift Flat shift to apply to the resulting rate curve (can be 0)
    """
    CONTROLLER = _controller
    RATE_CALCULATOR = _rate_calculator

    self._set_parameters(_target_utilization, _low_ratio, _high_ratio, _rate_shift)
```

</SourceCode>

<Example>

<ContractCall
  address="0xfF9b210877F122b0cd301DB6DFaD30597e64950a"
  abi={["function RATE_CALCULATOR() view returns (address)"]}
  method="RATE_CALCULATOR"
  contractName="HyperbolicDynamicMP"
/>

</Example>

::::
