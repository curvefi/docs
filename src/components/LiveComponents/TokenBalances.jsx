import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const RPC_URL = 'https://ethereum-rpc.publicnode.com/';
const provider = new ethers.JsonRpcProvider(RPC_URL);

const ERC20_BALANCE_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

const TokenBalances = ({ holderAddress, tokens }) => {
  const tokenKey = tokens.map((token) => `${token.tokenAddress}:${token.priceApiUrl}`).join('|');
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      try {
        setLoading(true);
        setError(null);

        const balances = await Promise.all(tokens.map(async (token) => {
          const contract = new ethers.Contract(token.tokenAddress, ERC20_BALANCE_ABI, provider);
          const [balanceWei, priceResponse] = await Promise.all([
            contract.balanceOf(holderAddress),
            fetch(token.priceApiUrl),
          ]);

          if (!priceResponse.ok) {
            throw new Error(`Failed to fetch ${token.tokenName} price`);
          }

          const priceData = await priceResponse.json();
          if (!priceData?.data?.usd_price) {
            throw new Error(`Invalid ${token.tokenName} price data`);
          }

          const balance = parseFloat(ethers.formatEther(balanceWei));
          return {
            ...token,
            balance,
            usdValue: balance * priceData.data.usd_price,
          };
        }));

        setBalanceData({
          balances: balances.sort((a, b) => b.usdValue - a.usdValue),
          lastUpdated: new Date(),
        });
      } catch (err) {
        console.error('Failed to fetch treasury balances:', err);
        setError('Could not retrieve data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculate();
  }, [holderAddress, tokenKey]);

  if (loading) return <div>Loading Treasury Data...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <table className="metric-table" style={{ marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            <th>Holdings</th>
            <th>Balance</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>
          {balanceData?.balances.map((token) => (
            <tr key={token.tokenAddress}>
              <td>
                {token.logo && <img src={token.logo} className="subheading-inline-logo" alt={token.tokenName} />}{' '}
                {token.tokenName}
              </td>
              <td>{token.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="2"><strong>Total</strong></td>
            <td>
              <strong>
                ${balanceData?.balances
                  .reduce((total, token) => total + token.usdValue, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--ifm-color-emphasis-600)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: '1.5rem'
      }}>
        Last updated: {balanceData?.lastUpdated?.toLocaleString()}
      </div>
    </div>
  );
};

export default TokenBalances;
