// Ghost CMS Configuration
// Replace these values with your actual Ghost instance details
// Based on: https://docs.ghost.org/content-api

export const GHOST_CONFIG = {
  // Your Ghost blog URL (without trailing slash)
  // Note: Use your admin domain, not your site domain for API calls
  url: 'https://curve-guides.ghost.io',
  
  // Your Ghost Content API Key
  // Get this from: Ghost Admin → Settings → Integrations → Add custom integration
  // Search "integrations" in your settings to jump right to the section
  // Replace 'YOUR_GHOST_CONTENT_API_KEY' with your actual API key
  contentApiKey: '73cd63275bf15475e1a6b4bd87',
  
  // Number of posts to display
  postLimit: 3,
  pinnedLimit: 3,
  // Posts tagged with this will be treated as pinned
  pinnedTag: 'pinned',
  // Explicit slugs to always pin (highest priority)
  pinnedSlugs: [
    'curve-finance-the-rise-of-the-home-of-stablecoins',
    'liquid-lockers-and-community-boosts',
    'crv-emission-rate-gets-a-cut-as-programmed',
  ],
  // For landing page "Interesting Reads":
  // first card: dynamic latest article; next cards: these static slugs (order preserved)
  featuredStaticSlugs: [
    'curve-finance-the-rise-of-the-home-of-stablecoins',
    'crv-emission-rate-gets-a-cut-as-programmed',
  ],
  
  // API version - use v6.0 for latest features
  // See: https://docs.ghost.org/content-api/versioning
  apiVersion: 'v6.0'
};

// Helper function to get the full API URL
export const getGhostApiUrl = () => {
  return `${GHOST_CONFIG.url}/ghost/api/content/posts/`;
};

// Helper function to get API parameters
export const getGhostApiParams = (limit?: number, extra?: Record<string, string>) => {
  const params = new URLSearchParams({
    key: GHOST_CONFIG.contentApiKey,
    limit: (limit || GHOST_CONFIG.postLimit).toString(),
    include: 'tags'
  });
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  }
  return params;
};


// CMS data is untrusted: links are rebuilt from the slug and images are limited to Ghost storage.
const POST_BASE_URL = 'https://news.curve.finance';
const IMAGE_ORIGIN = 'https://storage.ghost.io';
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export const getPostUrl = (slug: unknown): string | null => {
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) return null;
  return `${POST_BASE_URL}/${slug}/`;
};

export const getSafeImageUrl = (src: unknown): string | null => {
  if (typeof src !== 'string') return null;
  try {
    const url = new URL(src);
    return url.origin === IMAGE_ORIGIN ? url.href : null;
  } catch {
    return null;
  }
};
