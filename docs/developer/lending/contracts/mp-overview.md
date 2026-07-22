import DocCard, { DocCardGrid } from '@site/src/components/DocCard'

# Monetary Policies: Overview

:::warning

These are LlamaLend v1 monetary-policy contracts. LlamaLend v2 markets configure a policy through the [Configurator](../../llamalend-v2/configurator.md).

:::

Lending markets use monetary policies to determine interest rates. Each market has its own policy contract.

*Currently, there are two different kinds of policy contracts in use:*

<DocCardGrid>
  <DocCard title="SemilogMonetaryPolicy.vy" icon="vyper" link="./semilog-mp" linkText="SemilogMonetaryPolicy.vy">

Semi-logarithmic monetary policy based on the utilization of lending markets.

  </DocCard>
  <DocCard title="SecondaryMonetaryPolicy.vy" icon="vyper" link="./secondary-mp" linkText="SecondaryMonetaryPolicy.vy">

A monetary policy that follows the rate of crvUSD mint markets based on the utilization of the market.

  </DocCard>
</DocCardGrid>
