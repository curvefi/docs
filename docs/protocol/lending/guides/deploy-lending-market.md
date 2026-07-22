---
id: deploy-lending-market
title: Deploying a LlamaLend v2 Market
sidebar_label: Deploy a Market
---

LlamaLend v2 markets are deployed permissionlessly through the `LendFactory`. A successful deployment creates and registers a Vault, LendController, and AMM for one isolated token pair.

:::warning[Deployment is not activation]

New Controllers start with a borrow cap of zero. Deploying a market does not enable borrowing or give the deployer administrative rights. Coordinate with the Configurator administrator before deployment if the market is intended to become active.

:::

## Supported Deployments

The verified LlamaLend v2 factories currently report version `2.0.0` on **Ethereum** and **Optimism**. Addresses are chain-specific. Use the [LlamaLend v2 deployment table](/developer/llamalend-v2/overview#deployments) as the canonical address reference and verify the selected factory's `version()` before sending a transaction.

Do not use an address from another network or a deprecated factory.

## Requirements

Prepare and independently review:

- borrowed-token and collateral-token addresses;
- an initialized price oracle implementing `price()` and `price_w()`;
- an initialized monetary-policy contract;
- simulated `A`, AMM fee, loan discount, and liquidation discount;
- an initial Vault supply limit in raw borrowed-token units;
- a plan for the Configurator administrator to set the borrow cap and any other post-deployment parameters;
- initial lender liquidity, monitoring, and incident-response ownership.

See [Oracles & Parameters](../oracles-and-parameters.md) before constructing the transaction.

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

## Deployment Steps

### 1. Select and Verify the Factory

Choose the factory for the transaction's chain from the canonical deployment table. Confirm that the address has bytecode and that `version()` returns the expected v2 version.

### 2. Validate External Contracts

Check the token metadata, oracle output, and monetary-policy behavior. The factory will reject identical tokens, unsupported decimal precision, an invalid `A`, invalid discount ordering, or an oracle whose initial `price()` and `price_w()` values are zero or unequal.

### 3. Encode Integer Parameters

Convert token amounts and WAD-scaled percentages without floating-point arithmetic. Review every address and integer with a second person or automated deployment manifest.

### 4. Simulate the Call

Simulate `create()` from the intended account against a current fork or RPC state. A simulation should confirm contract validation and the returned address ordering, but it does not prove that the economic configuration is safe.

### 5. Submit `create()`

Call the factory through a verified block-explorer interface, deployment script, or contract client. Preserve the transaction hash and decoded inputs as the market's deployment record.

### 6. Verify Registration

After confirmation:

1. Decode `NewVault` from the receipt.
2. Confirm the three returned addresses have bytecode.
3. Read the new entry from `LendFactory.markets(index)`.
4. Confirm the Vault, Controller, and AMM point to the intended tokens, oracle, and monetary policy.
5. Confirm `controller.borrow_cap()` is zero before activation.

## Activate the Market

The Configurator's default administrator may assign a custom administrator for the new Controller. The default or assigned administrator can then set the borrow cap and other authorized parameters.

A market is ready for borrowers only after:

- the borrow cap is intentionally raised above zero;
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
