# Child Gauge v1.2.0

`ChildGauge` v1.2.0 is the latest liquidity gauge implementation for chains other than Ethereum. Child gauges are deployed by the [`ChildGaugeFactory`](./child-gauge-factory.md) on each chain as minimal proxies pointing to this implementation. They track LP token deposits, distribute CRV emissions bridged from their [`RootGauge`](./root-gauge.md) on Ethereum, and distribute permissionless rewards added to them. Staked positions are tokenized as an ERC-20 "gauge token" which supports EIP-2612 `permit`, including signatures from smart contract wallets (ERC-1271).

:::vyper[`ChildGauge.vy`]

The source code for the `ChildGauge.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-xchain-factory/blob/feat/reward-tokens/contracts/implementations/ChildGauge.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.3.10`.

The implementation is deployed at `0x9a09EC1205bF6c4B1C853e849cd7ec23dFea842e` on the following chains:

:logos-arbitrum: Arbitrum, :logos-arc: Arc, :logos-avalanche: Avalanche, :logos-base: Base, :logos-bsc: BSC, :logos-celo: Celo, :logos-etherlink: Etherlink, :logos-fraxtal: Fraxtal, :logos-gnosis: Gnosis, :logos-hyperliquid: HyperEVM, :logos-ink: Ink, :logos-kava: Kava, :logos-monad: Monad, :logos-optimism: Optimism, :logos-plasma: Plasma, :logos-plume: Plume, :logos-polygon: Polygon, :logos-robinhood: Robinhood, :logos-sonic: Sonic, :logos-stable: Stable, :logos-tac: TAC, :logos-taiko: Taiko, :logos-unichain: Unichain, :logos-xlayer: X Layer, :logos-xdc: XDC.

<ContractABI>


```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"index","type":"uint256"}],"name":"AddReward","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"distributor","type":"address"}],"name":"SetDistributor","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"is_killed","type":"bool"}],"name":"SetKilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"original_balance","type":"uint256"},{"indexed":false,"name":"original_supply","type":"uint256"},{"indexed":false,"name":"working_balance","type":"uint256"},{"indexed":false,"name":"working_supply","type":"uint256"}],"name":"UpdateLiquidityLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_gauge_manager","type":"address"}],"name":"SetGaugeManager","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"invalidated","type":"bool"}],"name":"SetRewardInvalidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"name":"_factory","type":"address"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"name":"_lp_token","type":"address"},{"name":"_root","type":"address"},{"name":"_manager","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"},{"name":"_claim_rewards","type":"bool"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"},{"name":"_receiver","type":"address"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"},{"name":"_tokens","type":"address[]"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"permit","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_added_value","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_subtracted_value","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"user_checkpoint","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_receiver","type":"address"}],"name":"set_rewards_receiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_gauge_manager","type":"address"}],"name":"set_gauge_manager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_gauge_manager","type":"address"}],"name":"set_manager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_epoch","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"}],"name":"recover_remaining","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"add_reward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"set_reward_distributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_invalidated","type":"bool"}],"name":"set_reward_invalidated","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_is_killed","type":"bool"}],"name":"set_killed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_root","type":"address"}],"name":"set_root_gauge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"update_voting_escrow","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_token","type":"address"}],"name":"claimed_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_reward_token","type":"address"}],"name":"claimable_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"claimable_tokens","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"integrate_checkpoint","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"factory","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"voting_escrow","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"salt","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"nonces","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lp_token","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"is_killed","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"inflation_rate","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reward_count","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_data","outputs":[{"components":[{"name":"distributor","type":"address"},{"name":"period_finish","type":"uint256"},{"name":"rate","type":"uint256"},{"name":"last_update","type":"uint256"},{"name":"integral","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"invalidated_reward","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_remaining","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"rewards_receiver","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"reward_integral_for","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"working_balances","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"working_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_inv_supply_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_checkpoint_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_fraction","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"period","outputs":[{"name":"","type":"int128"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"reward_tokens","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"int128"}],"name":"period_timestamp","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"int128"}],"name":"integrate_inv_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"root_gauge","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"}]
```

</ContractABI>

:::

:::info[What's new in v1.2.0]

Compared to the previous child gauge implementation (v1.1.0), this version:

- Lets users claim only selected reward tokens via the new `_tokens` argument of [`claim_rewards`](#claim_rewards).
- Adds [`set_reward_invalidated`](#set_reward_invalidated), which excludes a reward token from default claims (e.g. when its `transfer` reverts), so claiming the other rewards keeps working.
- Caps reward deposits at `2**96` tokens.

:::

---

## Initialization

The implementation contract is deployed once per chain with the address of that chain's `ChildGaugeFactory`, which is stored as an immutable. The constructor sets `lp_token` to a placeholder address so the implementation itself can never be initialized. Every gauge deployed by the factory is a minimal proxy that is initialized once via `initialize`.

### `initialize`
::::description[`ChildGauge.initialize(_lp_token: address, _root: address, _manager: address)`]

Function to initialize a gauge. It is called by the `ChildGaugeFactory` in the same transaction in which it deploys the gauge via [`deploy_gauge`](./child-gauge-factory.md#deploy_gauge), and can only be called once. It sets the LP token, the root gauge and the manager, reads the voting escrow from the factory, sets the gauge token `name` to `Curve.fi <LP symbol> Gauge Deposit` and `symbol` to `<LP symbol>-gauge`, and builds the EIP-712 domain separator using the previous block hash as `salt`.

| Input       | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| `_lp_token` | `address` | LP token of the gauge.                 |
| `_root`     | `address` | Address of the root gauge on Ethereum. |
| `_manager`  | `address` | Manager of the gauge.                  |

Emits: `SetGaugeManager` event.

<SourceCode>

```vyper
event SetGaugeManager:
    _gauge_manager: address

@external
def __init__(_factory: Factory):
    """
    @notice Deployer
    @param _factory Factory for deploying this gauge
    """
    self.lp_token = 0x000000000000000000000000000000000000dEaD

    FACTORY = _factory

@external
def initialize(_lp_token: address, _root: address, _manager: address):
    """
    @notice Initiailize contract created as proxy
    @param _lp_token Token to lock in
    @param _root Address of mirror Root gauge
    @param _manager Manager of rewards for the gauge
    """
    assert self.lp_token == empty(address)  # dev: already initialized

    self.lp_token = _lp_token
    self.root_gauge = _root
    self.manager = _manager
    log SetGaugeManager(_manager)

    self.voting_escrow = Factory(msg.sender).voting_escrow()

    symbol: String[32] = ERC20Extended(_lp_token).symbol()
    name: String[64] = concat("Curve.fi ", symbol, " Gauge Deposit")

    self.name = name
    self.symbol = concat(symbol, "-gauge")
    self.salt = block.prevhash

    self.period_timestamp[0] = block.timestamp
    self.DOMAIN_SEPARATOR = keccak256(
        _abi_encode(
            EIP712_TYPEHASH,
            keccak256(name),
            keccak256(VERSION),
            chain.id,
            self,
            self.salt,
        )
    )
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.initialize('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', '0x1234567890123456789012345678901234567890', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

---

## Depositing and Withdrawing

LP tokens can be deposited into or withdrawn from a gauge at any time. User interfaces usually call this "staking" and "unstaking"; in the source code, the functions are `deposit` and `withdraw`.

When LP tokens are deposited, the gauge mints the same amount of gauge tokens to the depositor; withdrawing burns them and returns the LP tokens. Deposits and withdrawals checkpoint the user's CRV emissions and permissionless rewards and recalculate their boosted working balance.

### `deposit`
::::description[`ChildGauge.deposit(_value: uint256, _addr: address = msg.sender, _claim_rewards: bool = False)`]

Function to deposit `_value` LP tokens into the gauge on behalf of `_addr`. The gauge mints the same amount of gauge tokens to `_addr`. LP tokens are transferred from `msg.sender`, which needs to have approved the gauge beforehand. Optionally, accrued permissionless rewards of `_addr` are claimed in the same transaction.

| Input            | Type      | Description                                            |
| ---------------- | --------- | ------------------------------------------------------ |
| `_value`         | `uint256` | Amount of LP tokens to deposit.                        |
| `_addr`          | `address` | Address to deposit for. Defaults to `msg.sender`.      |
| `_claim_rewards` | `bool`    | Whether to claim accrued rewards. Defaults to `False`. |

Emits: `Deposit`, `Transfer` and `UpdateLiquidityLimit` events.

<SourceCode>

```vyper
event Deposit:
    provider: indexed(address)
    value: uint256

@external
@nonreentrant('lock')
def deposit(_value: uint256, _addr: address = msg.sender, _claim_rewards: bool = False):
    """
    @notice Deposit `_value` LP tokens
    @dev Depositting also claims pending reward tokens
    @param _value Number of tokens to deposit
    @param _addr Address to deposit for
    @param _claim_rewards Whether to claim already accrued rewards
    """
    assert _addr != empty(address)  # dev: cannot deposit for zero address
    self._checkpoint(_addr)

    if _value != 0:
        is_rewards: bool = self.reward_count != 0
        total_supply: uint256 = self.totalSupply
        if is_rewards:
            self._checkpoint_rewards(_addr, total_supply, _claim_rewards, empty(address))

        total_supply += _value
        new_balance: uint256 = self.balanceOf[_addr] + _value
        self.balanceOf[_addr] = new_balance
        self.totalSupply = total_supply

        self._update_liquidity_limit(_addr, new_balance, total_supply)

        ERC20(self.lp_token).transferFrom(msg.sender, self, _value)

        log Deposit(_addr, _value)
        log Transfer(empty(address), _addr, _value)

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.deposit(1000000000000000000)
>>> ChildGauge.deposit(1000000000000000000, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', True)
```

</Example>

::::

### `withdraw`
::::description[`ChildGauge.withdraw(_value: uint256, _claim_rewards: bool = False, _receiver: address = msg.sender)`]

Function to withdraw `_value` LP tokens from the gauge. The gauge burns the caller's gauge tokens and sends the LP tokens to `_receiver`. Optionally, the caller's accrued permissionless rewards are claimed in the same transaction.

| Input            | Type      | Description                                                    |
| ---------------- | --------- | -------------------------------------------------------------- |
| `_value`         | `uint256` | Amount of LP tokens to withdraw.                               |
| `_claim_rewards` | `bool`    | Whether to claim accrued rewards. Defaults to `False`.         |
| `_receiver`      | `address` | Receiver of the withdrawn LP tokens. Defaults to `msg.sender`. |

Emits: `Withdraw`, `Transfer` and `UpdateLiquidityLimit` events.

<SourceCode>

```vyper
event Withdraw:
    provider: indexed(address)
    value: uint256

@external
@nonreentrant('lock')
def withdraw(_value: uint256, _claim_rewards: bool = False, _receiver: address = msg.sender):
    """
    @notice Withdraw `_value` LP tokens
    @dev Withdrawing also claims pending reward tokens
    @param _value Number of tokens to withdraw
    @param _claim_rewards Whether to claim rewards
    @param _receiver Receiver of withdrawn LP tokens
    """
    self._checkpoint(msg.sender)

    if _value != 0:
        is_rewards: bool = self.reward_count != 0
        total_supply: uint256 = self.totalSupply
        if is_rewards:
            self._checkpoint_rewards(msg.sender, total_supply, _claim_rewards, empty(address))

        total_supply -= _value
        new_balance: uint256 = self.balanceOf[msg.sender] - _value
        self.balanceOf[msg.sender] = new_balance
        self.totalSupply = total_supply

        self._update_liquidity_limit(msg.sender, new_balance, total_supply)

        ERC20(self.lp_token).transfer(_receiver, _value)

        log Withdraw(msg.sender, _value)
        log Transfer(msg.sender, empty(address), _value)

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.withdraw(1000000000000000000)
>>> ChildGauge.withdraw(1000000000000000000, True, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

---

## Claiming Rewards

Permissionless rewards are claimed with `claim_rewards`. By default, it claims every reward token of the gauge except those marked as invalidated (see [`set_reward_invalidated`](#set_reward_invalidated)). Passing a list of `_tokens` claims only those tokens, including invalidated ones. Rewards that are not claimed stay claimable.

:::info[CRV emissions are claimed from the `ChildGaugeFactory`]

`claim_rewards` only claims permissionless rewards. CRV emissions are claimed from the [`ChildGaugeFactory`](./child-gauge-factory.md) using its [`mint`](./child-gauge-factory.md#mint) function.

:::

The gauge checkpoints permissionless rewards when a reward token is deposited (a global checkpoint), when gauge tokens are transferred (for both sender and receiver), on deposits and withdrawals, and when rewards are claimed.

### `claim_rewards`
::::description[`ChildGauge.claim_rewards(_addr: address = msg.sender, _receiver: address = empty(address), _tokens: DynArray[address, MAX_REWARDS] = [])`]

Function to claim accrued permissionless rewards for `_addr`. If `_receiver` is `empty(address)`, rewards go to the default receiver set by `_addr` via [`set_rewards_receiver`](#set_rewards_receiver), or to `_addr` itself if none is set. Anyone can claim on behalf of another user, but only to that user's default receiver: a custom `_receiver` can only be passed when `_addr == msg.sender`.

If `_tokens` is empty, all reward tokens except invalidated ones are claimed. Otherwise, only the listed tokens are claimed, whether they are invalidated or not.

| Input       | Type                             | Description                                                               |
| ----------- | -------------------------------- | ------------------------------------------------------------------------- |
| `_addr`     | `address`                        | Address to claim rewards for. Defaults to `msg.sender`.                   |
| `_receiver` | `address`                        | Receiver of the rewards. Defaults to `empty(address)` (default receiver). |
| `_tokens`   | `DynArray[address, MAX_REWARDS]` | Reward tokens to claim. Defaults to `[]` (all non-invalidated tokens).    |

<SourceCode>

```vyper
@external
@nonreentrant('lock')
def claim_rewards(
    _addr: address = msg.sender,
    _receiver: address = empty(address),
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim available reward tokens for `_addr`
    @dev Rewards of tokens that are not claimed stay claimable later
    @param _addr Address to claim for
    @param _receiver Address to transfer rewards to - if set to
                     empty(address), uses the default reward receiver
                     for the caller
    @param _tokens Reward tokens to claim, including invalidated ones;
                   empty to claim all except invalidated
    """
    if _receiver != empty(address):
        assert _addr == msg.sender  # dev: cannot redirect when claiming for another user
    self._checkpoint_rewards(_addr, self.totalSupply, True, _receiver, _tokens)

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.claim_rewards()
>>> ChildGauge.claim_rewards('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x0000000000000000000000000000000000000000', ['0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5'])
```

</Example>

::::

### `claimed_reward`
::::description[`ChildGauge.claimed_reward(_addr: address, _token: address) -> uint256: view`]

Getter for the total amount of `_token` already claimed by `_addr`.

| Input    | Type      | Description       |
| -------- | --------- | ----------------- |
| `_addr`  | `address` | Address to check. |
| `_token` | `address` | Reward token.     |

Returns: amount of `_token` claimed (`uint256`).

<SourceCode>

```vyper
# user -> token -> [uint128 claimable amount][uint128 claimed amount]
claim_data: HashMap[address, HashMap[address, uint256]]

@view
@external
def claimed_reward(_addr: address, _token: address) -> uint256:
    """
    @notice Get the number of already-claimed reward tokens for a user
    @param _addr Account to get reward amount for
    @param _token Token to get reward amount for
    @return uint256 Total amount of `_token` already claimed by `_addr`
    """
    return self.claim_data[_addr][_token] % 2**128
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.claimed_reward('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

### `claimable_reward`
::::description[`ChildGauge.claimable_reward(_user: address, _reward_token: address) -> uint256: view`]

Getter for the amount of `_reward_token` currently claimable by `_user`.

| Input           | Type      | Description       |
| --------------- | --------- | ----------------- |
| `_user`         | `address` | Address to check. |
| `_reward_token` | `address` | Reward token.     |

Returns: claimable amount of `_reward_token` (`uint256`).

<SourceCode>

```vyper
# user -> token -> [uint128 claimable amount][uint128 claimed amount]
claim_data: HashMap[address, HashMap[address, uint256]]

@view
@external
def claimable_reward(_user: address, _reward_token: address) -> uint256:
    """
    @notice Get the number of claimable reward tokens for a user
    @param _user Account to get reward amount for
    @param _reward_token Token to get reward amount for
    @return uint256 Claimable reward token amount
    """
    integral: uint256 = self.reward_data[_reward_token].integral
    total_supply: uint256 = self.totalSupply
    if total_supply != 0:
        last_update: uint256 = min(block.timestamp, self.reward_data[_reward_token].period_finish)
        duration: uint256 = last_update - self.reward_data[_reward_token].last_update
        integral += (duration * self.reward_data[_reward_token].rate * 10**18 / total_supply)

    integral_for: uint256 = self.reward_integral_for[_reward_token][_user]
    new_claimable: uint256 = self.balanceOf[_user] * (integral - integral_for) / 10**18

    return (self.claim_data[_user][_reward_token] >> 128) + new_claimable
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.claimable_reward('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

### `rewards_receiver`
::::description[`ChildGauge.rewards_receiver(arg0: address) -> address: view`]

Getter for the default rewards receiver of a user. `empty(address)` means rewards are sent to the user.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: default rewards receiver (`address`).

<SourceCode>

```vyper
# claimant -> default reward receiver
rewards_receiver: public(HashMap[address, address])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.rewards_receiver('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `set_rewards_receiver`
::::description[`ChildGauge.set_rewards_receiver(_receiver: address)`]

Function to set the default receiver of the caller's permissionless rewards. Setting it to `empty(address)` sends rewards to the caller again.

| Input       | Type      | Description                                               |
| ----------- | --------- | --------------------------------------------------------- |
| `_receiver` | `address` | Default receiver for rewards claimed via `claim_rewards`. |

<SourceCode>

```vyper
@external
def set_rewards_receiver(_receiver: address):
    """
    @notice Set the default reward receiver for the caller.
    @dev When set to empty(address), rewards are sent to the caller
    @param _receiver Receiver address for any rewards claimed via `claim_rewards`
    """
    self.rewards_receiver[msg.sender] = _receiver
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_rewards_receiver('0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `reward_integral_for`
::::description[`ChildGauge.reward_integral_for(arg0: address, arg1: address) -> uint256: view`]

Getter for the reward integral of reward token `arg0` at the last checkpoint of user `arg1`. Used internally to calculate the rewards a user accrued since their last checkpoint.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | Reward token. |
| `arg1` | `address` | User address. |

Returns: reward integral (`uint256`).

<SourceCode>

```vyper
# reward token -> claiming address -> integral
reward_integral_for: public(HashMap[address, HashMap[address, uint256]])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.reward_integral_for('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

---

## Permissionless Rewards

Besides CRV emissions, up to eight additional reward tokens can be distributed through a gauge. The gauge `manager` (or the `ChildGaugeFactory` owner) adds a reward token together with a `distributor` via [`add_reward`](#add_reward). Only the distributor of a token can deposit it via [`deposit_reward_token`](#deposit_reward_token), which streams the deposited amount (plus anything left over from the previous period) to stakers over the chosen epoch. CRV cannot be added as a permissionless reward, because it could not be told apart from CRV emissions.

:::info[Permissionless rewards are not boosted]

Permissionless rewards are distributed based on a user's unboosted share of the gauge's total supply. If Alice holds 10% of the staked LP tokens, she receives 10% of the rewards, regardless of her veCRV balance.

:::

### `reward_data`
::::description[`ChildGauge.reward_data(arg0: address) -> Reward: view`]

Getter for the distribution data of a reward token.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | Reward token. |

Returns: token (`address`), distributor (`address`), period_finish (`uint256`), rate (`uint256`), last_update (`uint256`) and integral (`uint256`).

<SourceCode>

```vyper
struct Reward:
    distributor: address
    period_finish: uint256
    rate: uint256
    last_update: uint256
    integral: uint256

reward_data: public(HashMap[address, Reward])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.reward_data('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

### `reward_tokens`
::::description[`ChildGauge.reward_tokens(arg0: uint256) -> address: view`]

Getter for the reward token at index `arg0`.

| Input  | Type      | Description                |
| ------ | --------- | -------------------------- |
| `arg0` | `uint256` | Index of the reward token. |

Returns: reward token (`address`).

<SourceCode>

```vyper
MAX_REWARDS: constant(uint256) = 8

# array of reward tokens
reward_tokens: public(address[MAX_REWARDS])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.reward_tokens(0)
```

</Example>

::::

### `reward_count`
::::description[`ChildGauge.reward_count() -> uint256: view`]

Getter for the number of reward tokens added to the gauge.

Returns: number of reward tokens (`uint256`).

<SourceCode>

```vyper
# For tracking external rewards
reward_count: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.reward_count()
```

</Example>

::::

### `reward_remaining`
::::description[`ChildGauge.reward_remaining(arg0: address) -> uint256: view`]

Getter for the amount of a reward token that has been deposited but not yet distributed to stakers. It is used to carry rounding remainders into the reward integral, so that small-decimal tokens are distributed precisely. Once a distribution period has ended, any remaining amount can be returned to the distributor via [`recover_remaining`](#recover_remaining).

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | Reward token. |

Returns: undistributed amount (`uint256`).

<SourceCode>

```vyper
reward_remaining: public(HashMap[address, uint256])  # fixes bad precision
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.reward_remaining('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

### `invalidated_reward`
::::description[`ChildGauge.invalidated_reward(arg0: address) -> bool: view`]

Getter to check whether a reward token is invalidated. Invalidated tokens keep accruing but are skipped by claims that do not list tokens explicitly.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | Reward token. |

Returns: invalidated status (`bool`).

<SourceCode>

```vyper
invalidated_reward: public(HashMap[address, bool])  # skipped when claiming without `_tokens`
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.invalidated_reward('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

### `manager`
::::description[`ChildGauge.manager() -> address: view`]

Getter for the manager of the gauge, set at deployment via the `_manager` argument of the factory's `deploy_gauge`. The manager can add reward tokens, reassign distributors, invalidate reward tokens and transfer the manager role.

Returns: gauge manager (`address`).

<SourceCode>

```vyper
manager: public(address)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.manager()
```

</Example>

::::

### `add_reward`
::::description[`ChildGauge.add_reward(_reward_token: address, _distributor: address)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to add a reward token and set its distributor. Up to eight reward tokens can be added, and a reward token cannot be removed once added. CRV and the gauge token itself cannot be added as reward tokens.

| Input           | Type      | Description                                  |
| --------------- | --------- | -------------------------------------------- |
| `_reward_token` | `address` | Reward token to add.                         |
| `_distributor`  | `address` | Address allowed to deposit the reward token. |

Emits: `AddReward` and `SetDistributor` events.

<SourceCode>

```vyper
event AddReward:
    reward: indexed(address)
    index: uint256

event SetDistributor:
    reward: indexed(address)
    distributor: address

@external
def add_reward(_reward_token: address, _distributor: address):
    """
    @notice Add additional rewards to be distributed to stakers
    @param _reward_token The token to add as an additional reward
    @param _distributor Address permitted to fund this contract with the reward token
    """
    assert msg.sender in [self.manager, FACTORY.owner()]  # dev: only manager or factory admin
    assert _reward_token not in [FACTORY.crv().address, self]  # dev: can not distinguish CRV reward from CRV emission; do not use gauge token as reward token
    assert _distributor != empty(address)  # dev: distributor cannot be zero address

    reward_count: uint256 = self.reward_count
    assert reward_count < MAX_REWARDS
    assert self.reward_data[_reward_token].distributor == empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    self.reward_tokens[reward_count] = _reward_token
    self.reward_count = reward_count + 1
    log AddReward(_reward_token, reward_count)
    log SetDistributor(_reward_token, _distributor)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.add_reward('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', '0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `set_gauge_manager`
::::description[`ChildGauge.set_gauge_manager(_gauge_manager: address)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to set a new manager for the gauge.

| Input            | Type      | Description        |
| ---------------- | --------- | ------------------ |
| `_gauge_manager` | `address` | New gauge manager. |

Emits: `SetGaugeManager` event.

<SourceCode>

```vyper
event SetGaugeManager:
    _gauge_manager: address

@external
def set_gauge_manager(_gauge_manager: address):
    """
    @notice Change the gauge manager for a gauge
    @dev The manager of this contract, or the ownership admin can outright modify gauge
        managership. A gauge manager can also transfer managership to a new manager via this
        method, but only for the gauge which they are the manager of.
    @param _gauge_manager The account to set as the new manager of the gauge.
    """
    assert msg.sender in [self.manager, FACTORY.owner()]  # dev: only manager or factory admin

    self.manager = _gauge_manager
    log SetGaugeManager(_gauge_manager)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_gauge_manager('0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `set_manager`
::::description[`ChildGauge.set_manager(_gauge_manager: address)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to set a new manager for the gauge. Same as [`set_gauge_manager`](#set_gauge_manager), kept for backwards compatibility.

| Input            | Type      | Description        |
| ---------------- | --------- | ------------------ |
| `_gauge_manager` | `address` | New gauge manager. |

Emits: `SetGaugeManager` event.

<SourceCode>

```vyper
event SetGaugeManager:
    _gauge_manager: address

@external
def set_manager(_gauge_manager: address):
    """
    @notice Change the gauge manager for a gauge
    @dev Copy of `set_gauge_manager` for back-compatability
    @dev The manager of this contract, or the ownership admin can outright modify gauge
        managership. A gauge manager can also transfer managership to a new manager via this
        method, but only for the gauge which they are the manager of.
    @param _gauge_manager The account to set as the new manager of the gauge.
    """
    assert msg.sender in [self.manager, FACTORY.owner()]  # dev: only manager or factory admin

    self.manager = _gauge_manager
    log SetGaugeManager(_gauge_manager)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_manager('0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `set_reward_distributor`
::::description[`ChildGauge.set_reward_distributor(_reward_token: address, _distributor: address)`]

:::guard[Guarded Method]
This function can only be called by the current `distributor` of the reward token, the `manager` of the gauge, or the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to reassign the distributor of an existing reward token.

| Input           | Type      | Description      |
| --------------- | --------- | ---------------- |
| `_reward_token` | `address` | Reward token.    |
| `_distributor`  | `address` | New distributor. |

Emits: `SetDistributor` event.

<SourceCode>

```vyper
event SetDistributor:
    reward: indexed(address)
    distributor: address

@external
def set_reward_distributor(_reward_token: address, _distributor: address):
    """
    @notice Reassign the reward distributor for a reward token
    @param _reward_token The reward token to reassign distribution rights to
    @param _distributor The address of the new distributor
    """
    current_distributor: address = self.reward_data[_reward_token].distributor

    assert msg.sender in [current_distributor, FACTORY.owner(), self.manager]
    assert current_distributor != empty(address)
    assert _distributor != empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    log SetDistributor(_reward_token, _distributor)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_reward_distributor('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', '0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `set_reward_invalidated`
::::description[`ChildGauge.set_reward_invalidated(_reward_token: address, _invalidated: bool)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to invalidate or restore a reward token. An invalidated token is skipped by [`claim_rewards`](#claim_rewards) without `_tokens`, and by `deposit` and `withdraw` with `_claim_rewards=True`. This keeps claims of the other rewards working if a token's `transfer` reverts. Rewards of an invalidated token keep accruing and remain claimable by listing the token explicitly in `claim_rewards(_tokens)`.

| Input           | Type      | Description                                                 |
| --------------- | --------- | ----------------------------------------------------------- |
| `_reward_token` | `address` | Reward token.                                               |
| `_invalidated`  | `bool`    | `True` to skip the token by default, `False` to restore it. |

Emits: `SetRewardInvalidated` event.

<SourceCode>

```vyper
event SetRewardInvalidated:
    reward: indexed(address)
    invalidated: bool

@external
def set_reward_invalidated(_reward_token: address, _invalidated: bool):
    """
    @notice Exclude a reward token from claims that do not list tokens explicitly
    @dev Use when the token's `transfer` reverts, so that `claim_rewards()` and
        `deposit`/`withdraw` with `_claim_rewards=True` keep working for the other
        rewards. Rewards keep accruing and stay claimable via `claim_rewards(_tokens)`.
    @param _reward_token The reward token to (un)invalidate
    @param _invalidated True to skip the token by default, False to restore it
    """
    assert msg.sender in [self.manager, FACTORY.owner()]  # dev: only manager or factory admin
    assert self.reward_data[_reward_token].distributor != empty(address)  # dev: not a reward

    self.invalidated_reward[_reward_token] = _invalidated
    log SetRewardInvalidated(_reward_token, _invalidated)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_reward_invalidated('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', True)
```

</Example>

::::

### `deposit_reward_token`
::::description[`ChildGauge.deposit_reward_token(_reward_token: address, _amount: uint256, _epoch: uint256 = WEEK)`]

:::guard[Guarded Method]
This function can only be called by the `distributor` of `_reward_token`, which is set via [`add_reward`](#add_reward) and [`set_reward_distributor`](#set_reward_distributor).
:::

Function to deposit reward tokens for distribution. The amount actually received by the gauge is added to the amount not yet distributed ([`reward_remaining`](#reward_remaining)), and the total is streamed to stakers over `_epoch` seconds, starting now. The epoch must be between 3 days and 48 weeks, and the total amount to distribute cannot exceed `2**96`.

| Input           | Type      | Description                                                        |
| --------------- | --------- | ------------------------------------------------------------------ |
| `_reward_token` | `address` | Reward token to deposit.                                           |
| `_amount`       | `uint256` | Amount of reward tokens to deposit.                                |
| `_epoch`        | `uint256` | Distribution duration in seconds. Defaults to one week (`604800`). |

<SourceCode>

```vyper
@external
@nonreentrant("lock")
def deposit_reward_token(_reward_token: address, _amount: uint256, _epoch: uint256 = WEEK):
    """
    @notice Deposit a reward token for distribution
    @param _reward_token The reward token being deposited
    @param _amount The amount of `_reward_token` being deposited
    @param _epoch The duration the rewards are distributed across. Between 3 days and a year, week by default
    """
    assert msg.sender == self.reward_data[_reward_token].distributor
    assert 3 * WEEK / 7 <= _epoch and _epoch <= WEEK * 4 * 12, "Epoch duration"

    self._checkpoint_rewards(empty(address), self.totalSupply, False, empty(address))

    # transferFrom reward token and use transferred amount henceforth:
    amount_received: uint256 = ERC20(_reward_token).balanceOf(self)
    assert ERC20(_reward_token).transferFrom(
        msg.sender,
        self,
        _amount,
        default_return_value=True
    )
    amount_received = ERC20(_reward_token).balanceOf(self) - amount_received

    total_amount: uint256 = amount_received + self.reward_remaining[_reward_token]
    assert total_amount <= 2 ** (64 + 32), "Reward overflow"
    self.reward_data[_reward_token].rate = total_amount / _epoch
    self.reward_remaining[_reward_token] = total_amount

    self.reward_data[_reward_token].last_update = block.timestamp
    self.reward_data[_reward_token].period_finish = block.timestamp + _epoch

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.deposit_reward_token('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5', 10000000000000000000000, 604800)
```

</Example>

::::

### `recover_remaining`
::::description[`ChildGauge.recover_remaining(_reward_token: address)`]

Function to send the undistributed remainder of a reward token ([`reward_remaining`](#reward_remaining)) back to its distributor. This recovers dust caused by rounding, which mostly matters for tokens with few decimals. It can be called by anyone, but only after the current distribution period of the token has finished.

| Input           | Type      | Description              |
| --------------- | --------- | ------------------------ |
| `_reward_token` | `address` | Reward token to recover. |

<SourceCode>

```vyper
@external
@nonreentrant("lock")
def recover_remaining(_reward_token: address):
    """
    @notice Recover reward token remaining after calculation errors. Helpful for small decimal tokens.
    Remaining tokens will be claimable in favor of distributor. Callable by anyone after reward distribution finished.
    @param _reward_token The reward token being recovered
    """
    self._checkpoint_rewards(empty(address), self.totalSupply, False, empty(address))

    period_finish: uint256 = self.reward_data[_reward_token].period_finish
    assert period_finish < block.timestamp
    assert self.reward_data[_reward_token].last_update >= period_finish

    assert ERC20(_reward_token).transfer(self.reward_data[_reward_token].distributor,
        self.reward_remaining[_reward_token], default_return_value=True)
    self.reward_remaining[_reward_token] = 0

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.recover_remaining('0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5')
```

</Example>

::::

---

## Boosting

CRV emissions are distributed according to a user's boosted `working_balances` rather than their raw gauge balance. Without veCRV, a user's working balance is 40% of their staked LP tokens; with enough veCRV, it reaches 100%, a boost of 2.5x. On chains other than Ethereum, veCRV balances are read from the `voting_escrow` contract set in the `ChildGaugeFactory`, an oracle which mirrors veCRV data from Ethereum (see [Boosting on Sidechains](./overview.md#boosting-on-sidechains)). If no voting escrow is set, there is no boost and every working balance is 40% of the staked balance.

$$\text{working\_balance} = \min\left(l,\ 0.4 \cdot l + 0.6 \cdot L \cdot \frac{\text{ve\_balance}}{\text{ve\_total}}\right)$$

where $l$ is the user's staked balance, $L$ the gauge's total supply, $\text{ve\_balance}$ the user's balance in the voting escrow and $\text{ve\_total}$ its total supply. Working balances are updated on deposits, withdrawals, transfers and [`user_checkpoint`](#user_checkpoint).

### `working_balances`
::::description[`ChildGauge.working_balances(arg0: address) -> uint256: view`]

Getter for the boosted working balance of a user, which determines their share of CRV emissions.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: working balance (`uint256`).

<SourceCode>

```vyper
working_balances: public(HashMap[address, uint256])

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.working_balances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `working_supply`
::::description[`ChildGauge.working_supply() -> uint256: view`]

Getter for the sum of all working balances in the gauge.

Returns: working supply (`uint256`).

<SourceCode>

```vyper
working_supply: public(uint256)

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.working_supply()
```

</Example>

::::

### `voting_escrow`
::::description[`ChildGauge.voting_escrow() -> address: view`]

Getter for the voting escrow contract used to calculate boosts. It is read from the `ChildGaugeFactory` when the gauge is initialized and can be refreshed via [`update_voting_escrow`](#update_voting_escrow).

Returns: voting escrow (`address`).

<SourceCode>

```vyper
voting_escrow: public(address)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.voting_escrow()
```

</Example>

::::

### `update_voting_escrow`
::::description[`ChildGauge.update_voting_escrow()`]

Function to update the gauge's voting escrow to the one currently set in the `ChildGaugeFactory`. Callable by anyone.

<SourceCode>

```vyper
interface Factory:
    def owner() -> address: view
    def manager() -> address: view
    def voting_escrow() -> address: view
    def minted(_user: address, _gauge: address) -> uint256: view
    def crv() -> ERC20: view

@external
def update_voting_escrow():
    """
    @notice Update the voting escrow contract in storage
    """
    self.voting_escrow = FACTORY.voting_escrow()
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.update_voting_escrow()
```

</Example>

::::

---

## CRV Emissions and Checkpoints

CRV emissions for a child gauge are minted on Ethereum by its [`RootGauge`](./root-gauge.md) and bridged to the child gauge. On every checkpoint, the child gauge forwards its CRV balance to the `ChildGaugeFactory` and adds it to the current week's `inflation_rate`, spread over the rest of the week. Each user's entitlement is tracked in `integrate_fraction`, and users claim it from the factory via [`mint`](./child-gauge-factory.md#mint), which checkpoints the user through `user_checkpoint`.

### `claimable_tokens`
::::description[`ChildGauge.claimable_tokens(addr: address) -> uint256`]

Function to get the amount of CRV currently claimable by `addr` from the `ChildGaugeFactory`. It checkpoints the user and is therefore not a `view` function, but it can be called statically to read the value.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `addr` | `address` | Address to check. |

Returns: claimable CRV (`uint256`).

<SourceCode>

```vyper
@external
def claimable_tokens(addr: address) -> uint256:
    """
    @notice Get the number of claimable tokens per user
    @dev This function should be manually changed to "view" in the ABI
    @param addr User to check for
    @return uint256 number of claimable tokens per user
    """
    self._checkpoint(addr)
    return self.integrate_fraction[addr] - FACTORY.minted(addr, self)

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.claimable_tokens('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `user_checkpoint`
::::description[`ChildGauge.user_checkpoint(addr: address) -> bool`]

:::guard[Guarded Method]
This function can only be called by `addr` itself or by the [`ChildGaugeFactory`](./child-gauge-factory.md).
:::

Function to record a checkpoint for `addr`, updating their CRV entitlement and working balance.

| Input  | Type      | Description            |
| ------ | --------- | ---------------------- |
| `addr` | `address` | Address to checkpoint. |

Returns: `True` (`bool`).

Emits: `UpdateLiquidityLimit` event.

<SourceCode>

```vyper
@external
def user_checkpoint(addr: address) -> bool:
    """
    @notice Record a checkpoint for `addr`
    @param addr User address
    @return bool success
    """
    assert msg.sender in [addr, FACTORY.address]  # dev: unauthorized
    self._checkpoint(addr)
    self._update_liquidity_limit(addr, self.balanceOf[addr], self.totalSupply)
    return True

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.user_checkpoint('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `integrate_fraction`
::::description[`ChildGauge.integrate_fraction(arg0: address) -> uint256: view`]

Getter for the total amount of CRV a user has been entitled to, as of their last checkpoint. The amount still claimable is `integrate_fraction` minus what was already minted via the `ChildGaugeFactory`.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: total CRV entitlement (`uint256`).

<SourceCode>

```vyper
# ∫(balance * rate(t) / totalSupply(t) dt) from 0 till checkpoint
# Units: rate * t = already number of coins per address to issue
integrate_fraction: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.integrate_fraction('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `inflation_rate`
::::description[`ChildGauge.inflation_rate(arg0: uint256) -> uint256: view`]

Getter for the CRV emission rate (per second) of a week, where `arg0` is the week number (`timestamp / WEEK`).

| Input  | Type      | Description  |
| ------ | --------- | ------------ |
| `arg0` | `uint256` | Week number. |

Returns: CRV emission rate per second (`uint256`).

<SourceCode>

```vyper
inflation_rate: public(HashMap[uint256, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.inflation_rate(2925)
```

</Example>

::::

### `integrate_checkpoint`
::::description[`ChildGauge.integrate_checkpoint() -> uint256: view`]

Getter for the timestamp of the gauge's last checkpoint.

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
@view
@external
def integrate_checkpoint() -> uint256:
    """
    @notice Get the timestamp of the last checkpoint
    @return Integral value
    """
    return self.period_timestamp[self.period]
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.integrate_checkpoint()
```

</Example>

::::

### `integrate_checkpoint_of`
::::description[`ChildGauge.integrate_checkpoint_of(arg0: address) -> uint256: view`]

Getter for the timestamp of a user's last checkpoint.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
integrate_checkpoint_of: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.integrate_checkpoint_of('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `integrate_inv_supply`
::::description[`ChildGauge.integrate_inv_supply(arg0: int128) -> uint256: view`]

Getter for the integral of the CRV rate divided by the working supply, at checkpoint period `arg0`.

| Input  | Type     | Description        |
| ------ | -------- | ------------------ |
| `arg0` | `int128` | Checkpoint period. |

Returns: integral (`uint256`).

<SourceCode>

```vyper
# 1e18 * ∫(rate(t) / totalSupply(t) dt) from 0 till checkpoint
integrate_inv_supply: public(HashMap[int128, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.integrate_inv_supply(1)
```

</Example>

::::

### `integrate_inv_supply_of`
::::description[`ChildGauge.integrate_inv_supply_of(arg0: address) -> uint256: view`]

Getter for the value of `integrate_inv_supply` at a user's last checkpoint.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: integral (`uint256`).

<SourceCode>

```vyper
# 1e18 * ∫(rate(t) / totalSupply(t) dt) from (last_action) till checkpoint
integrate_inv_supply_of: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.integrate_inv_supply_of('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `period`
::::description[`ChildGauge.period() -> int128: view`]

Getter for the current checkpoint period. It is incremented on every checkpoint.

Returns: period (`int128`).

<SourceCode>

```vyper
# The goal is to be able to calculate ∫(rate * balance / totalSupply dt) from 0 till checkpoint
# All values are kept in units of being multiplied by 1e18
period: public(int128)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.period()
```

</Example>

::::

### `period_timestamp`
::::description[`ChildGauge.period_timestamp(arg0: int128) -> uint256: view`]

Getter for the timestamp of checkpoint period `arg0`.

| Input  | Type     | Description        |
| ------ | -------- | ------------------ |
| `arg0` | `int128` | Checkpoint period. |

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
period_timestamp: public(HashMap[int128, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.period_timestamp(1)
```

</Example>

::::

---

## Root Gauge

Each child gauge can be linked to a [`RootGauge`](./root-gauge.md) on Ethereum, which receives CRV emissions from the `GaugeController` and bridges them to the child gauge.

### `root_gauge`
::::description[`ChildGauge.root_gauge() -> address: view`]

Getter for the root gauge on Ethereum linked to this gauge.

Returns: root gauge (`address`).

<SourceCode>

```vyper
# xchain specific
root_gauge: public(address)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.root_gauge()
```

</Example>

::::

### `set_root_gauge`
::::description[`ChildGauge.set_root_gauge(_root: address)`]

:::guard[Guarded Method]
This function can only be called by the `owner` or the `manager` of the [`ChildGaugeFactory`](./child-gauge-factory.md). The `owner` is an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to set the root gauge, e.g. if something went wrong between implementation updates.

| Input   | Type      | Description        |
| ------- | --------- | ------------------ |
| `_root` | `address` | Root gauge to set. |

<SourceCode>

```vyper
interface Factory:
    def owner() -> address: view
    def manager() -> address: view
    def voting_escrow() -> address: view
    def minted(_user: address, _gauge: address) -> uint256: view
    def crv() -> ERC20: view

@external
def set_root_gauge(_root: address):
    """
    @notice Set Root contract in case something went wrong (e.g. between implementation updates)
    @param _root Root gauge to set
    """
    assert msg.sender in [FACTORY.owner(), FACTORY.manager()]
    assert _root != empty(address)

    self.root_gauge = _root
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_root_gauge('0x1234567890123456789012345678901234567890')
```

</Example>

::::

---

## Killing Gauges

Each child gauge has an `is_killed` flag, but it does not affect the gauge's accounting. To stop CRV emissions to a child gauge, its [`RootGauge`](./root-gauge.md#set_killed) on Ethereum must be killed (see [Killing Sidechain Gauges](./overview.md#killing-sidechain-gauges)).

### `is_killed`
::::description[`ChildGauge.is_killed() -> bool: view`]

Getter for the killed status of the gauge.

Returns: killed status (`bool`).

<SourceCode>

```vyper
is_killed: public(bool)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.is_killed()
False
```

</Example>

::::

### `set_killed`
::::description[`ChildGauge.set_killed(_is_killed: bool)`]

:::guard[Guarded Method]
This function can only be called by the `owner` of the [`ChildGaugeFactory`](./child-gauge-factory.md), an admin contract controlled by the Curve DAO through [cross-chain governance](../../curve-dao/governance/x-gov/overview.md).
:::

Function to set the killed status of the gauge. This only updates the `is_killed` flag.

| Input        | Type   | Description           |
| ------------ | ------ | --------------------- |
| `_is_killed` | `bool` | Killed status to set. |

Emits: `SetKilled` event.

<SourceCode>

```vyper
event SetKilled:
    is_killed: bool

@external
def set_killed(_is_killed: bool):
    """
    @notice Set the killed status for this contract
    @dev Nothing happens, just stop emissions and that's it
    @param _is_killed Killed status to set
    """
    assert msg.sender == FACTORY.owner()  # dev: only owner

    self.is_killed = _is_killed
    log SetKilled(_is_killed)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.set_killed(True)
```

</Example>

::::

---

## Gauge Token

Staked positions are represented by an ERC-20 gauge token with 18 decimals. Transfers checkpoint both the sender and the receiver, so CRV emissions, permissionless rewards and boosts are accounted for correctly when gauge tokens change hands.

### `transfer`
::::description[`ChildGauge.transfer(_to: address, _value: uint256) -> bool`]

Function to transfer `_value` gauge tokens from the caller to `_to`. Both addresses are checkpointed.

| Input    | Type      | Description                   |
| -------- | --------- | ----------------------------- |
| `_to`    | `address` | Receiver of the tokens.       |
| `_value` | `uint256` | Amount of tokens to transfer. |

Returns: `True` (`bool`).

Emits: `Transfer` and `UpdateLiquidityLimit` events.

<SourceCode>

```vyper
event Transfer:
    _from: indexed(address)
    _to: indexed(address)
    _value: uint256

@external
@nonreentrant('lock')
def transfer(_to: address, _value: uint256) -> bool:
    """
    @notice Transfer token for a specified address
    @dev Transferring claims pending reward tokens for the sender and receiver
    @param _to The address to transfer to.
    @param _value The amount to be transferred.
    @return True if transfer passed
    """
    self._transfer(msg.sender, _to, _value)

    return True

@internal
def _transfer(_from: address, _to: address, _value: uint256):
    """
    @notice Transfer tokens as well as checkpoint users
    """
    self._checkpoint(_from)
    self._checkpoint(_to)

    if _value != 0:
        total_supply: uint256 = self.totalSupply
        is_rewards: bool = self.reward_count != 0
        if is_rewards:
            self._checkpoint_rewards(_from, total_supply, False, empty(address))
        new_balance: uint256 = self.balanceOf[_from] - _value
        self.balanceOf[_from] = new_balance
        self._update_liquidity_limit(_from, new_balance, total_supply)

        if is_rewards:
            self._checkpoint_rewards(_to, total_supply, False, empty(address))
        new_balance = self.balanceOf[_to] + _value
        self.balanceOf[_to] = new_balance
        self._update_liquidity_limit(_to, new_balance, total_supply)

    log Transfer(_from, _to, _value)

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.transfer('0x1234567890123456789012345678901234567890', 1000000000000000000)
```

</Example>

::::

### `transferFrom`
::::description[`ChildGauge.transferFrom(_from: address, _to: address, _value: uint256) -> bool`]

Function to transfer `_value` gauge tokens from `_from` to `_to` using the caller's allowance. An allowance of `max_value(uint256)` is not decreased. Both addresses are checkpointed.

| Input    | Type      | Description                      |
| -------- | --------- | -------------------------------- |
| `_from`  | `address` | Address to transfer tokens from. |
| `_to`    | `address` | Receiver of the tokens.          |
| `_value` | `uint256` | Amount of tokens to transfer.    |

Returns: `True` (`bool`).

Emits: `Transfer` and `UpdateLiquidityLimit` events.

<SourceCode>

```vyper
event Transfer:
    _from: indexed(address)
    _to: indexed(address)
    _value: uint256

@external
@nonreentrant('lock')
def transferFrom(_from: address, _to :address, _value: uint256) -> bool:
    """
    @notice Transfer tokens from one address to another.
    @dev Transferring claims pending reward tokens for the sender and receiver
    @param _from address The address which you want to send tokens from
    @param _to address The address which you want to transfer to
    @param _value uint256 the amount of tokens to be transferred
    @return True if transfer passed
    """
    _allowance: uint256 = self.allowance[_from][msg.sender]
    if _allowance != max_value(uint256):
        self.allowance[_from][msg.sender] = _allowance - _value

    self._transfer(_from, _to, _value)

    return True

@internal
def _transfer(_from: address, _to: address, _value: uint256):
    """
    @notice Transfer tokens as well as checkpoint users
    """
    self._checkpoint(_from)
    self._checkpoint(_to)

    if _value != 0:
        total_supply: uint256 = self.totalSupply
        is_rewards: bool = self.reward_count != 0
        if is_rewards:
            self._checkpoint_rewards(_from, total_supply, False, empty(address))
        new_balance: uint256 = self.balanceOf[_from] - _value
        self.balanceOf[_from] = new_balance
        self._update_liquidity_limit(_from, new_balance, total_supply)

        if is_rewards:
            self._checkpoint_rewards(_to, total_supply, False, empty(address))
        new_balance = self.balanceOf[_to] + _value
        self.balanceOf[_to] = new_balance
        self._update_liquidity_limit(_to, new_balance, total_supply)

    log Transfer(_from, _to, _value)

@internal
def _checkpoint(_user: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param _user User address
    """
    period: int128 = self.period
    period_time: uint256 = self.period_timestamp[period]
    integrate_inv_supply: uint256 = self.integrate_inv_supply[period]

    if block.timestamp > period_time:

        working_supply: uint256 = self.working_supply
        prev_week_time: uint256 = period_time
        week_time: uint256 = min((period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(256):
            dt: uint256 = week_time - prev_week_time

            if working_supply != 0:
                # we don't have to worry about crossing inflation epochs
                # and if we miss any weeks, those weeks inflation rates will be 0 for sure
                # but that means no one interacted with the gauge for that long
                integrate_inv_supply += self.inflation_rate[prev_week_time / WEEK] * 10 ** 18 * dt / working_supply

            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)

    # check CRV balance and increase weekly inflation rate by delta for the rest of the week
    crv: ERC20 = FACTORY.crv()
    if crv != empty(ERC20):
        crv_balance: uint256 = crv.balanceOf(self)
        if crv_balance != 0:
            current_week: uint256 = block.timestamp / WEEK
            self.inflation_rate[current_week] += crv_balance / ((current_week + 1) * WEEK - block.timestamp)
            crv.transfer(FACTORY.address, crv_balance)

    period += 1
    self.period = period
    self.period_timestamp[period] = block.timestamp
    self.integrate_inv_supply[period] = integrate_inv_supply

    working_balance: uint256 = self.working_balances[_user]
    self.integrate_fraction[_user] += working_balance * (integrate_inv_supply - self.integrate_inv_supply_of[_user]) / 10 ** 18
    self.integrate_inv_supply_of[_user] = integrate_inv_supply
    self.integrate_checkpoint_of[_user] = block.timestamp

@internal
def _checkpoint_rewards(
    _user: address,
    _total_supply: uint256,
    _claim: bool,
    _receiver: address,
    _tokens: DynArray[address, MAX_REWARDS] = [],
):
    """
    @notice Claim pending rewards and checkpoint rewards for a user
    @param _tokens Reward tokens to transfer when claiming, empty for all except invalidated.
        Rewards that are not transferred stay pending in `claim_data`.
    """

    user_balance: uint256 = 0
    receiver: address = _receiver
    if _user != empty(address):
        user_balance = self.balanceOf[_user]
        if _claim and _receiver == empty(address):
            # if receiver is not explicitly declared, check if a default receiver is set
            receiver = self.rewards_receiver[_user]
            if receiver == empty(address):
                # if no default receiver is set, direct claims to the user
                receiver = _user

    reward_count: uint256 = self.reward_count
    for i in range(MAX_REWARDS):
        if i == reward_count:
            break
        token: address = self.reward_tokens[i]

        integral: uint256 = self.reward_data[token].integral
        period_finish: uint256 = self.reward_data[token].period_finish
        last_update: uint256 = min(block.timestamp, period_finish)
        duration: uint256 = last_update - self.reward_data[token].last_update

        if duration != 0 and _total_supply != 0:
            self.reward_data[token].last_update = last_update

            rate: uint256 = self.reward_data[token].rate
            excess: uint256 = self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            integral_change: uint256 = (duration * rate + excess) * 10**18 / _total_supply
            integral += integral_change
            self.reward_data[token].integral = integral
            # There is still calculation error in user's claimable amount,
            # but it has 18-decimal precision through LP(_total_supply) – safe
            self.reward_remaining[token] -= integral_change * _total_supply / 10**18

        if _user != empty(address):
            integral_for: uint256 = self.reward_integral_for[token][_user]
            new_claimable: uint256 = 0

            if integral_for < integral:
                self.reward_integral_for[token][_user] = integral
                new_claimable = user_balance * (integral - integral_for) / 10**18

            claim_data: uint256 = self.claim_data[_user][token]
            total_claimable: uint256 = (claim_data >> 128) + new_claimable
            if total_claimable > 0:
                total_claimed: uint256 = claim_data % 2**128
                if _claim and (
                    token in _tokens or (len(_tokens) == 0 and not self.invalidated_reward[token])
                ):
                    assert ERC20(token).transfer(receiver, total_claimable, default_return_value=True)
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(_user: address, _user_balance: uint256, _total_supply: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @dev https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/#boost-info
    @param _user The user address
    @param _user_balance User's amount of liquidity (LP tokens)
    @param _total_supply Total amount of liquidity (LP tokens)
    """
    working_balance: uint256 = _user_balance * TOKENLESS_PRODUCTION / 100

    ve: address = self.voting_escrow
    if ve != empty(address):
        ve_ts: uint256 = ERC20(ve).totalSupply()
        if ve_ts != 0:
            working_balance += _total_supply * ERC20(ve).balanceOf(_user) / ve_ts * (100 - TOKENLESS_PRODUCTION) / 100
            working_balance = min(_user_balance, working_balance)

    old_working_balance: uint256 = self.working_balances[_user]
    self.working_balances[_user] = working_balance

    working_supply: uint256 = self.working_supply + working_balance - old_working_balance
    self.working_supply = working_supply

    log UpdateLiquidityLimit(_user, _user_balance, _total_supply, working_balance, working_supply)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.transferFrom('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x1234567890123456789012345678901234567890', 1000000000000000000)
```

</Example>

::::

### `approve`
::::description[`ChildGauge.approve(_spender: address, _value: uint256) -> bool`]

Function to approve `_spender` to transfer up to `_value` of the caller's gauge tokens.

| Input      | Type      | Description                          |
| ---------- | --------- | ------------------------------------ |
| `_spender` | `address` | Address allowed to spend the tokens. |
| `_value`   | `uint256` | Allowance to set.                    |

Returns: `True` (`bool`).

Emits: `Approval` event.

<SourceCode>

```vyper
event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

@external
def approve(_spender : address, _value : uint256) -> bool:
    """
    @notice Approve the passed address to transfer the specified amount of
            tokens on behalf of msg.sender
    @dev Beware that changing an allowance via this method brings the risk
         that someone may use both the old and new allowance by unfortunate
         transaction ordering. This may be mitigated with the use of
         {incraseAllowance} and {decreaseAllowance}.
         https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    @param _spender The address which will transfer the funds
    @param _value The amount of tokens that may be transferred
    @return bool success
    """
    self.allowance[msg.sender][_spender] = _value
    log Approval(msg.sender, _spender, _value)

    return True
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.approve('0x1234567890123456789012345678901234567890', 1000000000000000000)
```

</Example>

::::

### `increaseAllowance`
::::description[`ChildGauge.increaseAllowance(_spender: address, _added_value: uint256) -> bool`]

Function to increase the allowance granted to `_spender` by the caller.

| Input          | Type      | Description                          |
| -------------- | --------- | ------------------------------------ |
| `_spender`     | `address` | Address allowed to spend the tokens. |
| `_added_value` | `uint256` | Amount to increase the allowance by. |

Returns: `True` (`bool`).

Emits: `Approval` event.

<SourceCode>

```vyper
event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

@external
def increaseAllowance(_spender: address, _added_value: uint256) -> bool:
    """
    @notice Increase the allowance granted to `_spender` by the caller
    @dev This is alternative to {approve} that can be used as a mitigation for
         the potential race condition
    @param _spender The address which will transfer the funds
    @param _added_value The amount of to increase the allowance
    @return bool success
    """
    allowance: uint256 = self.allowance[msg.sender][_spender] + _added_value
    self.allowance[msg.sender][_spender] = allowance

    log Approval(msg.sender, _spender, allowance)

    return True
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.increaseAllowance('0x1234567890123456789012345678901234567890', 1000000000000000000)
```

</Example>

::::

### `decreaseAllowance`
::::description[`ChildGauge.decreaseAllowance(_spender: address, _subtracted_value: uint256) -> bool`]

Function to decrease the allowance granted to `_spender` by the caller.

| Input               | Type      | Description                          |
| ------------------- | --------- | ------------------------------------ |
| `_spender`          | `address` | Address allowed to spend the tokens. |
| `_subtracted_value` | `uint256` | Amount to decrease the allowance by. |

Returns: `True` (`bool`).

Emits: `Approval` event.

<SourceCode>

```vyper
event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

@external
def decreaseAllowance(_spender: address, _subtracted_value: uint256) -> bool:
    """
    @notice Decrease the allowance granted to `_spender` by the caller
    @dev This is alternative to {approve} that can be used as a mitigation for
         the potential race condition
    @param _spender The address which will transfer the funds
    @param _subtracted_value The amount of to decrease the allowance
    @return bool success
    """
    allowance: uint256 = self.allowance[msg.sender][_spender] - _subtracted_value
    self.allowance[msg.sender][_spender] = allowance

    log Approval(msg.sender, _spender, allowance)

    return True
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.decreaseAllowance('0x1234567890123456789012345678901234567890', 1000000000000000000)
```

</Example>

::::

### `balanceOf`
::::description[`ChildGauge.balanceOf(arg0: address) -> uint256: view`]

Getter for the gauge token balance of an address, which equals the amount of LP tokens it has staked.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: gauge token balance (`uint256`).

<SourceCode>

```vyper
# ERC20
balanceOf: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.balanceOf('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `totalSupply`
::::description[`ChildGauge.totalSupply() -> uint256: view`]

Getter for the total supply of gauge tokens, which equals the total amount of LP tokens staked in the gauge.

Returns: total supply (`uint256`).

<SourceCode>

```vyper
totalSupply: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.totalSupply()
```

</Example>

::::

### `allowance`
::::description[`ChildGauge.allowance(arg0: address, arg1: address) -> uint256: view`]

Getter for the amount of gauge tokens `arg1` is allowed to transfer on behalf of `arg0`.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `arg0` | `address` | Owner of the tokens. |
| `arg1` | `address` | Spender.             |

Returns: allowance (`uint256`).

<SourceCode>

```vyper
allowance: public(HashMap[address, HashMap[address, uint256]])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.allowance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x1234567890123456789012345678901234567890')
```

</Example>

::::

### `name`
::::description[`ChildGauge.name() -> String[64]: view`]

Getter for the name of the gauge token, `Curve.fi <LP symbol> Gauge Deposit`.

Returns: token name (`String[64]`).

<SourceCode>

```vyper
name: public(String[64])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.name()
```

</Example>

::::

### `symbol`
::::description[`ChildGauge.symbol() -> String[40]: view`]

Getter for the symbol of the gauge token, `<LP symbol>-gauge`.

Returns: token symbol (`String[40]`).

<SourceCode>

```vyper
symbol: public(String[40])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.symbol()
```

</Example>

::::

### `decimals`
::::description[`ChildGauge.decimals() -> uint8: view`]

Getter for the decimals of the gauge token.

Returns: decimals (`uint8`).

<SourceCode>

```vyper
@view
@external
def decimals() -> uint8:
    """
    @notice Get the number of decimals for this token
    @dev Implemented as a view method to reduce gas costs
    @return uint8 decimal places
    """
    return 18
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.decimals()
18
```

</Example>

::::

---

## Permit (EIP-2612)

Allowances can be set by signature via `permit`. Signatures are verified against the gauge's EIP-712 domain, which includes the gauge name, the version string `1.2.0`, the chain ID, the gauge address and a `salt` set at initialization. If the owner is a smart contract, the signature is checked via ERC-1271 `isValidSignature`.

### `permit`
::::description[`ChildGauge.permit(_owner: address, _spender: address, _value: uint256, _deadline: uint256, _v: uint8, _r: bytes32, _s: bytes32) -> bool`]

Function to approve `_spender` to spend `_value` of `_owner`'s gauge tokens using a signature by `_owner`. The signature must be submitted before `_deadline` and is valid for `_owner`'s current nonce only.

| Input       | Type      | Description                                          |
| ----------- | --------- | ---------------------------------------------------- |
| `_owner`    | `address` | Owner of the tokens who signed the permit.           |
| `_spender`  | `address` | Address allowed to spend the tokens.                 |
| `_value`    | `uint256` | Allowance to set.                                    |
| `_deadline` | `uint256` | Timestamp after which the permit is no longer valid. |
| `_v`        | `uint8`   | `v` component of the signature.                      |
| `_r`        | `bytes32` | `r` component of the signature.                      |
| `_s`        | `bytes32` | `s` component of the signature.                      |

Returns: `True` (`bool`).

Emits: `Approval` event.

<SourceCode>

```vyper
event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

EIP2612_TYPEHASH: constant(bytes32) = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")

ERC1271_MAGIC_VAL: constant(bytes32) = 0x1626ba7e00000000000000000000000000000000000000000000000000000000

interface ERC1271:
    def isValidSignature(_hash: bytes32, _signature: Bytes[65]) -> bytes4: view

@external
def permit(
    _owner: address,
    _spender: address,
    _value: uint256,
    _deadline: uint256,
    _v: uint8,
    _r: bytes32,
    _s: bytes32
) -> bool:
    """
    @notice Approves spender by owner's signature to expend owner's tokens.
        See https://eips.ethereum.org/EIPS/eip-2612.
    @dev Inspired by https://github.com/yearn/yearn-vaults/blob/main/contracts/Vault.vy#L753-L793
    @dev Supports smart contract wallets which implement ERC1271
        https://eips.ethereum.org/EIPS/eip-1271
    @param _owner The address which is a source of funds and has signed the Permit.
    @param _spender The address which is allowed to spend the funds.
    @param _value The amount of tokens to be spent.
    @param _deadline The timestamp after which the Permit is no longer valid.
    @param _v The bytes[64] of the valid secp256k1 signature of permit by owner
    @param _r The bytes[0:32] of the valid secp256k1 signature of permit by owner
    @param _s The bytes[32:64] of the valid secp256k1 signature of permit by owner
    @return True, if transaction completes successfully
    """
    assert _owner != empty(address)  # dev: invalid owner
    assert block.timestamp <= _deadline  # dev: permit expired

    nonce: uint256 = self.nonces[_owner]
    digest: bytes32 = keccak256(
        concat(
            b"\x19\x01",
            self.DOMAIN_SEPARATOR,
            keccak256(
                _abi_encode(
                    EIP2612_TYPEHASH, _owner, _spender, _value, nonce, _deadline
                )
            ),
        )
    )
    if _owner.is_contract:
        sig: Bytes[65] = concat(_abi_encode(_r, _s), slice(convert(_v, bytes32), 31, 1))
        assert convert(ERC1271(_owner).isValidSignature(digest, sig), bytes32) == ERC1271_MAGIC_VAL  # dev: invalid signature
    else:
        assert ecrecover(digest, _v, _r, _s) == _owner  # dev: invalid signature

    self.allowance[_owner][_spender] = _value
    self.nonces[_owner] = unsafe_add(nonce, 1)

    log Approval(_owner, _spender, _value)
    return True
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.permit('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '0x1234567890123456789012345678901234567890', 1000000000000000000, 1767225600, 27, '0x…', '0x…')
```

</Example>

::::

### `nonces`
::::description[`ChildGauge.nonces(arg0: address) -> uint256: view`]

Getter for the current permit nonce of an address.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: nonce (`uint256`).

<SourceCode>

```vyper
nonces: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.nonces('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
```

</Example>

::::

### `DOMAIN_SEPARATOR`
::::description[`ChildGauge.DOMAIN_SEPARATOR() -> bytes32: view`]

Getter for the EIP-712 domain separator used for permit signatures. It is set when the gauge is initialized.

Returns: domain separator (`bytes32`).

<SourceCode>

```vyper
EIP712_TYPEHASH: constant(bytes32) = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)")

# ERC2612
DOMAIN_SEPARATOR: public(bytes32)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.DOMAIN_SEPARATOR()
```

</Example>

::::

### `salt`
::::description[`ChildGauge.salt() -> bytes32: view`]

Getter for the salt of the EIP-712 domain, set to the previous block hash when the gauge is initialized.

Returns: salt (`bytes32`).

<SourceCode>

```vyper
salt: public(bytes32)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.salt()
```

</Example>

::::

---

## Other Methods

### `factory`
::::description[`ChildGauge.factory() -> Factory: view`]

Getter for the `ChildGaugeFactory` the implementation was deployed for. It is an immutable of the implementation, so it is the same for every gauge deployed from it.

Returns: factory (`address`).

<SourceCode>

```vyper
# Gauge
FACTORY: immutable(Factory)

@view
@external
def factory() -> Factory:
    """
    @notice Get factory of this gauge
    @return address of factory
    """
    return FACTORY
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.factory()
```

</Example>

::::

### `lp_token`
::::description[`ChildGauge.lp_token() -> address: view`]

Getter for the LP token that is staked in the gauge.

Returns: LP token (`address`).

<SourceCode>

```vyper
lp_token: public(address)
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.lp_token()
```

</Example>

::::

### `version`
::::description[`ChildGauge.version() -> String[8]: pure`]

Getter for the version of the gauge implementation.

Returns: version (`String[8]`).

<SourceCode>

```vyper
VERSION: constant(String[8]) = "1.2.0"

@pure
@external
def version() -> String[8]:
    """
    @notice Get the version of this gauge contract
    @return Version in x.x.x format
    """
    return VERSION
```

</SourceCode>

<Example>

```shell
>>> ChildGauge.version()
'1.2.0'
```

</Example>

::::
