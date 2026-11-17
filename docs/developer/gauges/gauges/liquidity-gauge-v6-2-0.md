# Liquidity Gauge v6.2.0

`LiquidityGauge` v6.2.0 is the latest liquidity gauge implementation for Ethereum mainnet. Liquidity providers stake (deposit) their LP tokens into the gauge to earn boosted CRV emissions and any permissionless rewards added to it. Staked positions are tokenized as an ERC-20 "gauge token" which supports EIP-2612 `permit`, including signatures from smart contract wallets (ERC-1271).

The implementation is deployed as a blueprint contract. Gauges are created from it by a factory using `create_from_blueprint`, so the implementation itself cannot be called; all methods documented below are called on the gauges deployed from it. There are two variants of the implementation, which only differ in how a gauge is deployed and which factory role holds admin rights (see [Implementation Variants](#implementation-variants)).

:::vyper[`LiquidityGauge.vy`]

The source code for the `LiquidityGauge.vy` contract can be found on [GitHub](https://github.com/curvefi/stableswap-ng/blob/feat/gauge-6.2.0/contracts/main/LiquidityGauge.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.3.10`.

The implementation (blueprint) is deployed on :logos-ethereum: Ethereum at:

- Pool factories (Stableswap-NG, Twocrypto-NG and Tricrypto-NG): [`0x9a09ea6277483c54447A85D49431886218803c09`](https://etherscan.io/address/0x9a09ea6277483c54447A85D49431886218803c09)
- `GaugeFactory`: [`0x9A09eF62C5a38Ad86b7721f616D6Ab433EBC2f9c`](https://etherscan.io/address/0x9A09eF62C5a38Ad86b7721f616D6Ab433EBC2f9c)

<ContractABI>

<Tabs>
<TabItem value="pool-factories" label="Pool factories">

```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"original_balance","type":"uint256"},{"indexed":false,"name":"original_supply","type":"uint256"},{"indexed":false,"name":"working_balance","type":"uint256"},{"indexed":false,"name":"working_supply","type":"uint256"}],"name":"UpdateLiquidityLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"index","type":"uint256"}],"name":"AddReward","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"distributor","type":"address"}],"name":"SetDistributor","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"is_killed","type":"bool"}],"name":"SetKilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_gauge_manager","type":"address"}],"name":"SetGaugeManager","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"invalidated","type":"bool"}],"name":"SetRewardInvalidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"name":"_lp_token","type":"address"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"},{"name":"_claim_rewards","type":"bool"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"},{"name":"_receiver","type":"address"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"},{"name":"_tokens","type":"address[]"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"permit","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_added_value","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_subtracted_value","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"user_checkpoint","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_receiver","type":"address"}],"name":"set_rewards_receiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"kick","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_gauge_manager","type":"address"}],"name":"set_gauge_manager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_epoch","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"}],"name":"recover_remaining","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"add_reward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"set_reward_distributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_invalidated","type":"bool"}],"name":"set_reward_invalidated","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_is_killed","type":"bool"}],"name":"set_killed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_token","type":"address"}],"name":"claimed_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_reward_token","type":"address"}],"name":"claimable_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"claimable_tokens","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"integrate_checkpoint","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"future_epoch_time","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"inflation_rate","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"salt","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"nonces","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lp_token","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"is_killed","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reward_count","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_data","outputs":[{"components":[{"name":"token","type":"address"},{"name":"distributor","type":"address"},{"name":"period_finish","type":"uint256"},{"name":"rate","type":"uint256"},{"name":"last_update","type":"uint256"},{"name":"integral","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"invalidated_reward","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_remaining","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"rewards_receiver","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"reward_integral_for","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"working_balances","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"working_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_inv_supply_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_checkpoint_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_fraction","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"period","outputs":[{"name":"","type":"int128"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"reward_tokens","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"period_timestamp","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"integrate_inv_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
```

</TabItem>
<TabItem value="gauge-factory" label="GaugeFactory">

```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"provider","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"original_balance","type":"uint256"},{"indexed":false,"name":"original_supply","type":"uint256"},{"indexed":false,"name":"working_balance","type":"uint256"},{"indexed":false,"name":"working_supply","type":"uint256"}],"name":"UpdateLiquidityLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"index","type":"uint256"}],"name":"AddReward","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"distributor","type":"address"}],"name":"SetDistributor","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"is_killed","type":"bool"}],"name":"SetKilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_gauge_manager","type":"address"}],"name":"SetGaugeManager","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"reward","type":"address"},{"indexed":false,"name":"invalidated","type":"bool"}],"name":"SetRewardInvalidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"name":"_lp_token","type":"address"},{"name":"_manager","type":"address"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_addr","type":"address"},{"name":"_claim_rewards","type":"bool"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"},{"name":"_claim_rewards","type":"bool"},{"name":"_receiver","type":"address"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_receiver","type":"address"},{"name":"_tokens","type":"address[]"}],"name":"claim_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"permit","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_added_value","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_spender","type":"address"},{"name":"_subtracted_value","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"user_checkpoint","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_receiver","type":"address"}],"name":"set_rewards_receiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"kick","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_gauge_manager","type":"address"}],"name":"set_gauge_manager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_epoch","type":"uint256"}],"name":"deposit_reward_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"}],"name":"recover_remaining","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"add_reward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_distributor","type":"address"}],"name":"set_reward_distributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_reward_token","type":"address"},{"name":"_invalidated","type":"bool"}],"name":"set_reward_invalidated","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_is_killed","type":"bool"}],"name":"set_killed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_addr","type":"address"},{"name":"_token","type":"address"}],"name":"claimed_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_user","type":"address"},{"name":"_reward_token","type":"address"}],"name":"claimable_reward","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"name":"claimable_tokens","outputs":[{"name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"integrate_checkpoint","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"future_epoch_time","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"inflation_rate","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"salt","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"nonces","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lp_token","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"is_killed","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reward_count","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_data","outputs":[{"components":[{"name":"token","type":"address"},{"name":"distributor","type":"address"},{"name":"period_finish","type":"uint256"},{"name":"rate","type":"uint256"},{"name":"last_update","type":"uint256"},{"name":"integral","type":"uint256"}],"name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"invalidated_reward","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"reward_remaining","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"rewards_receiver","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"name":"reward_integral_for","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"working_balances","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"working_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_inv_supply_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_checkpoint_of","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"integrate_fraction","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"period","outputs":[{"name":"","type":"int128"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"reward_tokens","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"period_timestamp","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"uint256"}],"name":"integrate_inv_supply","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
```

</TabItem>
</Tabs>

</ContractABI>

:::

:::info[What's new in v6.2.0]

Compared to [`LiquidityGaugeV6`](liquidity-gauge-v6.md), this version:

- Lets users claim only selected reward tokens via the new `_tokens` argument of [`claim_rewards`](#claim_rewards).
- Adds [`set_reward_invalidated`](#set_reward_invalidated), which excludes a reward token from default claims (e.g. when its `transfer` reverts), so claiming the other rewards keeps working.
- Tracks undistributed reward amounts in [`reward_remaining`](#reward_remaining) to fix precision loss, and adds [`recover_remaining`](#recover_remaining) to return leftover reward dust to the distributor once a distribution period has ended.
- Caps reward deposits at `2**96` tokens.
- Adds a `_receiver` argument to [`withdraw`](#withdraw).
- Supports ERC-1271 signatures in [`permit`](#permit) and uses a salted EIP-712 domain separator.
- Returns `uint8` from [`decimals`](#decimals) and makes [`version`](#version) a `pure` function.

:::

---

## Implementation Variants

Both implementations share the same code apart from the constructor and the factory role that holds admin rights:

| | Pool factories | `GaugeFactory` |
| --- | --- | --- |
| Deployed by | Stableswap-NG, Twocrypto-NG and Tricrypto-NG factories via `deploy_gauge(_pool)` | [`GaugeFactory`](gauge-factory.md) via `deploy_gauge(_lp_token, ...)` |
| Constructor | `__init__(_lp_token: address)` | `__init__(_lp_token: address, _manager: address)` |
| Initial `manager` | `tx.origin` of the deployment transaction | `_manager` passed by the factory |
| Factory admin role | `factory.admin()` | `factory.owner()` |

When a gauge is deployed, its `name` is set to `Curve.fi <LP symbol> Gauge Deposit` and its `symbol` to `<LP symbol>-gauge`. The constructor also stores the current CRV inflation parameters and builds the EIP-712 domain separator, using the previous block hash as `salt`.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

```vyper
@external
def __init__(_lp_token: address):
    """
    @notice Contract constructor
    @param _lp_token Liquidity Pool contract address
    """
    lp_token = ERC20(_lp_token)
    self.factory = Factory(msg.sender)
    self.manager = tx.origin
    log SetGaugeManager(tx.origin)

    symbol: String[32] = ERC20Extended(_lp_token).symbol()
    name: String[64] = concat("Curve.fi ", symbol, " Gauge Deposit")

    self.name = name
    self.symbol = concat(symbol, "-gauge")

    self.period_timestamp[0] = block.timestamp
    self.inflation_params = ((CRV20(CRV).future_epoch_time_write() << 216) + CRV20(CRV).rate())

    salt = block.prevhash
    DOMAIN_SEPARATOR = keccak256(
        _abi_encode(
            EIP712_TYPEHASH,
            keccak256(name),
            keccak256(VERSION),
            chain.id,
            self,
            salt,
        )
    )
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

```vyper
@external
def __init__(_lp_token: address, _manager: address):
    """
    @notice Contract constructor
    @param _lp_token Liquidity Pool contract address
    @param _manager The address to set as manager of the gauge
    """
    lp_token = ERC20(_lp_token)
    self.factory = Factory(msg.sender)
    self.manager = _manager
    log SetGaugeManager(_manager)

    symbol: String[32] = ERC20Extended(_lp_token).symbol()
    name: String[64] = concat("Curve.fi ", symbol, " Gauge Deposit")

    self.name = name
    self.symbol = concat(symbol, "-gauge")

    self.period_timestamp[0] = block.timestamp
    self.inflation_params = ((CRV20(CRV).future_epoch_time_write() << 216) + CRV20(CRV).rate())

    salt = block.prevhash
    DOMAIN_SEPARATOR = keccak256(
        _abi_encode(
            EIP712_TYPEHASH,
            keccak256(name),
            keccak256(VERSION),
            chain.id,
            self,
            salt,
        )
    )
```

</TabItem>
</Tabs>

</SourceCode>

---

## Depositing and Withdrawing

LP tokens can be deposited into or withdrawn from a gauge at any time. User interfaces usually call this "staking" and "unstaking"; in the source code, the functions are `deposit` and `withdraw`.

When LP tokens are deposited, the gauge mints the same amount of gauge tokens to the depositor; withdrawing burns them and returns the LP tokens. Every deposit and withdrawal checkpoints the user's CRV emissions and permissionless rewards, and recalculates their boosted working balance.

### `deposit`
::::description[`LiquidityGauge.deposit(_value: uint256, _addr: address = msg.sender, _claim_rewards: bool = False)`]

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
@nonreentrant("lock")
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

        lp_token.transferFrom(msg.sender, self, _value)

        log Deposit(_addr, _value)
        log Transfer(empty(address), _addr, _value)

@internal
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.deposit(1000000000000000000)
>>> LiquidityGauge.deposit(1000000000000000000, '0x989AEb4d175e16225E39E87d0D97A3360524AD80', True)
```

</Example>

::::

### `withdraw`
::::description[`LiquidityGauge.withdraw(_value: uint256, _claim_rewards: bool = False, _receiver: address = msg.sender)`]

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
@nonreentrant("lock")
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

        lp_token.transfer(_receiver, _value)

        log Withdraw(msg.sender, _value)
        log Transfer(msg.sender, empty(address), _value)

@internal
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.withdraw(1000000000000000000)
>>> LiquidityGauge.withdraw(1000000000000000000, True, '0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

---

## Claiming Rewards

Permissionless rewards are claimed with `claim_rewards`. By default, it claims every reward token of the gauge except those marked as invalidated (see [`set_reward_invalidated`](#set_reward_invalidated)). Passing a list of `_tokens` claims only those tokens, including invalidated ones. Rewards that are not claimed stay claimable.

:::info[CRV emissions are claimed from the `Minter`]

`claim_rewards` only claims permissionless rewards. CRV emissions directed to the gauge are claimed from the [`Minter`](../minter.md) contract using its [`mint`](../minter.md#mint) function.

:::

The gauge checkpoints permissionless rewards when a reward token is deposited (a global checkpoint), when gauge tokens are transferred (for both sender and receiver), on deposits and withdrawals, and when rewards are claimed.

### `claim_rewards`
::::description[`LiquidityGauge.claim_rewards(_addr: address = msg.sender, _receiver: address = empty(address), _tokens: DynArray[address, MAX_REWARDS] = [])`]

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
@nonreentrant("lock")
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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.claim_rewards()
>>> LiquidityGauge.claim_rewards('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0x0000000000000000000000000000000000000000', ['0xD533a949740bb3306d119CC777fa900bA034cd52'])
```

</Example>

::::

### `claimed_reward`
::::description[`LiquidityGauge.claimed_reward(_addr: address, _token: address) -> uint256: view`]

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
>>> LiquidityGauge.claimed_reward('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

### `claimable_reward`
::::description[`LiquidityGauge.claimable_reward(_user: address, _reward_token: address) -> uint256: view`]

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
>>> LiquidityGauge.claimable_reward('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

### `rewards_receiver`
::::description[`LiquidityGauge.rewards_receiver(arg0: address) -> address: view`]

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
>>> LiquidityGauge.rewards_receiver('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `set_rewards_receiver`
::::description[`LiquidityGauge.set_rewards_receiver(_receiver: address)`]

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
>>> LiquidityGauge.set_rewards_receiver('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `reward_integral_for`
::::description[`LiquidityGauge.reward_integral_for(arg0: address, arg1: address) -> uint256: view`]

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
>>> LiquidityGauge.reward_integral_for('0xD533a949740bb3306d119CC777fa900bA034cd52', '0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

---

## Permissionless Rewards

Besides CRV emissions, up to eight additional reward tokens can be distributed through a gauge. The gauge `manager` (or the factory admin) adds a reward token together with a `distributor` via [`add_reward`](#add_reward). Only the distributor of a token can deposit it via [`deposit_reward_token`](#deposit_reward_token), which streams the deposited amount (plus anything left over from the previous period) to stakers over the chosen epoch.

The `manager` of a gauge deployed by a pool factory is `tx.origin` of the deployment transaction. For gauges deployed through the `GaugeFactory`, it is the `_manager` passed by the factory.

:::info[Permissionless rewards are not boosted]

Permissionless rewards are distributed based on a user's unboosted share of the gauge's total supply. If Alice holds 10% of the staked LP tokens, she receives 10% of the rewards, regardless of her veCRV balance.

:::

### `reward_data`
::::description[`LiquidityGauge.reward_data(arg0: address) -> Reward: view`]

Getter for the distribution data of a reward token.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | Reward token. |

Returns: token (`address`), distributor (`address`), period_finish (`uint256`), rate (`uint256`), last_update (`uint256`) and integral (`uint256`).

<SourceCode>

```vyper
struct Reward:
    token: address
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
>>> LiquidityGauge.reward_data('0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

### `reward_tokens`
::::description[`LiquidityGauge.reward_tokens(arg0: uint256) -> address: view`]

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
>>> LiquidityGauge.reward_tokens(0)
```

</Example>

::::

### `reward_count`
::::description[`LiquidityGauge.reward_count() -> uint256: view`]

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
>>> LiquidityGauge.reward_count()
```

</Example>

::::

### `reward_remaining`
::::description[`LiquidityGauge.reward_remaining(arg0: address) -> uint256: view`]

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
>>> LiquidityGauge.reward_remaining('0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

### `invalidated_reward`
::::description[`LiquidityGauge.invalidated_reward(arg0: address) -> bool: view`]

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
>>> LiquidityGauge.invalidated_reward('0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

### `manager`
::::description[`LiquidityGauge.manager() -> address: view`]

Getter for the manager of the gauge. The manager can add reward tokens, reassign distributors, invalidate reward tokens and transfer the manager role.

Returns: gauge manager (`address`).

<SourceCode>

```vyper
manager: public(address)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.manager()
```

</Example>

::::

### `add_reward`
::::description[`LiquidityGauge.add_reward(_reward_token: address, _distributor: address)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the admin of the factory that deployed it. For gauges deployed by the Stableswap-NG, Twocrypto-NG or Tricrypto-NG factories, this is the factory's `admin`; for gauges deployed through the [`GaugeFactory`](gauge-factory.md), it is the factory's `owner`. On Ethereum, both are admin contracts controlled by the Curve DAO.
:::

Function to add a reward token and set its distributor. Up to eight reward tokens can be added, and a reward token cannot be removed once added. The reward token cannot be the zero address, the gauge itself or the LP token.

| Input           | Type      | Description                                  |
| --------------- | --------- | -------------------------------------------- |
| `_reward_token` | `address` | Reward token to add.                         |
| `_distributor`  | `address` | Address allowed to deposit the reward token. |

Emits: `AddReward` and `SetDistributor` events.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

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
    assert msg.sender in [self.manager, self.factory.admin()]  # dev: only manager or factory admin
    assert _distributor != empty(address)  # dev: distributor cannot be zero address
    assert _reward_token not in [
        empty(address), self, lp_token.address
    ]

    reward_count: uint256 = self.reward_count
    assert reward_count < MAX_REWARDS
    assert self.reward_data[_reward_token].distributor == empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    self.reward_tokens[reward_count] = _reward_token
    self.reward_count = reward_count + 1
    log AddReward(_reward_token, reward_count)
    log SetDistributor(_reward_token, _distributor)
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

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
    assert msg.sender in [self.manager, self.factory.owner()]  # dev: only manager or factory admin
    assert _distributor != empty(address)  # dev: distributor cannot be zero address
    assert _reward_token not in [
        empty(address), self, lp_token.address
    ]

    reward_count: uint256 = self.reward_count
    assert reward_count < MAX_REWARDS
    assert self.reward_data[_reward_token].distributor == empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    self.reward_tokens[reward_count] = _reward_token
    self.reward_count = reward_count + 1
    log AddReward(_reward_token, reward_count)
    log SetDistributor(_reward_token, _distributor)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.add_reward('0xD533a949740bb3306d119CC777fa900bA034cd52', '0xC56706334afE5a1638845ED9168E2ca3b3dbCCe7')
```

</Example>

::::

### `set_gauge_manager`
::::description[`LiquidityGauge.set_gauge_manager(_gauge_manager: address)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the admin of the factory that deployed it. For gauges deployed by the Stableswap-NG, Twocrypto-NG or Tricrypto-NG factories, this is the factory's `admin`; for gauges deployed through the [`GaugeFactory`](gauge-factory.md), it is the factory's `owner`. On Ethereum, both are admin contracts controlled by the Curve DAO.
:::

Function to set a new manager for the gauge.

| Input            | Type      | Description        |
| ---------------- | --------- | ------------------ |
| `_gauge_manager` | `address` | New gauge manager. |

Emits: `SetGaugeManager` event.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

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
    assert msg.sender in [self.manager, self.factory.admin()]  # dev: only manager or factory admin

    self.manager = _gauge_manager
    log SetGaugeManager(_gauge_manager)
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

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
    assert msg.sender in [self.manager, self.factory.owner()]  # dev: only manager or factory admin

    self.manager = _gauge_manager
    log SetGaugeManager(_gauge_manager)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.set_gauge_manager('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `set_reward_distributor`
::::description[`LiquidityGauge.set_reward_distributor(_reward_token: address, _distributor: address)`]

:::guard[Guarded Method]
This function can only be called by the current `distributor` of the reward token, the `manager` of the gauge, or by the admin of the factory that deployed it. For gauges deployed by the Stableswap-NG, Twocrypto-NG or Tricrypto-NG factories, this is the factory's `admin`; for gauges deployed through the [`GaugeFactory`](gauge-factory.md), it is the factory's `owner`. On Ethereum, both are admin contracts controlled by the Curve DAO.
:::

Function to reassign the distributor of an existing reward token.

| Input           | Type      | Description      |
| --------------- | --------- | ---------------- |
| `_reward_token` | `address` | Reward token.    |
| `_distributor`  | `address` | New distributor. |

Emits: `SetDistributor` event.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

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

    assert msg.sender in [current_distributor, self.factory.admin(), self.manager]
    assert current_distributor != empty(address)
    assert _distributor != empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    log SetDistributor(_reward_token, _distributor)
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

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

    assert msg.sender in [current_distributor, self.factory.owner(), self.manager]
    assert current_distributor != empty(address)
    assert _distributor != empty(address)

    self.reward_data[_reward_token].distributor = _distributor
    log SetDistributor(_reward_token, _distributor)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.set_reward_distributor('0xD533a949740bb3306d119CC777fa900bA034cd52', '0xC56706334afE5a1638845ED9168E2ca3b3dbCCe7')
```

</Example>

::::

### `set_reward_invalidated`
::::description[`LiquidityGauge.set_reward_invalidated(_reward_token: address, _invalidated: bool)`]

:::guard[Guarded Method]
This function can only be called by the `manager` of the gauge or by the admin of the factory that deployed it. For gauges deployed by the Stableswap-NG, Twocrypto-NG or Tricrypto-NG factories, this is the factory's `admin`; for gauges deployed through the [`GaugeFactory`](gauge-factory.md), it is the factory's `owner`. On Ethereum, both are admin contracts controlled by the Curve DAO.
:::

Function to invalidate or restore a reward token. An invalidated token is skipped by [`claim_rewards`](#claim_rewards) without `_tokens`, and by `deposit` and `withdraw` with `_claim_rewards=True`. This keeps claims of the other rewards working if a token's `transfer` reverts. Rewards of an invalidated token keep accruing and remain claimable by listing the token explicitly in `claim_rewards(_tokens)`.

| Input           | Type      | Description                                                 |
| --------------- | --------- | ----------------------------------------------------------- |
| `_reward_token` | `address` | Reward token.                                               |
| `_invalidated`  | `bool`    | `True` to skip the token by default, `False` to restore it. |

Emits: `SetRewardInvalidated` event.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

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
    assert msg.sender in [self.manager, self.factory.admin()]  # dev: only manager or factory admin
    assert self.reward_data[_reward_token].distributor != empty(address)  # dev: not a reward

    self.invalidated_reward[_reward_token] = _invalidated
    log SetRewardInvalidated(_reward_token, _invalidated)
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

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
    assert msg.sender in [self.manager, self.factory.owner()]  # dev: only manager or factory admin
    assert self.reward_data[_reward_token].distributor != empty(address)  # dev: not a reward

    self.invalidated_reward[_reward_token] = _invalidated
    log SetRewardInvalidated(_reward_token, _invalidated)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.set_reward_invalidated('0xD533a949740bb3306d119CC777fa900bA034cd52', True)
```

</Example>

::::

### `deposit_reward_token`
::::description[`LiquidityGauge.deposit_reward_token(_reward_token: address, _amount: uint256, _epoch: uint256 = WEEK)`]

:::guard[Guarded Method]
This function can only be called by the `distributor` of `_reward_token`, which is set by the gauge `manager` or the factory admin via [`add_reward`](#add_reward) and [`set_reward_distributor`](#set_reward_distributor).
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
    assert ERC20(_reward_token).transferFrom(msg.sender, self, _amount, default_return_value=True)
    amount_received = ERC20(_reward_token).balanceOf(self) - amount_received

    total_amount: uint256 = self.reward_remaining[_reward_token] + amount_received
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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.deposit_reward_token('0xD533a949740bb3306d119CC777fa900bA034cd52', 1000000000000000000000)
```

</Example>

::::

### `recover_remaining`
::::description[`LiquidityGauge.recover_remaining(_reward_token: address)`]

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

    assert ERC20(_reward_token).transfer(
        self.reward_data[_reward_token].distributor,
        self.reward_remaining[_reward_token],
        default_return_value=True,
    )
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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.recover_remaining('0xD533a949740bb3306d119CC777fa900bA034cd52')
```

</Example>

::::

---

## Boosting

CRV emissions are distributed according to a user's boosted `working_balances` rather than their raw gauge balance. Without veCRV, a user's working balance is 40% of their staked LP tokens; with enough veCRV (using `adjusted_balance_of` from the veBoost proxy), it reaches 100%, a boost of 2.5x. The calculation is the same as in [`LiquidityGaugeV6`](liquidity-gauge-v6.md#boosting-your-lp-tokens):

$$\text{lim} = \min\left(l,\ 0.4 \cdot l + 0.6 \cdot L \cdot \frac{\text{voting\_balance}}{\text{voting\_total}}\right)$$

where $l$ is the user's staked balance, $L$ the gauge's total supply, $\text{voting\_balance}$ the user's adjusted veCRV balance and $\text{voting\_total}$ the total veCRV supply. Working balances are updated on deposits, withdrawals, transfers, [`user_checkpoint`](#user_checkpoint) and [`kick`](#kick).

### `working_balances`
::::description[`LiquidityGauge.working_balances(arg0: address) -> uint256: view`]

Getter for the boosted working balance of a user, which determines their share of CRV emissions.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: working balance (`uint256`).

<SourceCode>

```vyper
working_balances: public(HashMap[address, uint256])

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.working_balances('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `working_supply`
::::description[`LiquidityGauge.working_supply() -> uint256: view`]

Getter for the sum of all working balances in the gauge.

Returns: working supply (`uint256`).

<SourceCode>

```vyper
working_supply: public(uint256)

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.working_supply()
```

</Example>

::::

---

## CRV Emissions and Checkpoints

The gauge tracks each user's CRV entitlement in `integrate_fraction`. It is updated on checkpoints, using the gauge's relative weight from the `GaugeController` and the CRV inflation rate. The `Minter` calls `user_checkpoint` when minting and transfers `integrate_fraction - minted` CRV to the user. If the gauge is killed, the inflation rate used is zero.

### `claimable_tokens`
::::description[`LiquidityGauge.claimable_tokens(addr: address) -> uint256`]

Function to get the amount of CRV currently claimable by `addr` from the `Minter`. It checkpoints the user and is therefore not a `view` function, but it can be called statically to read the value.

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
    return self.integrate_fraction[addr] - Minter(MINTER).minted(addr, self)

@internal
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.claimable_tokens('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `user_checkpoint`
::::description[`LiquidityGauge.user_checkpoint(addr: address) -> bool`]

:::guard[Guarded Method]
This function can only be called by `addr` itself or by the [`Minter`](../minter.md) contract.
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
    assert msg.sender in [addr, MINTER]  # dev: unauthorized
    self._checkpoint(addr)
    self._update_liquidity_limit(addr, self.balanceOf[addr], self.totalSupply)
    return True

@internal
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.user_checkpoint('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `kick`
::::description[`LiquidityGauge.kick(addr: address)`]

Function to reset the boost of `addr` when it is no longer backed by veCRV. A user can be kicked if their veCRV lock has expired or if they had a new veCRV event since their last gauge checkpoint, and their working balance is above the unboosted 40% of their balance. Callable by anyone.

| Input  | Type      | Description      |
| ------ | --------- | ---------------- |
| `addr` | `address` | Address to kick. |

Emits: `UpdateLiquidityLimit` event.

<SourceCode>

```vyper
@external
def kick(addr: address):
    """
    @notice Kick `addr` for abusing their boost
    @dev Only if either they had another voting event, or their voting escrow lock expired
    @param addr Address to kick
    """
    t_last: uint256 = self.integrate_checkpoint_of[addr]
    t_ve: uint256 = VotingEscrow(VOTING_ESCROW).user_point_history__ts(
        addr, VotingEscrow(VOTING_ESCROW).user_point_epoch(addr)
    )
    _balance: uint256 = self.balanceOf[addr]

    assert ERC20(VOTING_ESCROW).balanceOf(addr) == 0 or t_ve > t_last  # dev: kick not allowed
    assert (
        self.working_balances[addr] > _balance * TOKENLESS_PRODUCTION / 100
    )  # dev: kick not needed

    self._checkpoint(addr)
    self._update_liquidity_limit(addr, self.balanceOf[addr], self.totalSupply)

@internal
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.kick('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `integrate_fraction`
::::description[`LiquidityGauge.integrate_fraction(arg0: address) -> uint256: view`]

Getter for the total amount of CRV a user has been entitled to since they first interacted with the gauge, as of their last checkpoint. The amount still claimable is `integrate_fraction` minus what was already minted via the `Minter`.

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
>>> LiquidityGauge.integrate_fraction('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `integrate_checkpoint`
::::description[`LiquidityGauge.integrate_checkpoint() -> uint256: view`]

Getter for the timestamp of the gauge's last checkpoint.

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
@view
@external
def integrate_checkpoint() -> uint256:
    """
    @notice Get the timestamp of the last checkpoint
    @return uint256 Timestamp of the last checkpoint
    """
    return self.period_timestamp[self.period]
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.integrate_checkpoint()
```

</Example>

::::

### `integrate_checkpoint_of`
::::description[`LiquidityGauge.integrate_checkpoint_of(arg0: address) -> uint256: view`]

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
>>> LiquidityGauge.integrate_checkpoint_of('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `integrate_inv_supply`
::::description[`LiquidityGauge.integrate_inv_supply(arg0: uint256) -> uint256: view`]

Getter for the integral of the CRV rate divided by the working supply, at checkpoint period `arg0`.

| Input  | Type      | Description        |
| ------ | --------- | ------------------ |
| `arg0` | `uint256` | Checkpoint period. |

Returns: integral (`uint256`).

<SourceCode>

```vyper
# 1e18 * ∫(rate(t) / totalSupply(t) dt) from 0 till checkpoint
integrate_inv_supply: public(
    uint256[100000000000000000000000000000]
)  # bump epoch when rate() changes
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.integrate_inv_supply(1)
```

</Example>

::::

### `integrate_inv_supply_of`
::::description[`LiquidityGauge.integrate_inv_supply_of(arg0: address) -> uint256: view`]

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
>>> LiquidityGauge.integrate_inv_supply_of('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `period`
::::description[`LiquidityGauge.period() -> int128: view`]

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
>>> LiquidityGauge.period()
```

</Example>

::::

### `period_timestamp`
::::description[`LiquidityGauge.period_timestamp(arg0: uint256) -> uint256: view`]

Getter for the timestamp of checkpoint period `arg0`.

| Input  | Type      | Description        |
| ------ | --------- | ------------------ |
| `arg0` | `uint256` | Checkpoint period. |

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
period_timestamp: public(uint256[100000000000000000000000000000])
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.period_timestamp(1)
```

</Example>

::::

### `inflation_rate`
::::description[`LiquidityGauge.inflation_rate() -> uint256: view`]

Getter for the CRV inflation rate stored in the gauge. It is read from the CRV token at deployment and refreshed on the first checkpoint after a new inflation epoch starts.

Returns: CRV inflation rate per second (`uint256`).

<SourceCode>

```vyper
@view
@external
def inflation_rate() -> uint256:
    """
    @notice Get the locally stored CRV inflation rate
    @return uint256 Inflation rate
    """
    return self.inflation_params % 2**216
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.inflation_rate()
```

</Example>

::::

### `future_epoch_time`
::::description[`LiquidityGauge.future_epoch_time() -> uint256: view`]

Getter for the start time of the next CRV inflation epoch, as stored in the gauge.

Returns: timestamp (`uint256`).

<SourceCode>

```vyper
@view
@external
def future_epoch_time() -> uint256:
    """
    @notice Get the locally stored CRV future epoch start time
    @return uint256 Future epoch start time
    """
    return self.inflation_params >> 216
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.future_epoch_time()
```

</Example>

::::

---

## Killing Gauges

A killed gauge accrues no CRV emissions: checkpoints use an inflation rate of zero. Permissionless rewards are not affected and keep being distributed.

### `is_killed`
::::description[`LiquidityGauge.is_killed() -> bool: view`]

Getter to check whether the gauge is killed.

Returns: killed status (`bool`).

<SourceCode>

```vyper
is_killed: public(bool)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.is_killed()
False
```

</Example>

::::

### `set_killed`
::::description[`LiquidityGauge.set_killed(_is_killed: bool)`]

:::guard[Guarded Method]
This function can only be called by the admin of the factory that deployed the gauge: the `admin` of the pool factory for gauges deployed by the Stableswap-NG, Twocrypto-NG or Tricrypto-NG factories, or the `owner` of the [`GaugeFactory`](gauge-factory.md) for gauges deployed through it. On Ethereum, both are admin contracts controlled by the Curve DAO, so killing a gauge is in the hands of the DAO.
:::

Function to set the killed status of the gauge. While killed, the gauge cannot earn CRV emissions. Killing a gauge is not meant to be undone.

| Input        | Type   | Description           |
| ------------ | ------ | --------------------- |
| `_is_killed` | `bool` | Killed status to set. |

Emits: `SetKilled` event.

<SourceCode>

<Tabs>
<TabItem value="pool-factories" label="LiquidityGauge.vy (pool factories)">

```vyper
event SetKilled:
    is_killed: bool

@external
def set_killed(_is_killed: bool):
    """
    @notice Set the killed status for this contract
    @dev When killed, the gauge always yields a rate of 0 and so cannot mint CRV.
        Not meant to be unkilled.
    @param _is_killed Killed status to set
    """
    assert msg.sender == self.factory.admin()  # dev: only owner

    self.is_killed = _is_killed
    log SetKilled(_is_killed)
```

</TabItem>
<TabItem value="gauge-factory" label="LiquidityGauge.vy (GaugeFactory)">

```vyper
event SetKilled:
    is_killed: bool

@external
def set_killed(_is_killed: bool):
    """
    @notice Set the killed status for this contract
    @dev When killed, the gauge always yields a rate of 0 and so cannot mint CRV.
        Not meant to be unkilled.
    @param _is_killed Killed status to set
    """
    assert msg.sender == self.factory.owner()  # dev: only owner

    self.is_killed = _is_killed
    log SetKilled(_is_killed)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.set_killed(True)
```

</Example>

::::

---

## Gauge Token

Staked positions are represented by an ERC-20 gauge token with 18 decimals. Transfers checkpoint both the sender and the receiver, so CRV emissions, permissionless rewards and boosts are accounted for correctly when gauge tokens change hands.

### `transfer`
::::description[`LiquidityGauge.transfer(_to: address, _value: uint256) -> bool`]

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
@nonreentrant("lock")
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
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.transfer('0x989AEb4d175e16225E39E87d0D97A3360524AD80', 1000000000000000000)
```

</Example>

::::

### `transferFrom`
::::description[`LiquidityGauge.transferFrom(_from: address, _to: address, _value: uint256) -> bool`]

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
@nonreentrant("lock")
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
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
def _checkpoint(addr: address):
    """
    @notice Checkpoint a user calculating their CRV entitlement
    @param addr User address
    """
    _period: int128 = self.period
    _period_time: uint256 = self.period_timestamp[_period]
    _integrate_inv_supply: uint256 = self.integrate_inv_supply[_period]

    inflation_params: uint256 = self.inflation_params
    prev_future_epoch: uint256 = inflation_params >> 216
    gauge_is_killed: bool = self.is_killed

    rate: uint256 = inflation_params % 2**216
    new_rate: uint256 = rate

    # New mining epoch started, time to update inflation parameters
    if block.timestamp >= prev_future_epoch:
        future_epoch_time_write: uint256 = CRV20(CRV).future_epoch_time_write()
        new_rate = CRV20(CRV).rate()
        self.inflation_params = (future_epoch_time_write << 216) + new_rate

    if gauge_is_killed:
        rate = 0
        new_rate = 0


    # Update integral of 1/supply
    if block.timestamp > _period_time:
        _working_supply: uint256 = self.working_supply
        Controller(GAUGE_CONTROLLER).checkpoint_gauge(self)
        prev_week_time: uint256 = _period_time
        week_time: uint256 = min((_period_time + WEEK) / WEEK * WEEK, block.timestamp)

        for i in range(500):
            dt: uint256 = week_time - prev_week_time
            w: uint256 = Controller(GAUGE_CONTROLLER).gauge_relative_weight(self, prev_week_time)

            if _working_supply > 0:
                if prev_future_epoch >= prev_week_time and prev_future_epoch < week_time:
                    # If we went across one or multiple epochs, apply the rate
                    # of the first epoch until it ends, and then the rate of
                    # the last epoch.
                    # If more than one epoch is crossed - the gauge gets less,
                    # but that'd mean it wasn't called for more than 1 year
                    _integrate_inv_supply += (
                        rate * w * (prev_future_epoch - prev_week_time) / _working_supply
                    )
                    rate = new_rate
                    _integrate_inv_supply += (
                        rate * w * (week_time - prev_future_epoch) / _working_supply
                    )
                else:
                    _integrate_inv_supply += rate * w * dt / _working_supply
                # On precisions of the calculation
                # rate ~= 10e18
                # last_weight > 0.01 * 1e18 = 1e16 (if pool weight is 1%)
                # _working_supply ~= TVL * 1e18 ~= 1e26 ($100M for example)
                # The largest loss is at dt = 1
                # Loss is 1e-9 - acceptable


            if week_time == block.timestamp:
                break
            prev_week_time = week_time
            week_time = min(week_time + WEEK, block.timestamp)
    _period += 1
    self.period = _period
    self.period_timestamp[_period] = block.timestamp
    self.integrate_inv_supply[_period] = _integrate_inv_supply

    # Update user-specific integrals
    _working_balance: uint256 = self.working_balances[addr]
    self.integrate_fraction[addr] += (
        _working_balance * (_integrate_inv_supply - self.integrate_inv_supply_of[addr]) / 10**18
    )
    self.integrate_inv_supply_of[addr] = _integrate_inv_supply
    self.integrate_checkpoint_of[addr] = block.timestamp

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
            excess: uint256 = (
                self.reward_remaining[token] - (period_finish - last_update + duration) * rate
            )
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
                    assert ERC20(token).transfer(
                        receiver, total_claimable, default_return_value=True
                    )
                    self.claim_data[_user][token] = total_claimed + total_claimable
                elif new_claimable > 0:
                    self.claim_data[_user][token] = total_claimed + (total_claimable << 128)

@internal
def _update_liquidity_limit(addr: address, l: uint256, L: uint256):
    """
    @notice Calculate working balances to apply amplification of CRV production.
    @param addr User address
    @param l User's amount of liquidity (LP tokens)
    @param L Total amount of liquidity (LP tokens)
    """
    # To be called after totalSupply is updated
    voting_balance: uint256 = VotingEscrowBoost(VEBOOST_PROXY).adjusted_balance_of(addr)
    voting_total: uint256 = ERC20(VOTING_ESCROW).totalSupply()

    lim: uint256 = l * TOKENLESS_PRODUCTION / 100
    if voting_total > 0:
        lim += L * voting_balance / voting_total * (100 - TOKENLESS_PRODUCTION) / 100

    lim = min(l, lim)
    old_bal: uint256 = self.working_balances[addr]
    self.working_balances[addr] = lim
    _working_supply: uint256 = self.working_supply + lim - old_bal
    self.working_supply = _working_supply

    log UpdateLiquidityLimit(addr, l, L, lim, _working_supply)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.transferFrom('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0xC56706334afE5a1638845ED9168E2ca3b3dbCCe7', 1000000000000000000)
```

</Example>

::::

### `approve`
::::description[`LiquidityGauge.approve(_spender: address, _value: uint256) -> bool`]

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
def approve(_spender: address, _value: uint256) -> bool:
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
>>> LiquidityGauge.approve('0x989AEb4d175e16225E39E87d0D97A3360524AD80', 1000000000000000000)
```

</Example>

::::

### `increaseAllowance`
::::description[`LiquidityGauge.increaseAllowance(_spender: address, _added_value: uint256) -> bool`]

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
>>> LiquidityGauge.increaseAllowance('0x989AEb4d175e16225E39E87d0D97A3360524AD80', 1000000000000000000)
```

</Example>

::::

### `decreaseAllowance`
::::description[`LiquidityGauge.decreaseAllowance(_spender: address, _subtracted_value: uint256) -> bool`]

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
>>> LiquidityGauge.decreaseAllowance('0x989AEb4d175e16225E39E87d0D97A3360524AD80', 1000000000000000000)
```

</Example>

::::

### `balanceOf`
::::description[`LiquidityGauge.balanceOf(arg0: address) -> uint256: view`]

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
>>> LiquidityGauge.balanceOf('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `totalSupply`
::::description[`LiquidityGauge.totalSupply() -> uint256: view`]

Getter for the total supply of gauge tokens, which equals the total amount of LP tokens staked in the gauge.

Returns: total supply (`uint256`).

<SourceCode>

```vyper
totalSupply: public(uint256)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.totalSupply()
```

</Example>

::::

### `allowance`
::::description[`LiquidityGauge.allowance(arg0: address, arg1: address) -> uint256: view`]

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
>>> LiquidityGauge.allowance('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0xC56706334afE5a1638845ED9168E2ca3b3dbCCe7')
```

</Example>

::::

### `name`
::::description[`LiquidityGauge.name() -> String[64]: view`]

Getter for the name of the gauge token, `Curve.fi <LP symbol> Gauge Deposit`.

Returns: token name (`String[64]`).

<SourceCode>

```vyper
name: public(String[64])
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.name()
```

</Example>

::::

### `symbol`
::::description[`LiquidityGauge.symbol() -> String[40]: view`]

Getter for the symbol of the gauge token, `<LP symbol>-gauge`.

Returns: token symbol (`String[40]`).

<SourceCode>

```vyper
symbol: public(String[40])
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.symbol()
```

</Example>

::::

### `decimals`
::::description[`LiquidityGauge.decimals() -> uint8: view`]

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
>>> LiquidityGauge.decimals()
18
```

</Example>

::::

---

## Permit (EIP-2612)

Allowances can be set by signature via `permit`. Signatures are verified against the gauge's EIP-712 domain, which includes the gauge name, the version string `v6.2.0`, the chain ID, the gauge address and a `salt` set at deployment. If the owner is a smart contract, the signature is checked via ERC-1271 `isValidSignature`.

### `permit`
::::description[`LiquidityGauge.permit(_owner: address, _spender: address, _value: uint256, _deadline: uint256, _v: uint8, _r: bytes32, _s: bytes32) -> bool`]

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

EIP2612_TYPEHASH: constant(bytes32) = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
)

ERC1271_MAGIC_VAL: constant(
    bytes32
) = 0x1626ba7e00000000000000000000000000000000000000000000000000000000

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
    _s: bytes32,
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
            DOMAIN_SEPARATOR,
            keccak256(_abi_encode(EIP2612_TYPEHASH, _owner, _spender, _value, nonce, _deadline)),
        )
    )
    if _owner.is_contract:
        sig: Bytes[65] = concat(_abi_encode(_r, _s), slice(convert(_v, bytes32), 31, 1))
        assert (
            convert(ERC1271(_owner).isValidSignature(digest, sig), bytes32) == ERC1271_MAGIC_VAL
        )  # dev: invalid signature
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
>>> LiquidityGauge.permit('0x989AEb4d175e16225E39E87d0D97A3360524AD80', '0xC56706334afE5a1638845ED9168E2ca3b3dbCCe7', 1000000000000000000, 1767225600, 27, '0x…', '0x…')
```

</Example>

::::

### `nonces`
::::description[`LiquidityGauge.nonces(arg0: address) -> uint256: view`]

Getter for the current permit nonce of an address.

| Input  | Type      | Description       |
| ------ | --------- | ----------------- |
| `arg0` | `address` | Address to check. |

Returns: nonce (`uint256`).

<SourceCode>

```vyper
# ERC2612
nonces: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.nonces('0x989AEb4d175e16225E39E87d0D97A3360524AD80')
```

</Example>

::::

### `DOMAIN_SEPARATOR`
::::description[`LiquidityGauge.DOMAIN_SEPARATOR() -> bytes32: view`]

Getter for the EIP-712 domain separator used for permit signatures. It is set at deployment.

Returns: domain separator (`bytes32`).

<SourceCode>

```vyper
EIP712_TYPEHASH: constant(bytes32) = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
)

# @notice Get the EIP-712 domain separator used for permit signatures
# @return bytes32 Domain separator hash
DOMAIN_SEPARATOR: public(immutable(bytes32))
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.DOMAIN_SEPARATOR()
```

</Example>

::::

### `salt`
::::description[`LiquidityGauge.salt() -> bytes32: view`]

Getter for the salt of the EIP-712 domain, set to the previous block hash at deployment.

Returns: salt (`bytes32`).

<SourceCode>

```vyper
salt: public(immutable(bytes32))
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.salt()
```

</Example>

::::

---

## Other Methods

### `factory`
::::description[`LiquidityGauge.factory() -> address: view`]

Getter for the factory that deployed the gauge. Its admin (`admin()` for pool factories, `owner()` for the `GaugeFactory`) holds admin rights over the gauge.

Returns: factory (`address`).

<SourceCode>

```vyper
# Gauge
factory: public(Factory)
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.factory()
```

</Example>

::::

### `lp_token`
::::description[`LiquidityGauge.lp_token() -> address: view`]

Getter for the LP token that is staked in the gauge.

Returns: LP token (`address`).

<SourceCode>

```vyper
lp_token: public(immutable(ERC20))
```

</SourceCode>

<Example>

```shell
>>> LiquidityGauge.lp_token()
```

</Example>

::::

### `version`
::::description[`LiquidityGauge.version() -> String[8]: pure`]

Getter for the version of the gauge implementation.

Returns: version (`String[8]`).

<SourceCode>

```vyper
VERSION: constant(String[8]) = "v6.2.0"

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
>>> LiquidityGauge.version()
'v6.2.0'
```

</Example>

::::
