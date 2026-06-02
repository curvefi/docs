# Vault Integration Guide

Llamalend v2 vaults are standard **ERC4626** vaults, so integrating them is straightforward — any protocol or aggregator that supports ERC4626 can plug in directly.


---


## Depositing and Withdrawing

Use the standard ERC4626 methods on the [Vault](./vault.md) contract:

- **`deposit(assets, receiver)`** — deposit borrowed tokens, receive vault shares
- **`mint(shares, receiver)`** — mint exact shares, pull required assets
- **`withdraw(assets, receiver, owner)`** — withdraw exact assets, burn required shares
- **`redeem(shares, receiver, owner)`** — burn exact shares, receive corresponding assets

All preview functions (`previewDeposit`, `previewMint`, `previewWithdraw`, `previewRedeem`) and limit functions (`maxDeposit`, `maxMint`, `maxWithdraw`, `maxRedeem`) are implemented per the ERC4626 spec.

**On-chain (Vyper):**

```vyper
from ethereum.ercs import IERC20
from ethereum.ercs import IERC4626

vault: IERC4626 = IERC4626(vault_addr)
asset: IERC20 = IERC20(staticcall vault.asset())

# Deposit 1000 USDC into the vault
amount: uint256 = 1000 * 10 ** 6
extcall asset.approve(vault_addr, amount)
shares: uint256 = extcall vault.deposit(amount, msg.sender)

# Withdraw all — burn shares, receive assets
assets: uint256 = extcall vault.redeem(shares, msg.sender, msg.sender)
```

**Off-chain (Python / ape):**

```python
vault = Contract(vault_address)
asset = Contract(vault.asset())

amount = 1000 * 10 ** asset.decimals()
asset.approve(vault.address, amount, sender=account)
vault.deposit(amount, account, sender=account)
```


---


## Supply Caps

Each vault has a DAO-configurable `max_supply` that limits total deposits. Integrators should check available capacity before depositing:

- **`maxDeposit(receiver)`** — returns the maximum assets depositable, accounting for the supply cap
- **`maxMint(receiver)`** — returns the maximum shares mintable, accounting for the supply cap

If `max_supply` is set to `0`, there is no cap (unlimited deposits). Deposits that would push `totalSupply` above the cap will revert.

```vyper
# Check remaining capacity before depositing
max_assets: uint256 = staticcall vault.maxDeposit(msg.sender)
assert amount <= max_assets, "exceeds supply cap"
extcall vault.deposit(amount, msg.sender)
```


---


## Dead Shares

On initialization, the vault mints 1000 shares to the zero address. This is a standard defense against [ERC4626 inflation attacks](https://docs.openzeppelin.com/contracts/5.x/erc4626#inflation-attack), where an attacker front-runs the first depositor to manipulate `pricePerShare` and steal funds.

Because of this, `pricePerShare` does not start at exactly `1e18` — it starts marginally above it. For most integrations this difference is negligible, but protocols that assume a fresh vault has a 1:1 asset-to-share ratio should account for the offset.

```vyper
# Use convertToShares / convertToAssets instead of assuming 1:1
shares: uint256 = staticcall vault.convertToShares(assets)
assets: uint256 = staticcall vault.convertToAssets(shares)
```


---


## Yield Accrual

Yield accrues passively through the vault's rising `pricePerShare` — no claiming or staking required. Useful view functions:

- **`pricePerShare()`** — current share price (scaled to 1e18), increases over time as borrowers pay interest
- **`lend_apr()`** — annualized yield for lenders after utilization and admin fees (scaled to 1e18)
- **`borrow_apr()`** — current annualized borrow rate (scaled to 1e18)

```python
vault = Contract(vault_address)

price = vault.pricePerShare()   # e.g. 1_023_000_000_000_000_000 (1.023)
lend = vault.lend_apr()         # e.g.   52_000_000_000_000_000 (5.2%)
borrow = vault.borrow_apr()     # e.g.   78_000_000_000_000_000 (7.8%)
```


---


## Liquidity Considerations

Withdrawals are limited by available liquidity — tokens currently lent out to borrowers cannot be withdrawn until repaid. The `maxWithdraw` and `maxRedeem` functions account for this automatically. Integrators building on top of the vaults should handle partial withdrawal availability gracefully.

```vyper
available: uint256 = staticcall vault.maxWithdraw(msg.sender)

if available < desired_amount:
    # Only withdraw what's available now
    extcall vault.withdraw(available, msg.sender, msg.sender)
else:
    extcall vault.withdraw(desired_amount, msg.sender, msg.sender)
```


---


## Market Discovery

Use the [LendFactory](./lend-factory.md) to enumerate available markets and find vault addresses programmatically.

```python
factory = Contract(factory_address)

n = factory.market_count()
for i in range(n):
    vault_addr = factory.vaults(i)
    vault = Contract(vault_addr)
    print(f"Market {i}: {vault.name()}, APR: {vault.lend_apr() / 1e16:.2f}%")
```
