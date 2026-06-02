# AMM (LLAMMA)

The `AMM` contract implements **LLAMMA** — the Lending-Liquidating AMM Algorithm. It holds borrower collateral distributed across discretized **price bands** and performs **soft liquidation**: as the collateral price drops into a borrower's band range, the AMM gradually converts their collateral to the borrowed token. If the price recovers, the process reverses (**de-liquidation**).

The AMM also serves as a regular DEX — arbitrageurs can swap between the collateral and borrowed tokens, which is the mechanism that drives soft liquidation.

Each lending market has its own AMM instance. The associated [LendController](./lend-controller.md) is the AMM's `admin` and is the only address allowed to deposit/withdraw collateral.

:::vyper[`AMM.vy`]

The source code for the `AMM.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/AMM.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::


---


## Swaps

### `exchange`

::::description[`AMM.exchange(i: uint256, j: uint256, in_amount: uint256, min_amount: uint256, _for: address) -> uint256[2]`]

Swaps `in_amount` of token `i` for token `j`. Token index 0 is the borrowed token, index 1 is the collateral token.

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index (0 = borrowed, 1 = collateral) |
| `j` | `uint256` | Output token index |
| `in_amount` | `uint256` | Amount of input token |
| `min_amount` | `uint256` | Minimum output amount (slippage protection) |
| `_for` | `address` | Address to receive the output tokens |

Returns: `[in_amount_done, out_amount]` (`uint256[2]`).

Emits: `TokenExchange` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `exchange_dy`

::::description[`AMM.exchange_dy(i: uint256, j: uint256, out_amount: uint256, max_amount: uint256, _for: address) -> uint256[2]`]

Swaps to receive exactly `out_amount` of token `j`, paying at most `max_amount` of token `i`.

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index |
| `j` | `uint256` | Output token index |
| `out_amount` | `uint256` | Desired output amount |
| `max_amount` | `uint256` | Maximum input amount (slippage protection) |
| `_for` | `address` | Address to receive the output tokens |

Returns: `[in_amount, out_amount_done]` (`uint256[2]`).

Emits: `TokenExchange` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_dy`

::::description[`AMM.get_dy(i: uint256, j: uint256, in_amount: uint256) -> uint256: view`]

Calculates the output amount for a given input amount (i.e., a swap quote).

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index |
| `j` | `uint256` | Output token index |
| `in_amount` | `uint256` | Input amount |

Returns: expected output amount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_dx`

::::description[`AMM.get_dx(i: uint256, j: uint256, out_amount: uint256) -> uint256: view`]

Calculates the input amount needed to receive a given output amount.

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index |
| `j` | `uint256` | Output token index |
| `out_amount` | `uint256` | Desired output amount |

Returns: required input amount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_dxdy`

::::description[`AMM.get_dxdy(i: uint256, j: uint256, in_amount: uint256) -> uint256[2]: view`]

Returns both the input amount used and the output amount for a given swap.

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index |
| `j` | `uint256` | Output token index |
| `in_amount` | `uint256` | Input amount |

Returns: `[in_amount_done, out_amount]` (`uint256[2]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_dydx`

::::description[`AMM.get_dydx(i: uint256, j: uint256, out_amount: uint256) -> uint256[2]: view`]

Returns both the output amount and the input amount needed for a given desired output.

| Input | Type | Description |
| --- | --- | --- |
| `i` | `uint256` | Input token index |
| `j` | `uint256` | Output token index |
| `out_amount` | `uint256` | Desired output amount |

Returns: `[out_amount_done, in_amount]` (`uint256[2]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_amount_for_price`

::::description[`AMM.get_amount_for_price(_p: uint256) -> uint256: view`]

Returns the amount of token 0 (borrowed token) needed to move the AMM price to `_p`.

| Input | Type | Description |
| --- | --- | --- |
| `_p` | `uint256` | Target price |

Returns: amount of token 0 needed (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Price and Band Info

### `price_oracle`

::::description[`AMM.price_oracle() -> uint256: view`]

Returns the current price from the external price oracle, smoothed by the AMM's internal EMA.

Returns: oracle price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `price_oracle_contract`

::::description[`AMM.price_oracle_contract() -> address: view`]

Returns the address of the external price oracle contract.

Returns: oracle address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_p`

::::description[`AMM.get_p() -> uint256: view`]

Returns the current AMM price (the marginal price at the active band).

Returns: current price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_base_price`

::::description[`AMM.get_base_price() -> uint256: view`]

Returns the base price used to calculate band boundaries, adjusted for accumulated interest rate.

Returns: base price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `active_band`

::::description[`AMM.active_band() -> int256: view`]

Returns the index of the currently active band (the band where trading is happening).

Returns: active band index (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `active_band_with_skip`

::::description[`AMM.active_band_with_skip() -> int256: view`]

Returns the active band, skipping over empty bands for gas efficiency.

Returns: active band index (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `min_band`

::::description[`AMM.min_band() -> int256: view`]

Returns the lowest band index that has ever been used.

Returns: minimum band index (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `max_band`

::::description[`AMM.max_band() -> int256: view`]

Returns the highest band index that has ever been used.

Returns: maximum band index (`int256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `p_current_up`

::::description[`AMM.p_current_up(_n: int256) -> uint256: view`]

Returns the upper price boundary of band `_n`, accounting for the current state of the band.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: upper price boundary (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `p_current_down`

::::description[`AMM.p_current_down(_n: int256) -> uint256: view`]

Returns the lower price boundary of band `_n`, accounting for the current state of the band.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: lower price boundary (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `p_oracle_up`

::::description[`AMM.p_oracle_up(_n: int256) -> uint256: view`]

Returns the upper oracle price boundary of band `_n` (based on the oracle price, not the current AMM state).

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: upper oracle price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `p_oracle_down`

::::description[`AMM.p_oracle_down(_n: int256) -> uint256: view`]

Returns the lower oracle price boundary of band `_n`.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: lower oracle price (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `dynamic_fee`

::::description[`AMM.dynamic_fee() -> uint256: view`]

Returns the current dynamic fee, which increases when the AMM price deviates from the oracle price to discourage trades that worsen the deviation.

Returns: dynamic fee (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## User Position Info

### `get_y_up`

::::description[`AMM.get_y_up(_user: address) -> uint256: view`]

Returns the amount of collateral token a user would have if the price goes up (full de-liquidation scenario).

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: collateral amount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_x_down`

::::description[`AMM.get_x_down(_user: address) -> uint256: view`]

Returns the amount of borrowed token a user would have if the price goes down (full soft-liquidation scenario).

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: borrowed token amount (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_sum_xy`

::::description[`AMM.get_sum_xy(_user: address) -> uint256[2]: view`]

Returns the total amounts of borrowed token and collateral token held in a user's bands.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: `[sum_x (borrowed), sum_y (collateral)]` (`uint256[2]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_xy`

::::description[`AMM.get_xy(_user: address) -> IController.UserTicks[]: view`]

Returns the per-band breakdown of a user's position — the amount of borrowed and collateral tokens in each band.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: array of per-band positions (`IController.UserTicks[]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `read_user_tick_numbers`

::::description[`AMM.read_user_tick_numbers(_user: address) -> int256[2]: view`]

Returns the upper and lower band indices of a user's position.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: `[n1 (upper), n2 (lower)]` (`int256[2]`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `has_liquidity`

::::description[`AMM.has_liquidity(_user: address) -> bool: view`]

Returns whether a user has any liquidity deposited in the AMM.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: has liquidity (`bool`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `bands_x`

::::description[`AMM.bands_x(_n: int256) -> uint256: view`]

Returns the total amount of borrowed token in band `_n`.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: borrowed token amount in band (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `bands_y`

::::description[`AMM.bands_y(_n: int256) -> uint256: view`]

Returns the total amount of collateral token in band `_n`.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: collateral token amount in band (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `user_shares`

::::description[`AMM.user_shares(_user: address) -> UserTicks: view`]

Returns a user's share information across their deposited bands.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: user tick/share info (`UserTicks`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Rate and Fee

### `rate`

::::description[`AMM.rate() -> uint256: view`]

Returns the current interest rate stored in the AMM, set by the controller from the monetary policy.

Returns: current rate (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `get_rate_mul`

::::description[`AMM.get_rate_mul() -> uint256: view`]

Returns the current rate multiplier — a cumulative value that tracks how much the base price has shifted due to interest accrual.

Returns: rate multiplier (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `fee`

::::description[`AMM.fee() -> uint256: view`]

Returns the current swap fee.

Returns: fee (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Admin Methods

These functions are restricted to the AMM's `admin`, which is the LendController.

### `set_admin`

::::description[`AMM.set_admin(_admin: address)`]

:::guard[Guarded Method]
This function is only callable by the current `admin` (the LendController).
:::

Transfers AMM admin to a new address.

| Input | Type | Description |
| --- | --- | --- |
| `_admin` | `address` | New admin address |

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `deposit_range`

::::description[`AMM.deposit_range(_user: address, _amount: uint256, _n1: int256, _n2: int256)`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController). It is called internally when a loan is created or collateral is added.
:::

Deposits collateral for a user across bands `_n1` to `_n2`.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |
| `_amount` | `uint256` | Collateral amount |
| `_n1` | `int256` | Upper band index |
| `_n2` | `int256` | Lower band index |

Emits: `Deposit` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `withdraw`

::::description[`AMM.withdraw(_user: address, _frac: uint256) -> uint256[2]`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController). It is called internally during repayment and liquidation.
:::

Withdraws a fraction of a user's position from the AMM. A `_frac` of `10**18` means full withdrawal.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |
| `_frac` | `uint256` | Fraction to withdraw (scaled by 1e18) |

Returns: `[withdrawn_borrowed, withdrawn_collateral]` (`uint256[2]`).

Emits: `Withdraw` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_rate`

::::description[`AMM.set_rate(_rate: uint256) -> uint256`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController).
:::

Sets the interest rate in the AMM and returns the updated rate multiplier.

| Input | Type | Description |
| --- | --- | --- |
| `_rate` | `uint256` | New rate value |

Returns: updated rate multiplier (`uint256`).

Emits: `SetRate` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_fee`

::::description[`AMM.set_fee(_fee: uint256)`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController).
:::

Sets the swap fee.

| Input | Type | Description |
| --- | --- | --- |
| `_fee` | `uint256` | New fee value |

Emits: `SetFee` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_price_oracle`

::::description[`AMM.set_price_oracle(_price_oracle: address)`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController).
:::

Sets the external price oracle contract.

| Input | Type | Description |
| --- | --- | --- |
| `_price_oracle` | `address` | New oracle address |

Emits: `SetPriceOracle` event.

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `set_callback`

::::description[`AMM.set_callback(_liquidity_mining_callback: address)`]

:::guard[Guarded Method]
This function is only callable by the `admin` (LendController).
:::

Sets the liquidity mining callback (gauge) address.

| Input | Type | Description |
| --- | --- | --- |
| `_liquidity_mining_callback` | `address` | Callback address |

<SourceCode>

</SourceCode>

<Example>

</Example>

::::


---


## Other Methods

### `coins`

::::description[`AMM.coins(_i: uint256) -> address: view`]

Returns the token address at index `_i` (0 = borrowed token, 1 = collateral token).

| Input | Type | Description |
| --- | --- | --- |
| `_i` | `uint256` | Token index (0 or 1) |

Returns: token address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `A`

::::description[`AMM.A() -> uint256: view`]

Returns the amplification coefficient. Band width is approximately `1/A`.

Returns: amplification coefficient (`uint256`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `admin`

::::description[`AMM.admin() -> address: view`]

Returns the admin address (the LendController).

Returns: admin address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `can_skip_bands`

::::description[`AMM.can_skip_bands(_n_end: int256) -> bool: view`]

Returns whether bands up to `_n_end` can be skipped (are empty) during traversal.

| Input | Type | Description |
| --- | --- | --- |
| `_n_end` | `int256` | Target band index |

Returns: whether bands can be skipped (`bool`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::

### `liquidity_mining_callback`

::::description[`AMM.liquidity_mining_callback() -> address: view`]

Returns the liquidity mining callback (gauge) address.

Returns: callback address (`address`).

<SourceCode>

</SourceCode>

<Example>

</Example>

::::
