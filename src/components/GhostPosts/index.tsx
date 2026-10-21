import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { GHOST_CONFIG, getGhostApiUrl, getGhostApiParams, getPostUrl, getSafeImageUrl } from '@site/src/config/ghost';

interface GhostPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  feature_image?: string;
  href: string;
  reading_time?: number;
  tags?: Array<{
    name: string;
    slug: string;
  }>;
}

// Drops posts without a valid slug and any feature image outside Ghost storage.
const toSafePosts = (raw: unknown): GhostPost[] =>
  (Array.isArray(raw) ? raw : []).flatMap((post) => {
    const href = getPostUrl(post?.slug);
    if (!href) return [];
    const { url: _cmsUrl, ...rest } = post;
    return [{ ...rest, href, feature_image: getSafeImageUrl(post.feature_image) ?? undefined }];
  });

interface GhostPostsProps {
  limit?: number;
  showPinned?: boolean;
  tag?: string; // Optional tag to filter posts by
  sectionTitle?: string; // Optional custom section title
  compact?: boolean; // Use compact display mode
  enablePagination?: boolean; // Enable pagination controls
}

export default function GhostPosts({ 
  limit = GHOST_CONFIG.postLimit,
  showPinned = true,
  tag,
  sectionTitle,
  compact = false,
  enablePagination = false,
}: GhostPostsProps): React.ReactNode {
  const [posts, setPosts] = useState<GhostPost[]>([]);
  const [pinned, setPinned] = useState<GhostPost[]>([]);
  const [featured, setFeatured] = useState<GhostPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<{ pagination?: { pages?: number; page?: number; limit?: number } } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = getGhostApiUrl();

        // Fetch latest posts - filter by tag if provided, add pagination if enabled
        const extraParams: Record<string, string> = {};
        if (tag) {
          // Use tags: syntax for Ghost API (supports tag slug or name)
          extraParams.filter = `tags:${tag}`;
        }
        // Always include page parameter when pagination is enabled (even for page 1)
        if (enablePagination) {
          extraParams.page = currentPage.toString();
        }
        const latestParams = getGhostApiParams(limit, Object.keys(extraParams).length > 0 ? extraParams : undefined);
        
        const latestResp = await fetch(`${apiUrl}?${latestParams}`, {
          headers: {
            'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v', '')}`
          }
        });
        if (!latestResp.ok) throw new Error(`Failed to fetch posts: ${latestResp.status}`);
        const latestData = await latestResp.json();
        
        // Only set posts for the current page - Ghost API should return only the requested page
        // But limit it just in case the API returns more than requested
        const fetchedPosts = toSafePosts(latestData.posts);
        setPosts(fetchedPosts.slice(0, limit));
        // Ghost API returns meta.pagination with pages, page, limit, total, etc.
        setMeta(latestData.meta || null);

        // Build featured (landing hero): first = newest post, next = static slugs
        // Only do this if no tag filter is applied (for landing page)
        if (!tag) {
          try {
            const newestParams = getGhostApiParams(1, { order: 'published_at DESC' });
            const newestResp = await fetch(`${apiUrl}?${newestParams}`, { headers: { 'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v','')}` } });
            const newestData = await newestResp.json();
            const first = toSafePosts(newestData?.posts)[0];
            let list: GhostPost[] = [];
            if (first) list.push(first);
            if (GHOST_CONFIG.featuredStaticSlugs?.length) {
              const slugFilter = GHOST_CONFIG.featuredStaticSlugs.map((s) => `slug:${s}`).join(',');
              const staticParams = getGhostApiParams(GHOST_CONFIG.featuredStaticSlugs.length, { filter: slugFilter });
              const staticResp = await fetch(`${apiUrl}?${staticParams}`, { headers: { 'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v','')}` } });
              const staticData = await staticResp.json();
              const staticPosts = toSafePosts(staticData?.posts);
              // preserve requested order
              const orderMap = new Map(GHOST_CONFIG.featuredStaticSlugs.map((s, i) => [s, i]));
              staticPosts.sort((a, b) => (orderMap.get(a.slug) ?? 0) - (orderMap.get(b.slug) ?? 0));
              // ensure uniqueness vs newest
              const seen = new Set(list.map(p => p.id));
              for (const p of staticPosts) if (!seen.has(p.id)) list.push(p);
            }
            setFeatured(list);
          } catch {}
        } else {
          // When filtering by tag, use the filtered posts as featured
          setFeatured([]);
        }

        // Fetch pinned posts: prefer explicit slugs, then tagged fallback
        if (showPinned) {
          let pinnedList: GhostPost[] = [];

          if (GHOST_CONFIG.pinnedSlugs && GHOST_CONFIG.pinnedSlugs.length > 0) {
            const slugFilter = GHOST_CONFIG.pinnedSlugs.map((s) => `slug:${s}`).join(",");
            const bySlugParams = getGhostApiParams(GHOST_CONFIG.pinnedLimit, { filter: slugFilter });
            const bySlugResp = await fetch(`${apiUrl}?${bySlugParams}`, {
              headers: { 'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v', '')}` }
            });
            if (bySlugResp.ok) {
              const bySlugData = await bySlugResp.json();
              pinnedList = toSafePosts(bySlugData.posts);
            }
          }

          if (pinnedList.length < GHOST_CONFIG.pinnedLimit) {
            const pinnedParams = getGhostApiParams(GHOST_CONFIG.pinnedLimit, { filter: `tag:${GHOST_CONFIG.pinnedTag}` });
            const pinnedResp = await fetch(`${apiUrl}?${pinnedParams}`, {
              headers: { 'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v', '')}` }
            });
            if (pinnedResp.ok) {
              const pinnedData = await pinnedResp.json();
              const fallback = toSafePosts(pinnedData.posts);
              // merge unique by id
              const seen = new Set(pinnedList.map(p => p.id));
              for (const p of fallback) if (!seen.has(p.id)) pinnedList.push(p);
            }
          }

          setPinned(pinnedList.slice(0, GHOST_CONFIG.pinnedLimit));
        }
      } catch (err) {
        console.error('Error fetching Ghost posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit, tag, currentPage, enablePagination]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayTitle = sectionTitle || 'INTERESTING READS';

  if (loading) {
    return (
      <section className={styles.ghostPosts}>
        <div className="container">
        <div className={styles.sectionTitle}>{displayTitle}</div>
          <div className={styles.loading}>Loading latest posts...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.ghostPosts}>
        <div className="container">
          <div className={styles.sectionTitle}>{displayTitle}</div>
          <div className={styles.error}>Unable to load posts: {error}</div>
        </div>
      </section>
    );
  }

  // Return null if there's nothing to display
  if (tag && posts.length === 0) {
    return null;
  }
  if (!tag && featured.length === 0 && posts.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.ghostPosts} ${compact ? styles.ghostPostsInline : ''}`}>
      <div className="container">
        <div className={`${styles.sectionTitle} ${compact ? styles.sectionTitleCompact : ''}`}>{displayTitle}</div>

        {/* Featured block for landing: first = latest, next = static slugs */}
        {featured.length > 0 && (
          <div className={`${styles.postsList} ${compact ? styles.postsListCompact : ''}`}>
            {featured.map((post, idx) => (
              <article key={`featured-${post.id}-${idx}`} className={`${styles.postListItem} ${compact ? styles.postListItemCompact : ''}`}>
                <a href={post.href} target="_blank" rel="noopener noreferrer" className={styles.postListLink}>
                  <div className={styles.postListContent}>
                    {post.feature_image && (
                      <div className={styles.postListImage}>
                        <img src={post.feature_image} alt={post.title} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.postListText}>
                      <h3 className={styles.postListTitle}>{post.title}</h3>
                      {post.excerpt && (
                        <p className={styles.postListExcerpt}>{post.excerpt.replace(/<[^>]*>/g, '')}</p>
                      )}
                      <div className={styles.postListMeta}>
                        <time className={styles.postDate}>{formatDate(post.published_at)}</time>
                        {post.reading_time && <span className={styles.readingTime}> · {post.reading_time} min read</span>}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}

        {/* Display filtered posts when tag is provided */}
        {tag && posts.length > 0 && (
          <div className={`${styles.postsList} ${compact ? styles.postsListCompact : ''}`}>
            {posts.map((post, idx) => (
              <article key={`tagged-${post.id}-${idx}`} className={`${styles.postListItem} ${compact ? styles.postListItemCompact : ''}`}>
                <a href={post.href} target="_blank" rel="noopener noreferrer" className={styles.postListLink}>
                  <div className={styles.postListContent}>
                    {post.feature_image && (
                      <div className={styles.postListImage}>
                        <img src={post.feature_image} alt={post.title} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.postListText}>
                      <h3 className={styles.postListTitle}>{post.title}</h3>
                      {post.excerpt && (
                        <p className={styles.postListExcerpt}>{post.excerpt.replace(/<[^>]*>/g, '')}</p>
                      )}
                      <div className={styles.postListMeta}>
                        <time className={styles.postDate}>{formatDate(post.published_at)}</time>
                        {post.reading_time && <span className={styles.readingTime}> · {post.reading_time} min read</span>}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {enablePagination && (() => {
          const pagination = meta?.pagination;
          const totalPages = pagination?.pages || 0;
          const hasMorePages = totalPages > 1;
          // If we got fewer posts than the limit, we're likely on the last page
          const isLastPage = posts.length < limit;
          // Show pagination if we have multiple pages OR if we got a full page (might have more)
          const shouldShowPagination = hasMorePages || (!isLastPage && currentPage === 1);
          
          if (!shouldShowPagination) {
            return null;
          }
          
          // Determine if we can go to next page
          const canGoNext = totalPages > 0 
            ? currentPage < totalPages 
            : !isLastPage;
          
          return (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className={styles.paginationButton}
              >
                ← Previous
              </button>
              <span className={styles.paginationInfo}>
                {totalPages > 0 ? (
                  `Page ${currentPage} of ${totalPages}`
                ) : (
                  `Page ${currentPage}`
                )}
              </span>
              <button
                onClick={() => {
                  if (totalPages > 0) {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  } else {
                    setCurrentPage(prev => prev + 1);
                  }
                }}
                disabled={!canGoNext || loading}
                className={styles.paginationButton}
              >
                Next →
              </button>
            </div>
          );
        })()}

        {/* Recent list removed per request */}
        {!enablePagination && (
          <div className={styles.viewAll}>
            <a 
              href={`${GHOST_CONFIG.url}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.viewAllLink}
            >
              View All Posts →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
