export const ALL_AUDITS = [
  // DAO Audits
  {
    id: 'dao-1',
    category: 'dao',
    auditor: 'TrailOfBits',
    date: '10. July, 2020',
    reportUrl: '/pdf/audits/curve-dao-ToB-final.pdf',
    logo: 'tob_light.svg',
    info: 'Scope: Curve DAO Contracts'
  },
  {
    id: 'dao-2',
    category: 'dao',
    auditor: 'MixBytes',
    date: '13. July, 2020',
    reportUrl: '/pdf/audits/Curve Finance DAO Voting Forwarder Security Audit Report.pdf',
    logo: 'mixbytes_light.svg',
    info: 'Scope: Curve DAO Voting Forwarder'
  },
  {
    id: 'dao-3',
    category: 'dao',
    auditor: 'MixBytes',
    date: '22. July, 2020',
    reportUrl: '/pdf/audits/Curve Finance DAO Voting Security Audit Report.pdf',
    logo: 'mixbytes_light.svg',
    info: 'Scope: Curve Voting (Aragon Voting Fork)'
  },
  {
    id: 'dao-4',
    category: 'dao',
    auditor: 'Quantstamp',
    date: '5. August, 2020',
    reportUrl: '/pdf/audits/curve-dao-quantstamp.pdf',
    logo: 'quantstamp.svg',
    info: 'Scope: Curve DAO Contracts'
  },
  {
    id: 'dao-5',
    category: 'dao',
    auditor: 'ChainSecurity',
    date: '25. September, 2024',
    reportUrl: '/pdf/audits/ChainSecurity_FeeSplitter.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: FeeSplitter.vy'
  },
  {
    id: 'dao-6',
    category: 'dao',
    auditor: 'ChainSecurity',
    date: '17. September, 2025',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Xgov_Audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Curve Cross-chain Governance'
  },

  // Infrastructure Audits
  {
    id: 'infra-1',
    category: 'infrastructure',
    auditor: 'ChainSecurity',
    date: '25. October, 2024',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Fast_Bridge_audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: FastBridge (Cross-chain crvUSD)'
  },

  // DEX Audits
  {
    id: 'dex-0',
    category: 'dex',
    auditor: 'TrailOfBits',
    date: 'January, 2020',
    reportUrl: '/pdf/audits/00-ToB.pdf',
    logo: 'tob_light.svg',
    info: 'Scope: Curve smart contracts'
  },
  {
    id: 'dex-1',
    category: 'dex',
    auditor: 'Quantstamp',
    date: '15. October, 2020',
    reportUrl: '/pdf/audits/CurveMetapoolAudit.pdf',
    logo: 'quantstamp.svg',
    info: 'Scope: Curve Metapools'
  },
  {
    id: 'dex-2',
    category: 'dex',
    auditor: 'ChainSecurity',
    date: '27. September, 2021',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Finance_Curve_ETH_sETH_Smart_contract_audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Curve ETH/sETH Liquidity Pool Implementation'
  },
  {
    id: 'dex-3',
    category: 'dex',
    auditor: 'MixBytes',
    date: '1. November, 2023',
    reportUrl: '/pdf/audits/Curve Finance StableSwapNG Security Audit Report.pdf',
    logo: 'mixbytes_light.svg',
    info: 'Scope: Stableswap-NG'
  },
  {
    id: 'dex-4',
    category: 'dex',
    auditor: 'ChainSecurity',
    date: '29. September, 2021',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Finance_Tricrypto_smart_contract_audit_September.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Tricrypto'
  },
  {
    id: 'dex-5',
    category: 'dex',
    auditor: 'ChainSecurity',
    date: '23. June, 2023',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_tricrypto-ng_audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Tricrypto-NG'
  },
  {
    id: 'dex-6',
    category: 'dex',
    auditor: 'ChainSecurity',
    date: '1. April, 2022',
    reportUrl: '/pdf/audits/private_ChainSecurity_Curve_CurveCryptoSwap2ETH_audit_draft.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Twocrypto'
  },

  // Stablecoin and Lending Audits
  {
    id: 'stablecoin-1',
    category: 'stablecoin',
    auditor: 'MixBytes',
    date: '5. June, 2023',
    reportUrl: '/pdf/audits/Curve Stablecoin (crvUSD) Security Audit Report.pdf',
    logo: 'mixbytes_light.svg',
    info: 'Scope: crvUSD Infrastucture'
  },
  {
    id: 'stablecoin-2',
    category: 'stablecoin',
    auditor: 'ChainSecurity',
    date: '24. January, 2024',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Curve_Stablecoin_audit-1.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: crvUSD Infrastucture'
  },
  {
    id: 'stablecoin-3',
    category: 'stablecoin',
    auditor: 'ChainSecurity',
    date: '21. February, 2025',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_Curve_Stablecoin_audit_250221.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: crvUSD Infrastucture'
  },
  {
    id: 'stablecoin-4',
    category: 'stablecoin',
    auditor: 'ChainSecurity',
    date: '12. December, 2023',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_PegKeeperV2_audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: PegKeeper V2'
  },
  {
    id: 'stablecoin-5',
    category: 'stablecoin',
    auditor: 'StateMind',
    date: '2. February, 2024',
    reportUrl: '/pdf/audits/StateMind_Curve_Lending.pdf',
    logo: 'statemind_light.svg',
    info: 'Scope: Curve Lending Infrastucture'
  },
  {
    id: 'stablecoin-6',
    category: 'stablecoin',
    auditor: 'ChainSecurity',
    date: '03. December, 2024',
    reportUrl: '/pdf/audits/ChainSecurity_Curve_scrvUSD_audit.pdf',
    logo: 'chainsecurity.jpg',
    info: 'Scope: Savings-crvUSD (scrvUSD)'
  }
];
