export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'amm': 'AMM',
  'dao': 'DAO',
  'x-dao': 'Crosschain DAO',
  'x-gov': 'Crosschain Governance',
  'crvusd': 'Curve Stablecoin',
  'scrvusd': 'Savings crvUSD',
  'llamalend': 'Llamalend V1',
  'llamalend-v2': 'Llamalend V2',
  'tokens': 'Tokens',
  'core': 'Core',
  'gauges': 'Gauges',
  'fees': 'Fees',
  'integrations': 'Integrations',
  'curve-block-oracle': 'Curve Block Oracle',
  'vecrv': 'veCRV',
};

export function formatChainName(chain: string): string {
  return chain
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatCategoryName(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (CATEGORY_DISPLAY_NAMES[lowerCategory]) {
    return CATEGORY_DISPLAY_NAMES[lowerCategory];
  }
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
