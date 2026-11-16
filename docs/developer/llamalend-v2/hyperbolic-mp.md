# HyperbolicMP

`HyperbolicMP` is a utilization-based monetary policy for Llamalend v2 markets. The borrow rate follows a hyperbolic curve around a **fixed target rate**: at the target utilization, borrowers pay exactly the target rate; below it they pay a discounted rate, and above it the rate rises steeply towards full utilization. The target rate is set at deployment and can only be changed by governance, which makes this policy the default choice for markets where a static base rate is desired.

Each market has its own `HyperbolicMP` instance. The policy is bound to a single controller at deployment (`CONTROLLER`), reads that controller's debt and reserves to compute utilization, and only accepts `rate_write` calls from it. For collateral whose borrow rate should track an external yield instead of a fixed number, see [`HyperbolicDynamicMP`](./hyperbolic-dynamic-mp.md).

:::vyper[`HyperbolicMP.vy`]

The source code for the `HyperbolicMP.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/81b3bea490e9b45221c82e78387920ccfeb05b33/curve_stablecoin/mpolicies/v2/HyperbolicMP.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed once per market. On :logos-ethereum: Ethereum, the following markets use it:

- wOUSD/crvUSD: [`0x4E7d5c1af3E1a52de689C050900aa0421396BcBA`](https://etherscan.io/address/0x4E7d5c1af3E1a52de689C050900aa0421396BcBA)
- wstGBP/crvUSD: [`0xA3AF6D0F8D23638912398d8D283a1deEF9B3410d`](https://etherscan.io/address/0xA3AF6D0F8D23638912398d8D283a1deEF9B3410d)
- reUSD/sfrxUSD LP/crvUSD: [`0x409ADA6A10145a88abCEAbAC0a820B28EB4C2f13`](https://etherscan.io/address/0x409ADA6A10145a88abCEAbAC0a820B28EB4C2f13)
- svZCHF/crvUSD: [`0x547De3c2E2960Cc7879EE6626F2763cbc24d4921`](https://etherscan.io/address/0x547De3c2E2960Cc7879EE6626F2763cbc24d4921)

The policy currently used by any market can be read from its controller with `LendController.monetary_policy()`.

<ContractABI>

```json
[{"name":"SetParameters","inputs":[{"name":"u_inf","type":"uint256","indexed":false},{"name":"A","type":"uint256","indexed":false},{"name":"r_minf","type":"int256","indexed":false},{"name":"target_utilization","type":"uint256","indexed":false},{"name":"target_rate","type":"uint256","indexed":false},{"name":"low_ratio","type":"uint256","indexed":false},{"name":"high_ratio","type":"uint256","indexed":false},{"name":"rate_shift","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"view","type":"function","name":"target_apr","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"rate","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"rate_write","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"set_parameters","inputs":[{"name":"_target_utilization","type":"uint256"},{"name":"_target_rate","type":"uint256"},{"name":"_low_ratio","type":"uint256"},{"name":"_high_ratio","type":"uint256"},{"name":"_rate_shift","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"future_rate","inputs":[{"name":"_d_reserves","type":"int256"},{"name":"_d_debt","type":"int256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"CONTROLLER","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"parameters","inputs":[],"outputs":[{"name":"","type":"tuple","components":[{"name":"u_inf","type":"uint256"},{"name":"A","type":"uint256"},{"name":"r_minf","type":"int256"},{"name":"target_utilization","type":"uint256"},{"name":"target_rate","type":"uint256"},{"name":"low_ratio","type":"uint256"},{"name":"high_ratio","type":"uint256"},{"name":"rate_shift","type":"uint256"}]}]},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_controller","type":"address"},{"name":"_target_utilization","type":"uint256"},{"name":"_target_rate","type":"uint256"},{"name":"_low_ratio","type":"uint256"},{"name":"_high_ratio","type":"uint256"},{"name":"_rate_shift","type":"uint256"}],"outputs":[]}]
```

</ContractABI>

:::

---

## Rate Curve

All rates are **per second**, scaled by $10^{18}$. The annualized rate (APR) is the per-second rate multiplied by $365 \cdot 86400$.

### Utilization

Utilization is the share of the market's lendable funds that is currently borrowed. It is read from the bound controller:

$$u = \frac{\text{total\_debt}}{\text{available\_balance} + \text{total\_debt} - \text{admin\_fees}}$$

The result is capped at $1$ ($10^{18}$). If the denominator is zero, utilization is $0$.

### Borrow Rate

The borrow rate is a hyperbola in $u$, scaled by the target rate $r_0$ and shifted by a constant:

$$r(u) = r_0 \cdot \left(r_{-\infty} + \frac{A}{u_{\infty} - u}\right) + \text{rate\_shift}$$

The three curve coefficients are not set directly. They are derived from three intuitive inputs so that the curve passes through three fixed points:

| Utilization | Rate (before `rate_shift`) | Set by |
| :---------: | :------------------------: | ------ |
| $0$ | $\alpha \cdot r_0$ | `low_ratio` ($\alpha$) |
| $u_0$ | $r_0$ | `target_utilization` ($u_0$), `target_rate` ($r_0$) |
| $1$ | $\beta \cdot r_0$ | `high_ratio` ($\beta$) |

Solving for the coefficients gives:

$$u_{\infty} = \frac{(\beta - 1) \cdot u_0}{(\beta - 1) \cdot u_0 - (1 - u_0) \cdot (1 - \alpha)}$$

$$A = (1 - \alpha) \cdot \frac{u_{\infty} \cdot (u_{\infty} - u_0)}{u_0}$$

$$r_{-\infty} = \alpha - \frac{A}{u_{\infty}}$$

- $u_{\infty}$ (`u_inf`) is the utilization at which the hyperbola diverges. It must be strictly above $1$, so the rate stays finite over the whole range $0 \le u \le 1$.
- $A$ (`A`) controls how sharply the curve bends.
- $r_{-\infty}$ (`r_minf`) is the rate multiplier the curve approaches as $u \to -\infty$. It can be negative.

The resulting rate is never negative. In the unexpected case that the computation yields a negative number, it is clamped to $0$ instead of reverting, so that a controller can never be bricked by its monetary policy.

:::example[Example: wOUSD/crvUSD]

The wOUSD/crvUSD market was deployed with `target_utilization = 0.9`, `target_rate = 1585489599` (5% APR), `low_ratio = 0.5`, `high_ratio = 5` and `rate_shift = 0`. This gives $u_{\infty} \approx 1.0141$, $A \approx 0.0643$ and $r_{-\infty} \approx 0.4366$, and the following borrow rates:

| Utilization | Multiple of target rate | Borrow APR |
| :---------: | :---------------------: | :--------: |
| 0% | 0.50x | 2.50% |
| 50% | 0.56x | 2.81% |
| 80% | 0.74x | 3.68% |
| 90% | 1.00x | 5.00% |
| 95% | 1.44x | 7.20% |
| 99% | 3.11x | 15.53% |
| 100% | 5.00x | 25.00% |

:::

### Parameter Bounds

`set_parameters` and the constructor validate all inputs:

| Parameter | Bounds |
| --------- | ------ |
| `target_utilization` | $10^{16} \le u_0 \le 99 \cdot 10^{16}$ (1% to 99%) |
| `target_rate` | $317097920 \le r_0 \le 47564687975$ (about 1% to 150% APR) |
| `low_ratio` | $10^{16} \le \alpha < 10^{18}$ (0.01x to below 1x) |
| `high_ratio` | $10^{18} < \beta \le 100 \cdot 10^{18}$ (above 1x to 100x) |
| `rate_shift` | $\le 100 \cdot 10^{18}$ |

In addition, the combination of inputs must describe a valid curve. A call reverts with `"invalid curve"` if $(\beta - 1) \cdot u_0 < (1 - u_0) \cdot (1 - \alpha) + 10^{-18}$ and with `"u_inf <= 100%"` if the resulting $u_{\infty}$ does not sit strictly above $1$.

Independently of the policy, the controller caps the rate it applies at its own `MAX_RATE`.

---

## Interest Rates

### `rate`
::::description[`HyperbolicMP.rate() -> uint256: view`]

Getter for the current borrow rate per second, based on the current utilization of the bound controller.

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
    return self._calculate_rate(0, 0)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return rate Final rate based on utilization
    """
    p: IHyperbolicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(p.target_rate, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * p.target_rate // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is target_rate*low_ratio/WAD + rate_shift > 0). Clamp rather than revert
    # so an unforeseen edge case can never brick the Controller's rate_write.
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
  address="0x4E7d5c1af3E1a52de689C050900aa0421396BcBA"
  abi={["function rate() view returns (uint256)"]}
  method="rate"
  contractName="HyperbolicMP"
/>

</Example>

::::

### `future_rate`
::::description[`HyperbolicMP.future_rate(_d_reserves: int256, _d_debt: int256) -> uint256: view`]

Function to estimate the borrow rate after a hypothetical change in the market's reserves and debt. This is useful for previewing the rate after a deposit, withdrawal, borrow or repayment. Reserves are the total lendable funds (idle balance plus outstanding debt, net of admin fees), so a deposit of `x` is `_d_reserves = x`, a withdrawal is `_d_reserves = -x`, a new borrow is `_d_debt = x` and a repayment is `_d_debt = -x`.

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
    return self._calculate_rate(_d_reserves, _d_debt)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return rate Final rate based on utilization
    """
    p: IHyperbolicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(p.target_rate, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * p.target_rate // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is target_rate*low_ratio/WAD + rate_shift > 0). Clamp rather than revert
    # so an unforeseen edge case can never brick the Controller's rate_write.
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
  address="0x4E7d5c1af3E1a52de689C050900aa0421396BcBA"
  abi={["function future_rate(int256, int256) view returns (uint256)"]}
  method="future_rate"
  args={["0", "0"]}
  labels={["_d_reserves", "_d_debt"]}
  contractName="HyperbolicMP"
/>

</Example>

::::

### `rate_write`
::::description[`HyperbolicMP.rate_write() -> uint256`]

:::guard[Guarded Method]
This function is only callable by the `CONTROLLER` the policy is bound to. The controller calls it whenever it saves a new rate to its AMM.
:::

Returns the current borrow rate per second. This is the entry point used by the controller. Because the target rate of this policy is static, no state is updated and the returned value is identical to [`rate`](#rate).

Returns: current borrow rate per second (`uint256`).

<SourceCode>

```vyper
@external
def rate_write() -> uint256:
    """
    @notice Returns the current rate (Controller entrypoint; no state is updated for a static policy)
    @return rate Current rate
    """
    assert CONTROLLER.address == msg.sender, "Controller only"
    return self._calculate_rate(0, 0)


@internal
@view
def _calculate_rate(_d_reserves: int256, _d_debt: int256) -> uint256:
    """
    @notice Computes dynamic interest rate based on utilization
    @param _d_reserves Change in reserves (simulated)
    @param _d_debt Change in debt (simulated)
    @return rate Final rate based on utilization
    """
    p: IHyperbolicMP.Parameters = self.parameters
    u: uint256 = self._get_utilization(_d_reserves, _d_debt)
    a: int256 = convert(p.target_rate, int256) * p.r_minf // SWAD
    b: int256 = convert(p.A * p.target_rate // (p.u_inf - u), int256)
    rate_shift: int256 = convert(p.rate_shift, int256)
    rate: int256 = a + b + rate_shift
    # A sub-zero rate is unreachable under the validated curve (the minimum, at
    # u=0, is target_rate*low_ratio/WAD + rate_shift > 0). Clamp rather than revert
    # so an unforeseen edge case can never brick the Controller's rate_write.
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
>>> HyperbolicMP.rate_write()
```

</Example>

::::

### `target_apr`
::::description[`HyperbolicMP.target_apr() -> uint256: view`]

Getter for the annualized target rate, i.e. the borrow APR at target utilization (before `rate_shift`). It is computed as `target_rate * 365 * 86400`, so `5 * 10**16` corresponds to 5% APR.

Returns: annualized target rate (`uint256`).

<SourceCode>

```vyper
@external
@view
def target_apr() -> uint256:
    """
    @notice View function to get the annualized target rate (APR)
    @return apr The target rate annualized
    """
    return self.parameters.target_rate * (365 * 86400)
```

</SourceCode>

<Example>

<ContractCall
  address="0x4E7d5c1af3E1a52de689C050900aa0421396BcBA"
  abi={["function target_apr() view returns (uint256)"]}
  method="target_apr"
  contractName="HyperbolicMP"
/>

</Example>

::::

---

## Parameters

### `parameters`
::::description[`HyperbolicMP.parameters() -> Parameters: view`]

Getter for the current curve parameters. The struct holds both the three derived coefficients used in the rate formula and the inputs they were computed from.

Returns: `Parameters` struct (`tuple`) containing:

| Field                | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| `u_inf`              | `uint256` | Utilization at which the curve diverges (always above `1e18`) |
| `A`                  | `uint256` | Curvature coefficient                                         |
| `r_minf`             | `int256`  | Rate multiplier the curve approaches for very low utilization |
| `target_utilization` | `uint256` | Utilization at which the rate equals `target_rate`            |
| `target_rate`        | `uint256` | Rate per second at target utilization                         |
| `low_ratio`          | `uint256` | Multiplier on `target_rate` at 0% utilization                 |
| `high_ratio`         | `uint256` | Multiplier on `target_rate` at 100% utilization               |
| `rate_shift`         | `uint256` | Constant rate per second added on top of the curve            |

<SourceCode>

<Tabs>
<TabItem value="HyperbolicMP.vy" label="HyperbolicMP.vy">

```vyper
parameters: public(IHyperbolicMP.Parameters)
```

</TabItem>
<TabItem value="IHyperbolicMP.vyi" label="IHyperbolicMP.vyi">

```vyper
struct Parameters:
    u_inf: uint256
    A: uint256
    r_minf: int256
    target_utilization: uint256
    target_rate: uint256
    low_ratio: uint256
    high_ratio: uint256
    rate_shift: uint256
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

<ContractCall
  address="0x4E7d5c1af3E1a52de689C050900aa0421396BcBA"
  abi={["function parameters() view returns (tuple(uint256 u_inf, uint256 A, int256 r_minf, uint256 target_utilization, uint256 target_rate, uint256 low_ratio, uint256 high_ratio, uint256 rate_shift))"]}
  method="parameters"
  contractName="HyperbolicMP"
/>

</Example>

::::

### `set_parameters`
::::description[`HyperbolicMP.set_parameters(_target_utilization: uint256, _target_rate: uint256, _low_ratio: uint256, _high_ratio: uint256, _rate_shift: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `admin` of the factory the bound controller was deployed from (`CONTROLLER.factory().admin()`). The factory admin is the Curve DAO, so changing the rate curve of a market requires a successful DAO vote.
:::

Function to set a new rate curve. All five inputs are replaced at once; the derived coefficients `u_inf`, `A` and `r_minf` are recomputed and stored. Inputs must be within the [parameter bounds](#parameter-bounds), otherwise the call reverts. The new curve applies from the next time the controller saves its rate.

| Input                 | Type      | Description                                                   |
| --------------------- | --------- | ------------------------------------------------------------- |
| `_target_utilization` | `uint256` | Utilization at which the rate equals `_target_rate`           |
| `_target_rate`        | `uint256` | Rate per second at target utilization                         |
| `_low_ratio`          | `uint256` | Multiplier on the target rate at 0% utilization               |
| `_high_ratio`         | `uint256` | Multiplier on the target rate at 100% utilization             |
| `_rate_shift`         | `uint256` | Constant rate per second added on top of the curve            |

Emits: `SetParameters` event.

<SourceCode>

```vyper
@external
def set_parameters(
    _target_utilization: uint256,
    _target_rate: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Admin function to change curve parameters
    @param _target_utilization Target utilization where rate = base
    @param _target_rate Fixed base rate per second at target utilization
    @param _low_ratio Ratio of rate/base at 0% utilization
    @param _high_ratio Ratio of rate/base at 100% utilization
    @param _rate_shift Constant shift on the curve
    """
    assert msg.sender == staticcall (staticcall CONTROLLER.factory()).admin(), "Not factory admin"

    self._set_parameters(_target_utilization, _target_rate, _low_ratio, _high_ratio, _rate_shift)


@internal
def _set_parameters(
    _target_utilization: uint256,
    _target_rate: uint256,
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
    assert _target_rate >= MIN_TARGET_RATE, "target_rate too low"
    assert _target_rate <= MAX_TARGET_RATE, "target_rate too high"
    assert _low_ratio >= MIN_LOW_RATIO, "low_ratio too low"
    assert _low_ratio < WAD, "low_ratio too high"
    assert _high_ratio > WAD, "high_ratio too low"
    assert _high_ratio <= MAX_HIGH_RATIO, "high_ratio too high"
    assert _rate_shift <= MAX_RATE_SHIFT, "rate_shift too high"

    p: IHyperbolicMP.Parameters = self._get_params(
        _target_utilization, _target_rate, _low_ratio, _high_ratio, _rate_shift)
    self.parameters = p

    log IHyperbolicMP.SetParameters(
        u_inf=p.u_inf,
        A=p.A,
        r_minf=p.r_minf,
        target_utilization=p.target_utilization,
        target_rate=p.target_rate,
        low_ratio=p.low_ratio,
        high_ratio=p.high_ratio,
        rate_shift=p.rate_shift,
    )


@internal
@pure
def _get_params(_u_0: uint256, _r_0: uint256, _alpha: uint256, _beta: uint256, _rate_shift: uint256) -> IHyperbolicMP.Parameters:
    """
    @notice Computes the internal rate curve parameters
    @param _u_0 Target utilization
    @param _r_0 Fixed target rate per second at target utilization
    @param _alpha Low-end ratio
    @param _beta High-end ratio
    @param _rate_shift Flat shift applied to the resulting rate curve
    @return p Struct containing computed parameters
    """
    p: IHyperbolicMP.Parameters = empty(IHyperbolicMP.Parameters)

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
    p.target_rate = _r_0
    p.low_ratio = _alpha
    p.high_ratio = _beta
    p.rate_shift = _rate_shift
    return p
```

</SourceCode>

<Example>

This example sets a curve with 90% target utilization, a 5% APR target rate, 0.5x of the target rate at 0% utilization and 5x at 100% utilization.

```shell
>>> HyperbolicMP.set_parameters(900000000000000000, 1585489599, 500000000000000000, 5000000000000000000, 0)
```

</Example>

::::

---

## Contract Info Methods

### `CONTROLLER`
::::description[`HyperbolicMP.CONTROLLER() -> address: view`]

Getter for the controller this policy is bound to. The address is set at deployment and cannot be changed. It is the only address allowed to call [`rate_write`](#rate_write), and its debt and balances are used to compute utilization.

Returns: controller address (`address`).

<SourceCode>

```vyper
CONTROLLER: public(immutable(IController))

@deploy
def __init__(
    _controller: IController,
    _target_utilization: uint256,
    _target_rate: uint256,
    _low_ratio: uint256,
    _high_ratio: uint256,
    _rate_shift: uint256
):
    """
    @notice Initializes the monetary policy with given parameters and sets initial EMA rate
    @param _controller Address of the market's controller contract (for access control)
    @param _target_utilization Utilization (0–1e18) where borrow rate equals base rate
    @param _target_rate Fixed base rate per second at target utilization (in [MIN_TARGET_RATE, MAX_TARGET_RATE])
    @param _low_ratio Multiplier on base rate at 0% utilization (≥1e16)
    @param _high_ratio Multiplier on base rate at 100% utilization (≤100e18)
    @param _rate_shift Flat shift to apply to the resulting rate curve (can be 0)
    """
    CONTROLLER = _controller
    self._set_parameters(_target_utilization, _target_rate, _low_ratio, _high_ratio, _rate_shift)
```

</SourceCode>

<Example>

<ContractCall
  address="0x4E7d5c1af3E1a52de689C050900aa0421396BcBA"
  abi={["function CONTROLLER() view returns (address)"]}
  method="CONTROLLER"
  contractName="HyperbolicMP"
/>

</Example>

::::
