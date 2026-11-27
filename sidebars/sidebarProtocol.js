export default {
    protocol: [
        {
            type: 'doc',
            id: 'why-curve',
        },
        {
            type: 'doc',
            id: 'launch-playbook',
        },
        {
            type: 'category',
            label: 'Use Cases',
            collapsed: true,
            items: [
                {
                    type: 'doc',
                    id: 'use-cases/stablecoin-issuers',
                },
                {
                    type: 'doc',
                    id: 'use-cases/rwa-issuers',
                },
                {
                    type: 'doc',
                    id: 'use-cases/chains',
                },
            ],
            link: {
                type: 'doc',
                id: 'use-cases/overview',
            },
        },
        {
            type: 'category',
            label: 'Deploy a Pool',
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Concepts',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'pool/understanding-stableswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/understanding-cryptoswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/understanding-fxswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/compare-amm',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Guides',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'pool/guides/deploy-stableswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/guides/deploy-cryptoswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/guides/deploy-fxswap',
                        },
                        {
                            type: 'doc',
                            id: 'pool/post-deployment',
                        },
                        {
                            type: 'doc',
                            id: 'pool/guides/donation-streamer',
                        },
                        {
                            type: 'doc',
                            id: 'pool/guides/enable-big-blocks-hyperevm',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Reference',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'pool/pool-parameters',
                        },
                        {
                            type: 'doc',
                            id: 'pool/presets',
                        },
                    ],
                },
                {
                    type: 'doc',
                    id: 'pool/troubleshooting',
                },
            ],
            link: {
                type: 'doc',
                id: 'pool/overview',
            },
        },
        {
            type: 'category',
            label: 'Deploy and Run a Lending Market',
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Concepts',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'lending/risk-and-roles',
                        },
                        {
                            type: 'doc',
                            id: 'lending/oracles-and-parameters',
                        },
                        {
                            type: 'doc',
                            id: 'lending/llamalend-vs-morpho-vs-euler',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Guides',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'lending/guides/deploy-lending-market',
                        },
                        {
                            type: 'doc',
                            id: 'lending/post-deployment',
                        },
                        {
                            type: 'doc',
                            id: 'lending/running-a-market',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Reference',
                    collapsed: true,
                    items: [
                        {
                            type: 'doc',
                            id: 'lending/parameters-and-access-control',
                        },
                    ],
                },
            ],
            link: {
                type: 'doc',
                id: 'lending/launch-isolated-lending-market',
            },
        },
        {
            type: 'category',
            label: 'Incentivize Liquidity',
            collapsed: true,
            items: [
                {
                    type: 'doc',
                    id: 'gauge/incentive-routes',
                },
                {
                    type: 'doc',
                    id: 'gauge/incentive-costs',
                },
                {
                    type: 'doc',
                    id: 'gauge/whitelisting-gauge',
                },
                {
                    type: 'doc',
                    id: 'gauge/guides/getting-crv-emissions',
                },
                {
                    type: 'doc',
                    id: 'gauge/guides/adding-direct-gauge-rewards',
                },
            ],
            link: {
                type: 'doc',
                id: 'gauge/overview',
            },
        },
        {
            type: 'category',
            label: 'Integrate Curve',
            collapsed: true,
            items: [
                {
                    type: 'doc',
                    id: 'integrate/quickstart-prices-api',
                },
                {
                    type: 'doc',
                    id: 'integrate/quickstart-deploy-pool',
                },
                {
                    type: 'doc',
                    id: 'integrate/quickstart-lend',
                },
            ],
            link: {
                type: 'doc',
                id: 'integrate/overview',
            },
        },
        {
            type: 'doc',
            id: 'glossary',
        },
        {
            type: 'category',
            label: 'Curve API',
            collapsed: true,
            items: [
                {
                    type: 'doc',
                    id: 'api/curve-prices',
                },
                {
                    type: 'doc',
                    id: 'api/curve-api',
                },
            ],
        },
        {
            type: 'link',
            href: 'https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74',
            label: 'Brand Assets',
        },
        {
            type: 'link',
            href: 'pathname:///llms.txt',
            label: 'For AI agents: llms.txt',
        },
    ],
};
