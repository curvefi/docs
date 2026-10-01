# FeeDistributor



Fees used to be distributed to [`veCRV`](https://etherscan.io/address/0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2) in the form of [`3CRV`](https://etherscan.io/address/0x6c3f90f043a72fa612cbac8115ee7e52bde6e490) tokens, the LP token of the [`threepool`](https://etherscan.io/address/0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7), which consists of `USDT`, `USDC`, and `DAI`. After the release of Curve's own stablecoin [`crvUSD`](https://etherscan.io/token/0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E) and following a successful DAO vote to change the reward token to it, a new `FeeDistributor` contract was deployed to distribute fees in the form of `crvUSD` tokens. **Fee claiming always takes place on Ethereum**.

:::vyper[`FeeDistributor.vy`]

The source code for the `FeeDistributor.vy` contract can be found on [GitHub](https://github.com/curvefi/curve-dao-contracts/blob/master/contracts/FeeDistributor.vy). The contract is written using [Vyper](https://github.com/vyperlang/vyper) version `0.2.7` and `0.3.7`.

There are two different `FeeDistributor` contracts deployed on Ethereum, depending on the reward token:

- :logos-3crv: `3CRV`: [0xA464e6DCda8AC41e03616F95f4BC98a13b8922Dc](https://etherscan.io/address/0xa464e6dcda8ac41e03616f95f4bc98a13b8922dc)
- :logos-crvusd: `crvUSD`: [0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914](https://etherscan.io/address/0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914)

<ContractABI>


```json
[{"name":"CommitAdmin","inputs":[{"name":"admin","type":"address","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyAdmin","inputs":[{"name":"admin","type":"address","indexed":false}],"anonymous":false,"type":"event"},{"name":"ToggleAllowCheckpointToken","inputs":[{"name":"toggle_flag","type":"bool","indexed":false}],"anonymous":false,"type":"event"},{"name":"CheckpointToken","inputs":[{"name":"time","type":"uint256","indexed":false},{"name":"tokens","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"Claimed","inputs":[{"name":"recipient","type":"address","indexed":true},{"name":"amount","type":"uint256","indexed":false},{"name":"claim_epoch","type":"uint256","indexed":false},{"name":"max_epoch","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_voting_escrow","type":"address"},{"name":"_start_time","type":"uint256"},{"name":"_token","type":"address"},{"name":"_admin","type":"address"},{"name":"_emergency_return","type":"address"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"checkpoint_token","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"ve_for_at","inputs":[{"name":"_user","type":"address"},{"name":"_timestamp","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"checkpoint_total_supply","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"claim","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"claim","inputs":[{"name":"_addr","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"claim_many","inputs":[{"name":"_receivers","type":"address[20]"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"burn","inputs":[{"name":"_coin","type":"address"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"commit_admin","inputs":[{"name":"_addr","type":"address"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"apply_admin","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"toggle_allow_checkpoint_token","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"kill_me","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"recover_balance","inputs":[{"name":"_coin","type":"address"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"start_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"time_cursor","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"time_cursor_of","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"user_epoch_of","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"last_token_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"tokens_per_week","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"voting_escrow","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"token","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"total_received","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"token_last_balance","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ve_supply","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"future_admin","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"can_checkpoint_token","inputs":[],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"emergency_return","inputs":[],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"is_killed","inputs":[],"outputs":[{"name":"","type":"bool"}]}]
```

</ContractABI>

:::

---

### `last_token_time`
::::description[`FeeDistributor.last_token_time() -> uint256: view`]


Getter for the timestamp of the last token checkpoint.

Returns: timestamp (`uint256`).

<SourceCode>




```vyper
last_token_time: public(uint256)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function last_token_time() view returns (uint256)"]}
  method="last_token_time"
  contractName="FeeDistributor"
/>

</Example>


::::

### `can_checkpoint_token`
::::description[`FeeDistributor.can_checkpoint_token() -> bool: view`]


Function to check whether the `checkpoint_token` function can be called by anyone or only by the admin. The state of this variable can be changed using the `toggle_allow_checkpoint_token` function. 

Returns: true or false (`bool`).

<SourceCode>




```vyper
can_checkpoint_token: public(bool)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function can_checkpoint_token() view returns (bool)"]}
  method="can_checkpoint_token"
  contractName="FeeDistributor"
/>

</Example>


::::

### `toggle_allow_checkpoint_token`
::::description[`FeeDistributor.toggle_allow_checkpoint_token()`]


:::guard[Guarded Method]

This function is only callable by the `admin` of the contract.


:::

Function to toggle permission for checkpointing by an account.

Emits: `ToggleAllowCheckpointToken` event.

<SourceCode>




```vyper
event ToggleAllowCheckpointToken:
    toggle_flag: bool

@external
def toggle_allow_checkpoint_token():
    """
    @notice Toggle permission for checkpointing by any account
    """
    assert msg.sender == self.admin
    flag: bool = not self.can_checkpoint_token
    self.can_checkpoint_token = flag
    log ToggleAllowCheckpointToken(flag)
```




</SourceCode>

<Example>


```shell
>>> FeeDistributor.toggle_allow_checkpoint_token()
```


</Example>


::::

---


## ve-Supply Checkpoint

Checkpointing the ve-Supply is an essential process to ensure fair reward distribution. It involves periodically recording the total supply of veCRV for each epoch. This process is crucial for accurately distributing fees to veCRV holders based on their balances.


### `checkpoint_total_supply`
::::description[`FeeDistributor.checkpoint_total_supply()`]


Function to update the total supply checkpoint of veCRV for each epoch. The checkpoint is also updated by the first claimant of each new epoch week. This function can be called independently of a claim to reduce claiming gas costs. It ensures that the contract maintains an accurate record of the total veCRV supply at the start of each week, which is essential for correctly distributing fees based on veCRV holdings.

<SourceCode>




```vyper 
@external
def checkpoint_total_supply():
    """
    @notice Update the veCRV total supply checkpoint
    @dev The checkpoint is also updated by the first claimant each
        new epoch week. This function may be called independently
        of a claim, to reduce claiming gas costs.
    """
    self._checkpoint_total_supply()

@internal
def _checkpoint_total_supply():
    ve: address = self.voting_escrow
    t: uint256 = self.time_cursor
    rounded_timestamp: uint256 = block.timestamp / WEEK * WEEK
    VotingEscrow(ve).checkpoint()

    for i in range(20):
        if t > rounded_timestamp:
            break
        else:
            epoch: uint256 = self._find_timestamp_epoch(ve, t)
            pt: Point = VotingEscrow(ve).point_history(epoch)
            dt: int128 = 0
            if t > pt.ts:
                # If the point is at 0 epoch, it can actually be earlier than the first deposit
                # Then make dt 0
                dt = convert(t - pt.ts, int128)
            self.ve_supply[t] = convert(max(pt.bias - pt.slope * dt, 0), uint256)
        t += WEEK

    self.time_cursor = t
```




</SourceCode>

<Example>


This example checkpoints the total supply of veCRV.

```shell
>>> FeeDistributor.checkpoint_total_supply()
```


</Example>


::::

### `time_cursor`
::::description[`FeeDistributor.time_cursor() -> uint256: view`]


Getter for the timestamp of the last `checkpoint_total_supply` of veCRV.

Returns: timestamp (`uint256`).

<SourceCode>




```vyper
time_cursor: public(uint256)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function time_cursor() view returns (uint256)"]}
  method="time_cursor"
  contractName="FeeDistributor"
/>

</Example>


::::

### `time_cursor_of`
::::description[`FeeDistributor.time_cursor_of(arg0: address) -> uint256: view`]


Getter for the timestamp of the last `checkpoint_total_supply` of veCRV.

| Input  | Type      | Description          |
| ------ | --------- | -------------------- |
| `arg0` | `address` | Address to check for |

Returns: timestamp (`uint256`).

<SourceCode>




```vyper
time_cursor_of: public(HashMap[address, uint256])
```




</SourceCode>

<Example>


This example returns the `time_cursor_of` for a given address.

```shell
>>> FeeDistributor.time_cursor_of('0x7a16fF8270133F063aAb6C9977183D9e72835428')
1719446400
```


</Example>


::::

### `ve_for_at`
::::description[`FeeDistributor.ve_for_at(_user: address, _timestamp: uint256) -> uint256: view`]


Getter for the veCRV balance of a user at a certain timestamp.

| Input        | Type      | Description                            |
| ------------ | --------- | -------------------------------------- |
| `_user`      | `address` | Address to query the veCRV balance for |
| `_timestamp` | `uint256` | Timestamp                              |

Returns: veCRV balance (`uint256`).

<SourceCode>




```vyper 
@view
@external
def ve_for_at(_user: address, _timestamp: uint256) -> uint256:
    """
    @notice Get the veCRV balance for `_user` at `_timestamp`
    @param _user Address to query balance for
    @param _timestamp Epoch time
    @return uint256 veCRV balance
    """
    ve: address = self.voting_escrow
    max_user_epoch: uint256 = VotingEscrow(ve).user_point_epoch(_user)
    epoch: uint256 = self._find_timestamp_user_epoch(ve, _user, _timestamp, max_user_epoch)
    pt: Point = VotingEscrow(ve).user_point_history(_user, epoch)
    return convert(max(pt.bias - pt.slope * convert(_timestamp - pt.ts, int128), 0), uint256)
```




</SourceCode>

<Example>


```shell
>>> FeeDistributor.ve_for_at("0x989AEb4d175e16225E39E87d0D97A3360524AD80", 1685972555)
290896146145001156884162140
```


</Example>


::::

### `ve_supply`
::::description[`FeeDistributor.ve_supply(arg0: uint256) -> uint256: view`]


Getter for the total supply of veCRV at the beginning of an epoch.

| Input  | Type      | Description                  |
| ------ | --------- | ---------------------------- |
| `arg0` | `uint256` | Timestamp of the epoch start |

Returns: veCRV supply (`uint256`).

<SourceCode>




```vyper
ve_supply: public(uint256[1000000000000000])  # VE total supply at week bounds
```




</SourceCode>

<Example>


```shell
>>> FeeDistributor.ve_supply(1718841600)
667140493408797243694521600
```


</Example>


::::

---


## Killing The FeeDistributor

The `FeeDistributor` can be killed by the `admin` of the contract, which is the Curve DAO. Doing so, transfers the entire token balance to the `emergency_return` address and blocks the ability to claim or burn. The contract can not be unkilled.

:::colab[Google Colab Notebook]

A Google Colab notebook that simulates killing the `FeeDistributor` and its respective consequences can be found here: [ Google Colab Notebook](https://colab.research.google.com/drive/1YgjNqZ4TdDEVoa-xTbZIDSPdtOwxuiH9?usp=sharing).


:::

### `is_killed`
::::description[`FeeDistributor.is_killed() -> bool: view`]


Getter method to check if the `FeeDistributor` contract is killed. When killed, the contract blocks `claim` and `burn` and the entire token balance is transferred to the `emergency_return` address.

Returns: true or false (`bool`).

<SourceCode>




```vyper
is_killed: public(bool)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function is_killed() view returns (bool)"]}
  method="is_killed"
  contractName="FeeDistributor"
/>

</Example>


::::

### `kill_me`
::::description[`FeeDistributor.kill_me()`]


:::guard[Guarded Method]

This function is only callable by the `admin` of the contract.


:::

By killing the `FeeDistributor`, the entire token balance is transferred to the [`emergency_return`](#emergency_return) address, and the ability to further call the `claim`, `claim_many`, or `burn` functions is blocked.

<SourceCode>




```vyper 
is_killed: public(bool)

@external
def kill_me():
    """
    @notice Kill the contract
    @dev Killing transfers the entire 3CRV balance to the emergency return address
        and blocks the ability to claim or burn. The contract cannot be unkilled.
    """
    assert msg.sender == self.admin

    self.is_killed = True

    token: address = self.token
    assert ERC20(token).transfer(self.emergency_return, ERC20(token).balanceOf(self))
```




</SourceCode>

<Example>


```shell
>>> FeeDistributor.kill_me()
```


</Example>


::::

### `emergency_return`
::::description[`FeeDistributor.emergency_return() -> address: view`]


Getter for the emergency return address. This address can not be changed.

Returns: emergency return (`address`).

<SourceCode>




```vyper
emergency_return: public(address)
```




</SourceCode>

<Example>


Due to the fact that the emergency return address can not be changed and Curve used a ownership agent back then when the distributor contract for 3CRV was deployed, this one was set as the emergency return address.

The second fee distributor contract (crvUSD) uses a 5 of 9 multisig, which replaced the ownership agent.

```shell
>>> FeeDistributor.emergency_return()               # 3CRV distributor
'0x00669DF67E4827FCc0E48A1838a8d5AB79281909'

>>> FeeDistributor.emergency_return()               # crvUSD distributor
'0x467947EE34aF926cF1DCac093870f613C96B1E0c'
```


</Example>


::::

### `recover_balance`
::::description[`FeeDistributor.recover_balance(_coin: address) -> bool`]


Function to recover ERC20 tokens from the contract. Tokens are sent to the emergency return address. This function only works for tokens other than the address set for `token`. E.g. this function on the 3CRV distributor contract can not be called to transfer 3CRV. The same applied to crvUSD distributor.

| Input   | Type      | Description       |
| ------- | --------- | ----------------- |
| `_coin` | `address` | Tokens to recover |

Returns: true (`bool`).

<SourceCode>




```vyper 
@external
def recover_balance(_coin: address) -> bool:
    """
    @notice Recover ERC20 tokens from this contract
    @dev Tokens are sent to the emergency return address.
    @param _coin Token address
    @return bool success
    """
    assert msg.sender == self.admin
    assert _coin != self.token

    amount: uint256 = ERC20(_coin).balanceOf(self)
    response: Bytes[32] = raw_call(
        _coin,
        concat(
            method_id("transfer(address,uint256)"),
            convert(self.emergency_return, bytes32),
            convert(amount, bytes32),
        ),
        max_outsize=32,
    )
    if len(response) != 0:
        assert convert(response, bool)

    return True
```




</SourceCode>

<Example>


This example recovers the balance of a given token.

```shell
>>> FeeDistributor.recover_balance("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
true
```


</Example>


::::

---


## Admin Ownership

### `admin`
::::description[`FeeDistributor.admin() -> address: view`]


Getter for the admin of the contract.

Returns: admin (`address`).

<SourceCode>




```vyper
admin: public(address)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function admin() view returns (address)"]}
  method="admin"
  contractName="FeeDistributor"
/>

</Example>


::::

### `future_admin`
::::description[`FeeDistributor.future_admin() -> address: view`]


Getter for the future admin of the contract.

Returns: future admin (`address`).

<SourceCode>




```vyper
future_admin: public(address)
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function future_admin() view returns (address)"]}
  method="future_admin"
  contractName="FeeDistributor"
/>

</Example>


::::

### `commit_admin`
::::description[`FeeDistributor.commit_admin(_addr: address)`]


:::guard[Guarded Method]

This function is only callable by the `admin` of the contract.


:::

Function to commit transfer of the ownership.

| Input   | Type      | Description                                   |
| ------- | --------- | --------------------------------------------- |
| `_addr` | `address` | Address to commit the ownership transfer to |

Emits: `CommitAdmin` event.

<SourceCode>




```vyper 
event CommitAdmin:
    admin: address

admin: public(address)
future_admin: public(address)

@external
def commit_admin(_addr: address):
    """
    @notice Commit transfer of ownership
    @param _addr New admin address
    """
    assert msg.sender == self.admin  # dev: access denied
    self.future_admin = _addr
    log CommitAdmin(_addr)
```




</SourceCode>

<Example>


This example commits the transfer of the ownership.

```shell
>>> FeeDistributor.commit_admin("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
```


</Example>


::::

### `apply_admin`
::::description[`FeeDistributor.apply_admin()`]


:::guard[Guarded Method]

This function is only callable by the `admin` of the contract.


:::

Function to apply the transfer of the ownership.

Emits: `ApplyAdmin` event.

<SourceCode>




```vyper 
event ApplyAdmin:
    admin: address

admin: public(address)
future_admin: public(address)

@external
def apply_admin():
    """
    @notice Apply transfer of ownership
    """
    assert msg.sender == self.admin
    assert self.future_admin != ZERO_ADDRESS
    future_admin: address = self.future_admin
    self.admin = future_admin
    log ApplyAdmin(future_admin)
```




</SourceCode>

<Example>


This example applies the transfer of the ownership.

```shell
>>> FeeDistributor.apply_admin()
```


</Example>


::::

---


## Other Methods

### `start_time`
::::description[`FeeDistributor.start_time() -> uint256: view`]


Getter for the epoch time for fee distribution to start.

Returns: epoch time (`uint256`).

<SourceCode>




```vyper 
start_time: public(uint256)

@external
def __init__(
    _voting_escrow: address,
    _start_time: uint256,
    _token: address,
    _admin: address,
    _emergency_return: address
):
    """
    @notice Contract constructor
    @param _voting_escrow VotingEscrow contract address
    @param _start_time Epoch time for fee distribution to start
    @param _token Fee token address (3CRV)
    @param _admin Admin address
    @param _emergency_return Address to transfer `_token` balance to
                            if this contract is killed
    """
    t: uint256 = _start_time / WEEK * WEEK
    self.start_time = t
    self.last_token_time = t
    self.time_cursor = t
    self.token = _token
    self.voting_escrow = _voting_escrow
    self.admin = _admin
    self.emergency_return = _emergency_return
```




</SourceCode>

<Example>


This example returns the `start_time` of the first distribution of rewards.

```shell
>>> FeeDistributor.start_time()         # 3CRV Distributor
1600300800                              # Thu Sep 17 2020 00:00:00 GMT+0000

>>> FeeDistributor.start_time()         # crvUSD Distributor
1718841600                              # Thu Jun 20 2024 00:00:00 GMT+0000
```


</Example>


::::

### `voting_escrow`
::::description[`FeeDistributor.voting_escrow() -> address: view`]


Getter for the voting escrow contract.

Returns: voting escrow (`address`).

<SourceCode>




```vyper 
voting_escrow: public(address)

@external
def __init__(
    _voting_escrow: address,
    _start_time: uint256,
    _token: address,
    _admin: address,
    _emergency_return: address
):
    """
    @notice Contract constructor
    @param _voting_escrow VotingEscrow contract address
    @param _start_time Epoch time for fee distribution to start
    @param _token Fee token address (3CRV)
    @param _admin Admin address
    @param _emergency_return Address to transfer `_token` balance to
                            if this contract is killed
    """
    t: uint256 = _start_time / WEEK * WEEK
    self.start_time = t
    self.last_token_time = t
    self.time_cursor = t
    self.token = _token
    self.voting_escrow = _voting_escrow
    self.admin = _admin
    self.emergency_return = _emergency_return
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function voting_escrow() view returns (address)"]}
  method="voting_escrow"
  contractName="FeeDistributor"
/>

</Example>


::::

### `token`
::::description[`FeeDistributor.token() -> address: view`]


Getter for the token address in which the fees are distributed.

Returns: reward token (`address`).

<SourceCode>




```vyper 
token: public(address)

@external
def __init__(
    _voting_escrow: address,
    _start_time: uint256,
    _token: address,
    _admin: address,
    _emergency_return: address
):
    """
    @notice Contract constructor
    @param _voting_escrow VotingEscrow contract address
    @param _start_time Epoch time for fee distribution to start
    @param _token Fee token address (crvUSD)
    @param _admin Admin address
    @param _emergency_return Address to transfer `_token` balance to
                            if this contract is killed
    """
    t: uint256 = _start_time / WEEK * WEEK
    self.start_time = t
    self.last_token_time = t
    self.time_cursor = t
    self.token = _token
    self.voting_escrow = _voting_escrow
    self.admin = _admin
    self.emergency_return = _emergency_return
```




</SourceCode>

<Example>

<ContractCall
  address="0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914"
  abi={["function token() view returns (address)"]}
  method="token"
  contractName="FeeDistributor"
/>

</Example>


::::

### `user_epoch_of`
::::description[`FeeDistributor.user_epoch_of(arg0: address) -> uint256: view`]


Getter for the user epoch of an address. This value increments by one each time rewards are claimed.

| Input  | Type      | Description                       |
| ------ | --------- | --------------------------------- |
| `arg0` | `address` | Address to get the user epoch for |

Returns: user epoch (`uint256`).

<SourceCode>




```vyper 
user_epoch_of: public(HashMap[address, uint256])
```




</SourceCode>

<Example>


This example returns the user epoch of a given address.

```shell
>>> FeeDistributor.user_epoch_of("0x989AEb4d175e16225E39E87d0D97A3360524AD80")
7739
```

</Example>


::::
