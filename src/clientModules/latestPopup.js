import { GHOST_CONFIG, getGhostApiParams, getGhostApiUrl, getPostUrl, getSafeImageUrl } from '@site/src/config/ghost';

const STORAGE_KEY_PREFIX = 'latestPopupDismissed:';

async function fetchLatest() {
  try {
    const url = getGhostApiUrl();
    const params = getGhostApiParams(1, { order: 'published_at DESC' });
    const resp = await fetch(`${url}?${params}`, {
      headers: { 'Accept-Version': `v${GHOST_CONFIG.apiVersion.replace('v','')}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return (data && data.posts && data.posts[0]) || null;
  } catch {
    return null;
  }
}

function ensureStyles() {
  if (document.getElementById('latest-popup-styles')) return;
  const style = document.createElement('style');
  style.id = 'latest-popup-styles';
  style.textContent = `
  .latest-popup{position:fixed;right:16px;bottom:16px;width:300px;max-width:calc(100% - 32px);background:var(--Layer-2-Fill);border:1px solid var(--Layer-2-Outline);border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,.22);overflow:hidden;z-index:1000}
  .latest-popup__img{display:block;width:100%;height:120px;object-fit:cover}
  .latest-popup__body{padding:10px}
  .latest-popup__kicker{font-size:.75rem;color:var(--Color-Primary-500);font-weight:700;font-family:'Mona Sans Mono',monospace;margin-bottom:4px}
  .latest-popup__title{font-weight:700;color:var(--Text-TextColors-Primary);text-decoration:none}
  .latest-popup__title:hover{color:var(--Color-Primary-500)}
  .latest-popup__meta{color:var(--Text-TextColors-Secondary);font-size:.9rem;margin-top:2px}
  .latest-popup__close{position:absolute;top:8px;right:8px;border:1px solid var(--Layer-2-Outline);background:var(--Layer-1-Fill);width:28px;height:28px;border-radius:6px;cursor:pointer}
  @media (max-width:768px){.latest-popup{right:8px;left:8px;bottom:12px;width:auto}}
  `;
  document.head.appendChild(style);
}

function renderPopup(post){
  ensureStyles();
  const isHome = typeof window !== 'undefined' && window.location && window.location.pathname === '/';
  // Scope dismissal so closing on the homepage doesn't hide it site‑wide
  const key = `${STORAGE_KEY_PREFIX}${post.id}${isHome ? ':home' : ':global'}`;
  if (localStorage.getItem(key)) return; // dismissed for this context
  if (document.querySelector('.latest-popup')) return; // already shown on this route

  const href = getPostUrl(post.slug);
  if (!href) return;
  const imageSrc = getSafeImageUrl(post.feature_image);

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const wrap = el('div', 'latest-popup');
  if (imageSrc) {
    const img = el('img', 'latest-popup__img');
    img.src = imageSrc;
    img.alt = '';
    wrap.appendChild(img);
  }
  const close = el('button', 'latest-popup__close', '×');
  close.setAttribute('aria-label', 'Dismiss');
  wrap.appendChild(close);

  const body = el('div', 'latest-popup__body');
  body.appendChild(el('div', 'latest-popup__kicker', 'Latest from Curve'));
  const title = el('a', 'latest-popup__title', String(post.title ?? ''));
  title.href = href;
  title.target = '_blank';
  title.rel = 'noopener noreferrer';
  body.appendChild(title);
  const date = new Date(post.published_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const readingTime = Number(post.reading_time);
  body.appendChild(el('div', 'latest-popup__meta', `${date}${readingTime > 0 ? ` · ${readingTime} min` : ''}`));
  wrap.appendChild(body);

  close.addEventListener('click',()=>{localStorage.setItem(key,'1');wrap.remove();});
  document.body.appendChild(wrap);
  // signal presence to avoid overlapping UI
  document.body.classList.add('has-latest-popup');
}

function removePopup(){
  const el = document.querySelector('.latest-popup');
  if (el) el.remove();
  document.body.classList.remove('has-latest-popup');
}

async function init(){
  // Skip on landing page entirely if you prefer; comment this out to allow popup there
  if (typeof window !== 'undefined' && window.location && window.location.pathname === '/') return;
  const post = await fetchLatest();
  if (post) renderPopup(post);
}

if (typeof window !== 'undefined'){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}

// Ensure popup reacts to SPA navigations in Docusaurus
export function onRouteDidUpdate({location}={}){
  const path = location?.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  if (path === '/') {
    removePopup();
    return;
  }
  init();
}


