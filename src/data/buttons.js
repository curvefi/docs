import React from 'react';
import ButtonIcon from '@site/src/components/ButtonIcon';

export const ALL_BUTTONS = {
  lockCrv: {
    link: 'https://www.curve.finance/dao/ethereum/vecrv/',
    line1: 'Lock',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/crv.png" alt="CRV" />
        CRV &nbsp; ⟶ &nbsp;
        <ButtonIcon src="/img/logos/vecrv.png" alt="veCRV" />
        veCRV
      </>
    ),
  },
  claimVecrvRevenue: {
    link: 'https://www.curve.finance/dao/ethereum/vecrv/',
    line1: 'Claim',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/vecrv.png" alt="veCRV" />
        veCRV Revenue
      </>
    ),
  },
  poolPositions: {
    link: 'https://www.curve.finance/dex/ethereum/pools/',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/crv.png" alt="CRV" />
        Your Pool Positions
      </>
    ),
  },
  boostCalculator: {
    link: 'https://dao-old.curve.finance/minter/calc',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/crv.png" alt="CRV" />
        Boost Calculator
      </>
    ),
  },
  gotoScrvusd: {
    link: 'https://www.curve.finance/crvusd/ethereum/scrvUSD/',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/scrvusd.png" alt="scrvUSD" />
        scrvUSD Savings Vault
      </>
    ),
  },
  gotoVecrvAnalytics: {
    link: 'https://www.curve.finance/dao/ethereum/analytics/',
    line1: 'Check',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/vecrv.png" alt="veCRV" />
        veCRV Revenue & Metrics
      </>
    ),
  },
  gotoDex: {
    link: 'https://www.curve.finance/dex/ethereum/pools/',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/crv.png" alt="Curve" />
        Curve's DEX
      </>
    ),
  },
  gotoSwap: {
    link: 'https://www.curve.finance/dex/ethereum/swap/',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon src="/img/logos/crv.png" alt="Curve" />
        Curve Swap
      </>
    ),
  },
  gotoLend: {
    link: 'https://www.curve.finance/lend/ethereum/markets/',
    line1: 'Go to',
    line2Content: (
      <>
        <ButtonIcon
          src="/img/favicon.png"
          alt="Llamalend"
          rounded={false}
        />
        Llamalend
      </>
    ),
  },
  gotoPoolDeployment: {
    link: 'https://www.curve.finance/dex/ethereum/create-pool',
    line1: 'Go to',
    line2Content: (
      <>
        Pool Creation UI
      </>
    ),
  },
  // --- Add any other buttons you want to reuse here ---
  // example: {
  //   link: '...',
  //   line1: '...',
  //   line2Content: '...'
  // }
};