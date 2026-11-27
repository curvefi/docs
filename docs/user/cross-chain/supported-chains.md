---
id: supported-chains
title: Supported Chains & Assets
sidebar_label: Supported Chains & Assets
---

import ThemedImage from '@theme/ThemedImage';
import ChainPresence from '@site/src/components/ChainPresence'

While Ethereum remains Curve's primary network, Curve products and assets are available across multiple blockchains. Each network offers unique advantages in terms of transaction speed and costs. To use Curve on alternate networks, you'll typically need to bridge your funds from Ethereum using the target network's bridge.

## Ecosystem Components

The Curve ecosystem consists of five key components with varying cross-chain availability:

- [**Curve DEX** (Decentralized Exchange)](/user/dex/overview) - Available on many chains, and now deployable permissionlessly to any chain.
- [**Curve Lending (Llamalend)**](/user/llamalend/overview) - Available on Ethereum and selected L2s.
- [**Curve Assets** (CRV, crvUSD, scrvUSD)](/user/curve-tokens/crv) - Available on most chains through native bridges and LayerZero.
- **crvUSD Minting** - Ethereum-only.
- **CRV Rewards** - CRV inflation rewards are available to pools and llamalend markets on all chains that Curve supports, but the DAO must vote to add the market to the Gauge Controller (controls which markets can get rewards).

## Curve's Chain Presence

Curve runs on dozens of networks to meet users and builders where they are. Full DEX deployments deliver the complete Curve experience (gauges, CRV emissions and frontend analytics). Curve Lite exists so new rollups have the possibility to launch with production‑grade swapping from day one — automatically rolling out Curve’s core DEX stack (permissionless Stableswap/Cryptoswap factories), direct frontend integration and CurveDAO ownership and fees. Curve Lite gauges pay direct rewards only and receive no CRV emissions. Llamalend adds credit markets on selected networks.

<ChainPresence />

---

## <img src="/img/logos/crv.svg" alt="CRV" style={{height: '1.3em', verticalAlign: 'middle'}} /> CRV (Curve DAO Token)

The Curve token can be bridged across various chains, though it does not always retain full functionality. Locking CRV to obtain veCRV, as well as rewards voting for cross-chain gauges, must be conducted on the Ethereum blockchain.

| Network | Contract Address | Bridge |
| ------- | :--------------: | :----: |
| <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [0xD533a949740bb3306d119CC777fa900bA034cd52](https://etherscan.io/token/0xd533a949740bb3306d119cc777fa900ba034cd52) | --- |
| <img src="/img/logos/arbitrum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Arbitrum** | [0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978](https://arbiscan.io/address/0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978) | [**Arbitrum Bridge**](https://bridge.arbitrum.io/) |
| <img src="/img/logos/optimism.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Optimism** | [0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53](https://optimistic.etherscan.io/address/0x0994206dfe8de6ec6920ff4d779b0d950605fb53) | [**Optimism Bridge**](https://app.optimism.io/bridge) |
| <img src="/img/logos/base.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Base** | [0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415](https://basescan.org/address/0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415) | [**Base Bridge**](https://bridge.base.org/deposit) |
| <img src="/img/logos/polygon.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Polygon** | [0x172370d5Cd63279eFa6d502DAB29171933a610AF](https://polygonscan.com/address/0x172370d5cd63279efa6d502dab29171933a610af) | [**Polygon Bridge**](https://wallet.polygon.technology/bridge/) |
| <img src="/img/logos/fraxtal.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fraxtal** | [0x331b9182088e2a7d6d3fe4742aba1fb231aecc56](https://fraxscan.com/address/0x331b9182088e2a7d6d3fe4742aba1fb231aecc56) | [**Fraxtal Bridge**](https://app.frax.finance/bridge) |
| <img src="/img/logos/sonic.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Sonic** | [0x5af79133999f7908953e94b7a5cf367740ebee35](https://sonicscan.org/address/0x5af79133999f7908953e94b7a5cf367740ebee35) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/taiko.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Taiko** | [0x09413312b263fD252C16e592A45f4689F26cb79d](https://taikoscan.io/address/0x09413312b263fD252C16e592A45f4689F26cb79d) | [**Taiko Bridge**](https://bridge.taiko.xyz/) |
| <img src="/img/logos/gnosis.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Gnosis** | [0x712b3d230F3C1c19db860d80619288b1F0BDd0Bd](https://gnosisscan.io/address/0x712b3d230f3c1c19db860d80619288b1f0bdd0bd) | [**Gnosis Bridge**](https://bridge.gnosischain.com/) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fantom** | [0xE6c259bc0FCE25b71fE95A00361D3878E16232C3](https://ftmscout.com/address/0xE6c259bc0FCE25b71fE95A00361D3878E16232C3) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **BSC** | [0x9996D0276612d23b35f90C51EE935520B3d7355B](https://bscscan.com/address/0x9996D0276612d23b35f90C51EE935520B3d7355B) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Avalanche** | [0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B](https://snowscan.xyz/address/0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/kava.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Kava** | [0x7736C61F00c72e868AA9904c9063e8445A1eF5DD](https://kavascan.com/address/0x7736C61F00c72e868AA9904c9063e8445A1eF5DD) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/etherlink.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Etherlink** | [0x004A476B5B76738E34c86C7144554B9d34402F13](https://explorer.etherlink.com/address/0x004A476B5B76738E34c86C7144554B9d34402F13) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/xlayer.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **X-Layer** | [0x3d5320821bfca19fb0b5428f2c79d63bd5246f89](https://web3.okx.com/explorer/x-layer/address/0x3d5320821bfca19fb0b5428f2c79d63bd5246f89) | [**X-Layer Bridge**](https://www.okx.com/xlayer/bridge) |


---


## <img src="/img/logos/crvusd.svg" alt="CRV" style={{height: '1.3em', verticalAlign: 'middle'}} /> crvUSD (Curve Stablecoin)

crvUSD was first introduced in May 2023 on the Ethereum blockchain. For now, this stablecoin can be minted exclusively on the Ethereum mainnet.

[Understanding crvUSD](/user/curve-tokens/crvusd)

*Despite being launched on Ethereum, crvUSD can be bridged to various chains:*

| Chain                         | crvUSD Token Address | Official Bridge |
| ----------------------------- | :------------------: | :-------------: |
| <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E](https://etherscan.io/token/0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E) | --- |
| <img src="/img/logos/arbitrum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Arbitrum** | [0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5](https://arbiscan.io/address/0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5) | [Arbitrum Bridge](https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum) |
| <img src="/img/logos/optimism.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Optimism** | [0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6](https://optimistic.etherscan.io/address/0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6) | [Optimism Bridge](https://app.optimism.io/bridge/deposit) |
| <img src="/img/logos/base.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Base** | [0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93](https://basescan.org/address/0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93) | [Base Bridge](https://bridge.base.org/deposit) |
| <img src="/img/logos/polygon.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Polygon** | [0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6](https://polygonscan.com/address/0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6) | [Polygon Bridge](https://wallet.polygon.technology/) |
| <img src="/img/logos/xlayer.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **X-Layer** | [0xda8f4eb4503acf5dec5420523637bb5b33a846f6](https://web3.okx.com/explorer/x-layer/address/0xda8f4eb4503acf5dec5420523637bb5b33a846f6) | [X-Layer Bridge](https://www.okx.com/xlayer/bridge) |
| <img src="/img/logos/fraxtal.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fraxtal** | [0xB102f7Efa0d5dE071A8D37B3548e1C7CB148Caf3](https://fraxscan.com/address/0xB102f7Efa0d5dE071A8D37B3548e1C7CB148Caf3) | [Fraxtal Bridge](https://app.frax.finance/bridge) |
| <img src="/img/logos/sonic.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Sonic** | [0x7FFf4C4a827C84E32c5E175052834111B2ccd270](https://sonicscan.org/address/0x7FFf4C4a827C84E32c5E175052834111B2ccd270) | [Sonic Bridge](https://bridge.soniclabs.com/) |
| <img src="/img/logos/taiko.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Taiko** | [0xc8F4518ed4bAB9a972808a493107926cE8237068](https://taikoscan.io/address/0xc8F4518ed4bAB9a972808a493107926cE8237068) | [Taiko Bridge](https://bridge.taiko.xyz/) |
| <img src="/img/logos/gnosis.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Gnosis** | [0xaBEf652195F98A91E490f047A5006B71c85f058d](https://gnosisscan.io/address/0xaBEf652195F98A91E490f047A5006B71c85f058d) | [Gnosis Bridge](https://bridge.gnosischain.com/) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fantom** | [0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6](https://ftmscout.com/address/0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **BSC** | [0xe2fb3F127f5450DeE44afe054385d74C392BdeF4](https://bscscan.com/address/0xe2fb3F127f5450DeE44afe054385d74C392BdeF4) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/mantle.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Mantle** | [0x0994206dfe8de6ec6920ff4d779b0d950605fb53](https://mantlescan.xyz/address/0x0994206dfe8de6ec6920ff4d779b0d950605fb53) | [Mantle Bridge](https://app.mantle.xyz/bridge) |
| <img src="/img/logos/zksync.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **zk-Sync** | [0x43cd37cc4b9ec54833c8ac362dd55e58bfd62b86](https://explorer.zksync.io/address/0x43cd37cc4b9ec54833c8ac362dd55e58bfd62b86) | [ZKsync Portal](https://portal.zksync.io/bridge) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Avalanche** | [0xCb7c161602d04C4e8aF1832046EE08AAF96d855D](https://snowscan.xyz/address/0xCb7c161602d04C4e8aF1832046EE08AAF96d855D) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/kava.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Kava** | [0x98B4029CaBEf7Fd525A36B0BF8555EC1d42ec0B6](https://kavascan.com/address/0x98B4029CaBEf7Fd525A36B0BF8555EC1d42ec0B6) | [Guide here](/user/cross-chain/bridging-tokens) |


---


## <img src="/img/logos/scrvusd.png" alt="CRV" style={{height: '1.3em', verticalAlign: 'middle'}} /> scrvUSD (Savings-crvUSD)

Savings crvUSD (scrvUSD) was first introduced in November 2024 on Ethereum.

[Understanding scrvUSD](/user/curve-tokens/scrvusd)

*Despite being launched on Ethereum, scrvUSD can be bridged to various chains:*

| Chain                         | scrvUSD Token Address | Official Bridge |
| ----------------------------- | :------------------: | :-------------: |
| <img src="/img/logos/ethereum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Ethereum** | [0x0655977FEb2f289A4aB78af67BAB0d17aAb84367](https://etherscan.io/address/0x0655977FEb2f289A4aB78af67BAB0d17aAb84367) | - |
| <img src="/img/logos/arbitrum.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Arbitrum** | [0xEfB6601Df148677A338720156E2eFd3c5Ba8809d](https://arbiscan.io/address/0xEfB6601Df148677A338720156E2eFd3c5Ba8809d) | [Arbitrum Bridge](https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum) |
| <img src="/img/logos/optimism.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Optimism** | [0x289f635106d5b822a505b39ac237a0ae9189335b](https://optimistic.etherscan.io/address/0x289f635106d5b822a505b39ac237a0ae9189335b) | [Superbridge](https://superbridge.app/base) |
| <img src="/img/logos/base.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Base** | [0x646a737b9b6024e49f5908762b3ff73e65b5160c](https://basescan.org/address/0x646a737b9b6024e49f5908762b3ff73e65b5160c) | [Superbridge](https://superbridge.app/base) |
| <img src="/img/logos/fraxtal.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fraxtal** | [0xaB94C721040b33aA8b0b4D159Da9878e2a836Ed0](https://fraxscan.com/address/0xaB94C721040b33aA8b0b4D159Da9878e2a836Ed0) | [Fraxtal Bridge](https://app.frax.finance/bridge) |
| <img src="/img/logos/sonic.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Sonic** | [0xb5f0edecff09081354db252ceec000b213186fac](https://sonicscan.org/address/0xb5f0edecff09081354db252ceec000b213186fac) | [Sonic Bridge](https://bridge.soniclabs.com/) |
| <img src="/img/logos/taiko.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Taiko** | [0x8c74d11da5E6cE0498cd280F9209dFB0C5e048A7](https://taikoscan.io/address/0x8c74d11da5E6cE0498cd280F9209dFB0C5e048A7) | [Taiko Bridge](https://bridge.taiko.xyz/) |
| <img src="/img/logos/fantom.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Fantom** | [0x5191946500e75f0A74476F146dF7d386e52961d9](https://ftmscout.com/address/0x5191946500e75f0A74476F146dF7d386e52961d9) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/bsc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **BSC** | [0x0094Ad026643994c8fB2136ec912D508B15fe0E5](https://bscscan.com/address/0x0094Ad026643994c8fB2136ec912D508B15fe0E5) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/avalanche.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **Avalanche** | [0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64](https://snowscan.xyz/address/0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64) | [Guide here](/user/cross-chain/bridging-tokens) |
| <img src="/img/logos/xdc.svg" alt="CRV" style={{height: '1.2em', verticalAlign: 'middle'}} /> **XDC** | [0x3d8EADb739D1Ef95dd53D718e4810721837c69c1](https://xdcscan.io/address/0x3d8EADb739D1Ef95dd53D718e4810721837c69c1) | [Guide here](/user/cross-chain/bridging-tokens) |
