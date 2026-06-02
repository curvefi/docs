export default {
    developer: [
        {
            type: 'doc',
            id: 'documentation-overview',
            label: 'Overview',
        },

        // --- CRV & Governance ---
        {
            type: 'category',
            label: 'CRV & Governance',
            items: [
                { type: 'doc', id: 'curve-dao/crv-token', label: 'CRV Token' },
                {
                    type: 'category',
                    label: 'Voting Escrow (veCRV)',
                    items: [
                        { type: 'doc', id: 'curve-dao/voting-escrow/voting-escrow', label: 'VotingEscrow (veCRV)' },
                        {
                            type: 'category',
                            label: 'Cross-chain veCRV',
                            items: [
                                { type: 'doc', id: 'curve-dao/voting-escrow/crosschain/vecrv-delegation', label: 'Delegation' },
                                { type: 'doc', id: 'curve-dao/voting-escrow/crosschain/vecrv-oracle', label: 'Oracle' },
                                { type: 'doc', id: 'curve-dao/voting-escrow/crosschain/vecrv-verifiers', label: 'Verifiers' },
                            ],
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Governance & Voting',
                    items: [
                        { type: 'doc', id: 'curve-dao/governance/overview', label: 'Overview' },
                        { type: 'doc', id: 'curve-dao/governance/voting-library', label: 'Voting Library' },
                        {
                            type: 'category',
                            label: 'Cross-chain Governance',
                            items: [
                                { type: 'doc', id: 'curve-dao/governance/x-gov/overview', label: 'Overview' },
                                { type: 'doc', id: 'curve-dao/governance/x-gov/broadcaster', label: 'Broadcaster' },
                                { type: 'doc', id: 'curve-dao/governance/x-gov/relayer', label: 'Relayer' },
                                { type: 'doc', id: 'curve-dao/governance/x-gov/agents', label: 'Agents' },
                                { type: 'doc', id: 'curve-dao/governance/x-gov/vault', label: 'Vault' },
                            ],
                        },
                    ],
                },
            ],
        },

        // --- Gauges & Emissions ---
        {
            type: 'category',
            label: 'Gauges & Emissions',
            items: [
                { type: 'doc', id: 'gauges/overview', label: 'Overview' },
                { type: 'doc', id: 'gauges/gauge-controller', label: 'GaugeController' },
                { type: 'doc', id: 'gauges/minter', label: 'Minter' },
                {
                    type: 'category',
                    label: 'Liquidity Gauges',
                    items: [
                        { type: 'doc', id: 'gauges/gauges/overview', label: 'Overview' },
                        { type: 'doc', id: 'gauges/gauges/liquidity-gauge-v6', label: 'LiquidityGaugeV6' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Cross-chain Gauges',
                    items: [
                        { type: 'doc', id: 'gauges/xchain-gauges/overview', label: 'Overview' },
                        { type: 'doc', id: 'gauges/xchain-gauges/root-gauge', label: 'RootGauge' },
                        { type: 'doc', id: 'gauges/xchain-gauges/root-gauge-factory', label: 'RootGaugeFactory' },
                        { type: 'doc', id: 'gauges/xchain-gauges/child-gauge', label: 'ChildGauge' },
                        { type: 'doc', id: 'gauges/xchain-gauges/child-gauge-factory', label: 'ChildGaugeFactory' },
                        { type: 'doc', id: 'gauges/xchain-gauges/bridgers', label: 'Bridgers' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Boosting (Sidechains)',
                    items: [
                        { type: 'doc', id: 'gauges/boosting-sidechains/updater', label: 'Updater' },
                    ],
                },
            ],
        },

        // --- Curve AMM ---
        {
            type: 'category',
            label: 'Curve AMM',
            items: [
                { type: 'doc', id: 'amm/curve-amm-overview', label: 'Overview' },
                { type: 'doc', id: 'amm/cryptoswap-in-depth', label: 'CryptoSwap: In Depth' },
                {
                    type: 'category',
                    label: 'Stableswap-NG',
                    items: [
                        { type: 'doc', id: 'amm/stableswap-ng/overview', label: 'Overview' },
                        {
                            type: 'category',
                            label: 'Pools',
                            items: [
                                { type: 'doc', id: 'amm/stableswap-ng/pools/plainpool', label: 'Plain Pool' },
                                { type: 'doc', id: 'amm/stableswap-ng/pools/metapool', label: 'Metapool' },
                            ],
                        },
                        { type: 'doc', id: 'amm/stableswap-ng/pools/oracles', label: 'Oracles' },
                        {
                            type: 'category',
                            label: 'Utility Contracts',
                            items: [
                                { type: 'doc', id: 'amm/stableswap-ng/utility-contracts/views', label: 'Views' },
                                { type: 'doc', id: 'amm/stableswap-ng/utility-contracts/math', label: 'Math' },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Implementations',
                            items: [
                                { type: 'doc', id: 'amm/stableswap-ng/implementations/custom1', label: 'Custom Implementation' },
                            ],
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Twocrypto-NG',
                    items: [
                        { type: 'doc', id: 'amm/twocrypto-ng/overview', label: 'Overview' },
                        {
                            type: 'category',
                            label: 'Pools',
                            items: [
                                { type: 'doc', id: 'amm/twocrypto-ng/pools/twocrypto', label: 'Twocrypto' },
                            ],
                        },
                        { type: 'doc', id: 'amm/twocrypto-ng/pools/oracles', label: 'Oracles' },
                        {
                            type: 'category',
                            label: 'Utility Contracts',
                            items: [
                                { type: 'doc', id: 'amm/twocrypto-ng/utility-contracts/views', label: 'Views' },
                                { type: 'doc', id: 'amm/twocrypto-ng/utility-contracts/math', label: 'Math' },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Implementations',
                            items: [
                                {
                                    type: 'category',
                                    label: 'FXSwap',
                                    link: { type: 'doc', id: 'amm/twocrypto-ng/implementations/fxswap' },
                                    items: [
                                        { type: 'doc', id: 'amm/twocrypto-ng/implementations/donation-streamer', label: 'DonationStreamer' },
                                        { type: 'doc', id: 'amm/twocrypto-ng/implementations/stream-executor', label: 'StreamExecutor' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Tricrypto-NG',
                    items: [
                        { type: 'doc', id: 'amm/tricrypto-ng/overview', label: 'Overview' },
                        {
                            type: 'category',
                            label: 'Pools',
                            items: [
                                { type: 'doc', id: 'amm/tricrypto-ng/pools/tricrypto', label: 'Tricrypto' },
                            ],
                        },
                        { type: 'doc', id: 'amm/tricrypto-ng/pools/oracles', label: 'Oracles' },
                        {
                            type: 'category',
                            label: 'Utility Contracts',
                            items: [
                                { type: 'doc', id: 'amm/tricrypto-ng/utility-contracts/views', label: 'Views' },
                                { type: 'doc', id: 'amm/tricrypto-ng/utility-contracts/math', label: 'Math' },
                            ],
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Pool Factory',
                    items: [
                        { type: 'doc', id: 'amm/factory/overview', label: 'Overview' },
                        { type: 'doc', id: 'amm/factory/stableswap-ng/overview', label: 'Stableswap-NG' },
                        { type: 'doc', id: 'amm/factory/twocrypto-ng/overview', label: 'Twocrypto-NG' },
                        { type: 'doc', id: 'amm/factory/tricrypto-ng/overview', label: 'Tricrypto-NG' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Router',
                    items: [
                        { type: 'doc', id: 'amm/router/curve-router-ng', label: 'CurveRouter-NG' },
                        { type: 'doc', id: 'amm/router/curve-registry-exchange', label: 'CurveRegistryExchange' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Legacy',
                    items: [
                        {
                            type: 'category',
                            label: 'Stableswap',
                            items: [
                                { type: 'doc', id: 'amm/legacy/stableswap-overview', label: 'Stableswap Exchange Overview' },
                                { type: 'doc', id: 'amm/legacy/stableswap/overview', label: 'Overview' },
                                {
                                    type: 'category',
                                    label: 'Pools',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/stableswap/pools/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/pools/plain-pools', label: 'Plain Pools' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/pools/lending-pools', label: 'Lending Pools' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/pools/metapools', label: 'Metapools' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/pools/admin-pool-settings', label: 'Admin Pool Settings' },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'LP Tokens',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/stableswap/lp-tokens/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/lp-tokens/curve-token-v1', label: 'CurveToken V1' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/lp-tokens/curve-token-v2', label: 'CurveToken V2' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/lp-tokens/curve-token-v3', label: 'CurveToken V3' },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Deposit Contracts',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/stableswap/deposit-contracts/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/deposit-contracts/lending-pool-deposits', label: 'Lending Pool Deposits' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/deposit-contracts/metapool-deposits', label: 'Metapool Deposits' },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Cross-Asset Swaps',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/stableswap/cross-asset-swaps/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/stableswap/cross-asset-swaps/synthswap-exchange', label: 'SynthSwap Exchange' },
                                    ],
                                },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'CryptoSwap',
                            items: [
                                { type: 'doc', id: 'amm/legacy/cryptoswap-overview', label: 'CryptoSwap Exchange Overview' },
                                {
                                    type: 'category',
                                    label: 'Pools',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/cryptoswap/pools/crypto-pool', label: 'CryptoPool' },
                                        { type: 'doc', id: 'amm/legacy/cryptoswap/pools/admin-controls', label: 'Admin Controls' },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'LP Tokens',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/cryptoswap/lp-tokens/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/cryptoswap/lp-tokens/lp-token-v5', label: 'LP Token V5' },
                                    ],
                                },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Pool Factory',
                            items: [
                                {
                                    type: 'category',
                                    label: 'Stableswap',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/factory/stableswap/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/factory/stableswap/deployer-api', label: 'Deployer API' },
                                        { type: 'doc', id: 'amm/legacy/factory/stableswap/implementations', label: 'Implementations' },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'CryptoSwap',
                                    items: [
                                        { type: 'doc', id: 'amm/legacy/factory/cryptoswap/overview', label: 'Overview' },
                                        { type: 'doc', id: 'amm/legacy/factory/cryptoswap/deployer-api', label: 'Deployer API' },
                                        { type: 'doc', id: 'amm/legacy/factory/cryptoswap/implementations', label: 'Implementations' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        // --- crvUSD ---
        {
            type: 'category',
            label: 'crvUSD',
            items: [
                { type: 'doc', id: 'crvusd/overview', label: 'Overview' },
                { type: 'doc', id: 'crvusd/llamma-explainer', label: 'LLAMMA Explainer' },
                { type: 'doc', id: 'crvusd/crvusd', label: 'crvUSD Token' },
                { type: 'doc', id: 'crvusd/controller', label: 'Controller' },
                { type: 'doc', id: 'crvusd/amm', label: 'LLAMMA (AMM)' },
                { type: 'doc', id: 'crvusd/flash-lender', label: 'FlashLender' },
                {
                    type: 'category',
                    label: 'Oracles',
                    items: [
                        { type: 'doc', id: 'crvusd/oracles/overview', label: 'Overview' },
                        { type: 'doc', id: 'crvusd/oracles/crypto-from-pool-vault-w-agg', label: 'CryptoFromPoolVaultWAgg' },
                        { type: 'doc', id: 'crvusd/oracles/crypto-from-pools-rate-w-agg', label: 'CryptoFromPoolsRateWAgg' },
                        { type: 'doc', id: 'crvusd/oracles/price-aggregator', label: 'PriceAggregator' },
                        { type: 'doc', id: 'crvusd/oracles/price-aggregator-old', label: 'PriceAggregator (Old)' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Monetary Policy',
                    items: [
                        { type: 'doc', id: 'crvusd/monetary-policy/overview', label: 'Overview' },
                        { type: 'doc', id: 'crvusd/monetary-policy/monetary-policy', label: 'AggMonetaryPolicy' },
                        { type: 'doc', id: 'crvusd/monetary-policy/agg-monetary-policy-v4', label: 'AggMonetaryPolicy (v4)' },
                    ],
                },
                { type: 'doc', id: 'crvusd/factory', label: 'MarketFactory' },
                {
                    type: 'category',
                    label: 'PegKeepers',
                    items: [
                        { type: 'doc', id: 'crvusd/pegkeepers/overview', label: 'Overview' },
                        { type: 'doc', id: 'crvusd/pegkeepers/peg-keeper-v1', label: 'PegKeeperV1' },
                        { type: 'doc', id: 'crvusd/pegkeepers/peg-keeper-v2', label: 'PegKeeperV2' },
                        { type: 'doc', id: 'crvusd/pegkeepers/peg-keeper-regulator', label: 'PegKeeperRegulator' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Leverage',
                    items: [
                        { type: 'doc', id: 'crvusd/leverage/overview', label: 'Overview' },
                        { type: 'doc', id: 'crvusd/leverage/leverage-zap', label: 'LeverageZap' },
                        { type: 'doc', id: 'crvusd/leverage/leverage-zap-1inch', label: 'LeverageZap (1inch)' },
                        { type: 'doc', id: 'crvusd/leverage/llamalend-odos-leverage-zap', label: 'Llamalend Odos Zap' },
                    ],
                },
            ],
        },

        // --- Savings crvUSD ---
        {
            type: 'category',
            label: 'Savings crvUSD',
            items: [
                { type: 'doc', id: 'scrvusd/overview', label: 'Overview' },
                { type: 'doc', id: 'scrvusd/rewards-handler', label: 'RewardsHandler' },
                { type: 'doc', id: 'scrvusd/stablecoin-lens', label: 'StablecoinLens' },
                {
                    type: 'category',
                    label: 'Cross-chain',
                    items: [
                        { type: 'doc', id: 'scrvusd/crosschain/oracle-v0', label: 'Oracle V0' },
                        {
                            type: 'category',
                            label: 'Oracle V2',
                            items: [
                                { type: 'doc', id: 'scrvusd/crosschain/oracle-v2/overview', label: 'Overview' },
                                { type: 'doc', id: 'scrvusd/crosschain/oracle-v2/oracle', label: 'Oracle' },
                                { type: 'doc', id: 'scrvusd/crosschain/oracle-v2/verifier', label: 'Verifier' },
                                { type: 'doc', id: 'scrvusd/crosschain/oracle-v2/blockhash', label: 'BlockHash' },
                            ],
                        },
                    ],
                },
            ],
        },

        // --- Block Oracle ---
        {
            type: 'category',
            label: 'Block Oracle',
            items: [
                { type: 'doc', id: 'block-oracle/overview', label: 'Overview' },
                { type: 'doc', id: 'block-oracle/block-oracle', label: 'BlockOracle' },
                { type: 'doc', id: 'block-oracle/header-verifier', label: 'HeaderVerifier' },
                { type: 'doc', id: 'block-oracle/lz-block-relay', label: 'LZBlockRelay' },
                { type: 'doc', id: 'block-oracle/mainnet-block-view', label: 'MainnetBlockView' },
            ],
        },

        // --- Fast Bridge ---
        {
            type: 'category',
            label: 'Fast Bridge',
            items: [
                { type: 'doc', id: 'fast-bridge/overview', label: 'Overview' },
                { type: 'doc', id: 'fast-bridge/fast-bridge-l2', label: 'FastBridgeL2' },
                { type: 'doc', id: 'fast-bridge/fast-bridge-vault', label: 'FastBridgeVault' },
                { type: 'doc', id: 'fast-bridge/l2-messenger-lz', label: 'L2MessengerLZ' },
                { type: 'doc', id: 'fast-bridge/vault-messenger-lz', label: 'VaultMessengerLZ' },
            ],
        },

        // --- Llamalend ---
        {
            type: 'category',
            label: 'Llamalend',
            items: [
                { type: 'doc', id: 'lending/overview', label: 'Overview' },
                { type: 'doc', id: 'lending/contracts/oneway-factory', label: 'OneWay Lending Factory' },
                { type: 'doc', id: 'lending/contracts/vault', label: 'Vault' },
                { type: 'doc', id: 'lending/contracts/controller-llamma', label: 'Controller & LLAMMA' },
                { type: 'doc', id: 'lending/contracts/leverage', label: 'Leverage' },
                {
                    type: 'category',
                    label: 'Oracles',
                    items: [
                        { type: 'doc', id: 'lending/contracts/oracle-overview', label: 'Overview' },
                        { type: 'doc', id: 'lending/contracts/crypto-from-pool', label: 'CryptoFromPool' },
                        { type: 'doc', id: 'lending/contracts/crypto-from-pool-vault', label: 'CryptoFromPoolVault' },
                        { type: 'doc', id: 'lending/contracts/crypto-from-pools-rate', label: 'CryptoFromPoolsRate' },
                    ],
                },
                {
                    type: 'category',
                    label: 'Monetary Policy',
                    items: [
                        { type: 'doc', id: 'lending/contracts/mp-overview', label: 'Overview' },
                        { type: 'doc', id: 'lending/contracts/semilog-mp', label: 'SemiLog Monetary Policy' },
                        { type: 'doc', id: 'lending/contracts/secondary-mp', label: 'Secondary Monetary Policy' },
                    ],
                },
            ],
        },

        // --- Llamalend v2 ---
        {
            type: 'category',
            label: 'Llamalend v2',
            items: [
                { type: 'doc', id: 'llamalend-v2/overview', label: 'Overview' },
                { type: 'doc', id: 'llamalend-v2/lend-factory', label: 'LendFactory' },
                { type: 'doc', id: 'llamalend-v2/vault', label: 'Vault' },
                { type: 'doc', id: 'llamalend-v2/lend-controller', label: 'LendController' },
                { type: 'doc', id: 'llamalend-v2/lend-controller-view', label: 'LendControllerView' },
                { type: 'doc', id: 'llamalend-v2/amm', label: 'AMM (LLAMMA)' },
                { type: 'doc', id: 'llamalend-v2/integration-guide', label: 'Integration Guide' },
            ],
        },

        // --- Fees ---
        {
            type: 'category',
            label: 'Fees',
            items: [
                { type: 'doc', id: 'fees/overview', label: 'Overview' },
                { type: 'doc', id: 'fees/fee-collector', label: 'FeeCollector' },
                { type: 'doc', id: 'fees/fee-distributor', label: 'FeeDistributor' },
                { type: 'doc', id: 'fees/fee-splitter', label: 'FeeSplitter' },
                { type: 'doc', id: 'fees/cow-swap-burner', label: 'CowSwapBurner' },
                { type: 'doc', id: 'fees/hooker', label: 'Hooker' },
                { type: 'doc', id: 'fees/fee-allocator', label: 'FeeAllocator' },
                {
                    type: 'category',
                    label: 'Legacy Architecture',
                    items: [
                        { type: 'doc', id: 'fees/original-architecture/overview', label: 'Overview' },
                        { type: 'doc', id: 'fees/original-architecture/withdraw-and-burn', label: 'Withdraw & Burn' },
                        { type: 'doc', id: 'fees/original-architecture/burner', label: 'Burner' },
                        { type: 'doc', id: 'fees/original-architecture/distributor', label: 'Distributor' },
                        { type: 'doc', id: 'fees/original-architecture/sidechains', label: 'Sidechains' },
                    ],
                },
            ],
        },

        // --- Integration ---
        {
            type: 'category',
            label: 'Integration',
            items: [
                { type: 'doc', id: 'integration/overview', label: 'Overview' },
                { type: 'doc', id: 'integration/address-provider', label: 'AddressProvider' },
                { type: 'doc', id: 'integration/meta-registry', label: 'MetaRegistry' },
                { type: 'doc', id: 'integration/rate-provider', label: 'Rate Provider' },
                {
                    type: 'category',
                    label: 'Integrating Curve AMMs',
                    items: [
                        { type: 'doc', id: 'integration/stableswap-ng', label: 'Stableswap-NG' },
                        { type: 'doc', id: 'integration/twocrypto-ng', label: 'Twocrypto-NG' },
                        { type: 'doc', id: 'integration/tricrypto-ng', label: 'Tricrypto-NG' },
                        { type: 'doc', id: 'integration/llamma', label: 'LLAMMA' },
                    ],
                },
                {
                    type: 'category',
                    label: 'API',
                    items: [
                        { type: 'doc', id: 'integration/api/curve-api', label: 'Curve API' },
                        { type: 'doc', id: 'integration/api/curve-prices', label: 'Curve Prices' },
                    ],
                },
            ],
        },

        // --- Security & Audits ---
        { type: 'doc', id: 'security/security', label: 'Security & Audits' },

        // --- Deployments ---
        { type: 'doc', id: 'deployments', label: 'Deployments' },

        // --- Resources ---
        {
            type: 'category',
            label: 'Resources',
            items: [
                { type: 'doc', id: 'resources/whitepaper', label: 'Whitepapers' },
                { type: 'doc', id: 'resources/derivations', label: 'Derivations' },
                { type: 'doc', id: 'resources/notebooks', label: 'Notebooks' },
                { type: 'doc', id: 'resources/curve-practices', label: 'Curve Practices' },
                { type: 'doc', id: 'resources/useful', label: 'Useful Resources' },
            ],
        },
    ],
};
