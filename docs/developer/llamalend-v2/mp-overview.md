import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# Monetary Policies: Overview

A monetary policy is the contract that determines the **borrow rate** of a Llamalend v2 market. Each market has its own policy instance, which is bound to that market's controller at deployment and computes the rate from the controller's current utilization.

*Currently, there are two kinds of policy contracts in use:*

<DocCardGrid>
  <DocCard title="HyperbolicMP" icon="vyper" link="./hyperbolic-mp" linkText="HyperbolicMP.vy">

Hyperbolic utilization curve around a **fixed target rate** that is set by governance.

  </DocCard>
  <DocCard title="HyperbolicDynamicMP" icon="vyper" link="./hyperbolic-dynamic-mp" linkText="HyperbolicDynamicMP.vy">

The same hyperbolic curve, but the **target rate follows the yield of the collateral**, as reported by an external rate calculator.

  </DocCard>
</DocCardGrid>

---

## Choosing a Policy

Both policies use the same rate curve and differ only in where the target rate comes from.

|                      | `HyperbolicMP` | `HyperbolicDynamicMP` |
| -------------------- | -------------- | --------------------- |
| Target rate          | Fixed value stored in the policy | Read from a rate calculator on every call |
| Changing the target rate | DAO vote (`set_parameters`) | Automatic, follows the collateral's yield |
| Target rate bounds   | About 1% to 150% APR, enforced when set | Clamped to about 1% to 150% APR on every read |
| Extra dependency     | None | One rate calculator per collateral token |
| Intended collateral  | Any | Yield-bearing tokens (e.g. sfrxUSD, sDOLA, syrupUSDC) |
| State written on `rate_write` | None | None in the policy; the rate calculator may record a sample |

For yield-bearing collateral, a fixed target rate would have to be re-tuned by governance each time the yield moves: if borrowing is much cheaper than the yield, the market is fully borrowed, and if it is much more expensive, nobody borrows. `HyperbolicDynamicMP` removes that maintenance by anchoring the borrow rate at target utilization to the yield itself.

---

## Rate Curve

Both policies compute the borrow rate from the market's utilization $u$ with a hyperbolic curve that is scaled by the target rate $r_0$:

$$r(u) = r_0 \cdot \left(r_{-\infty} + \frac{A}{u_{\infty} - u}\right) + \text{rate\_shift}$$

The coefficients $u_{\infty}$, $A$ and $r_{-\infty}$ are derived from three inputs, chosen so that the curve passes through three fixed points:

| Utilization | Rate (before `rate_shift`) | Parameter |
| :---------: | :------------------------: | --------- |
| $0$ | `low_ratio` $\cdot\ r_0$ | `low_ratio` (below 1) |
| `target_utilization` | $r_0$ | `target_utilization` |
| $1$ | `high_ratio` $\cdot\ r_0$ | `high_ratio` (above 1) |

Below target utilization the rate changes slowly, which keeps borrowing cheap while liquidity is plentiful. Above it the rate rises steeply, which pushes borrowers to repay and attracts new lenders before the market runs out of liquidity.

Utilization is the market's debt divided by its total lendable funds:

$$u = \frac{\text{total\_debt}}{\text{available\_balance} + \text{total\_debt} - \text{admin\_fees}}$$

The derivation of the coefficients and the bounds of each parameter are documented on the two contract pages.

---

## Interface

Every v2 monetary policy implements two methods. Both take no arguments, because a policy only ever serves the one controller it is bound to, and both return the borrow rate **per second**, scaled by $10^{18}$:

```vyper
def rate_write() -> uint256:
    ...

@view
def rate() -> uint256:
    ...
```

- `rate()` is the read-only getter, for integrators and user interfaces.
- `rate_write()` is the entry point used by the controller. It may update state, and in both hyperbolic policies it can only be called by the bound controller.

The two hyperbolic policies additionally expose `future_rate(_d_reserves, _d_debt)`, which returns the rate after a hypothetical change of reserves and debt, e.g. to preview the rate after a deposit or a new loan.

### How the Controller Uses the Policy

The controller calls `rate_write()` whenever it saves a new rate, caps the result at its own `MAX_RATE` (300% APY), and passes it on to the AMM:

```vyper
@internal
def _save_rate():
    rate: uint256 = min(extcall self._monetary_policy.rate_write(), MAX_RATE)
    extcall AMM.set_rate(rate)
```

This happens on every action that changes the market's debt or collateral (`create_loan`, `borrow_more`, `repay`, `add_collateral`, `remove_collateral`, `liquidate`), when fees are collected, and whenever anyone calls the controller's permissionless `save_rate()`. Between two such calls, interest accrues at the rate saved last, so the rate of a market only moves when the market is interacted with.

The policy a market currently uses can be read with `LendController.monetary_policy()`.

---

## Setting and Changing a Policy

- **At market creation:** the policy address is passed to the [`LendFactory`](./lend-factory.md) when the market is created. A policy is bound to its controller, but the controller only exists once the market is created. The deployment scripts therefore precompute the address the controller will be deployed at, deploy the policy for that address first, and then create the market. If the predicted address were wrong, market creation would revert.
- **Replacing the policy:** a market's policy is replaced with [`Configurator.set_monetary_policy`](./configurator.md#set_monetary_policy), which sets the new policy on the controller and immediately saves the new rate. It can be called by the `Configurator`'s default admin or by the custom admin set for that controller. The new policy must have been deployed for that same controller.
- **Changing the curve:** the parameters of an existing policy are changed with its own `set_parameters` method, which is restricted to the admin of the factory the market was created from.
