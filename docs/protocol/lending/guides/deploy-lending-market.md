---
id: deploy-lending-market
title: Deploying a LlamaLend v2 Market
sidebar_label: Deploy a Market
---

LlamaLend v2 markets are deployed permissionlessly through the `LendFactory`. A successful deployment creates and registers a Vault, LendController, and AMM for one isolated token pair.

:::warning[Deployment is not activation]

New Controllers start with a borrow cap of zero. Deploying a market does not enable borrowing or give the deployer administrative rights. The deployed Configurators are administered by Curve DAO ownership agents, so activation requires a DAO ownership vote unless the DAO assigns a controller-specific administrator.

:::

## Supported Deployments

LlamaLend v2 is currently deployed only on **Ethereum** and **Optimism**. Both verified factories report version `2.0.0`. Addresses are chain-specific: use the [LlamaLend v2 deployment table](/developer/llamalend-v2/overview#deployments) as the canonical reference and verify the selected factory's `version()` before sending a transaction.

Do not use an address from another network or a deprecated factory.

## Requirements

Prepare and independently review:

- borrowed-token and collateral-token addresses;
- an initialized price oracle implementing `price()` and `price_w()`;
- an initialized monetary-policy contract;
- simulated `A`, AMM fee, loan discount, and liquidation discount;
- an initial Vault supply limit in raw borrowed-token units;
- a Curve DAO ownership proposal for the initial borrow cap and any other post-deployment parameters, or for assigning a controller-specific administrator;
- initial lender liquidity, monitoring, and incident-response ownership.

See [Oracles & Parameters](../oracles-and-parameters.md) before constructing the transaction.

:::info[Need help?]

For help reviewing an oracle, parameter set, deployment, or governance proposal, contact **SwissStake** through Curve's [Telegram](https://t.me/curvefi) or [Discord](https://discord.gg/twUngQYz85).

:::

## The `create()` Call

The v2 factory exposes one market-creation function:

```solidity
create(
  address borrowed_token,
  address collateral_token,
  uint256 A,
  uint256 fee,
  uint256 loan_discount,
  uint256 liquidation_discount,
  address price_oracle,
  address monetary_policy,
  uint256 supply_limit
) returns (address[3])
```

The returned array is ordered as:

```text
[vault, controller, amm]
```

The transaction also emits `NewVault`, which contains the market index, token pair, deployed contract addresses, oracle, and monetary policy.

### Units

- `A` is an unscaled integer.
- `fee`, `loan_discount`, and `liquidation_discount` use WAD precision: `10^18 = 100%`.
- `supply_limit` uses the borrowed token's native decimals.
- Pass `max(uint256)` for no supply cap. Passing `0` prevents deposits.

Never enter display-formatted decimals directly into a contract field. Convert amounts to integers using the relevant token decimals first.

## Deploy and Verify

This section assumes familiarity with contract deployment, integer encoding, transaction simulation, and receipt decoding.

### 1. Prepare the Deployment

Choose the factory for the transaction's chain and confirm its bytecode and `version()`. Validate the token metadata, oracle, and monetary policy, then encode all token amounts and WAD-scaled parameters as integers. The factory rejects identical tokens, unsupported decimal precision, invalid `A` or discount ordering, and an oracle whose initial `price()` and `price_w()` values are zero or unequal.

### 2. Simulate and Submit `create()`

Simulate `create()` from the intended account against current fork or RPC state. Review the decoded calldata and expected `[vault, controller, amm]` return order, then submit through a deployment script or contract client. Preserve the transaction hash and deployment manifest. Passing contract validation does not prove the economic configuration is safe.

### 3. Verify the Registered Market

After confirmation:

1. Decode `NewVault` from the receipt.
2. Confirm the three returned addresses have bytecode.
3. Read the new entry from `LendFactory.markets(index)`.
4. Confirm the Vault, Controller, and AMM point to the intended tokens, oracle, and monetary policy.
5. Confirm `controller.borrow_cap()` is zero before activation.

## Activate the Market

On both current deployments, the Configurator's default administrator is a Curve DAO ownership agent. Submit a DAO ownership vote that calls `Configurator.set_borrow_cap(controller, cap)`. The proposal may also call `set_custom_admin(controller, admin)` if the DAO intends to delegate later parameter management for that market. On Optimism, the passed DAO action is executed through Curve's cross-chain governance path.

A market is ready for borrowers only after:

- the DAO vote has passed and executed, and the borrow cap is confirmed above zero;
- the Vault has enough available borrowed-token liquidity;
- the oracle and monetary policy are operating as expected;
- frontend and monitoring systems recognize the new market;
- ownership and emergency procedures are documented.

Continue with [Post-Deployment & Integration](../post-deployment.md).

## Low-Level References

- [LendFactory contract reference](/developer/llamalend-v2/lend-factory)
- [Configurator contract reference](/developer/llamalend-v2/configurator)
- [Vault contract reference](/developer/llamalend-v2/vault)
- [LendController contract reference](/developer/llamalend-v2/lend-controller)
