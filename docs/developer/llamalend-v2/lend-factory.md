# LendFactory

The `LendFactory` is the entry point for **creating new one-way lending markets**. It deploys a triplet of contracts — [Vault](./vault.md), [LendController](./lend-controller.md), and [AMM](./amm.md) — from blueprint implementations stored in an internal registry. Each market is fully isolated.

The factory uses Snekmate's [`ownable`](https://github.com/pcaversaccio/snekmate) module for access control and [`pausable`](https://github.com/pcaversaccio/snekmate) for emergency pause functionality.

:::vyper[`LendFactory.vy`]

The source code for the `LendFactory.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/LendFactory.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::


---


## Market Creation

### `create`

::::description[`LendFactory.create(_borrowed_token: address, _collateral_token: address, _A: uint256, _fee: uint256, _loan_discount: uint256, _liquidation_discount: uint256, _price_oracle: address, _monetary_policy: address, _name: String[64], _supply_limit: uint256) -> address[3]`]

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
| `_name` | `String[64]` | Name for the vault token |
| `_supply_limit` | `uint256` | Maximum supply cap for the vault |

Returns: array of three addresses — `[vault, controller, amm]` (`address[3]`).

Emits: `NewVault` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Market Registry

### `market_count`

::::description[`LendFactory.market_count() -> uint256: view`]

Returns the total number of lending markets created by the factory.

Returns: number of markets (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `markets`

::::description[`LendFactory.markets(_n: uint256) -> Market: view`]

Returns the market info struct for a given market index.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `uint256` | Market index (0-based) |

Returns: market struct containing vault, controller, amm, collateral token, borrowed token, and market index (`Market`).

<SourceCode>

</SourceCode>

<Example>

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

</SourceCode>

<Example>

</Example>

::::

### `vaults_index`

::::description[`LendFactory.vaults_index(_vault: IVault) -> uint256: view`]

Returns the index of a vault in the factory registry. Uses a `2^128` offset internally — a return value of `0` means the vault is not registered.

| Input | Type | Description |
| --- | --- | --- |
| `_vault` | `IVault` | Vault address to look up |

Returns: vault index (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Blueprints

### `amm_blueprint`

::::description[`LendFactory.amm_blueprint() -> address: view`]

Returns the current AMM blueprint address used for deploying new markets.

Returns: blueprint address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `controller_blueprint`

::::description[`LendFactory.controller_blueprint() -> address: view`]

Returns the current controller blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `vault_blueprint`

::::description[`LendFactory.vault_blueprint() -> address: view`]

Returns the current vault blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `controller_view_blueprint`

::::description[`LendFactory.controller_view_blueprint() -> address: view`]

Returns the current controller view blueprint address.

Returns: blueprint address (`address`).

<SourceCode>

</SourceCode>

<Example>

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

</SourceCode>

<Example>

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

</SourceCode>

<Example>

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

</SourceCode>

<Example>

</Example>

::::


---


## Contract Ownership

### `admin`

::::description[`LendFactory.admin() -> address: view`]

Returns the current owner of the factory contract.

Returns: owner address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `pause`

::::description[`LendFactory.pause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Pauses the factory, preventing new market creation.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `unpause`

::::description[`LendFactory.unpause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This function is only callable by the `owner` of the contract.
:::

Unpauses the factory, re-enabling market creation.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Other Methods

### `version`

::::description[`LendFactory.version() -> String[5]: view`]

Returns the contract version string.

Returns: version (`String[5]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::
