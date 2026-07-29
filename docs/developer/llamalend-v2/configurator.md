# Configurator

The `Configurator` is the permissioned administrative entry point for LlamaLend v2 markets. It changes parameters across a market's controller, AMM, and view contracts; lenders, borrowers, and liquidators do not interact with it in normal operation.

Each Configurator has a `default_admin`. The default administrator can assign a custom administrator for an individual controller. A market-setting call then accepts either the default administrator or that controller's custom administrator; changing the default administrator or custom assignments remains restricted to the default administrator.

:::vyper[`Configurator.vy`]

The implementation is [`Configurator.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Configurator.vy), written in Vyper `0.4.3`.

The deployment registry lists the Configurator at [`0x6065858d0eF0AA240DFdf6f1A0B2ae34B41f49bC`](https://etherscan.io/address/0x6065858d0eF0AA240DFdf6f1A0B2ae34B41f49bC) on Ethereum and [`0xd36c590531cAF5F620C57Faf5827Ce8E7f6E5Bec`](https://optimistic.etherscan.io/address/0xd36c590531cAF5F620C57Faf5827Ce8E7f6E5Bec) on Optimism. Read-only RPC checks on July 22, 2026 returned Curve's Ethereum Ownership Agent (`0x4090…9968`) and Optimism ownership agent (`0x28c4…8267`) as their respective `default_admin` values. Consequently, activating a newly deployed market requires a Curve DAO ownership vote unless that vote assigns a controller-specific administrator.

:::

Examples use Ethers v6 with an ABI generated from the pinned source. They are administrator transaction templates: replace every placeholder and execute them on a fork before any governance or multisig proposal.

```ts
import { Contract } from 'ethers'

const CONFIGURATOR = '0x6065858d0eF0AA240DFdf6f1A0B2ae34B41f49bC'
const configurator = new Contract(CONFIGURATOR, ConfiguratorAbi, signer)
```

---

## Administration

### `set_custom_admin`

::::description[`Configurator.set_custom_admin(_controller: address, _admin: address)`]

Sets the administrator for one controller. Passing the zero address removes that controller-specific assignment, so future market-setting calls fall back to `default_admin`.

| Input | Type | Description |
| --- | --- | --- |
| `_controller` | `address` | Controller whose authorization is being configured |
| `_admin` | `address` | New per-controller administrator, or zero address to reset |

Emits: `SetCustomAdmin`.

<SourceCode>

Excerpt from [`Configurator.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/Configurator.vy):

```vyper
@external
def set_custom_admin(_controller: IController, _admin: address):
    self._check_admin()
    self.admins[_controller] = _admin
    log IConfigurator.SetCustomAdmin(controller=_controller.address, admin=_admin)
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_custom_admin(controller, marketAdmin)
await tx.wait()
```

</Example>

::::

### `set_owner`

::::description[`Configurator.set_owner(_new_default_admin: address)`]

Changes the default administrator. This does not overwrite existing per-controller custom administrator assignments.

| Input | Type | Description |
| --- | --- | --- |
| `_new_default_admin` | `address` | New default administrator |

Emits: `SetDefaultAdmin`.

<SourceCode>

```vyper
@external
def set_owner(_new_default_admin: address):
    self._check_admin()
    self.default_admin = _new_default_admin
    log IConfigurator.SetDefaultAdmin(new_default_admin=_new_default_admin)
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_owner(newDefaultAdmin)
await tx.wait()
```

</Example>

::::

### `default_admin` and `admins`

::::description[`Configurator.default_admin() -> address: view`]

Returns the Configurator's default administrator. `Configurator.admins(_controller) -> address: view` returns the custom administrator stored for a controller, or the zero address when none is set.

<SourceCode>

```vyper
default_admin: public(address)
admins: public(HashMap[IController, address])
```

</SourceCode>

<Example>

```ts
const [defaultAdmin, customAdmin] = await Promise.all([
  configurator.default_admin(),
  configurator.admins(controller),
])
```

</Example>

::::

---

## Controller configuration

The following calls require the default administrator or the controller's custom administrator.

### `set_borrowing_discounts`

::::description[`Configurator.set_borrowing_discounts(_controller: address, _loan_discount: uint256, _liquidation_discount: uint256)`]

Sets the loan and liquidation discounts used by the controller. Both values use `10**18 = 100%`; the liquidation discount must be positive and strictly less than the loan discount, which must be less than 100%.

<SourceCode>

```vyper
@external
def set_borrowing_discounts(
    _controller: IController, _loan_discount: uint256, _liquidation_discount: uint256
):
    self._check_authorized(_controller)
    assert _liquidation_discount > 0
    assert _loan_discount < WAD and _loan_discount > _liquidation_discount
    extcall _controller.configure(
        _loan_discount, _liquidation_discount, IMonetaryPolicy(SKIP_CONFIG_ADDRESS),
        SKIP_CONFIG_ADDRESS, SKIP_CONFIG_UINT256, IPriceOracle(SKIP_CONFIG_ADDRESS),
        ILMCallback(SKIP_CONFIG_ADDRESS),
    )
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_borrowing_discounts(
  controller,
  loanDiscount,
  liquidationDiscount,
)
await tx.wait()
```

</Example>

::::

### `set_monetary_policy`

::::description[`Configurator.set_monetary_policy(_controller: address, _monetary_policy: address)`]

Updates a controller's monetary-policy contract, then saves the controller rate.

<SourceCode>

```vyper
@external
def set_monetary_policy(_controller: IController, _monetary_policy: IMonetaryPolicy):
    self._check_authorized(_controller)
    assert _monetary_policy.address != SKIP_CONFIG_ADDRESS
    extcall _controller.configure(
        SKIP_CONFIG_UINT256, SKIP_CONFIG_UINT256, _monetary_policy,
        SKIP_CONFIG_ADDRESS, SKIP_CONFIG_UINT256, IPriceOracle(SKIP_CONFIG_ADDRESS),
        ILMCallback(SKIP_CONFIG_ADDRESS),
    )
    extcall _controller.save_rate()
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_monetary_policy(controller, monetaryPolicy)
await tx.wait()
```

</Example>

::::

### `set_view`

::::description[`Configurator.set_view(_controller: address, _view_blueprint: address)`]

Deploys and configures a new controller-view instance from the supplied blueprint. The blueprint must be nonzero and cannot be the configuration sentinel address.

<SourceCode>

```vyper
@external
def set_view(_controller: IController, _view_blueprint: address):
    self._check_authorized(_controller)
    assert _view_blueprint != empty(address)
    extcall _controller.configure(
        SKIP_CONFIG_UINT256, SKIP_CONFIG_UINT256, IMonetaryPolicy(SKIP_CONFIG_ADDRESS),
        _view_blueprint, SKIP_CONFIG_UINT256, IPriceOracle(SKIP_CONFIG_ADDRESS),
        ILMCallback(SKIP_CONFIG_ADDRESS),
    )
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_view(controller, controllerViewBlueprint)
await tx.wait()
```

</Example>

::::

---

## Lending-market configuration

### `set_borrow_cap`

::::description[`Configurator.set_borrow_cap(_controller: address, _borrow_cap: uint256)`]

Sets a lending controller's borrow cap in units of its borrowed token. A new lending market starts with a borrow cap of zero. On the current deployments, raising it requires a Curve DAO ownership vote unless the DAO has assigned a controller-specific administrator.

<SourceCode>

```vyper
@external
def set_borrow_cap(_controller: ILendController, _borrow_cap: uint256):
    self._check_authorized(IController(_controller.address))
    assert _borrow_cap != SKIP_CONFIG_UINT256
    extcall _controller.configure_lend(_borrow_cap, SKIP_CONFIG_UINT256)
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_borrow_cap(lendController, borrowCap)
await tx.wait()
```

</Example>

::::

### `set_admin_percentage`

::::description[`Configurator.set_admin_percentage(_controller: address, _admin_percentage: uint256)`]

Sets the share of interest assigned to the administrator. `_admin_percentage` uses `10**18 = 100%` and cannot exceed 100%.

<SourceCode>

```vyper
@external
def set_admin_percentage(_controller: ILendController, _admin_percentage: uint256):
    self._check_authorized(IController(_controller.address))
    assert _admin_percentage <= WAD
    extcall _controller.configure_lend(SKIP_CONFIG_UINT256, _admin_percentage)
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_admin_percentage(lendController, adminPercentage)
await tx.wait()
```

</Example>

::::

---

## AMM configuration

### `set_price_oracle`

::::description[`Configurator.set_price_oracle(_controller: address, _price_oracle: address, _max_deviation: uint256)`]

Updates the AMM price oracle after validating it. `_max_deviation` is WAD-scaled and may be at most 50%; `max_value(uint256)` explicitly skips the deviation check. The Configurator calls `price_w()` and `price()` on the new oracle before applying the change.

<SourceCode>

```vyper
@external
def set_price_oracle(
    _controller: IController, _price_oracle: IPriceOracle, _max_deviation: uint256
):
    self._check_authorized(_controller)
    assert _max_deviation <= MAX_ORACLE_PRICE_DEVIATION or _max_deviation == max_value(uint256)
    extcall _price_oracle.price_w()
    new_price: uint256 = staticcall _price_oracle.price()
    # The remaining implementation compares the existing oracle before configuration.
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_price_oracle(controller, priceOracle, maxDeviation)
await tx.wait()
```

</Example>

::::

### `set_callback`

::::description[`Configurator.set_callback(_controller: address, _cb: address)`]

Sets the AMM liquidity-mining callback. Pass the zero address to remove the callback; the configuration sentinel address is rejected.

<SourceCode>

```vyper
@external
def set_callback(_controller: IController, _cb: ILMCallback):
    self._check_authorized(_controller)
    assert _cb.address != SKIP_CONFIG_ADDRESS
    extcall _controller.configure(
        SKIP_CONFIG_UINT256, SKIP_CONFIG_UINT256, IMonetaryPolicy(SKIP_CONFIG_ADDRESS),
        SKIP_CONFIG_ADDRESS, SKIP_CONFIG_UINT256, IPriceOracle(SKIP_CONFIG_ADDRESS), _cb,
    )
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_callback(controller, liquidityMiningCallback)
await tx.wait()
```

</Example>

::::

### `set_amm_fee`

::::description[`Configurator.set_amm_fee(_controller: address, _fee: uint256)`]

Sets the AMM fee through the controller configuration path. The fee is WAD-scaled and the controller/AMM configuration enforces its permitted range.

<SourceCode>

```vyper
@external
def set_amm_fee(_controller: IController, _fee: uint256):
    self._check_authorized(_controller)
    assert _fee != SKIP_CONFIG_UINT256
    extcall _controller.configure(
        SKIP_CONFIG_UINT256, SKIP_CONFIG_UINT256, IMonetaryPolicy(SKIP_CONFIG_ADDRESS),
        SKIP_CONFIG_ADDRESS, _fee, IPriceOracle(SKIP_CONFIG_ADDRESS), ILMCallback(SKIP_CONFIG_ADDRESS),
    )
```

</SourceCode>

<Example>

```ts
const tx = await configurator.set_amm_fee(controller, ammFee)
await tx.wait()
```

</Example>

::::
