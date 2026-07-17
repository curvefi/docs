# GaugeFactory

The `GaugeFactory` contract is used to deploy liquidity gauges for Curve pools on the Ethereum mainnet. Once a liquidity gauge is deployed, it can be added to the `GaugeController` via DAO voting. If successful, the gauge becomes eligible to receive CRV emissions, allowing users to stake their LP tokens to earn CRV rewards.

:::vyper[GaugeFactory.vy]
The source code for the `GaugeFactory.vy` contract can be found on [GitHub](https://github.com/curvefi/curve_gauge_factory/blob/main/contracts/GaugeFactory.vy). The contract is written using [Vyper](https://github.com/vyperlang/vyper) version `0.3.10`.

The contract is deployed on :logos-ethereum: Ethereum at [`0x64e1a69732fAC63F6790b3d8a34C5D713cC623E6`](https://etherscan.io/address/0x64e1a69732fAC63F6790b3d8a34C5D713cC623E6).

The contract address varies depending on the specific pool registry (e.g. StableSwap-NG, CryptoSwap, etc.) or deployment version. Please refer to the official [Contract Deployments](https://docs.curve.finance/developer/deployments) page or the MetaRegistry to find the active factory address on :logos-ethereum: Ethereum.

<ContractABI>

```json
[{"name":"DeployedGauge","inputs":[{"name":"_implementation","type":"address","indexed":true},{"name":"_lp_token","type":"address","indexed":true},{"name":"_deployer","type":"address","indexed":true},{"name":"_gauge","type":"address","indexed":false}],"anonymous":false,"type":"event"},{"name":"UpdateImplementation","inputs":[{"name":"_old_implementation","type":"address","indexed":false},{"name":"_new_implementation","type":"address","indexed":false}],"anonymous":false,"type":"event"},{"name":"TransferOwnership","inputs":[{"name":"_old_owner","type":"address","indexed":false},{"name":"_new_owner","type":"address","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"deploy_gauge","inputs":[{"name":"_lp_token","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"nonpayable","type":"function","name":"deploy_gauge","inputs":[{"name":"_lp_token","type":"address"},{"name":"_manager","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"nonpayable","type":"function","name":"set_implementation","inputs":[{"name":"_implementation","type":"address"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"commit_transfer_ownership","inputs":[{"name":"_future_owner","type":"address"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"accept_transfer_ownership","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"is_valid_gauge","inputs":[{"name":"_gauge","type":"address"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"get_implementation","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"future_owner","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"gauge_data","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_gauge_from_lp_token","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"get_gauge_count","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_gauge","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]}]
```

</ContractABI>

:::

---

## Deploying Gauges

The `GaugeFactory` contract handles the deployment of liquidity gauges. It allows users to create new liquidity gauges for specific LP tokens.

### `deploy_gauge`

::::description
`GaugeFactory.deploy_gauge(_lp_token: address, _manager: address = msg.sender) -> address`


Function to deploy a new liquidity gauge. The factory deploys a proxy gauge contract pointing to the preconfigured `implementation` blueprint contract using the Vyper `create_from_blueprint` instruction.

If a gauge has already been deployed for the given LP token, this function will revert unless the caller is the contract `owner`. This restriction prevents unauthorized overwrites of the registered gauge mapping.

| Input       | Type      | Description |
| ----------- | --------- | ----------- |
| `_lp_token` | `address` | Address of the LP token to deploy the gauge for |
| `_manager`  | `address` | Address to set as the manager of the deployed gauge |

Returns: Newly deployed gauge address (`address`).
Emtis: `DeployedGauge` event.

<SourceCode>

```vyper
@external
def deploy_gauge(_lp_token: address, _manager: address = msg.sender) -> address:
    """
    @notice Deploy a liquidity gauge
    @param _lp_token The token to deposit in the gauge
    @param _manager The address to set as manager of the gauge
    """
    if self.get_gauge_from_lp_token[_lp_token] != empty(address):
        # overwriting lp_token -> gauge mapping requires
        assert msg.sender == self.owner  # dev: only owner

    gauge_data: uint256 = 1  # set is_valid_gauge = True
    implementation: address = self.get_implementation

    gauge: address = create_from_blueprint(
        implementation,
        _lp_token,
        _manager,
        code_offset=3,
    )

    self.gauge_data[gauge] = gauge_data

    idx: uint256 = self.get_gauge_count
    self.get_gauge[idx] = gauge
    self.get_gauge_count = idx + 1
    self.get_gauge_from_lp_token[_lp_token] = gauge

    log DeployedGauge(implementation, _lp_token, msg.sender, gauge)

    return gauge
```

</SourceCode>

<Example>

```shell
# Example: Deploying a gauge for a specific LP token
>>> GaugeFactory.deploy_gauge("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174")
'0x729227A6a88bE1D3478d10C240E10d65E785412e'
```

</Example>

::::

---

## Gauge Information

The `GaugeFactory` contract provides several public getter functions to query information about the deployed liquidity gauges.

### `is_valid_gauge`

::::description
`GaugeFactory.is_valid_gauge(_gauge: address) -> bool: view`


Getter to query whether a gauge is a valid one deployed via the factory.

| Input    | Type      | Description |
| -------- | --------- | ----------- |
| `_gauge` | `address` | The address of the gauge to verify |

Returns: `True` if the gauge is valid, `False` otherwise (`bool`).

<SourceCode>

```vyper
@view
@external
def is_valid_gauge(_gauge: address) -> bool:
    """
    @notice Query whether the gauge is a valid one deployed via the factory
    @param _gauge The address of the gauge of interest
    """
    return self.gauge_data[_gauge] != 0
```

</SourceCode>

<Example>

```shell
# Example: Checking if a gauge is valid
>>> GaugeFactory.is_valid_gauge("0x3A55AAb28B4516ceB565a6e0577285C84F53520a")
True
```

</Example>

::::

### `get_gauge_from_lp_token`

::::description
`GaugeFactory.get_gauge_from_lp_token(arg0: address) -> address: view`


Getter to retrieve the gauge address deployed for a specific LP token.

| Input    | Type      | Description |
| -------- | --------- | ----------- |
| `arg0`   | `address` | Address of the LP token |

Returns: Gauge address (`address`).

<SourceCode>

```vyper
get_gauge_from_lp_token: public(HashMap[address, address])
```

</SourceCode>

<Example>

```shell
# Example: Getting the gauge address for an LP token
>>> GaugeFactory.get_gauge_from_lp_token("0x2b5a321C3cb1F33e1ABECD047C2649D0b4C47eBa")
'0x3A55AAb28B4516ceB565a6e0577285C84F53520a'
```

</Example>

::::

### `get_gauge`

::::description
`GaugeFactory.get_gauge(arg0: uint256) -> address: view`


Getter to retrieve a deployed gauge by its chronological index.

| Input    | Type      | Description |
| -------- | --------- | ----------- |
| `arg0`   | `uint256` | Index of the gauge in the deployment list |

Returns: Gauge address (`address`).

<SourceCode>

```vyper
get_gauge: public(address[max_value(int128)])
```

</SourceCode>

<Example>

```shell
# Example: Getting the first deployed gauge
>>> GaugeFactory.get_gauge(0)
'0x3A55AAb28B4516ceB565a6e0577285C84F53520a'
```

</Example>

::::

### `get_gauge_count`

::::description
`GaugeFactory.get_gauge_count() -> uint256: view`


Getter to retrieve the total number of deployed gauges.

Returns: Total gauge count (`uint256`).

<SourceCode>

```vyper
get_gauge_count: public(uint256)
```

</SourceCode>

<Example>

```shell
# Example: Getting the gauge count
>>> GaugeFactory.get_gauge_count()
2
```

</Example>

::::

### `gauge_data`

::::description
`GaugeFactory.gauge_data(arg0: address) -> uint256: view`


Getter to check the configuration data mapping for a given gauge (1 indicates a valid gauge, 0 indicates invalid or undeployed).

| Input    | Type      | Description |
| -------- | --------- | ----------- |
| `arg0` | `address` | Address of the gauge |

Returns: Configuration state (`uint256`).

<SourceCode>

```vyper
gauge_data: public(HashMap[address, uint256])
```

</SourceCode>

<Example>

```shell
# Example: Querying configuration state for a gauge
>>> GaugeFactory.gauge_data("0x3A55AAb28B4516ceB565a6e0577285C84F53520a")
1
```

</Example>

::::

---

## Factory Configurations

### `get_implementation`

::::description
`GaugeFactory.get_implementation() -> address: view`


Getter for the template `LiquidityGauge` implementation blueprint address. This blueprint contract is used to deploy proxy instances of the gauge when `deploy_gauge` is invoked.

Returns: Blueprint implementation address (`address`).

<SourceCode>

```vyper
get_implementation: public(address)
```

</SourceCode>

::::

### `set_implementation`

::::description
`GaugeFactory.set_implementation(_implementation: address)`


:::guard[guarded method]

This function is only callable by the `owner` of the contract.


:::

Sets a new blueprint implementation contract to be used for deploying subsequent liquidity gauges.

| Input | Type | Description |
| :--- | :--- | :--- |
| `_implementation` | `address` | Address of the new blueprint implementation |

Emits: `UpdateImplementation` event.

<SourceCode>

```vyper
@external
def set_implementation(_implementation: address):
    """
    @notice Set the implementation
    @param _implementation The address of the implementation to use
    """
    assert msg.sender == self.owner  # dev: only owner

    log UpdateImplementation(self.get_implementation, _implementation)
    self.get_implementation = _implementation
```

</SourceCode>

<Example>

```shell
# Example: Updating the gauge implementation blueprint
>>> GaugeFactory.set_implementation("0x19FeB8099eD22B18A7eF8386c507216874748aE5")
```

</Example>

::::


---

## Contract Ownership

For contract ownership details, see [here](../../resources/curve-practices.md#commit--accept).
