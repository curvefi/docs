import React, { useState, useEffect } from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import LendingRateChart from '../../components/LendingRateChart';
import SemiLogChart from '../../components/SemiLogChart';
import SwaggerUIComponent from '../../components/SwaggerUI';
import SourceCode from '../../components/SourceCode';
import Example from '../../components/Example';
import ContractABI from '../../components/ContractABI';
import Dropdown from '../../components/Dropdown';

// Lazy-load ContractCall to avoid loading ethers.js on every page.
// Only pages that render <ContractCall> will load the bundle.
function LazyContractCall(props) {
  const [Component, setComponent] = useState(null);
  useEffect(() => {
    import('../../components/ContractCall').then((mod) => {
      setComponent(() => mod.default);
    });
  }, []);
  if (!Component) return null;
  return <Component {...props} />;
}

// Markdown tables fill the content column; the wrapper scrolls a table wider than that.
function Table(props) {
  return (
    <div className="table-scroll">
      <table {...props} />
    </div>
  );
}

export default {
  ...MDXComponents,
  Tabs,
  TabItem,
  LendingRateChart,
  SemiLogChart,
  SwaggerUI: SwaggerUIComponent,
  SourceCode,
  Example,
  ContractABI,
  ContractCall: LazyContractCall,
  Dropdown,
  table: Table,
};
