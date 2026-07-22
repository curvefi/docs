# Building Leverage

:::warning

This page covers LlamaLend v1 leverage integrations. Validate v2 compatibility against the [LlamaLend v2 contracts](../../llamalend-v2/overview.md) before reusing a zap or callback flow.

:::

There are multiple ways on how to create automated leverage for lending markets:

- v1: using the [Curve Pools](../../crvusd/leverage/leverage-zap.md)
- v2: using the [1inch Router](../../crvusd/leverage/leverage-zap-1inch.md)
- v3: using the [Odos Router](../../crvusd/leverage/llamalend-odos-leverage-zap.md)

:::warning[Warning]

The possibility of creating leverage and the usage of the contract above is dependent on the implementation contract of the `Controller` contract of the market.

For more information on the leverage feature, please refer to the [Leverage](../../crvusd/leverage/llamalend-odos-leverage-zap.md) section of the crvUSD documentation.


:::
