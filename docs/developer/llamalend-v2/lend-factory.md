# LendFactory

The `LendFactory` is the entry point for **creating new one-way lending markets**. It deploys a triplet of contracts — [Vault](./vault.md), [LendController](./lend-controller.md), and [AMM](./amm.md) — from blueprint implementations stored in an internal registry. Each market is fully isolated.

The factory uses Snekmate's [`ownable`](https://github.com/pcaversaccio/snekmate) module for access control and [`pausable`](https://github.com/pcaversaccio/snekmate) for emergency pause functionality.

:::vyper[`LendFactory.vy`]

The source code for the `LendFactory.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendFactory.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

Examples use Ethers v6 with an ABI generated from the pinned source linked in each panel. Replace every zero address and amount placeholder. Read-only calls use the verified Ethereum v2 reference factory; execute a write only on a fork first.


---


## Market Creation

### `create`

::::description[`LendFactory.create(_borrowed_token: address, _collateral_token: address, _A: uint256, _fee: uint256, _loan_discount: uint256, _liquidation_discount: uint256, _price_oracle: address, _monetary_policy: address, _supply_limit: uint256) -> address[3]`]

Deploys a new lending market by creating a Vault, LendController, and AMM from their respective blueprints. Validates all parameters, initializes the triplet, and registers the market.

| Input | Type | Description |
| --- | --- | --- |
| `_borrowed_token` | `address` | Token that lenders deposit and borrowers receive |
| `_collateral_token` | `address` | Token used as collateral by borrowers |
| `_A` | `uint256` | Amplification coefficient — determines band width (~1/A) |
| `_fee` | `uint256` | Swap fee for the AMM |
| `_loan_discount` | `uint256` | Maximum discount for LTV calculation |
| `_liquidation_discount` | `uint256` | Discount at which liquidation can occur |
| `_price_oracle` | `address` | Initialized price oracle contract |
| `_monetary_policy` | `address` | Initialized monetary policy contract |
| `_supply_limit` | `uint256` | Maximum Vault assets in borrowed-token units; `0` disables deposits and `max(uint256)` is unlimited |

Returns: array of three addresses — `[vault, controller, amm]` (`address[3]`).

:::note[Return ordering]

The executable return statement is `return [vault.address, controller.address, amm.address]`. An older NatSpec line in the pinned source excerpt below lists the last two entries in the opposite order; integrations must use the executable ordering shown here and in the `NewVault` event.

:::

Emits: `NewVault` event.

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
def create(
    _borrowed_token: IERC20,
    _collateral_token: IERC20,
    _A: uint256,
    _fee: uint256,
    _loan_discount: uint256,
    _liquidation_discount: uint256,
    _price_oracle: IPriceOracle,
    _monetary_policy: IMonetaryPolicy,
    _supply_limit: uint256,
) -> address[3]:
    """
    @notice Creation of the vault using user-supplied price oracle contract
    @param _borrowed_token Token which is being borrowed
    @param _collateral_token Token used for collateral
    @param _A Amplification coefficient: band size is ~1//A
    @param _fee Fee for swaps in AMM (for ETH markets found to be 0.6%).
                Bounds are enforced by the AMM: MIN_FEE <= _fee <= min(WAD * MIN_TICKS / _A, 10%)
    @param _loan_discount Maximum discount. LTV = sqrt(((A - 1) // A) ** 4) - loan_discount
    @param _liquidation_discount Liquidation discount. LT = sqrt(((A - 1) // A) ** 4) - liquidation_discount
    @param _price_oracle Custom price oracle contract
    @param _monetary_policy Monetary policy contract to set the borrow rate
    @param _supply_limit Supply cap
    @return Addresses of the deployed [vault, AMM, controller] contracts
    """
    pausable._require_not_paused()
    assert _borrowed_token != _collateral_token, "Same token"
    assert _A >= MIN_A and _A <= MAX_A, "Wrong A"
    assert _liquidation_discount > 0, "liquidation discount = 0"
    assert _loan_discount < WAD, "loan discount >= 100%"
    assert _loan_discount > _liquidation_discount, "loan discount <= liquidation discount"

    A_ratio: uint256 = 10**18 * _A // (_A - 1)

    # Validate price oracle
    p: uint256 = (staticcall _price_oracle.price())
    assert p > 0  # dev: price oracle returned zero
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, signer)
const tx = await contract.create(
  /* _borrowed_token: address */ "0x0000000000000000000000000000000000000000",
  /* _collateral_token: address */ "0x0000000000000000000000000000000000000000",
  /* _A: uint256 */ 0n,
  /* _fee: uint256 */ 0n,
  /* _loan_discount: uint256 */ 0n,
  /* _liquidation_discount: uint256 */ 0n,
  /* _price_oracle: address */ "0x0000000000000000000000000000000000000000",
  /* _monetary_policy: address */ "0x0000000000000000000000000000000000000000",
  /* _supply_limit: uint256 — max(uint256) leaves supply unlimited */ (2n ** 256n) - 1n,
)
await tx.wait()
```

</Example>

::::


---


## Market Registry

### `market_count`

::::description[`LendFactory.market_count() -> uint256: view`]

Returns the total number of lending markets created by the factory.

Returns: number of markets (`uint256`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def market_count() -> uint256:
    return len(self._vaults)

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.market_count()
```

</Example>

::::

### `markets`

::::description[`LendFactory.markets(_n: uint256) -> Market: view`]

Returns the market info struct for a given market index.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `uint256` | Market index (0-based) |

Returns: market struct containing the vault, controller, AMM, collateral-token, borrowed-token, price-oracle, and monetary-policy addresses (`Market`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
@reentrant
def markets(_n: uint256) -> ILendFactory.Market:
    """
    @notice Get market data for market at index `_n`
    @param _n Index of the market
    @return Market struct containing vault, controller, amm, tokens, price oracle and monetary policy addresses
    """
    vault: IVault = self._vaults[_n]
    controller: IController = staticcall vault.controller()
    amm: IAMM = staticcall vault.amm()

    return ILendFactory.Market(
        vault=vault,
        controller=controller,
        amm=amm,
        collateral_token=staticcall vault.collateral_token(),
        borrowed_token=staticcall vault.borrowed_token(),
        price_oracle=staticcall amm.price_oracle_contract(),
        monetary_policy=staticcall controller.monetary_policy(),
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.markets(
  /* _n: uint256 */ 0n,
)
```

</Example>

::::

### `coins`

::::description[`LendFactory.coins(_vault_id: uint256) -> IERC20[2]: view`]

Returns the borrowed and collateral token addresses for a given vault.

| Input | Type | Description |
| --- | --- | --- |
| `_vault_id` | `uint256` | Vault index |

Returns: array of `[borrowed_token, collateral_token]` (`IERC20[2]`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
@reentrant
def coins(_vault_id: uint256) -> IERC20[2]:
    vault: IVault = self._vaults[_vault_id]
    return [staticcall vault.borrowed_token(), staticcall vault.collateral_token()]


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.coins(
  /* _vault_id: uint256 */ 0n,
)
```

</Example>

::::

### `vaults_index`

::::description[`LendFactory.vaults_index(_vault: IVault) -> uint256: view`]

Returns the index of a vault in the factory registry. Reverts if the vault is not registered.

| Input | Type | Description |
| --- | --- | --- |
| `_vault` | `IVault` | Vault address to look up |

Returns: vault index (`uint256`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
@reentrant
def vaults_index(_vault: IVault) -> uint256:
    """
    @notice Get the index of a vault in the markets array
    @param _vault Address of the vault
    @return Index of the vault
    """
    return self._vaults_index[_vault] - 2**128


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.vaults_index(
  /* _vault: IVault */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::


---


## Blueprints

### `amm_blueprint`

::::description[`LendFactory.amm_blueprint() -> address: view`]

Returns the current AMM blueprint address used for deploying new markets.

Returns: blueprint address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def amm_blueprint() -> address:
    """
    @notice Get the address of the AMM blueprint
    @return Address of the AMM blueprint
    """
    return blueprint_registry.get(AMM_BLUEPRINT_ID)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.amm_blueprint()
```

</Example>

::::

### `controller_blueprint`

::::description[`LendFactory.controller_blueprint() -> address: view`]

Returns the current controller blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def controller_blueprint() -> address:
    """
    @notice Get the address of the controller blueprint
    @return Address of the controller blueprint
    """
    return blueprint_registry.get(CONTROLLER_BLUEPRINT_ID)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.controller_blueprint()
```

</Example>

::::

### `vault_blueprint`

::::description[`LendFactory.vault_blueprint() -> address: view`]

Returns the current vault blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def vault_blueprint() -> address:
    """
    @notice Get the address of the vault blueprint
    @return Address of the vault blueprint
    """
    return blueprint_registry.get(VAULT_BLUEPRINT_ID)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.vault_blueprint()
```

</Example>

::::

### `controller_view_blueprint`

::::description[`LendFactory.controller_view_blueprint() -> address: view`]

Returns the current controller view blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def controller_view_blueprint() -> address:
    """
    @notice Get the address of the controller view blueprint
    @return Address of the controller view blueprint
    """
    return blueprint_registry.get(CONTROLLER_VIEW_BLUEPRINT_ID)



```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.controller_view_blueprint()
```

</Example>

::::


---


## Fee Receivers

### `fee_receiver`

::::description[`LendFactory.fee_receiver(_controller: address) -> address: view`]

Returns the fee receiver for a given controller. If a custom fee receiver is set, it returns that; otherwise, it returns the default fee receiver.

| Input | Type | Description |
| --- | --- | --- |
| `_controller` | `address` | Controller address |

Returns: fee receiver address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def fee_receiver(_controller: address = msg.sender) -> address:
    """
    @notice Get fee receiver who earns interest from admin fees
    @dev This function is called by controllers without specifying the
    first argument to get their fee receiver.
    @param _controller Address of the controller
    @return Address of the fee receiver
    """
    custom_fee_receiver: address = self.fee_receivers[_controller]
    return custom_fee_receiver if custom_fee_receiver != empty(address) else self.default_fee_receiver


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.fee_receiver(
  /* _controller: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `set_default_fee_receiver`

::::description[`LendFactory.set_default_fee_receiver(_fee_receiver: address)`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Sets the default fee receiver for all markets that don't have a custom one.

| Input | Type | Description |
| --- | --- | --- |
| `_fee_receiver` | `address` | New default fee receiver address |

Emits: `SetFeeReceiver` event.

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@reentrant
def set_default_fee_receiver(_fee_receiver: address):
    """
    @notice Set default fee receiver who earns admin fees on
    all controllers without a custom fee receiver
    @param _fee_receiver Address of the receiver
    """
    ownable._check_owner()
    self._set_default_fee_receiver(_fee_receiver)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, signer)
const tx = await contract.set_default_fee_receiver(
  /* _fee_receiver: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::

### `set_custom_fee_receiver`

::::description[`LendFactory.set_custom_fee_receiver(_controller: address, _fee_receiver: address)`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Sets a custom fee receiver for a specific market's controller.

| Input | Type | Description |
| --- | --- | --- |
| `_controller` | `address` | Controller address |
| `_fee_receiver` | `address` | Custom fee receiver address |

Emits: `CustomSetFeeReceiver` event.

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@reentrant
def set_custom_fee_receiver(_controller: address, _fee_receiver: address):
    """
    @notice Set fee receiver who earns admin fees for a specific controller
    @dev Setting to zero address resets to default fee receiver
    @param _controller Address of the controller
    @param _fee_receiver Address of the receiver
    """
    ownable._check_owner()
    contract_info: ILendFactory.ContractInfo = self.check_contract[_controller]
    assert contract_info.contract_type == ILendFactory.ContractType.CONTROLLER, "not a controller"
    self.fee_receivers[_controller] = _fee_receiver
    log ILendFactory.SetCustomFeeReceiver(controller=_controller, fee_receiver=_fee_receiver)


@internal
def _set_default_fee_receiver(_fee_receiver: address):
    assert _fee_receiver != empty(address), "invalid receiver"
    self.default_fee_receiver = _fee_receiver
    log ILendFactory.SetFeeReceiver(fee_receiver=_fee_receiver)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, signer)
const tx = await contract.set_custom_fee_receiver(
  /* _controller: address */ "0x0000000000000000000000000000000000000000",
  /* _fee_receiver: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::


---


## Contract Ownership

### `admin`

::::description[`LendFactory.admin() -> address: view`]

Returns the current owner of the factory contract.

Returns: owner address (`address`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
@reentrant
def admin() -> address:
    """
    @notice Get the admin of the factory
    @dev Called `admin` for backwards compatibility
    @return Address of the factory admin
    """
    return ownable.owner


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.admin()
```

</Example>

::::

### `pause`

::::description[`LendFactory.pause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Pauses the factory, preventing new market creation.

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
def pause():
    """
    @notice Pause new market creation
    """
    ownable._check_owner()
    pausable._pause()


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, signer)
const tx = await contract.pause()
await tx.wait()
```

</Example>

::::

### `unpause`

::::description[`LendFactory.unpause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Unpauses the factory, re-enabling market creation.

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
def unpause():
    """
    @notice Unpause the factory to allow new market creation
    """
    ownable._check_owner()
    pausable._unpause()


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, signer)
const tx = await contract.unpause()
await tx.wait()
```

</Example>

::::


---


## Other Methods

### `version`

::::description[`LendFactory.version() -> String[5]: view`]

Returns the contract version string.

Returns: version (`String[5]`).

<SourceCode>

Excerpt from [`lending/LendFactory.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/LendFactory.vy):

```vyper
@external
@view
def version() -> String[5]:
    return c.__version__


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x8f6B56EC5ddF1F2691a1059f1D3cd97Ac9EaB0bd', LendFactoryAbi, provider)
const result = await contract.version()
```

</Example>

::::
