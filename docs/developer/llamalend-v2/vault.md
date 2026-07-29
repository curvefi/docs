# Vault

The `Vault` is an **ERC4626-compliant vault** where lenders deposit the borrowed token (e.g., USDC, WETH) to earn yield from borrower interest. Each lending market has its own isolated vault instance deployed by the [LendFactory](./lend-factory.md).

The vault's `pricePerShare` increases over time as borrowers pay interest. It implements the full ERC20 and ERC4626 interfaces, with additional Curve-specific methods for APR reporting and supply limits.

The vault includes **1000 virtual shares** in its conversion math to protect against ERC4626 inflation attacks. They are not minted to the zero address and are not included in `totalSupply`.

:::vyper[`Vault.vy`]

The source code for the `Vault.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lending/Vault.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

Examples use Ethers v6 with an ABI generated from the pinned source linked in each panel. Replace every zero address and amount placeholder. Read-only calls use the verified Ethereum v2 reference market; execute a write only on a fork first.


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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def deposit(_assets: uint256, _receiver: address = msg.sender) -> uint256:
    """
    @notice Deposit assets in return for whatever number of shares corresponds to the current conditions
    @param _assets Amount of assets to deposit
    @param _receiver Receiver of the shares who is optional. If not specified - receiver is the sender
    @return Amount of shares minted
    """
    controller: IController = self._controller
    total_assets: uint256 = self._total_assets()
    assert total_assets + _assets >= MIN_ASSETS, "Need more assets"
    assert total_assets + _assets <= self.maxSupply, "Supply limit"
    to_mint: uint256 = self._convert_to_shares(_assets, True, total_assets)
    assert to_mint > 0, "Can't mint 0 shares"

    extcall ILendController(controller.address).on_borrowed_token_transfer_in(_assets)
    tkn.transfer_from(self._borrowed_token, msg.sender, controller.address, _assets)

    self._mint(_receiver, to_mint)
    extcall controller.save_rate()
    log IERC4626.Deposit(sender=msg.sender, owner=_receiver, assets=_assets, shares=to_mint)
    return to_mint


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.deposit(
  /* _assets: uint256 */ 0n,
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def mint(_shares: uint256, _receiver: address = msg.sender) -> uint256:
    """
    @notice Mint given amount of shares taking whatever number of assets it requires
    @param _shares Number of shares to mint
    @param _receiver Optional receiver for the shares. If not specified - it's the sender
    @return Amount of assets taken from the caller
    """
    assert _shares > 0, "Can't mint 0 shares"
    controller: IController = self._controller
    total_assets: uint256 = self._total_assets()
    assets: uint256 = self._convert_to_assets(_shares, False, total_assets)
    assert total_assets + assets >= MIN_ASSETS, "Need more assets"
    assert total_assets + assets <= self.maxSupply, "Supply limit"

    extcall ILendController(controller.address).on_borrowed_token_transfer_in(assets)
    tkn.transfer_from(self._borrowed_token, msg.sender, controller.address, assets)

    self._mint(_receiver, _shares)
    extcall controller.save_rate()
    log IERC4626.Deposit(sender=msg.sender, owner=_receiver, assets=assets, shares=_shares)
    return assets


@internal
@view
def _available_balance() -> uint256:
    return crv_math.sub_or_zero(
        staticcall self._controller.available_balance(),
        staticcall self._controller.admin_fees(),
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.mint(
  /* _shares: uint256 */ 0n,
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def withdraw(_assets: uint256, _receiver: address = msg.sender, _owner: address = msg.sender) -> uint256:
    """
    @notice Withdraw given amount of asset and burn the corresponding amount of vault shares
    @param _assets Amount of assets to withdraw
    @param _receiver Receiver of the assets (optional, sender if not specified)
    @param _owner Owner who's shares the caller takes. Only can take those if owner gave the approval to the sender. Optional
    @return Number of shares burned
    """
    total_assets: uint256 = self._total_assets()
    assert total_assets - _assets >= MIN_ASSETS or total_assets == _assets, "Need more assets"
    shares: uint256 = self._convert_to_shares(_assets, False, total_assets)
    if _owner != msg.sender:
        allowance: uint256 = self.allowance[_owner][msg.sender]
        if allowance != max_value(uint256):
            self._approve(_owner, msg.sender, allowance - shares)

    controller: IController = self._controller
    self._burn(_owner, shares)

    extcall ILendController(controller.address).on_borrowed_token_transfer_out(_assets)
    tkn.transfer_from(self._borrowed_token, controller.address, _receiver, _assets)

    extcall controller.save_rate()
    log IERC4626.Withdraw(sender=msg.sender, receiver=_receiver, owner=_owner, assets=_assets, shares=shares)
    return shares


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.withdraw(
  /* _assets: uint256 */ 0n,
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
  /* _owner: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def redeem(_shares: uint256, _receiver: address = msg.sender, _owner: address = msg.sender) -> uint256:
    """
    @notice Burn given amount of shares and give corresponding assets to the user
    @param _shares Amount of shares to burn
    @param _receiver Optional receiver of the assets
    @param _owner Optional owner of the shares. Can only redeem if owner gave approval to the sender
    @return Amount of assets sent to the receiver
    """
    if _owner != msg.sender:
        allowance: uint256 = self.allowance[_owner][msg.sender]
        if allowance != max_value(uint256):
            self._approve(_owner, msg.sender, allowance - _shares)

    total_assets: uint256 = self._total_assets()
    assets_to_redeem: uint256 = self._convert_to_assets(_shares, True, total_assets)
    assert total_assets - assets_to_redeem >= MIN_ASSETS or total_assets == assets_to_redeem, "Need more assets"
    self._burn(_owner, _shares)
    controller: IController = self._controller

    extcall ILendController(controller.address).on_borrowed_token_transfer_out(assets_to_redeem)
    tkn.transfer_from(self._borrowed_token, controller.address, _receiver, assets_to_redeem)

    extcall controller.save_rate()
    log IERC4626.Withdraw(sender=msg.sender, receiver=_receiver, owner=_owner, assets=assets_to_redeem, shares=_shares)
    return assets_to_redeem


# ERC20 methods

@internal
def _approve(_owner: address, _spender: address, _value: uint256):
    self.allowance[_owner][_spender] = _value

    log IERC20.Approval(owner=_owner, spender=_spender, value=_value)


@internal
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.redeem(
  /* _shares: uint256 */ 0n,
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
  /* _owner: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::


---


## ERC4626 — Preview and Limits

### `totalAssets`

::::description[`Vault.totalAssets() -> uint256: view`]

Returns the total amount of borrowed tokens managed by the vault, including tokens lent out to borrowers (tracked by the controller's debt accounting).

Returns: total assets (`uint256`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def totalAssets() -> uint256:
    """
    @notice Total assets which can be lent out or be in reserve
    @return Total amount of underlying assets managed by the vault
    """
    return self._total_assets()


@internal
@view
def _convert_to_shares(_assets: uint256, _is_floor: bool = True,
                       _total_assets: uint256 = max_value(uint256)) -> uint256:
    """
    @param _assets Amount of assets to convert
    @param _is_floor If True, round down; if False, round up
    @param _total_assets Override for total assets; uses current value if max_value(uint256)
    @return Amount of shares equivalent to `_assets`
    """
    total_assets: uint256 = _total_assets
    if total_assets == max_value(uint256):
        total_assets = self._total_assets()
    precision: uint256 = self.precision
    numerator: uint256 = (self.totalSupply + DEAD_SHARES) * _assets * precision
    denominator: uint256 = (total_assets * precision + 1)
    if _is_floor:
        return numerator // denominator
    else:
        return math._ceil_div(numerator, denominator)


@internal
@view
def _convert_to_assets(_shares: uint256, _is_floor: bool = True,
                       _total_assets: uint256 = max_value(uint256)) -> uint256:
    """
    @param _shares Amount of shares to convert
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.totalAssets()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def convertToShares(_assets: uint256) -> uint256:
    """
    @notice Returns the amount of shares which the Vault would exchange for the given amount of assets provided
    @param _assets Amount of assets to convert
    @return Amount of shares equivalent to _assets
    """
    return self._convert_to_shares(_assets)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.convertToShares(
  /* _assets: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def convertToAssets(_shares: uint256) -> uint256:
    """
    @notice Returns the amount of assets that the Vault would exchange for the amount of shares provided
    @param _shares Amount of shares to convert
    @return Amount of assets equivalent to _shares
    """
    return self._convert_to_assets(_shares)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.convertToAssets(
  /* _shares: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def previewDeposit(_assets: uint256) -> uint256:
    """
    @notice Returns the amount of shares which can be obtained upon depositing assets
    @param _assets Amount of assets to deposit
    @return Amount of shares that would be minted for _assets
    """
    return self._convert_to_shares(_assets)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.previewDeposit(
  /* _assets: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def previewMint(_shares: uint256) -> uint256:
    """
    @notice Calculate the amount of assets which is needed to exactly mint the given amount of shares
    @param _shares Number of shares to mint
    @return Amount of assets required to mint exactly _shares
    """
    return self._convert_to_assets(_shares, False)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.previewMint(
  /* _shares: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def previewWithdraw(_assets: uint256) -> uint256:
    """
    @notice Calculate number of shares which gets burned when withdrawing given amount of asset
    @param _assets Amount of assets to withdraw
    @return Number of shares that would be burned for _assets
    """
    return self._convert_to_shares(_assets, False)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.previewWithdraw(
  /* _assets: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def previewRedeem(_shares: uint256) -> uint256:
    """
    @notice Calculate the amount of assets which can be obtained by redeeming the given amount of shares
    @param _shares Amount of shares to redeem
    @return Amount of assets that would be received for _shares
    """
    return self._convert_to_assets(_shares)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.previewRedeem(
  /* _shares: uint256 */ 0n,
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def maxDeposit(_receiver: address) -> uint256:
    """
    @notice Maximum amount of assets which a given user can deposit
    @param _receiver Address of the prospective depositor
    @return Maximum depositable asset amount given the current supply cap
    """
    max_supply: uint256 = self.maxSupply
    if max_supply == max_value(uint256):
        return max_supply
    else:
        assets: uint256 = self._total_assets()
        return max(max_supply, assets) - assets


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.maxDeposit(
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def maxMint(_receiver: address) -> uint256:
    """
    @notice Return maximum amount of shares which a given user can mint
    @param _receiver Address of the prospective minter
    @return Maximum mintable share amount given the current supply cap
    """
    max_supply: uint256 = self.maxSupply
    if max_supply == max_value(uint256):
        return max_supply
    else:
        assets: uint256 = self._total_assets()
        return self._convert_to_shares(max(max_supply, assets) - assets)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.maxMint(
  /* _receiver: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def maxWithdraw(_owner: address) -> uint256:
    """
    @notice Maximum amount of assets which a given user can withdraw. Aware of both user's balance and available liquidity
    @param _owner Address of the share owner
    @return Maximum withdrawable asset amount
    """
    return min(
        self._convert_to_assets(self.balanceOf[_owner]),
        self._available_balance(),
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.maxWithdraw(
  /* _owner: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def maxRedeem(_owner: address) -> uint256:
    """
    @notice Calculate maximum amount of shares which a given user can redeem
    @param _owner Address of the share owner
    @return Maximum redeemable share amount given the owner's balance and available liquidity
    """
    return min(
        self._convert_to_shares(self._available_balance(), False),
        self.balanceOf[_owner],
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.maxRedeem(
  /* _owner: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `pricePerShare`

::::description[`Vault.pricePerShare() -> uint256: view`]

Returns the current price per share, scaled to 1e18. Increases over time as interest accrues.

Returns: price per share (`uint256`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def pricePerShare(_is_floor: bool = True) -> uint256:
    """
    @notice Method which shows how much one pool share costs in asset tokens if they are normalized to 18 decimals
    @dev pricePerShare can decrease if totalSupply reaches zero (e.g., when all shares are burned).
         In this case, it resets to the initial value.
    @param _is_floor If True, round down; if False, round up
    @return Price of one share in asset tokens, normalized to 1e18
    """
    supply: uint256 = self.totalSupply
    if supply == 0:
        return 10**18 // DEAD_SHARES
    else:
        precision: uint256 = self.precision
        numerator: uint256 = 10**18 * (self._total_assets() * precision + 1)
        denominator: uint256 = (supply + DEAD_SHARES)
        pps: uint256 = 0
        if _is_floor:
            pps = numerator // denominator
        else:
            pps = math._ceil_div(numerator, denominator)
        assert pps > 0
        return pps


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.pricePerShare()
```

</Example>

::::


---


## APR

### `borrow_apr`

::::description[`Vault.borrow_apr() -> uint256: view`]

Returns the current annualized borrow rate as reported by the monetary policy, scaled to 1e18.

Returns: borrow APR (`uint256`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def borrow_apr() -> uint256:
    """
    @notice Borrow APR (annualized and 1e18-based)
    @return Current annualized borrow rate scaled by 1e18
    """
    return staticcall self._amm.rate() * (365 * 86400)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.borrow_apr()
```

</Example>

::::

### `lend_apr`

::::description[`Vault.lend_apr() -> uint256: view`]

Returns the current annualized lending rate — the effective yield lenders earn after accounting for utilization and admin fees, scaled to 1e18.

Returns: lend APR (`uint256`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def lend_apr() -> uint256:
    """
    @notice Lending APR (annualized and 1e18-based), net of admin fees
    @return Current annualized lending rate scaled by 1e18, after admin fee deduction
    """
    debt: uint256 = staticcall self._controller.total_debt()
    if debt == 0:
        return 0

    gross_apr: uint256 = staticcall self._amm.rate() * (365 * 86400) * debt // self._total_assets()
    admin_pct: uint256 = staticcall ILendController(self._controller.address).admin_percentage()
    return gross_apr * (c.WAD - admin_pct) // c.WAD


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.lend_apr()
```

</Example>

::::


---


## Vault Info

### `asset`

::::description[`Vault.asset() -> address: view`]

Returns the address of the underlying borrowed token (the ERC4626 `asset`).

Returns: asset address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def asset() -> IERC20:
    """
    @notice Asset which is the same as borrowed_token
    @return Address of the underlying asset token
    """
    return self._borrowed_token


@internal
@view
def _total_assets() -> uint256:
    return (
        staticcall self._controller.available_balance()
        + staticcall self._controller.total_debt()
        - staticcall self._controller.admin_fees()
    )


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.asset()
```

</Example>

::::

### `borrowed_token`

::::description[`Vault.borrowed_token() -> address: view`]

Returns the borrowed token address.

Returns: token address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
@reentrant
def borrowed_token() -> IERC20:
    return self._borrowed_token

_collateral_token: IERC20
# https://github.com/vyperlang/vyper/issues/4721
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.borrowed_token()
```

</Example>

::::

### `collateral_token`

::::description[`Vault.collateral_token() -> address: view`]

Returns the collateral token address for this market.

Returns: token address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
@reentrant
def collateral_token() -> IERC20:
    return self._collateral_token

_amm: IAMM
# https://github.com/vyperlang/vyper/issues/4721
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.collateral_token()
```

</Example>

::::

### `controller`

::::description[`Vault.controller() -> address: view`]

Returns the LendController address associated with this vault.

Returns: controller address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
@reentrant
def controller() -> IController:
    return self._controller

_factory: IFactory
# https://github.com/vyperlang/vyper/issues/4721
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.controller()
```

</Example>

::::

### `amm`

::::description[`Vault.amm() -> address: view`]

Returns the AMM (LLAMMA) address associated with this vault.

Returns: AMM address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
@reentrant
def amm() -> IAMM:
    return self._amm

_controller: IController
# https://github.com/vyperlang/vyper/issues/4721
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.amm()
```

</Example>

::::

### `factory`

::::description[`Vault.factory() -> address: view`]

Returns the factory that deployed this vault.

Returns: factory address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
@reentrant
def factory() -> IFactory:
    return self._factory


maxSupply: public(reentrant(uint256))

# ERC20 publics

decimals: public(constant(uint8)) = 18
name: public(reentrant(String[64]))
symbol: public(reentrant(String[34]))

NAME_PREFIX: constant(String[16]) = 'Curve Vault for '
SYMBOL_PREFIX: constant(String[2]) = 'cv'

allowance: public(reentrant(HashMap[address, HashMap[address, uint256]]))
balanceOf: public(reentrant(HashMap[address, uint256]))
totalSupply: public(reentrant(uint256))

precision: uint256

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.factory()
```

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
| `_max_supply` | `uint256` | New maximum supply cap in asset units (`0` disables deposits; `max(uint256)` is unlimited) |

Emits: `SetMaxSupply` event.

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def set_max_supply(_max_supply: uint256):
    """
    @notice Set maximum depositable supply
    @param _max_supply New maximum supply cap in asset tokens
    """
    assert msg.sender == staticcall self._factory.admin() or msg.sender == self._factory.address
    self.maxSupply = _max_supply
    log IVault.SetMaxSupply(max_supply=_max_supply)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.set_max_supply(
  /* _max_supply: uint256 — this example disables new deposits */ 0n,
)
await tx.wait()
```

</Example>

::::

### `admin`

::::description[`Vault.admin() -> address: view`]

Returns the admin of the vault, which is the owner of the factory contract.

Returns: admin address (`address`).

<SourceCode>

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
@view
def admin() -> address:
    return staticcall self._factory.admin()

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, provider)
const result = await contract.admin()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def transfer(_to: address, _value: uint256) -> bool:
    """
    @notice Transfer tokens to `_to`.
    @param _to The account to transfer tokens to.
    @param _value The amount of tokens to transfer.
    @return True on success
    """
    self._transfer(msg.sender, _to, _value)
    return True


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.transfer(
  /* _to: address */ "0x0000000000000000000000000000000000000000",
  /* _value: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    """
    @notice Transfer tokens from one account to another.
    @dev The caller needs to have an allowance from account `_from` greater than or
        equal to the value being transferred. An allowance equal to the uint256 type's
        maximum, is considered infinite and does not decrease.
    @param _from The account which tokens will be spent from.
    @param _to The account which tokens will be sent to.
    @param _value The amount of tokens to be transferred.
    @return True on success
    """
    allowance: uint256 = self.allowance[_from][msg.sender]
    if allowance != max_value(uint256):
        self._approve(_from, msg.sender, allowance - _value)

    self._transfer(_from, _to, _value)
    return True


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.transferFrom(
  /* _from: address */ "0x0000000000000000000000000000000000000000",
  /* _to: address */ "0x0000000000000000000000000000000000000000",
  /* _value: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def approve(_spender: address, _value: uint256) -> bool:
    """
    @notice Allow `_spender` to transfer up to `_value` amount of tokens from the caller's account.
    @dev Non-zero to non-zero approvals are allowed, but should be used cautiously. The methods
        increaseAllowance + decreaseAllowance are available to prevent any front-running that
        may occur.
    @param _spender The account permitted to spend up to `_value` amount of caller's funds.
    @param _value The amount of tokens `_spender` is allowed to spend.
    @return True on success
    """
    self._approve(msg.sender, _spender, _value)
    return True


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.approve(
  /* _spender: address */ "0x0000000000000000000000000000000000000000",
  /* _value: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def increaseAllowance(_spender: address, _add_value: uint256) -> bool:
    """
    @notice Increase the allowance granted to `_spender`.
    @dev This function will never overflow, and instead will bound
        allowance to MAX_UINT256. This has the potential to grant an
        infinite approval.
    @param _spender The account to increase the allowance of.
    @param _add_value The amount to increase the allowance by.
    @return True on success
    """
    cached_allowance: uint256 = self.allowance[msg.sender][_spender]
    allowance: uint256 = unsafe_add(cached_allowance, _add_value)

    # check for an overflow
    if allowance < cached_allowance:
        allowance = max_value(uint256)

    if allowance != cached_allowance:
        self._approve(msg.sender, _spender, allowance)

    return True


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.increaseAllowance(
  /* _spender: address */ "0x0000000000000000000000000000000000000000",
  /* _add_value: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`lending/Vault.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/lending/Vault.vy):

```vyper
@external
def decreaseAllowance(_spender: address, _sub_value: uint256) -> bool:
    """
    @notice Decrease the allowance granted to `_spender`.
    @dev This function will never underflow, and instead will bound
        allowance to 0.
    @param _spender The account to decrease the allowance of.
    @param _sub_value The amount to decrease the allowance by.
    @return True on success
    """
    cached_allowance: uint256 = self.allowance[msg.sender][_spender]
    allowance: uint256 = unsafe_sub(cached_allowance, _sub_value)

    # check for an underflow
    if cached_allowance < allowance:
        allowance = 0

    if allowance != cached_allowance:
        self._approve(msg.sender, _spender, allowance)

    return True


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0x2b5a321c3cb1f33e1abecd047c2649d0b4c47eba', VaultAbi, signer)
const tx = await contract.decreaseAllowance(
  /* _spender: address */ "0x0000000000000000000000000000000000000000",
  /* _sub_value: uint256 */ 0n,
)
await tx.wait()
```

</Example>

::::
