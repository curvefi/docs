# CurveLMCallbackFactory

`CurveLMCallbackFactory` deploys LM Callback contracts for LlamaLend and crvUSD markets from a shared blueprint. LM Callbacks let an AMM route liquidity-mining incentives to depositors, and the factory tracks every LM Callback it has deployed as a permanent, on-chain registry.

:::vyper[`CurveLMCallbackFactory.vy`]

The source code for the `CurveLMCallbackFactory.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lm_callback/LMCallbackFactory.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3`.

The contract is deployed on :logos-ethereum: Ethereum at [`0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D`](https://etherscan.io/address/0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D).

<ContractABI>


```json
[{"inputs":[{"name":"_owner","type":"address"},{"name":"_blueprint","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previous_owner","type":"address"},{"indexed":true,"name":"new_owner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"old_blueprint","type":"address"},{"indexed":false,"name":"new_blueprint","type":"address"}],"name":"UpdateLMCallbackBlueprint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"amm","type":"address"},{"indexed":true,"name":"deployer","type":"address"},{"indexed":true,"name":"blueprint","type":"address"},{"indexed":false,"name":"lm_callback","type":"address"}],"name":"DeployedLMCallback","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"stateMutability":"nonpayable","type":"function","name":"deploy_lm_callback","inputs":[{"name":"_amm","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"get_lm_callback","inputs":[{"name":"_i","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"get_lm_callback_by_amm","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"get_blueprint_by_lm_callback","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"get_lm_callback_count","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"pause","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"unpause","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_blueprint","inputs":[{"name":"_blueprint","type":"address"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"nonpayable","type":"function","name":"transfer_ownership","inputs":[{"name":"new_owner","type":"address"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"paused","inputs":[],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"lm_callback_blueprint","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"is_valid_gauge","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]}]
```

</ContractABI>

:::

## LM Callback Deployment

### `deploy_lm_callback`
::::description[`CurveLMCallbackFactory.deploy_lm_callback(_amm: IAMM) -> address`]

Deploys a new LM Callback from the current blueprint for the given LlamaLend/crvUSD AMM. The call reverts if the factory is paused. It also reverts if the AMM's most recently deployed LM Callback already came from the blueprint currently set — this stops the same market from being handed two identical callbacks back to back. Only the AMM's newest callback is checked, not every callback ever deployed for it, so rotating the blueprint away and back does allow another deployment from the earlier blueprint. The function is guarded against reentrancy because the blueprint's constructor hands control to the caller-supplied `_amm`, and the reentrancy lock keeps the registry writes below atomic with respect to the deployment they describe.

| Input | Type   | Description                                              |
| ----- | ------ | ---------------------------------------------------------- |
| `_amm` | `address` | LlamaLend AMM the deployed LM Callback is going to be used for |

Returns: address of the deployed LM Callback (`address`).

Emits: `DeployedLMCallback` event.

<SourceCode>

```vyper
@external
@nonreentrant
def deploy_lm_callback(_amm: IAMM) -> address:
    """
    @notice Deploy an LM Callback
    @dev Reentrancy-locked because the blueprint constructor hands control to
    the caller-supplied `_amm`; the lock keeps the registry writes below
    atomic with respect to the deployment they describe
    @dev Reverts if the AMM's newest callback came from the blueprint currently
    set, so a market cannot be handed two identical callbacks back to back.
    Only that newest callback is compared, not every one ever deployed for the
    AMM: rotating the blueprint away and back therefore does allow another
    deployment from the earlier blueprint
    @param _amm LlamaLend AMM the deployed LM Callback is going to be used for
    @return Address of the deployed LM Callback
    """
    pausable._require_not_paused()

    lm_callback_blueprint: address = self.lm_callback_blueprint
    existing_lm_callback: address = self.get_lm_callback_by_amm[_amm.address]
    if existing_lm_callback != empty(address):
        assert (
            self.get_blueprint_by_lm_callback[existing_lm_callback]
            != lm_callback_blueprint
        ), "already deployed"

    lm_callback: address = create_from_blueprint(
        lm_callback_blueprint,
        _amm,
        code_offset=3,
    )

    self.is_valid_gauge[lm_callback] = True
    self._lm_callbacks.append(lm_callback)
    self.get_lm_callback_by_amm[_amm.address] = lm_callback
    self.get_blueprint_by_lm_callback[lm_callback] = lm_callback_blueprint

    log ILMCallbackFactory.DeployedLMCallback(
        amm=_amm.address,
        deployer=msg.sender,
        blueprint=lm_callback_blueprint,
        lm_callback=lm_callback,
    )

    return lm_callback
```

</SourceCode>

<Example>

```shell
>>> CurveLMCallbackFactory.deploy_lm_callback("0x0000000000000000000000000000000000000A")
```

</Example>

::::

### `get_lm_callback`
::::description[`CurveLMCallbackFactory.get_lm_callback(_i: uint256) -> address: view`]

Returns the address of the LM Callback deployed at index `_i` in the factory's registry.

| Input | Type      | Description             |
| ----- | --------- | ------------------------ |
| `_i`  | `uint256` | Index of the LM Callback |

Returns: address of the LM Callback (`address`).

<SourceCode>

```vyper
@external
@view
def get_lm_callback(_i: uint256) -> address:
    """
    @notice Get the LM Callback deployed at index `_i`
    @param _i Index of the LM Callback
    @return Address of the LM Callback
    """
    return self._lm_callbacks[_i]
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function get_lm_callback(uint256) view returns (address)"]}
  method="get_lm_callback"
  args={["0"]}
  labels={["_i"]}
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `get_lm_callback_by_amm`
::::description[`CurveLMCallbackFactory.get_lm_callback_by_amm(arg0: address) -> address: view`]

Returns the most recent LM Callback this factory deployed for a given AMM, or the zero address if it has never deployed one for it. This reflects deploy-time intent, not necessarily live state: the Controller's Configurator can point an AMM's callback at any address it likes, and detaching one is never reflected here. To find out what an AMM is actually using right now, query the AMM itself rather than the factory.

| Input  | Type      | Description   |
| ------ | --------- | ------------- |
| `arg0` | `address` | AMM address   |

Returns: address of the AMM's most recently factory-deployed LM Callback, or the zero address (`address`).

<SourceCode>

```vyper
# The newest callback this factory deployed for an AMM - deploy-time intent, not
# live state: the Configurator can attach any address it likes, and a detach is
# never reflected here. Ask the AMM itself for what is currently attached
get_lm_callback_by_amm: public(HashMap[address, address])
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function get_lm_callback_by_amm(address) view returns (address)"]}
  method="get_lm_callback_by_amm"
  args={["0x0000000000000000000000000000000000000A"]}
  labels={["_amm"]}
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `get_blueprint_by_lm_callback`
::::description[`CurveLMCallbackFactory.get_blueprint_by_lm_callback(arg0: address) -> address: view`]

Returns the blueprint a given LM Callback was created from. This is kept both for the duplicate-deploy check in `deploy_lm_callback` and so integrations can tell different callback generations apart.

| Input  | Type      | Description        |
| ------ | --------- | -------------------- |
| `arg0` | `address` | LM Callback address |

Returns: address of the blueprint the LM Callback was deployed from (`address`).

<SourceCode>

```vyper
# Blueprint each callback was created from, kept for the duplicate check in
# `deploy_lm_callback` and so integrations can tell callback generations apart
get_blueprint_by_lm_callback: public(HashMap[address, address])
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function get_blueprint_by_lm_callback(address) view returns (address)"]}
  method="get_blueprint_by_lm_callback"
  args={["0x0000000000000000000000000000000000000A"]}
  labels={["_lm_callback"]}
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `get_lm_callback_count`
::::description[`CurveLMCallbackFactory.get_lm_callback_count() -> uint256: view`]

Returns the number of LM Callbacks deployed by this factory.

Returns: number of deployed LM Callbacks (`uint256`).

<SourceCode>

```vyper
@external
@view
def get_lm_callback_count() -> uint256:
    """
    @notice Get the number of LM Callbacks deployed by this factory
    @return Number of deployed LM Callbacks
    """
    return len(self._lm_callbacks)
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function get_lm_callback_count() view returns (uint256)"]}
  method="get_lm_callback_count"
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `lm_callback_blueprint`
::::description[`CurveLMCallbackFactory.lm_callback_blueprint() -> address: view`]

Returns the address of the blueprint contract that `deploy_lm_callback` currently deploys from.

Returns: address of the LM Callback blueprint (`address`).

<SourceCode>

```vyper
lm_callback_blueprint: public(address)
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function lm_callback_blueprint() view returns (address)"]}
  method="lm_callback_blueprint"
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `is_valid_gauge`
::::description[`CurveLMCallbackFactory.is_valid_gauge(arg0: address) -> bool: view`]

Returns `True` if the given address is an LM Callback deployed by this factory. This getter is named after the convention gauge factories use — integrations validate a gauge by asking its factory for `is_valid_gauge`, and LM Callbacks are gauges from that point of view — rather than being named directly after `LMCallback`. It was renamed from `is_valid_lm_callback` in the previous version of this contract; the check itself is unchanged.

| Input  | Type      | Description                     |
| ------ | --------- | -------------------------------- |
| `arg0` | `address` | Address to check                 |

Returns: whether the address is a valid, factory-deployed LM Callback (`bool`).

<SourceCode>

```vyper
# Named after the gauge factories' getter rather than after the callback:
# integrations validate a gauge by asking its factory for `is_valid_gauge`,
# and LM Callbacks are gauges from their point of view
is_valid_gauge: public(HashMap[address, bool])
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function is_valid_gauge(address) view returns (bool)"]}
  method="is_valid_gauge"
  args={["0x0000000000000000000000000000000000000A"]}
  labels={["_lm_callback"]}
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `set_blueprint`
::::description[`CurveLMCallbackFactory.set_blueprint(_blueprint: address)`]

:::guard[Guarded Method]
This function is only callable by the `owner` of the contract. The `owner` in this case is ideally the Curve DAO. So, rotating the LM Callback blueprint used by `deploy_lm_callback` is in the hands of the DAO.
:::

Sets the blueprint that `deploy_lm_callback` deploys from. Reverts on the zero address: the blueprint can be rotated but never unset, so new deployments are halted with `pause()` instead.

| Input        | Type      | Description                          |
| ------------ | --------- | -------------------------------------- |
| `_blueprint` | `address` | The address of the blueprint to use  |

Emits: `UpdateLMCallbackBlueprint` event.

<SourceCode>

<Tabs>
<TabItem value="CurveLMCallbackFactory.vy" label="CurveLMCallbackFactory.vy">

```vyper
@external
def set_blueprint(_blueprint: address):
    """
    @notice Set the blueprint
    @dev Reverts on the empty address: the blueprint can be rotated but never
    unset, so deployments are halted with pause() instead
    @param _blueprint The address of the blueprint to use
    """
    ownable._check_owner()
    self._set_blueprint(_blueprint)

@internal
def _set_blueprint(_blueprint: address):
    assert _blueprint != empty(address)  # dev: zero blueprint
    log ILMCallbackFactory.UpdateLMCallbackBlueprint(
        old_blueprint=self.lm_callback_blueprint, new_blueprint=_blueprint
    )
    self.lm_callback_blueprint = _blueprint
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
@internal
def _check_owner():
    """
    @dev Throws if the sender is not the owner.
    """
    assert msg.sender == self.owner, "ownable: caller is not the owner"
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> CurveLMCallbackFactory.set_blueprint("0x0000000000000000000000000000000000000B")
```

</Example>

::::

## Pausing

### `pause`
::::description[`CurveLMCallbackFactory.pause()`]

:::guard[Guarded Method]
This function is only callable by the `owner` of the contract. The `owner` in this case is ideally the Curve DAO. So, halting new LM Callback deployments is in the hands of the DAO.
:::

Pauses new LM Callback deployments. While paused, `deploy_lm_callback` reverts.

Emits: `Paused` event.

<SourceCode>

<Tabs>
<TabItem value="CurveLMCallbackFactory.vy" label="CurveLMCallbackFactory.vy">

```vyper
@external
def pause():
    """
    @notice Pause new LM Callback deployments
    """
    ownable._check_owner()
    pausable._pause()
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
@internal
def _check_owner():
    """
    @dev Throws if the sender is not the owner.
    """
    assert msg.sender == self.owner, "ownable: caller is not the owner"
```

</TabItem>
<TabItem value="pausable.vy" label="pausable.vy (Snekmate 🐍)">

```vyper
@internal
def _pause():
    """
    @dev Triggers the pause state. Note that the contract
         must not be paused.
    @notice This is an `internal` function without access
            restriction.
    """
    self._require_not_paused()
    self.paused = True
    log Paused(account=msg.sender)

@internal
def _require_not_paused():
    """
    @dev Throws if the contract is paused.
    """
    assert not self.paused, "pausable: contract is paused"
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> CurveLMCallbackFactory.pause()
```

</Example>

::::

### `unpause`
::::description[`CurveLMCallbackFactory.unpause()`]

:::guard[Guarded Method]
This function is only callable by the `owner` of the contract. The `owner` in this case is ideally the Curve DAO. So, resuming LM Callback deployments is in the hands of the DAO.
:::

Unpauses the factory, allowing `deploy_lm_callback` to be called again.

Emits: `Unpaused` event.

<SourceCode>

<Tabs>
<TabItem value="CurveLMCallbackFactory.vy" label="CurveLMCallbackFactory.vy">

```vyper
@external
def unpause():
    """
    @notice Unpause the factory to allow new LM Callback deployments
    """
    ownable._check_owner()
    pausable._unpause()
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
@internal
def _check_owner():
    """
    @dev Throws if the sender is not the owner.
    """
    assert msg.sender == self.owner, "ownable: caller is not the owner"
```

</TabItem>
<TabItem value="pausable.vy" label="pausable.vy (Snekmate 🐍)">

```vyper
@internal
def _unpause():
    """
    @dev Lifts the pause state. Note that the contract
         must be paused.
    @notice This is an `internal` function without access
            restriction.
    """
    self._require_paused()
    self.paused = False
    log Unpaused(account=msg.sender)

@internal
def _require_paused():
    """
    @dev Throws if the contract is not paused.
    """
    assert self.paused, "pausable: contract is not paused"
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> CurveLMCallbackFactory.unpause()
```

</Example>

::::

### `paused`
::::description[`CurveLMCallbackFactory.paused() -> bool: view`]

Returns whether the factory is currently paused. While paused, `deploy_lm_callback` reverts.

Returns: whether the factory is paused (`bool`).

<SourceCode>

```vyper
paused: public(bool)
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function paused() view returns (bool)"]}
  method="paused"
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

## Contract Ownership

### `owner`
::::description[`CurveLMCallbackFactory.owner() -> address: view`]

Returns the address of the current owner of the factory.

Returns: address of the current owner (`address`).

<SourceCode>

```vyper
owner: public(address)
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function owner() view returns (address)"]}
  method="owner"
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::

### `transfer_ownership`
::::description[`CurveLMCallbackFactory.transfer_ownership(new_owner: address)`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the contract.
:::

Transfers ownership of the contract to a new account. The new owner cannot be the zero address. Note that `renounce_ownership` is intentionally not exported by this factory: with a zero owner, the blueprint could never be updated again.

| Input       | Type      | Description                      |
| ----------- | --------- | ---------------------------------- |
| `new_owner` | `address` | The 20-byte address of the new owner |

Emits: `OwnershipTransferred` event.

<SourceCode>

<Tabs>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
@external
def transfer_ownership(new_owner: address):
    """
    @dev Transfers the ownership of the contract
         to a new account `new_owner`.
    @notice Note that this function can only be
            called by the current `owner`. Also,
            the `new_owner` cannot be the zero address.
    @param new_owner The 20-byte address of the new owner.
    """
    self._check_owner()
    assert new_owner != empty(address), "ownable: new owner is the zero address"
    self._transfer_ownership(new_owner)

@internal
def _check_owner():
    """
    @dev Throws if the sender is not the owner.
    """
    assert msg.sender == self.owner, "ownable: caller is not the owner"

@internal
def _transfer_ownership(new_owner: address):
    """
    @dev Transfers the ownership of the contract
         to a new account `new_owner`.
    @notice This is an `internal` function without
            access restriction.
    """
    old_owner: address = self.owner
    self.owner = new_owner
    log OwnershipTransferred(previous_owner=old_owner, new_owner=new_owner)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

```shell
>>> CurveLMCallbackFactory.transfer_ownership("0x0000000000000000000000000000000000000C")
```

</Example>

::::

## Other Methods

### `version`
::::description[`CurveLMCallbackFactory.version() -> String[5]: view`]

Returns the version of this factory contract as a string.

Returns: contract version (`String[5]`).

<SourceCode>

```vyper
version: public(constant(String[5])) = "1.0.0"
```

</SourceCode>

<Example>

<ContractCall
  address="0x2191718CD32d02B8E60BAdFFeA33E4B5DD9A0A0D"
  abi={["function version() view returns (string)"]}
  method="version"
  contractName="CurveLMCallbackFactory"
/>

</Example>

::::
