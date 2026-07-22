---
id: introduction
title: What is Curve?
sidebar_label: Introduction
---

import BadgeGrid from '@site/src/components/BadgeGrid'

Curve is a decentralized exchange (DEX) powered by automated market makers (AMMs) designed for efficient trading of stablecoins and volatile assets. Built on Ethereum and EVM-compatible chains, Curve delivers deep liquidity for traders and peace of mind for liquidity providers through passive and fully automated concentrated liquidity.

Additionally, Curve developed crvUSD, a decentralized CDP USD stablecoin, and Llamalend, a permissionless lending protocol. Both use LLAMMA to convert collateral gradually across a price range rather than liquidating at one specific price. This can give borrowers more time to act, but conversions incur losses and can still end in full liquidation.

<BadgeGrid
  cards={[
    {
      title: "DEX",
      description: "The core liquidity engine of DeFi — delivering deep, decentralized markets for stable and correlated assets with unmatched efficiency.",
    },
    {
      title: "Llamalend",
      logo: {
        light: "/img/logos/llamalend-light.svg",
        dark: "/img/logos/llamalend-dark.svg"
      },
      description: "Advanced onchain lending with LLAMMA, which converts collateral gradually across a price range and gives borrowers time to manage risk.",
    },
  ]}
/>

---

Check out the other sections of the documentation for technical and protocol information:

<BadgeGrid
  cards={[
    {
      title: "Build On Curve",
      description: "Learn everything about how to build on Curve: From deploying pools or lending markets to establishing, growing and maintaining deep on-chain liquidity for assets through the core mechanics of Curve.",
      href: "/protocol/why-curve"
    },
    {
      title: "Developer Documentation",
      description: "Comprehensive documentation of all smart contracts — learn how they work, what they do, and how to integrate them into your applications.",
      href: "/developer/documentation-overview"
    },
  ]}
/>
