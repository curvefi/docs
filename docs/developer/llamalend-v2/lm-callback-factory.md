# CurveLMCallbackFactory

The `CurveLMCallbackFactory` deploys [`LMCallback`](./lm-callback.md) contracts for Llamalend markets from a single blueprint. An LM Callback acts as a liquidity gauge for the collateral deposited in a market's AMM: once it receives gauge weight in the `GaugeController`, it streams CRV emissions to the market's borrowers.

The factory only deploys callbacks and keeps a registry of them. Deploying a callback does not activate it: a callback starts earning only after it is set as the AMM's liquidity mining callback through the market's `Configurator` and added to the `GaugeController` by the DAO.

Deployment is permissionless. Anyone can call `deploy_lm_callback` for an AMM, while the owner of the factory controls the blueprint, can pause new deployments, and is the account allowed to pause CRV rewards on every callback deployed by this factory (see [`LMCallback.set_killed`](./lm-callback.md#set_killed)).

:::vyper[`LMCallbackFactory.vy`]

The source code for the `LMCallbackFactory.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-stablecoin/blob/master/curve_stablecoin/lm_callback/LMCallbackFactory.vy). The contract is written in [Vyper](https://vyperlang.org/) version `0.4.3` and uses the [Snekmate](https://github.com/pcaversaccio/snekmate) `ownable` and `pausable` modules.

The contract is deployed on :logos-ethereum: Ethereum at [`0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0`](https://etherscan.io/address/0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0).

<ContractABI>

```json
[{"anonymous":false,"inputs":[{"indexed":true,"name":"previous_owner","type":"address"},{"indexed":true,"name":"new_owner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"old_blueprint","type":"address"},{"indexed":false,"name":"new_blueprint","type":"address"}],"name":"UpdateLMCallbackBlueprint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"amm","type":"address"},{"indexed":true,"name":"deployer","type":"address"},{"indexed":true,"name":"blueprint","type":"address"},{"indexed":false,"name":"lm_callback","type":"address"}],"name":"DeployedLMCallback","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"new_owner","type":"address"}],"name":"transfer_ownership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_amm","type":"address"}],"name":"deploy_lm_callback","outputs":[{"name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_i","type":"uint256"}],"name":"get_lm_callback","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"get_lm_callback_count","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_blueprint","type":"address"}],"name":"set_blueprint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lm_callback_blueprint","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"is_valid_gauge","outputs":[{"name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"get_lm_callback_by_amm","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"arg0","type":"address"}],"name":"get_blueprint_by_lm_callback","outputs":[{"name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_blueprint","type":"address"}],"outputs":[],"stateMutability":"nonpayable","type":"constructor"}]
```

</ContractABI>

:::

---

## Deploying LM Callbacks

### `deploy_lm_callback`
::::description[`LMCallbackFactory.deploy_lm_callback(_amm: IAMM) -> address`]

Deploys a new `LMCallback` for the AMM `_amm` from the current `lm_callback_blueprint`. Anyone can call this function while the factory is not paused.

The new callback is registered as a valid gauge (`is_valid_gauge`), appended to the list of deployed callbacks, recorded as the newest callback for the AMM (`get_lm_callback_by_amm`), and linked to the blueprint it was created from (`get_blueprint_by_lm_callback`).

The call reverts with `"already deployed"` if the AMM's newest callback was created from the blueprint that is currently set, so a market cannot receive two identical callbacks back to back. Only the newest callback is compared: after the blueprint has been rotated, a new callback can be deployed for an AMM that already has one from an earlier blueprint.

The callback constructor reads the collateral token from `_amm.coins(1)` and requires it to have 18 decimals. The function is reentrancy-locked because the blueprint constructor calls into the caller-supplied AMM.

Deploying a callback does not attach it to the AMM. Attaching is done through the market's `Configurator`, and CRV only flows once the DAO has added the callback to the `GaugeController`.

| Input  | Type      | Description                                               |
| ------ | --------- | --------------------------------------------------------- |
| `_amm` | `address` | Llamalend AMM the LM Callback is deployed for.            |

Returns: address of the deployed LM Callback (`address`).

Emits: `DeployedLMCallback` event.

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

```vyper
event DeployedLMCallback:
    amm: indexed(address)
    deployer: indexed(address)
    blueprint: indexed(address)
    lm_callback: address

MAX_LM_CALLBACKS: constant(uint256) = 10**18

lm_callback_blueprint: public(address)
is_valid_gauge: public(HashMap[address, bool])
get_lm_callback_by_amm: public(HashMap[address, address])
get_blueprint_by_lm_callback: public(HashMap[address, address])

_lm_callbacks: DynArray[address, MAX_LM_CALLBACKS]

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

</TabItem>
<TabItem value="pausable.vy" label="pausable.vy (Snekmate 🐍)">

```vyper
paused: public(bool)

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
>>> LMCallbackFactory.deploy_lm_callback("0xAMM...")
'0xLMCallback...'
```

</Example>

::::

---

## Blueprint

### `lm_callback_blueprint`
::::description[`LMCallbackFactory.lm_callback_blueprint() -> address: view`]

Getter for the blueprint that new LM Callbacks are deployed from. It is set in the constructor and can be changed by the owner via `set_blueprint`. The blueprint can never be the zero address.

Returns: LM Callback blueprint (`address`).

<SourceCode>

```vyper
lm_callback_blueprint: public(address)

@deploy
def __init__(
    _owner: address,
    _blueprint: address,
):
    """
    @notice Factory which creates LM Callbacks for LlamaLend/crvUSD markets from a blueprint
    @param _owner Owner of the factory, allowed to update the blueprint (ideally DAO)
    @param _blueprint Address of the LM Callback blueprint
    """
    ownable.__init__()
    pausable.__init__()
    assert _owner != empty(address)  # dev: zero owner
    ownable._transfer_ownership(_owner)

    self._set_blueprint(_blueprint)

@internal
def _set_blueprint(_blueprint: address):
    assert _blueprint != empty(address)  # dev: zero blueprint
    log ILMCallbackFactory.UpdateLMCallbackBlueprint(
        old_blueprint=self.lm_callback_blueprint, new_blueprint=_blueprint
    )
    self.lm_callback_blueprint = _blueprint
```

</SourceCode>

<Example>

<ContractCall
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function lm_callback_blueprint() view returns (address)"]}
  method="lm_callback_blueprint"
  contractName="LMCallbackFactory"
/>

</Example>

::::

### `set_blueprint`
::::description[`LMCallbackFactory.set_blueprint(_blueprint: address)`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the factory, which is intended to be the Curve DAO. Changing the code that future LM Callbacks are deployed from is therefore in the hands of the owner.
:::

Sets a new blueprint for future LM Callback deployments. Callbacks that were already deployed are not affected. The blueprint can be rotated but never unset: passing the zero address reverts, so new deployments are halted with `pause` instead.

| Input        | Type      | Description                            |
| ------------ | --------- | -------------------------------------- |
| `_blueprint` | `address` | Address of the new LM Callback blueprint. |

Emits: `UpdateLMCallbackBlueprint` event.

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

```vyper
event UpdateLMCallbackBlueprint:
    old_blueprint: address
    new_blueprint: address

lm_callback_blueprint: public(address)

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
owner: public(address)

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
>>> LMCallbackFactory.set_blueprint("0xNewBlueprint...")
```

</Example>

::::

### `get_blueprint_by_lm_callback`
::::description[`LMCallbackFactory.get_blueprint_by_lm_callback(arg0: address) -> address: view`]

Getter for the blueprint an LM Callback was deployed from. It is used for the duplicate check in `deploy_lm_callback` and lets integrations tell callback generations apart. Returns the zero address for addresses not deployed by this factory.

| Input  | Type      | Description                    |
| ------ | --------- | ------------------------------ |
| `arg0` | `address` | Address of the LM Callback.    |

Returns: blueprint the callback was created from (`address`).

<SourceCode>

```vyper
# Blueprint each callback was created from, kept for the duplicate check in
# `deploy_lm_callback` and so integrations can tell callback generations apart
get_blueprint_by_lm_callback: public(HashMap[address, address])
```

</SourceCode>

<Example>

<ContractCall
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function get_blueprint_by_lm_callback(address) view returns (address)"]}
  method="get_blueprint_by_lm_callback"
  args={["0x0000000000000000000000000000000000000000"]}
  labels={["arg0"]}
  contractName="LMCallbackFactory"
/>

</Example>

::::

---

## Querying LM Callbacks

### `get_lm_callback`
::::description[`LMCallbackFactory.get_lm_callback(_i: uint256) -> address: view`]

Returns the LM Callback deployed at index `_i`, in deployment order. Reverts if `_i` is not lower than `get_lm_callback_count`.

| Input | Type      | Description                  |
| ----- | --------- | ---------------------------- |
| `_i`  | `uint256` | Index of the LM Callback.    |

Returns: LM Callback (`address`).

<SourceCode>

```vyper
_lm_callbacks: DynArray[address, MAX_LM_CALLBACKS]

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

```shell
>>> LMCallbackFactory.get_lm_callback(0)
'0xLMCallback...'
```

</Example>

::::

### `get_lm_callback_count`
::::description[`LMCallbackFactory.get_lm_callback_count() -> uint256: view`]

Returns the number of LM Callbacks deployed by this factory.

Returns: number of deployed LM Callbacks (`uint256`).

<SourceCode>

```vyper
_lm_callbacks: DynArray[address, MAX_LM_CALLBACKS]

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
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function get_lm_callback_count() view returns (uint256)"]}
  method="get_lm_callback_count"
  contractName="LMCallbackFactory"
/>

</Example>

::::

### `get_lm_callback_by_amm`
::::description[`LMCallbackFactory.get_lm_callback_by_amm(arg0: address) -> address: view`]

Getter for the newest LM Callback this factory deployed for an AMM. This records deploy-time intent, not live state: the `Configurator` can attach any address as the callback, and a detach is never reflected here. To find the callback currently attached to a market, query `liquidity_mining_callback()` on the AMM itself.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `arg0` | `address` | Address of the AMM.  |

Returns: newest LM Callback deployed for the AMM (`address`).

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
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function get_lm_callback_by_amm(address) view returns (address)"]}
  method="get_lm_callback_by_amm"
  args={["0x0000000000000000000000000000000000000000"]}
  labels={["arg0"]}
  contractName="LMCallbackFactory"
/>

</Example>

::::

### `is_valid_gauge`
::::description[`LMCallbackFactory.is_valid_gauge(arg0: address) -> bool: view`]

Checks whether an address is an LM Callback deployed by this factory. The getter is named after the gauge factories' `is_valid_gauge` because integrations validate gauges by asking their factory, and LM Callbacks are gauges from their point of view.

A `True` result only means the callback was deployed by this factory. It says nothing about whether the callback is currently attached to its AMM or whether its rewards are paused; see [`LMCallback.is_killed`](./lm-callback.md#is_killed) for that.

| Input  | Type      | Description            |
| ------ | --------- | ---------------------- |
| `arg0` | `address` | Address to check.      |

Returns: `True` if deployed by this factory (`bool`).

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
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function is_valid_gauge(address) view returns (bool)"]}
  method="is_valid_gauge"
  args={["0x0000000000000000000000000000000000000000"]}
  labels={["arg0"]}
  contractName="LMCallbackFactory"
/>

</Example>

::::

---

## Pausing Deployments

Pausing only stops new deployments through `deploy_lm_callback`. It has no effect on callbacks that are already deployed; CRV rewards on an individual callback are paused with [`LMCallback.set_killed`](./lm-callback.md#set_killed).

### `pause`
::::description[`LMCallbackFactory.pause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the factory, which is intended to be the Curve DAO.
:::

Pauses the factory, so `deploy_lm_callback` reverts until it is unpaused. Reverts if the factory is already paused.

Emits: `Paused` event.

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

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
owner: public(address)

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
event Paused:
    account: address

paused: public(bool)

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
>>> LMCallbackFactory.pause()
```

</Example>

::::

### `unpause`
::::description[`LMCallbackFactory.unpause()`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the factory, which is intended to be the Curve DAO.
:::

Unpauses the factory to allow new LM Callback deployments again. Reverts if the factory is not paused.

Emits: `Unpaused` event.

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

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
owner: public(address)

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
event Unpaused:
    account: address

paused: public(bool)

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
>>> LMCallbackFactory.unpause()
```

</Example>

::::

### `paused`
::::description[`LMCallbackFactory.paused() -> bool: view`]

Getter for whether the factory is paused. While paused, `deploy_lm_callback` reverts.

Returns: `True` if paused (`bool`).

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

```vyper
from snekmate.utils import pausable

initializes: pausable

exports: (
    ...
    pausable.paused,
)
```

</TabItem>
<TabItem value="pausable.vy" label="pausable.vy (Snekmate 🐍)">

```vyper
paused: public(bool)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

<ContractCall
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function paused() view returns (bool)"]}
  method="paused"
  contractName="LMCallbackFactory"
/>

</Example>

::::

---

## Contract Ownership

The factory uses Snekmate's `ownable` module. `renounce_ownership` is intentionally not exported: with a zero owner the blueprint could never be updated again.

### `owner`
::::description[`LMCallbackFactory.owner() -> address: view`]

Getter for the owner of the factory. The owner can change the blueprint, pause and unpause deployments, and pause or resume CRV rewards on any LM Callback deployed by this factory.

Returns: owner (`address`).

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

```vyper
from snekmate.auth import ownable

initializes: ownable

exports: (
    # `renounce_ownership` is intentionally not exported: with a zero owner the
    # blueprint could never be updated again
    ownable.owner,
    ownable.transfer_ownership,
    ...
)
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
owner: public(address)
```

</TabItem>
</Tabs>

</SourceCode>

<Example>

<ContractCall
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function owner() view returns (address)"]}
  method="owner"
  contractName="LMCallbackFactory"
/>

</Example>

::::

### `transfer_ownership`
::::description[`LMCallbackFactory.transfer_ownership(new_owner: address)`]

:::guard[Guarded Method by [Snekmate 🐍](https://github.com/pcaversaccio/snekmate)]
This contract makes use of a Snekmate module to manage roles and permissions. This specific function can only be called by the current `owner` of the factory.
:::

Transfers ownership of the factory to `new_owner`. The new owner cannot be the zero address. Because LM Callbacks read the factory owner when `set_killed` is called, this also hands over the right to pause CRV rewards on every callback deployed by this factory.

| Input       | Type      | Description            |
| ----------- | --------- | ---------------------- |
| `new_owner` | `address` | Address of the new owner. |

Emits: `OwnershipTransferred` event.

<SourceCode>

<Tabs>
<TabItem value="LMCallbackFactory.vy" label="LMCallbackFactory.vy">

```vyper
exports: (
    ownable.owner,
    ownable.transfer_ownership,
    ...
)
```

</TabItem>
<TabItem value="ownable.vy" label="ownable.vy (Snekmate 🐍)">

```vyper
event OwnershipTransferred:
    previous_owner: indexed(address)
    new_owner: indexed(address)

owner: public(address)

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
    @param new_owner The 20-byte address of the new owner.
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
>>> LMCallbackFactory.transfer_ownership("0xNewOwner...")
```

</Example>

::::

---

## Other Methods

### `version`
::::description[`LMCallbackFactory.version() -> String[5]: view`]

Getter for the version of the contract.

Returns: contract version (`String[5]`).

<SourceCode>

```vyper
version: public(constant(String[5])) = "1.0.0"
```

</SourceCode>

<Example>

<ContractCall
  address="0x916E2B5E3Df268Ce2348265d2AAD4BB9f2B3dFA0"
  abi={["function version() view returns (string)"]}
  method="version"
  contractName="LMCallbackFactory"
/>

</Example>

::::
