---
id: bridging-tokens
title: Bridging Tokens
sidebar_label: Bridging Tokens
---

import ThemedImage from '@theme/ThemedImage';

Curve uses [LayerZero](https://layerzero.network/) to enable **cross-chain transfers of `CRV`, `crvUSD`, and `scrvUSD`** to other L1 blockchains such as `BinanceSmartChain`, `Avalanche`, and `Fantom`. This guide focuses on bridging using only blockchain explorers, reducing reliance on third-party interfaces and avoiding any additional fees they may charge.

This guide explains how to **bridge any of the three tokens from the Ethereum Mainnet to other L1 blockchains or vice versa**. The only requirements include having a wallet with the token to be bridged and ETH or the gas token of the L1, depending on the bridging direction, to cover transaction fees.

:::info Contract Addresses
This guide is applicable for bridging `CRV`, `crvUSD` and `scrvUSD` to other L1 blockchains. When following this guide, one needs to make sure to use the correct contract addresses depending on the token to be bridged. 
:::

**<img src="/img/logos/crv.svg" alt="CRV" style={{height: '1.3em', verticalAlign: 'middle'}} /> CRV**

The contract addresses for bridges are mirrored meaning the bridge contract on Ethereum is the same as the one on the L1 blockchain. But the CRV token address is different for each chain.

- <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Ethereum: [`0xD533a949740bb3306d119CC777fa900bA034cd52`](https://etherscan.io/address/0xD533a949740bb3306d119CC777fa900bA034cd52)
- <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Binance Smart Chain: [`0x9996D0276612d23b35f90C51EE935520B3d7355B`](https://bscscan.com/address/0x9996D0276612d23b35f90C51EE935520B3d7355B)
- <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche: [`0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B`](https://snowscan.xyz/address/0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B)
- <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom: [`0xE6c259bc0FCE25b71fE95A00361D3878E16232C3`](https://ftmscout.com/address/0xE6c259bc0FCE25b71fE95A00361D3878E16232C3)
- <img src="/img/logos/sonic.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Sonic: [`0x5Af79133999f7908953E94b7A5CF367740Ebee35`](https://sonicscan.org/address/0x5af79133999f7908953e94b7a5cf367740ebee35)
- <img src="/img/logos/etherlink.png" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Etherlink: [`0x004A476B5B76738E34c86C7144554B9d34402F13`](https://explorer.etherlink.com/address/0xFF0871601158e506338967aB8C19fB59d8d5cAB2)


| Chain | Bridge Contract Address | Etherscan Link |
| ------------------ | ---------------- | ---------------- |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> BinanceSmartChain Bridge | `0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355` | [Ethereum](https://etherscan.io/address/0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355), [BSC](https://bscscan.com/address/0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche Bridge | `0x5cc0144A511807608eF644c9e99B486124D1cFd6` | [Ethereum](https://etherscan.io/address/0x5cc0144A511807608eF644c9e99B486124D1cFd6), [Avalanche](https://snowscan.xyz/address/0x5cc0144A511807608eF644c9e99B486124D1cFd6) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom Bridge | `0x7ce8aF75A9180B602445bE230860DDcb4cAc3E42` | [Ethereum](https://etherscan.io/address/0x7ce8aF75A9180B602445bE230860DDcb4cAc3E42), [Fantom](https://ftmscout.com/address/0x7ce8aF75A9180B602445bE230860DDcb4cAc3E42) |
| <img src="/img/logos/sonic.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Sonic Bridge | `0x5A537a46D780B1C70138aB98eDce69e7a53177ba` | [Ethereum](https://etherscan.io/address/0x5A537a46D780B1C70138aB98eDce69e7a53177ba), [Sonic](https://sonicscan.org/address/0x5A537a46D780B1C70138aB98eDce69e7a53177ba) |
| <img src="/img/logos/etherlink.png" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Etherlink Bridge | `0x5A537a46D780B1C70138aB98eDce69e7a53177ba` | [Ethereum](https://etherscan.io/address/0xFF0871601158e506338967aB8C19fB59d8d5cAB2), [Etherlink](https://explorer.etherlink.com/address/0xFF0871601158e506338967aB8C19fB59d8d5cAB2) |

---

**<img src="/img/logos/crvusd.svg" alt="CRV" style={{height: '1.5em', verticalAlign: 'middle'}} /> crvUSD**

The contract addresses for bridges are mirrored meaning the bridge contract on Ethereum is the same as the one on the L1 blockchain. But the crvUSD token address is different for each chain.

- <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Ethereum: [`0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E`](https://etherscan.io/address/0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E)
- <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Binance Smart Chain: [`0xe2fb3F127f5450DeE44afe054385d74C392BdeF4`](https://bscscan.com/address/0xe2fb3F127f5450DeE44afe054385d74C392BdeF4)
- <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche: [`0xCb7c161602d04C4e8aF1832046EE08AAF96d855D`](https://snowscan.xyz/address/0xCb7c161602d04C4e8aF1832046EE08AAF96d855D)
- <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom: [`0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6`](https://ftmscout.com/address/0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6)

| Chain | Bridge Contract Address | Etherscan Link |
| ------------------ | ---------------- | ---------------- |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> BinanceSmartChain Bridge | `0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f` | [Ethereum](https://etherscan.io/address/0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f), [BSC](https://bscscan.com/address/0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche Bridge | `0x26D01ce989037befd7Ff63837A86e2da32E7D7e2` | [Ethereum](https://etherscan.io/address/0x26D01ce989037befd7Ff63837A86e2da32E7D7e2), [Avalanche](https://snowscan.xyz/address/0x26D01ce989037befd7Ff63837A86e2da32E7D7e2) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom Bridge | `0x76EAfda658C54548B460B3f190386699DE3827d8` | [Ethereum](https://etherscan.io/address/0x76EAfda658C54548B460B3f190386699DE3827d8), [Fantom](https://ftmscout.com/address/0x76EAfda658C54548B460B3f190386699DE3827d8) |

---

**<img src="/img/logos/scrvusd.svg" alt="CRV" style={{height: '1.5em', verticalAlign: 'middle'}} /> scrvUSD**

The contract addresses for bridges are mirrored meaning the bridge contract on Ethereum is the same as the one on the L1 blockchain. But the crvUSD token address is different for each chain.

- <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Ethereum: [`0x0655977FEb2f289A4aB78af67BAB0d17aAb84367`](https://etherscan.io/address/0x0655977FEb2f289A4aB78af67BAB0d17aAb84367)
- <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Binance Smart Chain: [`0x0094Ad026643994c8fB2136ec912D508B15fe0E5`](https://bscscan.com/address/0x0094Ad026643994c8fB2136ec912D508B15fe0E5)
- <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche: [`0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64`](https://snowscan.xyz/address/0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64)
- <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom: [`0x5191946500e75f0A74476F146dF7d386e52961d9`](https://ftmscout.com/address/0x5191946500e75f0A74476F146dF7d386e52961d9)
- <img src="/img/logos/xdc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> XDC: [`0x3d8EADb739D1Ef95dd53D718e4810721837c69c1`](https://xdcscan.com/address/0x3d8EADb739D1Ef95dd53D718e4810721837c69c1)

| Chain | Bridge Contract Address | Etherscan Link |
| ------------------ | ---------------- | ---------------- |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> BinanceSmartChain Bridge | `0xAE0666C978500f2C05784242B79B08C478Dd999c` | [Ethereum](https://etherscan.io/address/0xAE0666C978500f2C05784242B79B08C478Dd999c), [BSC](https://bscscan.com/address/0xAE0666C978500f2C05784242B79B08C478Dd999c) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Avalanche Bridge | `0x26E91B1f142b9bF0bB37e82959bA79D2Aa6b99b8` | [Ethereum](https://etherscan.io/address/0x26E91B1f142b9bF0bB37e82959bA79D2Aa6b99b8), [Avalanche](https://snowscan.xyz/address/0x26E91B1f142b9bF0bB37e82959bA79D2Aa6b99b8) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> Fantom Bridge | `0x08132eA9b02750E118cF5F5C640B7c46A8E638E8` | [Ethereum](https://etherscan.io/address/0x08132eA9b02750E118cF5F5C640B7c46A8E638E8), [Fantom](https://ftmscout.com/address/0x08132eA9b02750E118cF5F5C640B7c46A8E638E8) |
| <img src="/img/logos/xdc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> XDC Bridge | `0x1Ae4Ab5274a96B75d6f55a696c9D550D218261b0` | [Ethereum](https://etherscan.io/address/0x1ae4ab5274a96b75d6f55a696c9d550d218261b0), [XDC](https://xdcscan.com/address/0x1ae4ab5274a96b75d6f55a696c9d550d218261b0) |
:::

---

## Bridging tokens from Ethereum to an L1 blockchain

### Step 1: Approve the Bridge Contract to Spend Your Tokens

1. Navigate to the contract of the token you want to bridge on [Etherscan](https://etherscan.io/).

2. Connect your wallet by navigating to **`Contract` > `Write Contract`** and clicking the **`Connect to Web3`** option.
   
    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/connect.png').default,
            dark: require('@site/static/img/user/cross-chain/connect.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>
    
3. Look for the **`approve`** method and approve the according bridge contract as a spender.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/approve.png').default,
            dark: require('@site/static/img/user/cross-chain/approve.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    - **`_spender`**: Enter `0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f`, the bridge contract address. This address is the same for all tokens.
    - **`_value`**: Specify the amount in 1e18 format (for example, for 100 crvUSD, enter `100000000000000000000`).
  
    Again, to avoid manually entering the amount in 1e18 format, you can input the amount of tokens you wish to bridge and then append 18 zeros by using the **`+`** button.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/zeroes.png').default,
            dark: require('@site/static/img/user/cross-chain/zeroes.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

2. Click **`Write`**. A transaction should pop up in your wallet which you need to sign to complete the approval.

---

### Step 2: Read Contract and Quote ETH Amount

1. Visit the bridge contract on Etherscan. This contract address is different depending on the token to be bridged and where it is being bridged to. This time, there is **no need to connect your wallet**.

2. Use function **`1. quote`** to determine the bridging cost.
   
    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/quote_eth.png').default,
            dark: require('@site/static/img/user/cross-chain/quote_eth.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    The `quote` amount represents the cost (in ETH) of calling the bridge method in the [next step](#step-3-bridge-the-token-to-the-l1-blockchain). This does not include gas costs, which need to be paid on top of the quoted amount.

---

### Step 3: Bridge the token to the L1 blockchain

1. Access the bridge contract on Etherscan. This contract address is different depending on the token to be bridged and where it is being bridged to.

2. Connect your wallet by navigating to **`Contract` > `Write Contract`** and clicking the **`Connect to Web3`** option.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/connect.png').default,
            dark: require('@site/static/img/user/cross-chain/connect.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

3. Navigate to method **`2. bridge`** and input your values. On this contract, there might be multiple methods with the same name. Make sure to select the one which looks like the one in the image down below (it should have three input parameters: `bridge`, `_amount` and `_receiver`).

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/bridge_eth.png').default,
            dark: require('@site/static/img/user/cross-chain/bridge_eth.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    - **`bridge`**: Enter the `ETH` amount quoted in [Step 2](#step-2-read-contract-and-quote-eth-amount). Ensure you enter the **amount denominated in Ether** (quoted amount / 1e18).
    - **`_amount`**: Specify the amount of tokens to bridge in 1e18 format.
    - **`_receiver`**: Enter the wallet you wish to receive the tokens to.

    Alternatively, to avoid manually entering the amount in 1e18 format, you can input the amount of tokens you wish to bridge and then append 18 zeros by using the **`+`** button.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/zeroes.png').default,
            dark: require('@site/static/img/user/cross-chain/zeroes.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

4. Click **`Write`**. A transaction should pop up in your wallet which you need to sign to complete the bridging process.

:::warning Warning
The bridging transaction will not be settled immediately. After completing these steps, it may take a few minutes for your tokens to be successfully bridged to the L1.
:::

---

## Bridging tokens from an L1 blockchain to Ethereum

### Step 1: Approve the Bridge Contract to Spend Your Tokens

1. Navigate to the token contract on the block explorer for the L1 network you want to bridge from. For example, to bridge crvUSD from BSC to Ethereum, you would need to navigate to the crvUSD token contract on BSCScan. All token addresses are listed in the table at the top of the page.

2. Connect your wallet by navigating to **`Contract` > `Write Contract`** and clicking the **`Connect to Web3`** option.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/connect.png').default,
            dark: require('@site/static/img/user/cross-chain/connect.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

3. Look for the **`approve`** method and approve the according bridge contract as a spender.
   
    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/approve.png').default,
            dark: require('@site/static/img/user/cross-chain/approve.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    - **`_spender`**: Enter the contract address of the bridge on the L1 blockchain.
    - **`_value`**: Specify the amount in 1e18 format (for example, for 100 crvUSD, enter `100000000000000000000`).

    Alternatively, to avoid manually entering the amount in 1e18 format, you can input the amount of tokens you wish to bridge and then append 18 zeros by using the **`+`** button.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/zeroes.png').default,
            dark: require('@site/static/img/user/cross-chain/zeroes.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

4. Click **`Write`**. A transaction should pop up in your wallet which you need to sign to complete the approval.

---

### Step 2: Read Contract and Quote the Fee Amount

1. Visit the bridge contract on the L1 blockchain you want to bridge from.

2. Use function **`1. quote`** to determine the bridging cost.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/quote_bnb.png').default,
            dark: require('@site/static/img/user/cross-chain/quote_bnb.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    The `quote` amount represents the cost (in the gas token of the L1 blockchain) of calling the bridge method in [Step 3](#step-3-bridge-tokens-to-ethereum). This does not include gas costs, which need to be paid additionally.

---

### Step 3: Bridge Tokens to Ethereum

1. Access the bridge contract on the L1 blockchain you want to bridge from.

2. Connect your wallet by navigating to **`Contract` > `Write Contract`** and clicking the **`Connect to Web3`** option.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/connect.png').default,
            dark: require('@site/static/img/user/cross-chain/connect.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

3. Navigate to method **`2. bridge`** and input your values. On this contract, there might be multiple methods with the same name. Make sure to select the one which looks like the one in the image down below (it should have three input parameters: `bridge`, `_amount` and `_receiver`).

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/bridge_bnb.png').default,
            dark: require('@site/static/img/user/cross-chain/bridge_bnb.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

    - **`bridge`**: Enter the ETH amount quoted in [Step 2](#step-2-read-contract-and-quote-the-fee-amount). Ensure you enter the **amount denominated in Ether** (quoted amount / 1e18).
    - **`_amount`**: Specify the amount of tokens in 1e18 format.
    - **`_receiver`**: Enter the wallet you wish to receive the tokens to.

    Alternatively, to avoid manually entering the amount in 1e18 format, you can input the amount of tokens you wish to bridge and then append 18 zeros by using the **`+`** button.

    <figure>
    <ThemedImage
        alt="Weekly gauge weight cycle showing the voting and distribution timeline"
        sources={{
            light: require('@site/static/img/user/cross-chain/zeroes.png').default,
            dark: require('@site/static/img/user/cross-chain/zeroes.png').default,
        }}
        style={{ width: '400px', display: 'block', margin: '0 auto' }}
    />
    </figure>

4. Click **`Write`**. A transaction should pop up in your wallet which you need to sign to complete the bridging process.

:::warning Warning
The bridging transaction will not be settled immediately. After completing these steps, it may take a few minutes for your tokens to be successfully bridged to the L1.
:::

---

## Retrying a Delayed Bridge Transaction[​](#retrying-a-delayed-bridge-transaction "Direct link to Retrying a Delayed Bridge Transaction")

Each bridge contract enforces an **issuance limit** over a rolling period. If the amount being bridged in would push the destination chain's issuance over that limit (or if the bridge is temporarily paused), the incoming transfer is **not** released immediately. Instead, it is recorded as delayed, and a `Delayed` event is emitted instead of `Issued`. The tokens remain claimable, you just need to wait out the delay period and then call `retry` yourself on the destination-side bridge contract.

:::warning Warning
A delayed transfer is not lost. It is safely held by the bridge contract until you call `retry`, which anyone can do — it is not restricted to the original sender.
:::

### Step 1: Find the Destination Transaction[​](#step-1-find-the-destination-transaction "Direct link to Step 1: Find the Destination Transaction")

1. Take the transaction hash of your original `bridge` transaction (the one on the source chain) and look it up on [LayerZero Scan](https://layerzeroscan.com/).
2. On the transaction page, find the **destination transaction hash** — this is the `lzReceive` transaction on the destination chain.
3. Open that destination transaction hash on the destination chain's block explorer (e.g., BscScan, Snowscan, etc.).

### Step 2: Read the Delayed Event[​](#step-2-read-the-delayed-event "Direct link to Step 2: Read the Delayed Event")

1. On the destination transaction page, open the **`Logs`** tab.
2. Look for a log named **`Delayed`**. It contains the following values, which you'll need for `retry`:

   - **`nonce`**
   - **`receiver`**
   - **`amount`**

3. Note the timestamp of the transaction itself (shown near the top of the transaction page), and convert it to Unix time using a tool such as [epochconverter.com](https://www.epochconverter.com/). This is the **`_timestamp`** value for `retry`.

### Step 3: Call Retry[​](#step-3-call-retry "Direct link to Step 3: Call Retry")

1. Wait at least 24 hours from the timestamp found in Step 2.
2. Go to the bridge contract on the **destination chain's** block explorer, then **`Contract` > `Write Contract`**, and click **`Connect to Web3`**.
3. Find the **`retry`** method and input the values gathered above:

   - **`_nonce`**: the nonce from the `Delayed` log.
   - **`_timestamp`**: the Unix timestamp of the destination transaction.
   - **`_receiver`**: the receiver address from the `Delayed` log.
   - **`_amount`**: the amount from the `Delayed` log, in 1e18 format.

4. Click **`Write`**. A transaction should pop up in your wallet which you need to sign. Once confirmed, your tokens will be released to `_receiver`.
