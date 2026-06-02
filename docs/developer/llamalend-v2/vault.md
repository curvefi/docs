# Vault

The `Vault` is an **ERC4626-compliant vault** where lenders deposit the borrowed token (e.g., USDC, WETH) to earn yield from borrower interest. Each lending market has its own isolated vault instance deployed by the [LendFactory](./lend-factory.md).

The vault's `pricePerShare` increases over time as borrowers pay interest. It implements the full ERC20 and ERC4626 interfaces, with additional Curve-specific methods for APR reporting and supply limits.

The vault uses a **dead shares** mechanism (minting 1000 shares to the zero address on initialization) to protect against ERC4626 inflation attacks.

:::vyper[`Vault.vy`]

The source code for the `Vault.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/Vault.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::


---


## ERC4626 — Deposits and Withdrawals

### `deposit`

::::description[`Vault.deposit(_assets: uint256, _receiver: address) -> uint256`]

Deposits the specified amount of borrowed tokens into the vault and mints shares to the receiver.

| Input | Type | Description |
| --- | --- | --- |
| `_assets` | `uint256` | Amount of borrowed tokens to deposit |
| `_receiver` | `address` | Address to receive the minted vault shares |

Returns: number of shares minted (`uint256`).

Emits: `Deposit` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `mint`

::::description[`Vault.mint(_shares: uint256, _receiver: address) -> uint256`]

Mints an exact number of vault shares by depositing the required amount of borrowed tokens.

| Input | Type | Description |
| --- | --- | --- |
| `_shares` | `uint256` | Exact number of shares to mint |
| `_receiver` | `address` | Address to receive the minted shares |

Returns: amount of assets deposited (`uint256`).

Emits: `Deposit` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `withdraw`

::::description[`Vault.withdraw(_assets: uint256, _receiver: address, _owner: address) -> uint256`]

Withdraws an exact amount of borrowed tokens by burning the required vault shares.

| Input | Type | Description |
| --- | --- | --- |
| `_assets` | `uint256` | Exact amount of borrowed tokens to withdraw |
| `_receiver` | `address` | Address to receive the withdrawn tokens |
| `_owner` | `address` | Address whose shares are burned |

Returns: number of shares burned (`uint256`).

Emits: `Withdraw` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `redeem`

::::description[`Vault.redeem(_shares: uint256, _receiver: address, _owner: address) -> uint256`]

Burns an exact number of vault shares and returns the corresponding borrowed tokens.

| Input | Type | Description |
| --- | --- | --- |
| `_shares` | `uint256` | Exact number of shares to burn |
| `_receiver` | `address` | Address to receive the withdrawn tokens |
| `_owner` | `address` | Address whose shares are burned |

Returns: amount of assets withdrawn (`uint256`).

Emits: `Withdraw` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## ERC4626 — Preview and Limits

### `totalAssets`

::::description[`Vault.totalAssets() -> uint256: view`]

Returns the total amount of borrowed tokens managed by the vault, including tokens lent out to borrowers (tracked by the controller's debt accounting).

Returns: total assets (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `convertToShares`

::::description[`Vault.convertToShares(_assets: uint256) -> uint256: view`]

Returns the number of vault shares that would be minted for a given amount of assets.

| Input | Type | Description |
| --- | --- | --- |
| `_assets` | `uint256` | Amount of assets |

Returns: equivalent shares (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `convertToAssets`

::::description[`Vault.convertToAssets(_shares: uint256) -> uint256: view`]

Returns the amount of assets that a given number of shares is worth.

| Input | Type | Description |
| --- | --- | --- |
| `_shares` | `uint256` | Amount of shares |

Returns: equivalent assets (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `previewDeposit`

::::description[`Vault.previewDeposit(_assets: uint256) -> uint256: view`]

Simulates a deposit and returns the number of shares that would be minted. Rounds down.

| Input | Type | Description |
| --- | --- | --- |
| `_assets` | `uint256` | Amount of assets to deposit |

Returns: shares that would be minted (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `previewMint`

::::description[`Vault.previewMint(_shares: uint256) -> uint256: view`]

Simulates a mint and returns the amount of assets required. Rounds up.

| Input | Type | Description |
| --- | --- | --- |
| `_shares` | `uint256` | Number of shares to mint |

Returns: assets required (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `previewWithdraw`

::::description[`Vault.previewWithdraw(_assets: uint256) -> uint256: view`]

Simulates a withdrawal and returns the number of shares that would be burned. Rounds up.

| Input | Type | Description |
| --- | --- | --- |
| `_assets` | `uint256` | Amount of assets to withdraw |

Returns: shares that would be burned (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `previewRedeem`

::::description[`Vault.previewRedeem(_shares: uint256) -> uint256: view`]

Simulates a redemption and returns the amount of assets that would be returned. Rounds down.

| Input | Type | Description |
| --- | --- | --- |
| `_shares` | `uint256` | Number of shares to redeem |

Returns: assets that would be returned (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `maxDeposit`

::::description[`Vault.maxDeposit(_receiver: address) -> uint256: view`]

Returns the maximum amount of assets that can be deposited for a given receiver, considering the supply limit.

| Input | Type | Description |
| --- | --- | --- |
| `_receiver` | `address` | Receiver address |

Returns: max depositable assets (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `maxMint`

::::description[`Vault.maxMint(_receiver: address) -> uint256: view`]

Returns the maximum number of shares that can be minted for a given receiver.

| Input | Type | Description |
| --- | --- | --- |
| `_receiver` | `address` | Receiver address |

Returns: max mintable shares (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `maxWithdraw`

::::description[`Vault.maxWithdraw(_owner: address) -> uint256: view`]

Returns the maximum amount of assets that can be withdrawn by a given owner, limited by available liquidity.

| Input | Type | Description |
| --- | --- | --- |
| `_owner` | `address` | Owner of the shares |

Returns: max withdrawable assets (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `maxRedeem`

::::description[`Vault.maxRedeem(_owner: address) -> uint256: view`]

Returns the maximum number of shares that can be redeemed by a given owner.

| Input | Type | Description |
| --- | --- | --- |
| `_owner` | `address` | Owner of the shares |

Returns: max redeemable shares (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `pricePerShare`

::::description[`Vault.pricePerShare() -> uint256: view`]

Returns the current price per share, scaled to 1e18. Increases over time as interest accrues.

Returns: price per share (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## APR

### `borrow_apr`

::::description[`Vault.borrow_apr() -> uint256: view`]

Returns the current annualized borrow rate as reported by the monetary policy, scaled to 1e18.

Returns: borrow APR (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `lend_apr`

::::description[`Vault.lend_apr() -> uint256: view`]

Returns the current annualized lending rate — the effective yield lenders earn after accounting for utilization and admin fees, scaled to 1e18.

Returns: lend APR (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Vault Info

### `asset`

::::description[`Vault.asset() -> address: view`]

Returns the address of the underlying borrowed token (the ERC4626 `asset`).

Returns: asset address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `borrowed_token`

::::description[`Vault.borrowed_token() -> address: view`]

Returns the borrowed token address.

Returns: token address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `collateral_token`

::::description[`Vault.collateral_token() -> address: view`]

Returns the collateral token address for this market.

Returns: token address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `controller`

::::description[`Vault.controller() -> address: view`]

Returns the LendController address associated with this vault.

Returns: controller address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `amm`

::::description[`Vault.amm() -> address: view`]

Returns the AMM (LLAMMA) address associated with this vault.

Returns: AMM address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `factory`

::::description[`Vault.factory() -> address: view`]

Returns the factory that deployed this vault.

Returns: factory address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Admin

### `set_max_supply`

::::description[`Vault.set_max_supply(_max_supply: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `admin`, which is the factory owner.
:::

Sets the maximum supply cap for the vault. When set, deposits that would push `totalSupply` above this limit are rejected.

| Input | Type | Description |
| --- | --- | --- |
| `_max_supply` | `uint256` | New maximum supply cap (0 = unlimited) |

Emits: `SetMaxSupply` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `admin`

::::description[`Vault.admin() -> address: view`]

Returns the admin of the vault, which is the owner of the factory contract.

Returns: admin address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## ERC20

The vault implements the full ERC20 interface for vault share tokens.

### `transfer`

::::description[`Vault.transfer(_to: address, _value: uint256) -> bool`]

Transfers vault shares to another address.

| Input | Type | Description |
| --- | --- | --- |
| `_to` | `address` | Recipient address |
| `_value` | `uint256` | Amount of shares to transfer |

Returns: success (`bool`).

Emits: `Transfer` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `transferFrom`

::::description[`Vault.transferFrom(_from: address, _to: address, _value: uint256) -> bool`]

Transfers vault shares from one address to another, using the caller's allowance.

| Input | Type | Description |
| --- | --- | --- |
| `_from` | `address` | Sender address |
| `_to` | `address` | Recipient address |
| `_value` | `uint256` | Amount of shares to transfer |

Returns: success (`bool`).

Emits: `Transfer` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `approve`

::::description[`Vault.approve(_spender: address, _value: uint256) -> bool`]

Approves an address to spend vault shares on behalf of the caller.

| Input | Type | Description |
| --- | --- | --- |
| `_spender` | `address` | Address to approve |
| `_value` | `uint256` | Allowance amount |

Returns: success (`bool`).

Emits: `Approval` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `increaseAllowance`

::::description[`Vault.increaseAllowance(_spender: address, _add_value: uint256) -> bool`]

Increases the allowance for a spender by a given amount.

| Input | Type | Description |
| --- | --- | --- |
| `_spender` | `address` | Address whose allowance to increase |
| `_add_value` | `uint256` | Amount to add to the current allowance |

Returns: success (`bool`).

Emits: `Approval` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `decreaseAllowance`

::::description[`Vault.decreaseAllowance(_spender: address, _sub_value: uint256) -> bool`]

Decreases the allowance for a spender by a given amount.

| Input | Type | Description |
| --- | --- | --- |
| `_spender` | `address` | Address whose allowance to decrease |
| `_sub_value` | `uint256` | Amount to subtract from the current allowance |

Returns: success (`bool`).

Emits: `Approval` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::
