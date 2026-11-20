import DocCard, { DocCardGrid } from '@site/src/components/DocCard'
import ThemedImage from '@theme/ThemedImage'

# Fee Collection, Burning, and Distribution
The Curve ecosystem generates revenue from various sources, primarily through trading fees from liquidity pools and interest from crvUSD markets. This page explains how these fees are collected, converted, and distributed to veCRV holders, detailing the contracts and processes involved.

The two primary revenue sources of the DAO are **fees collected from liquidity pools** and **interest rate fees from crvUSD markets**.

Usually, admin fees of liquidity pools are collected just as the tokens in the pool, though sometimes fees are collected in LP tokens. For the system, this distinction does not make any significant difference.


:::telegram[Telegram]

If you are running or planning to run fee collection for Curve DAO, there is a Telegram channel and a group for necessary updates. Also, many hooks for automation are coming in the future which will be written about in the group.

[→ Join the Telegram group](https://t.me/curve_automation)


:::

---


## System Overview

The state of the system can be roughly summarized as follows:

<figure>
  <ThemedImage
    alt="Fee Structure Overview"
    sources={{
      light: require('@site/docs/assets/images/fees/fee_structure_light.svg').default,
      dark: require('@site/docs/assets/images/fees/fee_structure_dark.svg').default,
    }}
    style={{ width: "1100px" }}
  />
  <figcaption>Overview of Curve's fee collection, burning, and distribution system</figcaption>
</figure>

*The collected admin fees can accrue in any type of tokens, whether they are LP or "regular" tokens. For simplicity, the `Hooker.vy` contract, which is essentially responsible for transferring the reward tokens from the `FeeCollector` to the `FeeDistributor`, was omitted from the graph. The burner shown can be either of the two burner implementations described [below](#burners). The same infrastructure runs on other chains. The only difference is that instead of transferring the reward tokens to a `FeeDistributor` contract, they are bridged to the `FeeCollector` on Ethereum mainnet.*


---


## Key Contracts

The fee collection, burning, and distribution system of Curve involves the following main contracts:

<DocCardGrid>
  <DocCard title="Fee Collector" link="FeeCollector" linkText="FeeCollector.vy">

Contract which acts as the entry point for the fee burning system. All admin fees in various kinds of tokens are collected here, and it sets the weekly schedule that the burner follows.

  </DocCard>
  <DocCard title="Fee Splitter" link="FeeSplitter" linkText="FeeSplitter.vy">

Contract that collects accumulated crvUSD fees from crvUSD Controllers and distributes them to other contracts according to predetermined weights in a single transaction.

  </DocCard>
  <DocCard title="Dutch Auction Burner" link="dutch-auction-burner" linkText="DutchAuctionBurner.vy">

Burner that sells the collected admin fees into the target token through a weekly Dutch auction. Anyone can buy directly from the auction, and external protocols such as CoW Protocol can settle orders through registered adapters.

  </DocCard>
  <DocCard title="CowSwap Burner" icon="cowswap" link="CowSwapBurner" linkText="CowSwapBurner.vy">

Burner that converts the collected admin fees into the target token using CowSwap's conditional orders.

  </DocCard>
  <DocCard title="Adapter Registry" link="adapter-registry" linkText="AdapterRegistry.vy">

List of external settlement adapters that a `DutchAuctionBurner` may route orders to, managed by the `FeeCollector` owner. The emergency owner can disable adapters.

  </DocCard>
  <DocCard title="CoW Adapter" icon="cowswap" link="cow-adapter" linkText="CowAdapter.vy">

Settlement adapter that lets CoW Protocol fill `DutchAuctionBurner` lots, priced against the auction's live curve.

  </DocCard>
  <DocCard title="Hooker" link="hooker" linkText="Hooker.vy">

Contract that allows users to execute certain hooks like forwarding crvUSD from the `FeeCollector` to the `FeeDistributor`.

  </DocCard>
  <DocCard title="Fee Distributor" link="FeeDistributor" linkText="FeeDistributor.vy">

The `FeeDistributor` is the contract which distributes the fee token to veCRV holders. This contract is only deployed on Ethereum mainnet. There are actually two `FeeDistributors` deployed, as rewards were distributed in `3CRV` tokens, before a DAO vote changed the reward token to `crvUSD`.

  </DocCard>
</DocCardGrid>


---


## Fee Burning

The process of burning coins into the target coin involves the following flow:

1. **Collecting Fees:** Admin fees are collected in various token types in the `FeeCollector`.
2. **Burning Admin Fees:** The burn process is initiated via the permissionless `collect` function, which hands the tokens to the burner. Depending on the burner, this either creates CowSwap conditional orders or stages Dutch auction lots that are sold during the following EXCHANGE epoch.
3. **Forwarding Fees:** Collected target coins are forwarded to the `FeeDistributor` using the `forward` function.
4. **Claiming Fees:** Accrued fees can be claimed from the `FeeDistributor` using the `claim` function.
5. **Splitting crvUSD Fees:** The `FeeSplitter` handles the collection and distribution of crvUSD fees from crvUSD markets.

This system ensures efficient fee collection, conversion, and distribution across the Curve ecosystem, rewarding veCRV holders and supporting the ongoing development and maintenance of the protocol.

*Curve has implemented different fee burning architectures over time to optimize the process:*


<DocCardGrid>
  <DocCard title="Current Architecture" link="#current-fee-system" linkText="Current Fee System">

A single `FeeCollector` per chain with one pluggable burner (`DutchAuctionBurner` or `CowSwapBurner`), plus `Hooker`, `FeeSplitter` and `FeeDistributor`. No coins or exchange routes need to be added manually.

  </DocCard>
  <DocCard title="Original Architecture" link="./original-architecture/overview" linkText="Original Architecture">

An older system using multiple burner contracts with manually added and hardcoded exchange routes. This architecture is still in use on chains where the current system hasn't been deployed yet.

  </DocCard>
</DocCardGrid>


On chains where the current system isn't deployed, admin fees are burned using the original architecture and then transferred to Ethereum via bridging contracts.

This page will primarily focus on the current fee system while also providing information on the original architecture for context and comparison.

---

## Current Fee System

The current fee system utilizes a set of contracts to efficiently collect, convert, and distribute fees:

1. **FeeCollector**: Acts as the entry point for fee collection from various sources and defines the weekly schedule.
2. **FeeSplitter**: Handles the distribution of crvUSD fees from crvUSD markets.
3. **Burner**: Converts collected fees into the target token. The `FeeCollector` uses one burner at a time, set by its owner via `set_burner`.
4. **Hooker**: Facilitates the execution of specific actions, such as forwarding fees.
5. **FeeDistributor**: Distributes the converted fees to veCRV holders.

This system ensures that all types of fees can be efficiently processed **without the need to manually add coins to burners or hardcode exchange routes.**

### Weekly Schedule

The `FeeCollector` divides every week into four epochs. Each step of the process can only happen in its epoch, and `collect` and `forward` pay the caller a keeper fee that grows over the epoch.

| Epoch | Days | What happens |
| ----- | ---- | ------------ |
| `SLEEP` | 0 – 4 | Nothing; configuration changes are made here |
| `COLLECT` | 4 – 5 | `collect` hands the fees held by the `FeeCollector` to the burner |
| `EXCHANGE` | 5 – 6 | The burner converts the fees into the target token |
| `FORWARD` | 6 – 7 | `forward` sends the target token on through the `Hooker` |

### Burners

There are two burner implementations. Both plug into the same `FeeCollector`, so switching from one to the other is a single `set_burner` call.

<DocCardGrid>
  <DocCard title="Dutch Auction Burner" link="dutch-auction-burner" linkText="DutchAuctionBurner.vy">

Stages each fee token's balance as a lot during COLLECT and sells it during EXCHANGE, at a price that decays exponentially from a start price to a floor price. Lots can be bought directly with `take` by anyone, or through external settlement protocols via adapters listed in the [`AdapterRegistry`](./adapter-registry.md), such as the [`CowAdapter`](./cow-adapter.md). Because direct takes need no external protocol, it can run on any chain.

  </DocCard>
  <DocCard title="CowSwap Burner" icon="cowswap" link="CowSwapBurner" linkText="CowSwapBurner.vy">

Creates a CowSwap conditional order for each fee token, which CoW solvers fill into the target token. It can only be used on chains where CoW Protocol is deployed.

  </DocCard>
</DocCardGrid>

In both cases, all proceeds go directly to the `FeeCollector`, and the burner can only ever return funds to it.

## Previous Architecture

Prior to this system, Curve used multiple different kinds of burners where the **exchange routes for the to-be-burned coins had to be manually added**. Additionally, exchange routes were hardcoded, which often led to semi-efficient fee burning. If coins were not manually added to the burners, they could not be burned, which resulted in unburned (but obviously not lost) fees. The old burner contracts required lots of maintenance and dev resources.

The first version of the current system depended on CoW Protocol being deployed on a chain, as the `CowSwapBurner` relies on it. The `DutchAuctionBurner` removes this dependency, so the current system can be deployed on any chain. On chains where it isn't deployed yet, admin fees are still burned using the [original architecture](./original-architecture/sidechains.md) and then transferred via a bridging contract to Ethereum.

---

## Further Reading

- [DutchAuctionBurner](./dutch-auction-burner.md)
- [Old Fee Burning Architecture](./original-architecture/overview.md)
- [CowSwap Protocol Documentation](https://docs.cow.fi/)
- [veCRV Documentation](../curve-dao/voting-escrow/voting-escrow.md)
