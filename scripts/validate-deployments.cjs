const { getAddress, isAddress } = require('ethers');
const deployments = require('../static/deployments.json');

const failures = [];
const addressOrigins = deployments._addressOrigins || {};
const requiredOrigins = {
  'x-gov.l1-broadcaster': 'ethereum',
  'curve-block-oracle.mainnet-block-view': 'ethereum',
  'x-dao.curve-block-oracle.mainnet-block-view': 'ethereum',
};

for (const [path, chain] of Object.entries(requiredOrigins)) {
  if (addressOrigins[path] !== chain) failures.push(`Missing explicit ${chain} origin metadata for ${path}`);
}

function visit(value, path = []) {
  if (typeof value === 'string') {
    // Governance roles may be intentionally unset before their x-gov contracts deploy.
    if (!value) {
      if (!['ownership-agent', 'parameter-agent', 'emergency-agent'].includes(path.at(-1))) {
        failures.push(`Empty deployment record at ${path.join('.')}`);
      }
      return;
    }
    if (!isAddress(value)) failures.push(`Invalid EIP-55 address at ${path.join('.')}: ${value}`);
    else {
      try { getAddress(value); } catch { failures.push(`Invalid checksum at ${path.join('.')}: ${value}`); }
    }
    return;
  }
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) visit(child, [...path, key]);
}

for (const [chain, data] of Object.entries(deployments)) {
  if (!chain.startsWith('_')) visit(data, [chain]);
}

function checkBootstrapAdmin(chain) {
  const xgov = deployments[chain]?.['x-gov'] || {};
  for (const key of ['ownership-agent', 'parameter-agent', 'emergency-agent']) {
    if (xgov[key] === '0xabc336d4C71ad275695744d32DdB1d8266Db1cbF') {
      failures.push(`${chain}.${key} mislabels the bootstrap admin as an agent`);
    }
  }
}
['monad', 'stable', 'unichain'].forEach(checkBootstrapAdmin);

const serialized = JSON.stringify(deployments);
if (serialized.includes('amm-native-enable-implementationd')) failures.push('Legacy tricrypto implementation key remains');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Deployment data validation passed');
