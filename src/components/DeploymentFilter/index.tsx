import React, { useState, useMemo, useEffect } from 'react';
import deploymentsData from '@site/static/deployments.json';
import styles from './styles.module.css';
import type { DeploymentEntry } from './types';
import { formatChainName, formatCategoryName } from './constants';
import { ChainLogo } from './ChainLogo';
import { NameDisplay } from './NameDisplay';
import { CategorySelect } from './CategorySelect';
import { ChainSelect } from './ChainSelect';
import { filterDeployments } from './searchFilter';

function getInitialParams() {
  if (typeof window === 'undefined') return { search: '', chains: [], category: 'all' };
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') || '',
    chains: params.get('chains') ? params.get('chains')!.split(',').filter(Boolean) : [],
    category: params.get('category') || 'all',
  };
}

function updateUrlParams(search: string, chains: string[], category: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (chains.length > 0) params.set('chains', chains.join(','));
  if (category && category !== 'all') params.set('category', category);
  const qs = params.toString();
  const newUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
  window.history.replaceState(null, '', newUrl);
}

// Get explorer URLs from JSON data
const getExplorerUrls = (data: any): Record<string, string> => {
  return (data._explorers || {}) as Record<string, string>;
};

function flattenDeployments(data: any): DeploymentEntry[] {
  const entries: DeploymentEntry[] = [];

  function traverse(obj: any, chain: string, category: string, subcategory: string = '', path: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '_explorers') continue;

      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        entries.push({
          chain,
          category,
          subcategory: subcategory || undefined,
          name: key,
          address: value,
          path: currentPath,
        });
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const allValuesAreStrings = Object.values(value).every(v => typeof v === 'string');

        if (allValuesAreStrings) {
          traverse(value, chain, category, key, currentPath);
        } else {
          traverse(value, chain, category, subcategory, currentPath);
        }
      }
    }
  }

  for (const [chain, chainData] of Object.entries(data)) {
    if (chain.startsWith('_')) continue;

    if (typeof chainData === 'object' && chainData !== null) {
      for (const [category, categoryData] of Object.entries(chainData as any)) {
        if (typeof categoryData === 'object' && categoryData !== null) {
          traverse(categoryData, chain, category, '', category);
        }
      }
    }
  }

  return entries;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function DeploymentFilter(): React.ReactNode {
  const initial = useMemo(() => getInitialParams(), []);
  const [searchTerm, setSearchTerm] = useState(initial.search);
  const [selectedChains, setSelectedChains] = useState<string[]>(initial.chains);
  const [selectedCategory, setSelectedCategory] = useState<string>(initial.category);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync filter state to URL
  useEffect(() => {
    updateUrlParams(searchTerm, selectedChains, selectedCategory);
  }, [searchTerm, selectedChains, selectedCategory]);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close other dropdown when one opens (mobile only)
  const handleChainDropdownChange = (isOpen: boolean) => {
    setChainDropdownOpen(isOpen);
    if (isOpen && isMobile) {
      setCategoryDropdownOpen(false);
    }
  };

  const handleCategoryDropdownChange = (isOpen: boolean) => {
    setCategoryDropdownOpen(isOpen);
    if (isOpen && isMobile) {
      setChainDropdownOpen(false);
    }
  };

  const handleChainClose = () => {
    setChainDropdownOpen(false);
  };

  const handleCategoryClose = () => {
    setCategoryDropdownOpen(false);
  };

  const explorerUrls = useMemo(() => getExplorerUrls(deploymentsData), []);
  const allDeployments = useMemo(() => flattenDeployments(deploymentsData), []);

  const chains = useMemo(() => {
    const chainSet = new Set(allDeployments.map(d => d.chain));
    return Array.from(chainSet).sort();
  }, [allDeployments]);

  const categories = useMemo(() => {
    const categorySet = new Set(allDeployments.map(d => d.category));
    return Array.from(categorySet).sort();
  }, [allDeployments]);

  const filteredDeployments = useMemo(
    () => filterDeployments(allDeployments, selectedChains, selectedCategory, searchTerm),
    [allDeployments, selectedChains, selectedCategory, searchTerm],
  );

  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getExplorerUrl = (chain: string, address: string): string | null => {
    const explorerBase = explorerUrls[chain.toLowerCase()];
    if (!explorerBase) return null;
    return `${explorerBase}${address}`;
  };

  return (
    <div className={`${styles.container} deployment-filter-container`}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="search" className={styles.label}>Search</label>
          <input
            id="search"
            type="text"
            className={styles.input}
            placeholder="Search by name, address, or path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="chain" className={styles.label}>Chain</label>
          <ChainSelect
            chains={chains}
            value={selectedChains}
            onChange={setSelectedChains}
            onOpenChange={handleChainDropdownChange}
            isControlledOpen={isMobile && categoryDropdownOpen ? false : undefined}
            onControlledClose={handleChainClose}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category" className={styles.label}>Category</label>
          <CategorySelect
            categories={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            onOpenChange={handleCategoryDropdownChange}
            isControlledOpen={isMobile && chainDropdownOpen ? false : undefined}
            onControlledClose={handleCategoryClose}
          />
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            {filteredDeployments.length} {filteredDeployments.length === 1 ? 'deployment' : 'deployments'} found
          </span>
        </div>

        {filteredDeployments.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Chain</th>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeployments.map((deployment, index) => {
                  const explorerUrl = getExplorerUrl(deployment.chain, deployment.address);
                  return (
                    <tr key={`${deployment.chain}-${deployment.path}-${index}`}>
                      <td>
                        <div className={styles.chainCell}>
                          <ChainLogo chain={deployment.chain} />
                          <span className={styles.chainName}>
                            {formatChainName(deployment.chain)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {formatCategoryName(deployment.category)}
                          {deployment.subcategory && (
                            <span className={styles.subcategory}>
                              {' / '}
                              {formatCategoryName(deployment.subcategory)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td>
                        <NameDisplay name={deployment.name} />
                      </td>
                      <td>
                        <div className={styles.addressCell}>
                          {explorerUrl ? (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.addressLink}
                            >
                              <code className={styles.addressCode}>{deployment.address}</code>
                            </a>
                          ) : (
                            <code className={styles.addressCode}>{deployment.address}</code>
                          )}
                          <button
                            className={styles.copyIconButton}
                            onClick={(e) => handleCopy(e, deployment.address)}
                            title="Copy address"
                            aria-label="Copy address"
                          >
                            {copiedAddress === deployment.address ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>No deployments found matching your filters.</p>
            <p className={styles.noResultsHint}>
              Try adjusting your search term or filter selections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
