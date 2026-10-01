import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const RPC_URL = 'https://ethereum-rpc.publicnode.com/';
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) view returns ((bool success, bytes returnData)[])',
];

// --- Module-level batch manager ---
// Collects all auto-fetch calls across ContractCall instances,
// then executes them in a single multicall3 RPC request.
let pendingCalls = [];
let batchTimer = null;

function registerCall(address, abi, method, args) {
  return new Promise((resolve, reject) => {
    const iface = new ethers.Interface(abi);
    const callData = iface.encodeFunctionData(method, args);
    pendingCalls.push({ address, iface, method, callData, resolve, reject });

    if (!batchTimer) {
      batchTimer = setTimeout(executeBatch, 100);
    }
  });
}

async function executeBatch() {
  const calls = [...pendingCalls];
  pendingCalls = [];
  batchTimer = null;

  if (calls.length === 0) return;

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL, 1, { staticNetwork: true });
    const multicall = new ethers.Contract(MULTICALL3, MULTICALL3_ABI, provider);

    const aggregate = calls.map((c) => ({
      target: c.address,
      allowFailure: true,
      callData: c.callData,
    }));

    const results = await multicall.aggregate3(aggregate);

    results.forEach((result, i) => {
      if (result.success) {
        try {
          const decoded = calls[i].iface.decodeFunctionResult(calls[i].method, result.returnData);
          calls[i].resolve(decoded.length === 1 ? decoded[0] : decoded);
        } catch (err) {
          calls[i].reject(err);
        }
      } else {
        calls[i].reject(new Error('Call reverted'));
      }
    });
  } catch (err) {
    calls.forEach((c) => c.reject(err));
  }
}

// --- Single direct call (for user-triggered queries with custom inputs) ---
async function directCall(address, abi, method, args) {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 1, { staticNetwork: true });
  const contract = new ethers.Contract(address, abi, provider);
  return contract[method](...args);
}

// --- Styles ---
const preStyle = {
  backgroundColor: 'var(--prism-background-color)',
  color: 'var(--prism-color)',
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: 'var(--ifm-code-font-size)',
  lineHeight: 'var(--ifm-pre-line-height)',
  borderRadius: 'var(--ifm-code-border-radius)',
  padding: 'var(--ifm-pre-padding)',
  margin: 0,
  overflow: 'auto',
};

const inputStyle = {
  backgroundColor: 'var(--prism-background-color)',
  color: 'var(--prism-color)',
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: 'var(--ifm-code-font-size)',
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '4px',
  padding: '4px 8px',
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyle = {
  backgroundColor: 'var(--ifm-color-primary)',
  color: 'var(--ifm-font-color-base-inverse)',
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: 'var(--ifm-code-font-size)',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 16px',
  cursor: 'pointer',
  marginTop: '4px',
};

function ContractCallInner({ address, abi, method, args = [], labels = [], contractName = 'Contract' }) {
  const hasInputs = labels.length > 0;
  const [inputValues, setInputValues] = useState(args.map(String));
  const [currentArgs, setCurrentArgs] = useState(args.map(String));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!hasInputs);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  // Auto-fetch on mount via multicall batch (only for no-input calls)
  useEffect(() => {
    if (hasInputs) return;

    let cancelled = false;
    registerCall(address, abi, method, args)
      .then((value) => {
        if (cancelled) return;
        setResult(value.toString());
        setFetchedAt(new Date());
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`ContractCall error (${method}):`, err);
        setError('Could not fetch on-chain data. An adblocker may be blocking the RPC call.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Manual fetch for input-based calls
  const handleQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await directCall(address, abi, method, inputValues);
      setResult(value.toString());
      setCurrentArgs([...inputValues]);
      setFetchedAt(new Date());
    } catch (err) {
      console.error(`ContractCall error (${method}):`, err);
      setError('Could not fetch on-chain data. An adblocker may be blocking the RPC call.');
    } finally {
      setLoading(false);
    }
  }, [address, abi, method, inputValues]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuery();
  };

  // Build display
  const displayArgs = (hasInputs ? currentArgs : args).map(
    (a) => typeof a === 'string' && a.startsWith('0x') ? `'${a}'` : a
  ).join(', ');
  const callSignature = `${contractName}.${method}(${displayArgs})`;

  let output;
  if (hasInputs && !result && !loading && !error) {
    output = `>>> ${callSignature}\n`;
  } else if (loading) {
    output = `>>> ${callSignature}\nLoading...`;
  } else if (error) {
    output = `>>> ${callSignature}\nError: ${error}`;
  } else {
    output = `>>> ${callSignature}\n${result}`;
  }

  return (
    <div style={{ marginBottom: 'var(--ifm-spacing-vertical)' }}>
      {hasInputs && (
        <div style={{ marginBottom: '8px' }}>
          {labels.map((label, i) => (
            <div key={label} style={{ marginBottom: '4px' }}>
              <label style={{
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontSize: 'var(--ifm-code-font-size)',
                display: 'block',
                marginBottom: '2px',
              }}>
                {label}
              </label>
              <input
                style={inputStyle}
                value={inputValues[i] || ''}
                onChange={(e) => {
                  const next = [...inputValues];
                  next[i] = e.target.value;
                  setInputValues(next);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
          ))}
          <button style={buttonStyle} onClick={handleQuery}>
            Query
          </button>
        </div>
      )}
      <pre style={preStyle}>
        <code>{output}</code>
      </pre>
      {fetchedAt && !error && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--ifm-color-emphasis-600)',
          marginTop: '4px',
          fontStyle: 'italic',
        }}>
          Fetched on-chain at {fetchedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default function ContractCall(props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    const {contractName = 'Contract', method, args = [], address} = props;
    const displayArgs = args.map((arg) => typeof arg === 'string' && arg.startsWith('0x') ? `'${arg}'` : arg).join(', ');
    return (
      <div>
        <pre><code>{`>>> ${contractName}.${method}(${displayArgs})`}</code></pre>
        <p>Read the current value from contract <code>{address}</code>. Live results load in the interactive page.</p>
      </div>
    );
  }
  return <ContractCallInner {...props} />;
}
