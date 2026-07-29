# AMM (LLAMMA)

The `AMM` contract implements **LLAMMA** — the Lending-Liquidating AMM Algorithm. It holds borrower collateral distributed across discretized **price bands** and performs **soft liquidation**: as the collateral price drops into a borrower's band range, the AMM gradually converts their collateral to the borrowed token. If the price recovers, the direction of conversion can reverse (**de-liquidation**), but AMM fees and arbitrage losses already incurred do not reverse. Repeated conversion can reduce collateral value and health until the position becomes hard-liquidatable.

The AMM also serves as a regular DEX — arbitrageurs can swap between the collateral and borrowed tokens, which is the mechanism that drives soft liquidation.

Each lending market has its own AMM instance. The associated [LendController](./lend-controller.md) is the AMM's `admin` and is the only address allowed to deposit/withdraw collateral.

:::vyper[`AMM.vy`]

The source code for the lending `AMM.vy` contract is [pinned on GitHub](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

*Deployment addresses will be added once contracts are finalized.*

:::

Examples use Ethers v6 with an ABI generated from the pinned source linked in each panel. Replace every zero address and amount placeholder. Read-only calls use the verified Ethereum v2 reference market; execute a write only on a fork first.


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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def exchange(i: uint256, j: uint256, in_amount: uint256, min_amount: uint256, _for: address = msg.sender) -> uint256[2]:
    """
    @notice Exchanges two coins, callable by anyone
    @param i Input coin index
    @param j Output coin index
    @param in_amount Amount of input coin to swap
    @param min_amount Minimal amount to get as output
    @param _for Address to send coins to
    @return Amount of coins given in/out
    """
    return self._exchange(i, j, in_amount, min_amount, _for, True)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.exchange(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* in_amount: uint256 */ 0n,
  /* min_amount: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Returns: `[in_amount, out_amount_done]` (`uint256[2]`). `out_amount_done` can be less than `out_amount` when the AMM does not have enough liquidity.

Emits: `TokenExchange` event.

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def exchange_dy(i: uint256, j: uint256, out_amount: uint256, max_amount: uint256, _for: address = msg.sender) -> uint256[2]:
    """
    @notice Exchanges two coins, callable by anyone
    @param i Input coin index
    @param j Output coin index
    @param out_amount Desired amount of output coin to receive
    @param max_amount Maximum amount to spend (revert if more)
    @param _for Address to send coins to
    @return Amount of coins given in/out
    """
    return self._exchange(i, j, out_amount, max_amount, _for, False)


@internal
@view
def get_xy_up(user: address, use_y: bool) -> uint256:
    """
    @notice Measure the amount of y (collateral) in the band n if we adiabatically trade near p_oracle on the way up,
            or the amount of x (borrowed) if we trade adiabatically down
    @param user User the amount is calculated for
    @param use_y Calculate amount of collateral if True and of borrowed if False
    @return Amount of coins
    """
    ns: int256[2] = self._read_user_tick_numbers(user)
    ticks: DynArray[uint256, MAX_TICKS_UINT] = self._read_user_ticks(user, ns)
    if ticks[0] == 0:  # Even dynamic array will have 0th element set here
        return 0
    p_o: uint256 = self._price_oracle_ro()[0]
    assert p_o != 0

    n: int256 = ns[0] - 1
    n_active: int256 = self.active_band
    p_o_down: uint256 = self._p_oracle_up(ns[0])
    XY: uint256 = 0

    for i: uint256 in range(MAX_TICKS_UINT):
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.exchange_dy(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* out_amount: uint256 */ 0n,
  /* max_amount: uint256 */ 0n,
  /* _for: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_dy(i: uint256, j: uint256, in_amount: uint256) -> uint256:
    """
    @notice Method to use to calculate out amount
    @param i Input coin index
    @param j Output coin index
    @param in_amount Amount of input coin to swap
    @return Amount of coin j to give out
    """
    return self._get_dxdy(i, j, in_amount, True).out_amount


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_dy(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* in_amount: uint256 */ 0n,
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_dx(i: uint256, j: uint256, out_amount: uint256) -> uint256:
    """
    @notice Method to use to calculate in amount required to receive the desired out_amount
    @param i Input coin index
    @param j Output coin index
    @param out_amount Desired amount of output coin to receive
    @return Amount of coin i to spend
    """
    # i = 0: borrowable (USD) in, collateral (ETH) out; going up
    # i = 1: collateral (ETH) in, borrowable (USD) out; going down
    trade: IAMM.DetailedTrade = self._get_dxdy(i, j, out_amount, False)
    assert trade.out_amount == out_amount
    return trade.in_amount


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_dx(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* out_amount: uint256 */ 0n,
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_dxdy(i: uint256, j: uint256, in_amount: uint256) -> (uint256, uint256):
    """
    @notice Method to use to calculate out amount and spent in amount
    @param i Input coin index
    @param j Output coin index
    @param in_amount Amount of input coin to swap
    @return A tuple with in_amount used and out_amount returned
    """
    out: IAMM.DetailedTrade = self._get_dxdy(i, j, in_amount, True)
    return (out.in_amount, out.out_amount)


@internal
def _exchange(i: uint256, j: uint256, amount: uint256, minmax_amount: uint256, _for: address, use_in_amount: bool) -> uint256[2]:
    """
    @notice Exchanges two coins, callable by anyone
    @param i Input coin index
    @param j Output coin index
    @param amount Amount of input/output coin to swap
    @param minmax_amount Minimal/maximum amount to get as output/input
    @param _for Address to send coins to
    @param use_in_amount Whether input or output amount is specified
    @return Amount of coins given in and out
    """
    assert (i == 0 and j == 1) or (i == 1 and j == 0), "Wrong index"
    p_o: uint256[2] = self._price_oracle_w()  # Let's update the oracle even if we exchange 0
    if amount == 0:
        return [0, 0]

    lm: ILMCallback = self._liquidity_mining_callback
    collateral_shares: DynArray[uint256, MAX_TICKS_UINT] = []

    in_coin: IERC20 = BORROWED_TOKEN
    out_coin: IERC20 = COLLATERAL_TOKEN
    in_precision: uint256 = BORROWED_PRECISION
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_dxdy(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* in_amount: uint256 */ 0n,
)
```

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

Returns: `[out_amount_done, in_amount]` (`uint256[2]`). `out_amount_done` can be less than `out_amount` when the AMM does not have enough liquidity.

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_dydx(i: uint256, j: uint256, out_amount: uint256) -> (uint256, uint256):
    """
    @notice Method to use to calculate in amount required and out amount received
    @param i Input coin index
    @param j Output coin index
    @param out_amount Desired amount of output coin to receive
    @return A tuple with out_amount received and in_amount returned
    """
    # i = 0: borrowable (USD) in, collateral (ETH) out; going up
    # i = 1: collateral (ETH) in, borrowable (USD) out; going down
    out: IAMM.DetailedTrade = self._get_dxdy(i, j, out_amount, False)
    return (out.out_amount, out.in_amount)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_dydx(
  /* i: uint256 */ 0n,
  /* j: uint256 */ 0n,
  /* out_amount: uint256 */ 0n,
)
```

</Example>

::::

### `get_amount_for_price`

::::description[`AMM.get_amount_for_price(_p: uint256) -> (uint256, bool): view`]

Returns the amount and swap direction needed to move the AMM price to `_p`.

| Input | Type | Description |
| --- | --- | --- |
| `_p` | `uint256` | Target price, scaled by `1e18` |

Returns: `[amount, is_pump]`. If `is_pump` is true, swap borrowed token for collateral and `amount` is the required borrowed-token input. If false, swap collateral for borrowed token and `amount` is the required collateral-token input.

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_amount_for_price(p: uint256) -> (uint256, bool):
    """
    @notice Amount necessary to be exchanged to have the AMM at the final price `p`
    @param p Target price to reach, in units of borrowed token per collateral multiplied by 1e18
    @return (amount, is_pump)
    """
    min_band: int256 = self.min_band
    max_band: int256 = self.max_band
    n: int256 = self.active_band
    p_o: uint256[2] = self._price_oracle_ro()
    p_o_up: uint256 = self._p_oracle_up(n)
    p_down: uint256 = unsafe_div(unsafe_div(p_o[0]**2, p_o_up) * p_o[0], p_o_up)  # p_current_down
    p_up: uint256 = unsafe_div(p_down * A2, Aminus12)  # p_crurrent_up
    amount: uint256 = 0
    y0: uint256 = 0
    f: uint256 = 0
    g: uint256 = 0
    Inv: uint256 = 0
    j: uint256 = MAX_TICKS_UINT
    pump: bool = True

    fee: uint256 = max(self.fee, p_o[1])

    for i: uint256 in range(MAX_TICKS_UINT + MAX_SKIP_TICKS_UINT):
        assert p_o_up > 0
        x: uint256 = self.bands_x[n]
        y: uint256 = self.bands_y[n]
        if i == 0:
            if p < self._get_p(n, x, y):
                pump = False
        dynamic_fee: uint256 = fee
        not_empty: bool = x > 0 or y > 0

        if not_empty:
            y0 = self._get_y0(x, y, p_o[0], p_o_up)
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_amount_for_price(
  /* _p: uint256 */ 0n,
)
```

</Example>

::::


---


## Price and Band Info

### `price_oracle`

::::description[`AMM.price_oracle() -> uint256: view`]

Returns the external oracle price, clamped to the maximum allowed relative change.

Returns: oracle price (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def price_oracle() -> uint256:
    """
    @notice Value returned by the external price oracle contract
    @return Current price of collateral in units of borrowed token, multiplied by 1e18
    """
    return self._price_oracle_ro()[0]


@internal
@view
def _rate_mul() -> uint256:
    """
    @notice Rate multiplier which is 1.0 + integral(rate, dt)
    @return Rate multiplier in units where 1.0 == 1e18
    """
    return unsafe_div(self.rate_mul * (10**18 + self.rate * (block.timestamp - self.rate_time)), 10**18)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.price_oracle()
```

</Example>

::::

### `price_oracle_contract`

::::description[`AMM.price_oracle_contract() -> address: view`]

Returns the address of the external price oracle contract.

Returns: oracle address (`address`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@view
@external
def price_oracle_contract() -> IPriceOracle:
    return self._price_oracle


old_p_o: uint256
old_dfee: uint256
prev_p_o_time: uint256
PREV_P_O_DELAY: constant(uint256) = 2 * 60  # s = 2 min
MAX_P_O_CHG: constant(uint256) = 12500 * 10**14  # <= 2**(1/3) - max relative change to have fee < 50%

bands_x: public(HashMap[int256, uint256])
bands_y: public(HashMap[int256, uint256])

total_shares: HashMap[int256, uint256]
_user_shares: HashMap[address, IAMM.UserTicks]


_liquidity_mining_callback: ILMCallback

# https://github.com/vyperlang/vyper/issues/4721
@view
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.price_oracle_contract()
```

</Example>

::::

### `get_p`

::::description[`AMM.get_p() -> uint256: view`]

Returns the current AMM price (the marginal price at the active band).

Returns: current price (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_p() -> uint256:
    """
    @notice Get current AMM price in active_band
    @return Current price at 1e18 base
    """
    n: int256 = self.active_band
    return self._get_p(n, self.bands_x[n], self.bands_y[n])


@internal
@view
def _read_user_tick_numbers(user: address) -> int256[2]:
    """
    @notice Unpacks and reads user tick numbers
    @param user User address
    @return Lowest and highest band the user deposited into
    """
    ns: int256 = self._user_shares[user].ns
    n2: int256 = unsafe_div(ns, 2**128)
    n1: int256 = ns % 2**128
    if n1 >= 2**127:
        n1 = unsafe_sub(n1, 2**128)
        n2 = unsafe_add(n2, 1)
    return [n1, n2]


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_p()
```

</Example>

::::

### `get_base_price`

::::description[`AMM.get_base_price() -> uint256: view`]

Returns the base price used to calculate band boundaries, adjusted for accumulated interest rate.

Returns: base price (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def get_base_price() -> uint256:
    """
    @notice Price which corresponds to band 0.
            Base price grows with time to account for interest rate (which is 0 by default)
    @return Base price in units of borrowed token per collateral, multiplied by 1e18
    """
    return self._base_price()


@internal
@view
def _p_oracle_up(n: int256) -> uint256:
    """
    @notice Upper oracle price for the band to have liquidity when p = p_oracle
    @param n Band number (can be negative)
    @return Price at 1e18 base
    """
    # p_oracle_up(n) = p_base * ((A - 1) / A) ** n
    # p_oracle_down(n) = p_base * ((A - 1) / A) ** (n + 1) = p_oracle_up(n+1)
    # return unsafe_div(self._base_price() * self.exp_int(-n * LOG_A_RATIO), 10**18)

    power: int256 = -n * LOG_A_RATIO

    # ((A - 1) / A) ** n = exp(-n * ln(A / (A - 1))) = exp(-n * LOG_A_RATIO)
    exp_result: uint256 = convert(math._wad_exp(power), uint256)

    assert exp_result > 1000  # dev: limit precision of the multiplier
    return unsafe_div(self._base_price() * exp_result, WAD)


@internal
@view
def _p_current_band(n: int256) -> uint256:
    """
    @notice Lowest possible price of the band at current oracle price
    @param n Band number (can be negative)
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_base_price()
```

</Example>

::::

### `active_band`

::::description[`AMM.active_band() -> int256: view`]

Returns the index of the currently active band (the band where trading is happening).

Returns: active band index (`int256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.active_band()
await tx.wait()
```

</Example>

::::

### `active_band_with_skip`

::::description[`AMM.active_band_with_skip() -> int256: view`]

Returns the active band, skipping over empty bands for gas efficiency.

Returns: active band index (`int256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def active_band_with_skip() -> int256:
    n0: int256 = self.active_band
    n: int256 = n0
    min_band: int256 = self.min_band
    for i: uint256 in range(MAX_SKIP_TICKS_UINT):
        if n < min_band:
            n = n0 - MAX_SKIP_TICKS
            break
        if self.bands_x[n] != 0:
            break
        n -= 1
    return n


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.active_band_with_skip()
```

</Example>

::::

### `min_band`

::::description[`AMM.min_band() -> int256: view`]

Returns the lowest band index that has ever been used.

Returns: minimum band index (`int256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.min_band()
await tx.wait()
```

</Example>

::::

### `max_band`

::::description[`AMM.max_band() -> int256: view`]

Returns the highest band index that has ever been used.

Returns: maximum band index (`int256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.max_band()
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def p_current_up(n: int256) -> uint256:
    """
    @notice Highest possible price of the band at current oracle price
    @param n Band number (can be negative)
    @return Price at 1e18 base
    """
    return self._p_current_band(n + 1)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.p_current_up(
  /* _n: int256 */ 0n,
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def p_current_down(n: int256) -> uint256:
    """
    @notice Lowest possible price of the band at current oracle price
    @param n Band number (can be negative)
    @return Price at 1e18 base
    """
    return self._p_current_band(n)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.p_current_down(
  /* _n: int256 */ 0n,
)
```

</Example>

::::

### `p_oracle_up`

::::description[`AMM.p_oracle_up(_n: int256) -> uint256: view`]

Returns the upper boundary of band `_n` in the AMM's fixed price grid. Band numbers may be negative; higher band numbers correspond to lower prices, and positive bands lie to the left of the base price.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: upper oracle price (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def p_oracle_up(n: int256) -> uint256:
    """
    @notice Highest oracle price for the band to have liquidity when p = p_oracle
    @param n Band number (can be negative)
    @return Price at 1e18 base
    """
    return self._p_oracle_up(n)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.p_oracle_up(
  /* _n: int256 */ 0n,
)
```

</Example>

::::

### `p_oracle_down`

::::description[`AMM.p_oracle_down(_n: int256) -> uint256: view`]

Returns the lower boundary of band `_n` in the AMM's fixed price grid. The boundaries are `p_base * ((A - 1) / A) ** n` and `p_base * ((A - 1) / A) ** (n + 1)` respectively.

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: lower oracle price (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def p_oracle_down(n: int256) -> uint256:
    """
    @notice Lowest oracle price for the band to have liquidity when p = p_oracle
    @param n Band number (can be negative)
    @return Price at 1e18 base
    """
    return self._p_oracle_up(n + 1)


@internal
@view
def _get_y0(x: uint256, y: uint256, p_o: uint256, p_o_up: uint256) -> uint256:
    """
    @notice Calculate y0 for the invariant based on current liquidity in band.
            The value of y0 has a meaning of amount of collateral when band has no borrowed tokens
            but current price is equal to both oracle price and upper band price.
    @param x Amount of borrowed in band
    @param y Amount of collateral in band
    @param p_o External oracle price
    @param p_o_up Upper boundary of the band
    @return y0
    """
    assert p_o != 0
    # solve:
    # p_o * A * y0**2 - y0 * (p_oracle_up/p_o * (A-1) * x + p_o**2/p_oracle_up * A * y) - xy = 0
    b: uint256 = 0
    # p_o_up * unsafe_sub(A, 1) * x / p_o + A * p_o**2 / p_o_up * y / 10**18
    if x != 0:
        b = unsafe_div(p_o_up * Aminus1 * x, p_o)
    if y != 0:
        b += unsafe_div(A * p_o**2 // p_o_up * y, 10**18)
    if x > 0 and y > 0:
        D: uint256 = b**2 + unsafe_div((unsafe_mul(4, A) * p_o) * y, 10**18) * x
        return unsafe_div((b + self.sqrt_int(D)) * 10**18, unsafe_mul(unsafe_mul(2, A), p_o))
    else:
        return unsafe_div(b * 10**18, unsafe_mul(A, p_o))
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.p_oracle_down(
  /* _n: int256 */ 0n,
)
```

</Example>

::::

## User Position Info

### `get_y_up`

::::description[`AMM.get_y_up(_user: address) -> uint256: view`]

Returns the amount of collateral token a user would have if the price goes up (full de-liquidation scenario).

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: collateral amount (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_y_up(user: address) -> uint256:
    """
    @notice Measure the amount of y (collateral) in the band n if we adiabatically trade near p_oracle on the way up
    @param user User the amount is calculated for
    @return Amount of coins
    """
    return self.get_xy_up(user, True)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_y_up(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_x_down(user: address) -> uint256:
    """
    @notice Measure the amount of x (borrowed) if we trade adiabatically down
    @param user User the amount is calculated for
    @return Amount of coins
    """
    return self.get_xy_up(user, False)

@internal
@view
def _get_xy(user: address, is_sum: bool) -> DynArray[uint256, MAX_TICKS_UINT][2]:
    """
    @notice A low-gas function to measure amounts of borrowed and collateral tokens which user currently owns
    @param user User address
    @param is_sum Return sum or amounts by bands
    @return Amounts of (borrowed, collateral) in a tuple
    """
    xs: DynArray[uint256, MAX_TICKS_UINT] = []
    ys: DynArray[uint256, MAX_TICKS_UINT] = []
    if is_sum:
        xs.append(0)
        ys.append(0)
    ns: int256[2] = self._read_user_tick_numbers(user)
    ticks: DynArray[uint256, MAX_TICKS_UINT] = self._read_user_ticks(user, ns)
    if ticks[0] != 0:
        for i: uint256 in range(MAX_TICKS_UINT):
            total_shares: uint256 = self.total_shares[ns[0]] + DEAD_SHARES
            ds: uint256 = ticks[i]
            dx: uint256 = unsafe_div((self.bands_x[ns[0]] + 1) * ds, total_shares)
            dy: uint256 = unsafe_div((self.bands_y[ns[0]] + 1) * ds, total_shares)
            if is_sum:
                xs[0] += dx
                ys[0] += dy
            else:
                xs.append(unsafe_div(dx, BORROWED_PRECISION))
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_x_down(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_sum_xy(user: address) -> uint256[2]:
    """
    @notice A low-gas function to measure amounts of borrowed and collateral tokens which user currently owns
    @param user User address
    @return Amounts of (borrowed, collateral) in a tuple
    """
    xy: DynArray[uint256, MAX_TICKS_UINT][2] = self._get_xy(user, True)
    return [xy[0][0], xy[1][0]]

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_sum_xy(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def get_xy(user: address) -> DynArray[uint256, MAX_TICKS_UINT][2]:
    """
    @notice A low-gas function to measure amounts of borrowed and collateral tokens by bands which user currently owns
    @param user User address
    @return Amounts of (borrowed, collateral) by bands in a tuple
    """
    return self._get_xy(user, False)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_xy(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `read_user_tick_numbers`

::::description[`AMM.read_user_tick_numbers(_user: address) -> int256[2]: view`]

Returns the upper and lower band indices of a user's position.

| Input | Type | Description |
| --- | --- | --- |
| `_user` | `address` | User address |

Returns: `[n1, n2]` (`int256[2]`), where `n1 < n2` and the corresponding upper boundary is at a higher price than the lower boundary.

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def read_user_tick_numbers(user: address) -> int256[2]:
    """
    @notice Unpacks and reads user tick numbers
    @param user User address
    @return Lowest and highest band the user deposited into
    """
    return self._read_user_tick_numbers(user)


@internal
@view
def _read_user_ticks(user: address, ns: int256[2]) -> DynArray[uint256, MAX_TICKS_UINT]:
    """
    @notice Unpacks and reads user ticks (shares) for all the ticks user deposited into
    @param user User address
    @param ns Pair of band indices [n1, n2] defining the user's position range
    @return Array of shares the user has
    """
    ticks: DynArray[uint256, MAX_TICKS_UINT] = []
    size: uint256 = convert(ns[1] - ns[0] + 1, uint256)
    for i: uint256 in range(MAX_TICKS_UINT // 2):
        if len(ticks) == size:
            break
        tick: uint256 = self._user_shares[user].ticks[i]
        ticks.append(tick & (2**128 - 1))
        if len(ticks) == size:
            break
        ticks.append(tick >> 128)
    return ticks


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.read_user_tick_numbers(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def has_liquidity(user: address) -> bool:
    """
    @notice Check if `user` has any liquidity in the AMM
    @param user Address of the user to check
    @return True if the user has an active position, False otherwise
    """
    return self._user_shares[user].ticks[0] != 0


@internal
def save_user_shares(user: address, user_shares: DynArray[uint256, MAX_TICKS_UINT]):
    ptr: uint256 = 0
    for j: uint256 in range(MAX_TICKS_UINT // 2):
        if ptr >= len(user_shares):
            break
        tick: uint256 = user_shares[ptr]
        ptr = unsafe_add(ptr, 1)
        if len(user_shares) != ptr:
            tick = tick | (user_shares[ptr] << 128)
        ptr = unsafe_add(ptr, 1)
        self._user_shares[user].ticks[j] = tick


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.has_liquidity(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
```

</Example>

::::

### `bands_x`

::::description[`AMM.bands_x(_n: int256) -> uint256: view`]

Returns the total amount of borrowed token in band `_n`, normalized to 18 decimals (not the token's native decimals).

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: borrowed token amount in band (`uint256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.bands_x(
  /* _n: int256 */ 0n,
)
await tx.wait()
```

</Example>

::::

### `bands_y`

::::description[`AMM.bands_y(_n: int256) -> uint256: view`]

Returns the total amount of collateral token in band `_n`, normalized to 18 decimals (not the token's native decimals).

| Input | Type | Description |
| --- | --- | --- |
| `_n` | `int256` | Band index |

Returns: collateral token amount in band (`uint256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.bands_y(
  /* _n: int256 */ 0n,
)
await tx.wait()
```

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

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.user_shares(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

</Example>

::::


---


## Rate and Fee

### `rate`

::::description[`AMM.rate() -> uint256: view`]

Returns the current interest rate stored in the AMM, set by the controller from the monetary policy.

Returns: current rate (`uint256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.rate()
await tx.wait()
```

</Example>

::::

### `get_rate_mul`

::::description[`AMM.get_rate_mul() -> uint256: view`]

Returns the current rate multiplier — a cumulative value that tracks how much the base price has shifted due to interest accrual.

Returns: rate multiplier (`uint256`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def get_rate_mul() -> uint256:
    """
    @notice Rate multiplier which is 1.0 + integral(rate, dt)
    @return Rate multiplier in units where 1.0 == 1e18
    """
    return self._rate_mul()


@internal
@view
def _base_price() -> uint256:
    """
    @notice Price which corresponds to band 0.
            Base price grows with time to account for interest rate (which is 0 by default)
    @return Base price in units of borrowed token per collateral, multiplied by 1e18
    """
    return unsafe_div(BASE_PRICE * self._rate_mul(), 10**18)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.get_rate_mul()
```

</Example>

::::

### `fee`

::::description[`AMM.fee() -> uint256: view`]

Returns the base AMM swap fee (the minimum fee before any dynamic component).

Returns: fee (`uint256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.fee()
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
def set_admin(_admin: address):
    """
    @notice Set admin of the AMM. Typically it's a controller (unless it's tests)
    @param _admin Admin address
    """
    assert self.admin == empty(address)
    self.admin = _admin
    tkn.max_approve(BORROWED_TOKEN, _admin)
    tkn.max_approve(COLLATERAL_TOKEN, _admin)


@internal
@pure
def sqrt_int(_x: uint256) -> uint256:
    """
    @notice Wrapping isqrt builtin because otherwise it will be repeated every time instead of calling
    @param _x Square root's input in "normal" units, e.g. sqrt_int(1) == 1
    @return Integer square root of _x
    """
    return isqrt(_x)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.set_admin(
  /* _admin: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def deposit_range(user: address, amount: uint256, n1: int256, n2: int256):
    """
    @notice Deposit for a user in a range of bands. Only admin contract (Controller) can do it
    @param user User address
    @param amount Amount of collateral to deposit
    @param n1 Lower band in the deposit range
    @param n2 Upper band in the deposit range
    """
    assert msg.sender == self.admin

    user_shares: DynArray[uint256, MAX_TICKS_UINT] = []
    collateral_shares: DynArray[uint256, MAX_TICKS_UINT] = []

    n0: int256 = self.active_band

    # We assume that n1,n2 area already sorted (and they are in Controller)
    assert n2 < 2**127
    assert n1 > -2**127

    n_bands: uint256 = unsafe_add(convert(unsafe_sub(n2, n1), uint256), 1)
    assert n_bands <= MAX_TICKS_UINT

    y_per_band: uint256 = unsafe_div(amount * COLLATERAL_PRECISION, n_bands)
    assert y_per_band > 100, "Amount too low"

    assert self._user_shares[user].ticks[0] == 0  # dev: User must have no liquidity
    self._user_shares[user].ns = unsafe_add(n1, unsafe_mul(n2, 2**128))

    lm: ILMCallback = self._liquidity_mining_callback

    # Autoskip bands if we can
    for i: uint256 in range(MAX_SKIP_TICKS_UINT + 1):
        if n1 > n0:
            if i != 0:
                self.active_band = n0
            break
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.deposit_range(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _amount: uint256 */ 0n,
  /* _n1: int256 */ 0n,
  /* _n2: int256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def withdraw(user: address, frac: uint256) -> uint256[2]:
    """
    @notice Withdraw liquidity for the user. Only admin contract can do it
    @param user User who owns liquidity
    @param frac Fraction to withdraw (1e18 being 100%)
    @return Amount of [borrowed, collateral] withdrawn
    """
    assert msg.sender == self.admin
    assert frac <= 10**18

    lm: ILMCallback = self._liquidity_mining_callback

    ns: int256[2] = self._read_user_tick_numbers(user)
    n: int256 = ns[0]
    old_user_shares: DynArray[uint256, MAX_TICKS_UINT] = self._read_user_ticks(user, ns)
    user_shares: DynArray[uint256, MAX_TICKS_UINT] = old_user_shares
    assert user_shares[0] > 0, "No deposits"

    total_x: uint256 = 0
    total_y: uint256 = 0
    min_band: int256 = self.min_band
    old_min_band: int256 = min_band
    old_max_band: int256 = self.max_band
    max_band: int256 = n - 1

    for i: uint256 in range(MAX_TICKS_UINT):
        x: uint256 = self.bands_x[n]
        y: uint256 = self.bands_y[n]
        ds: uint256 = unsafe_div(frac * user_shares[i], 10**18)
        user_shares[i] = unsafe_sub(user_shares[i], ds)  # Can ONLY zero out when frac == 10**18
        s: uint256 = self.total_shares[n]
        new_shares: uint256 = s - ds
        self.total_shares[n] = new_shares
        s += DEAD_SHARES  # after this s is guaranteed to be bigger than 0
        dx: uint256 = unsafe_div((x + 1) * ds, s)
        dy: uint256 = unsafe_div((y + 1) * ds, s)
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.withdraw(
  /* _user: address */ "0x0000000000000000000000000000000000000000",
  /* _frac: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def set_rate(rate: uint256) -> uint256:
    """
    @notice Set interest rate. That affects the dependence of AMM base price over time
    @param rate New rate in units of int(fraction * 1e18) per second
    @return rate_mul multiplier (e.g. 1.0 + integral(rate, dt))
    """
    assert msg.sender == self.admin
    rate_mul: uint256 = self._rate_mul()
    self.rate_mul = rate_mul
    self.rate_time = block.timestamp
    self.rate = rate
    log IAMM.SetRate(rate=rate, rate_mul=rate_mul, time=block.timestamp)
    return rate_mul


@internal
def _set_fee(_fee: uint256):
    assert _fee >= MIN_FEE and _fee <= MAX_FEE  # dev: fee is out of bounds
    self.fee = _fee


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.set_rate(
  /* _rate: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def set_fee(fee: uint256):
    """
    @notice Set AMM fee
    @param fee Fee where 1e18 == 100%
    """
    assert msg.sender == self.admin
    self._set_fee(fee)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.set_fee(
  /* _fee: uint256 */ 0n,
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def set_price_oracle(_price_oracle: IPriceOracle):
    """
    @notice Set a new price oracle contract. Can only be called by admin (Controller)
    @param _price_oracle New price oracle contract
    """
    assert msg.sender == self.admin
    self._price_oracle = _price_oracle

```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.set_price_oracle(
  /* _price_oracle: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@nonreentrant
def set_callback(liquidity_mining_callback: ILMCallback):
    """
    @notice Set a gauge address with callbacks for liquidity mining for collateral
    @param liquidity_mining_callback Gauge address
    """
    assert msg.sender == self.admin  # dev: admin only
    self._liquidity_mining_callback = liquidity_mining_callback


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.set_callback(
  /* _liquidity_mining_callback: address */ "0x0000000000000000000000000000000000000000",
)
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
def coins(i: uint256) -> address:
    return [BORROWED_TOKEN.address, COLLATERAL_TOKEN.address][i]


@internal
@view
def limit_p_o(p: uint256) -> uint256[2]:
    """
    @notice Limits oracle price to avoid losses at abrupt changes, as well as calculates a dynamic fee.
        If we consider oracle_change such as:
            ratio = p_new / p_old
        (let's take for simplicity p_new < p_old, otherwise we compute p_old / p_new)
        Then if the minimal AMM fee will be:
            fee = (1 - ratio**3),
        AMM will not have a loss associated with the price change.
        However, over time fee should still go down (over PREV_P_O_DELAY), and also ratio should be limited
        because we don't want the fee to become too large (say, 50%) which is achieved by limiting the instantaneous
        change in oracle price.
    @param p Current oracle price
    @return (limited_price_oracle, dynamic_fee)
    """
    p_new: uint256 = p
    dt: uint256 = unsafe_sub(PREV_P_O_DELAY, min(PREV_P_O_DELAY, block.timestamp - self.prev_p_o_time))
    ratio: uint256 = 0

    # ratio = 1 - (p_o_min / p_o_max)**3

    if dt > 0:
        old_p_o: uint256 = self.old_p_o
        # ratio = p_o_min / p_o_max
        if p > old_p_o:
            ratio = unsafe_div(old_p_o * 10**18, p)
            if ratio < 10**36 // MAX_P_O_CHG:
                p_new = unsafe_div(old_p_o * MAX_P_O_CHG, 10**18)
                ratio = 10**36 // MAX_P_O_CHG
        else:
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.coins(
  /* _i: uint256 */ 0n,
)
```

</Example>

::::

### `A`

::::description[`AMM.A() -> uint256: view`]

Returns the band-width factor. Band width is approximately `1/A`.

Returns: band-width factor (`uint256`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.A()
await tx.wait()
```

</Example>

::::

### `admin`

::::description[`AMM.admin() -> address: view`]

Returns the admin address (the LendController).

Returns: admin address (`address`).

<SourceCode>

The implementation is in [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy). This public ABI entry is compiler-generated or inherited; inspect the linked contract source and interfaces for its implementation.

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, signer)
const tx = await contract.admin()
await tx.wait()
```

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

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@external
@view
@nonreentrant
def can_skip_bands(n_end: int256) -> bool:
    """
    @notice Check that we have no liquidity between active_band and `n_end`
    @param n_end Band index to check up to (not inclusive)
    @return True if no liquidity exists between active_band and n_end, False otherwise
    """
    n: int256 = self.active_band
    for i: uint256 in range(MAX_SKIP_TICKS_UINT):
        if n_end > n:
            if self.bands_y[n] != 0:
                return False
            n = unsafe_add(n, 1)
        else:
            if self.bands_x[n] != 0:
                return False
            n = unsafe_sub(n, 1)
        if n == n_end:  # not including n_end
            return True
    raise "Too deep"
    # Actually skipping bands:
    # * change self.active_band to the new n
    # * change self.p_base_mul
    # to do n2-n1 times (if n2 > n1):
    # out.base_mul = unsafe_div(out.base_mul * Aminus1, A)


```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.can_skip_bands(
  /* _n_end: int256 */ 0n,
)
```

</Example>

::::

### `liquidity_mining_callback`

::::description[`AMM.liquidity_mining_callback() -> address: view`]

Returns the liquidity mining callback (gauge) address.

Returns: callback address (`address`).

<SourceCode>

Excerpt from [`AMM.vy` at `0d726b1`](https://github.com/curvefi/curve-stablecoin/blob/0d726b110555e9506f5bec7e4b04eaac7b2a7986/curve_stablecoin/AMM.vy):

```vyper
@view
@external
def liquidity_mining_callback() -> ILMCallback:
    return self._liquidity_mining_callback


@deploy
def __init__(
        _borrowed_token: IERC20,
        _borrowed_precision: uint256,
        _collateral_token: IERC20,
        _collateral_precision: uint256,
        _A: uint256,
        _sqrt_band_ratio: uint256,
        _log_A_ratio: int256,
        _base_price: uint256,
        _fee: uint256,
        _admin_fee: uint256,
        _price_oracle: IPriceOracle,
    ):
    """
    @notice LLAMMA constructor
    @param _borrowed_token Token which is being borrowed
    @param _borrowed_precision Precision of borrowed token: we pass it because we want the blueprint to fit into bytecode
    @param _collateral_token Token used as collateral
    @param _collateral_precision Precision of collateral: we pass it because we want the blueprint to fit into bytecode
    @param _A "Amplification coefficient" which also defines density of liquidity and band size. Relative band size is 1/_A
    @param _sqrt_band_ratio Precomputed int(sqrt(A / (A - 1)) * 1e18)
    @param _log_A_ratio Precomputed int(ln(A / (A - 1)) * 1e18)
    @param _base_price Typically the initial crypto price at which AMM is deployed. Will correspond to band 0
    @param _fee Relative fee of the AMM: int(fee * 1e18)
    @param _admin_fee DEPRECATED, left for backward compatibility
    @param _price_oracle External price oracle which has price() and price_w() methods
           which both return current price of collateral multiplied by 1e18
    """
    BORROWED_TOKEN = _borrowed_token
    BORROWED_PRECISION = _borrowed_precision
    COLLATERAL_TOKEN = _collateral_token
# … the remaining implementation is linked above.
```

</SourceCode>

<Example>

```ts
const contract = new Contract('0xbf6f64b741164c26023f97faaea8e02453c27442', AMMAbi, provider)
const result = await contract.liquidity_mining_callback()
```

</Example>

::::
