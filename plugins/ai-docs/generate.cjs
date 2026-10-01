const fs = require('node:fs/promises');
const path = require('node:path');
const {createHash} = require('node:crypto');
const domino = require('@mixmark-io/domino');
const Turndown = require('turndown');
const {gfm} = require('turndown-plugin-gfm');
const {markdownPath} = require('../../src/utils/markdown-path');

const sections = {user: 'User documentation', developer: 'Developer documentation', protocol: 'Build on Curve'};
const maxBundleBytes = 512 * 1024;

function htmlFile(outDir, permalink) {
  const folder = path.join(outDir, permalink, 'index.html');
  return require('node:fs').existsSync(folder) ? folder : path.join(outDir, `${permalink}.html`);
}

function codeText(pre) {
  const lines = pre.querySelectorAll('.token-line');
  return lines.length ? Array.from(lines, (line) => line.textContent).join('\n') : pre.textContent;
}

function toMarkdown({html, title, canonical, routes}) {
  const document = domino.createDocument(html);
  const article = document.querySelector('article .theme-doc-markdown');
  if (!article) throw new Error(`Missing documentation content: ${canonical}`);
  for (const panel of article.querySelectorAll('[role="tabpanel"]')) {
    const label = document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent;
    if (label) {
      const heading = document.createElement('p');
      heading.textContent = label;
      panel.insertBefore(heading, panel.firstChild);
    }
  }
  for (const node of article.querySelectorAll('button, script, style, .hash-link, [role="tablist"], .inline-logo, .theme-doc-toc-mobile, [data-ai-ignore], [aria-hidden="true"], img[src^="/img/chains/"], img[src^="/img/logos/"], img[src^="/img/auditors/"]')) node.remove();
  for (const math of article.querySelectorAll('.katex-display, .katex')) {
    const tex = math.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
    if (!tex || !math.parentNode) continue;
    const block = math.classList.contains('katex-display');
    const replacement = document.createElement('span');
    replacement.setAttribute('data-ai-math', block ? 'display' : 'inline');
    replacement.textContent = tex;
    math.parentNode.replaceChild(replacement, math);
  }
  const firstHeading = article.querySelector('h1');
  if (firstHeading?.textContent.trim() === title) firstHeading.remove();
  for (const node of article.querySelectorAll('a[href], img[src], video[src], source[src]')) {
    const attr = node.tagName.toUpperCase() === 'A' ? 'href' : 'src';
    const raw = node.getAttribute(attr);
    if (!raw || /^(mailto:|tel:|data:)/.test(raw)) continue;
    const url = new URL(raw, canonical);
    if (attr === 'href' && url.origin === new URL(canonical).origin && routes.has(url.pathname)) url.pathname = routes.get(url.pathname);
    node.setAttribute(attr, url.href);
  }
  const converter = new Turndown({headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*'});
  converter.use(gfm);
  converter.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: (content, node) => {
      const text = content.trim().replace(/\s*\n+\s*/g, ' ').replace(/(?<!\\)\|/g, '\\|');
      return (node.previousElementSibling ? ' ' : '| ') + text + ' |';
    },
  });
  converter.addRule('details', {
    filter: 'details',
    replacement: (content) => `\n\n${content.trim()}\n\n`,
  });
  converter.addRule('summary', {
    filter: 'summary',
    replacement: (content) => `\n\n**${content.trim()}**\n\n`,
  });
  converter.addRule('code', {
    filter: 'pre',
    replacement: (_content, node) => {
      const code = node.querySelector('code');
      const language = (node.className + ' ' + (code?.className || '')).match(/language-([\w-]+)/)?.[1] || '';
      const text = codeText(node).replace(/\n$/, '');
      const fence = '`'.repeat(Math.max(3, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length + 1)));
      return `\n\n${fence}${language}\n${text}\n${fence}\n\n`;
    },
  });
  converter.addRule('math', {
    filter: (node) => node.hasAttribute('data-ai-math'),
    replacement: (_content, node) => node.getAttribute('data-ai-math') === 'display' ? `\n\n$$\n${node.textContent}\n$$\n\n` : `$${node.textContent}$`,
  });
  converter.addRule('headingIds', {
    filter: (node) => /^H[1-6]$/.test(node.nodeName),
    replacement: (content, node) => `\n\n${node.id ? `<a id="${node.id}"></a>\n\n` : ''}${'#'.repeat(Number(node.nodeName[1]))} ${content}\n\n`,
  });
  converter.addRule('video', {filter: 'video', replacement: (_content, node) => {
    const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src');
    return src ? `\n\n[Video](${src})\n\n` : '';
  }});
  converter.addRule('svg', {filter: 'svg', replacement: (_content, node) => {
    const labels = [...new Set(Array.from(node.querySelectorAll('title, text'), (text) => text.textContent.trim()).filter(Boolean))];
    const links = Array.from(node.querySelectorAll('a[href]'), (link) => `[${link.textContent.trim() || 'Diagram link'}](${link.getAttribute('href')})`);
    return labels.length || links.length ? `\n\n${labels.join('; ')}\n\n${links.join('\n\n')}\n\n` : '';
  }});
  const content = converter.turndown(article).trim();
  if (!content) throw new Error(`Empty documentation export: ${canonical}`);
  return `# ${title}\n\nSource: [${canonical}](${canonical})\n\n${content}\n`;
}

function description(doc, html) {
  const article = domino.createDocument(html).querySelector('article .theme-doc-markdown');
  for (const node of article.querySelectorAll('.inline-logo, [data-ai-ignore], [aria-hidden="true"]')) node.remove();
  const text = String(doc.frontMatter?.description || article.querySelector('p')?.textContent || '').replace(/`([^`]+)`/g, '$1').replace(/\s+/g, ' ').trim();
  return /^import\b/.test(text) ? '' : text.length > 180 ? text.slice(0, 177).replace(/\s+\S*$/, '') + '...' : text;
}

function index(title, summary, pages, siteUrl, extras = '') {
  let content = `# ${title}\n\n> ${summary}\n\nRead individual Markdown pages for focused retrieval. Source links identify the canonical documentation.\n\n${extras}`;
  for (const [section, label] of Object.entries(sections)) {
    const items = pages.filter((page) => page.section === section);
    if (!items.length) continue;
    content += `## ${label}\n\n` + items.map((page) => `- [${page.title.replace(/[\[\]\r\n]/g, '')}](${siteUrl}${page.markdown})${page.description ? `: ${page.description}` : ''}`).join('\n') + '\n\n';
  }
  return content;
}

async function generate({docs, siteDir, outDir, siteUrl}) {
  if (!docs.length) throw new Error('No documentation metadata available');
  const routes = new Map(docs.map((doc) => [doc.permalink, markdownPath(doc.permalink)]));
  for (const [route, markdown] of [...routes]) routes.set(route.endsWith('/') ? route.slice(0, -1) : route + '/', markdown);
  const pages = [];
  const writes = new Map();
  const write = async (url, content) => {
    if (writes.has(url) && writes.get(url) !== content) throw new Error(`Conflicting export: ${url}`);
    writes.set(url, content);
    const file = path.join(outDir, url);
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, content);
  };
  for (const doc of [...docs].sort((a, b) => a.permalink.localeCompare(b.permalink))) {
    const canonical = siteUrl + doc.permalink;
    const html = await fs.readFile(htmlFile(outDir, doc.permalink), 'utf8');
    const markdown = markdownPath(doc.permalink);
    let content = toMarkdown({html, title: doc.title, canonical, routes});
    const source = doc.source.replace(/^@site\//, '');
    const raw = await fs.readFile(path.join(siteDir, source), 'utf8');
    const diagrams = Array.from(raw.matchAll(/^```mermaid\s*\n([\s\S]*?)^```\s*$/gm), (match) => match[1]);
    if (diagrams.length && !content.includes('```mermaid')) content += '\n## Diagram definitions\n\n' + diagrams.map((diagram) => '```mermaid\n' + diagram.trimEnd() + '\n```\n').join('\n');
    const aliases = [...new Set([`/${source.replace(/\.mdx$/, '.md')}`, `/docs${doc.permalink.replace(/\/$/, '')}.md`])].filter((alias) => alias !== markdown);
    await write(markdown, content);
    for (const alias of aliases) await write(alias, content);
    pages.push({title: doc.title, description: description(doc, html), section: doc.permalink.split('/')[1], html: doc.permalink, markdown, source, aliases, bytes: Buffer.byteLength(content), sha256: createHash('sha256').update(content).digest('hex'), content});
  }
  const bundles = [];
  for (const section of Object.keys(sections)) {
    let batch = [], bytes = 0, part = 0;
    const flush = async () => {
      if (!batch.length) return;
      const url = `/llms/${section}-${++part}.txt`;
      const text = `# ${sections[section]}\n\n` + batch.map((page) => page.content).join('\n---\n\n');
      await write(url, text);
      bundles.push({url, pages: batch.map((page) => page.markdown), bytes: Buffer.byteLength(text)});
      batch = []; bytes = 0;
    };
    for (const page of pages.filter((page) => page.section === section)) {
      if (page.bytes > maxBundleBytes - 1024) { await flush(); continue; }
      if (bytes + page.bytes + 1024 > maxBundleBytes) await flush();
      batch.push(page); bytes += page.bytes + 10;
    }
    await flush();
    await write(`/${section}/llms.txt`, index(sections[section], `Official Curve ${section} documentation.`, pages.filter((page) => page.section === section), siteUrl));
  }
  const extras = `## Retrieval\n\n- [Users](${siteUrl}/user/llms.txt): User guides, tokens, DAO, and risk documentation\n- [Developers](${siteUrl}/developer/llms.txt): Contract references and integration guides\n- [Build on Curve](${siteUrl}/protocol/llms.txt): Deployment and incentive guides\n- [Deployment data](${siteUrl}/deployments.json): Contract addresses by chain\n- [Manifest](${siteUrl}/llms-manifest.json): Canonical URLs, export hashes, and bounded bundles\n\n`;
  const optional = '\n## Optional\n\n' + bundles.map((bundle) => `- [${bundle.url}](${siteUrl}${bundle.url}): ${bundle.bytes} bytes`).join('\n') + `\n- [Full documentation](${siteUrl}/llms-full.txt): Large combined export; prefer individual pages or bounded bundles\n- [Governance map](${siteUrl}/governance): Interactive governance overview\n- [Emissions cycle](${siteUrl}/emissions): Interactive emissions overview\n- [Fee architecture](${siteUrl}/fee-architecture): Interactive fee overview\n`;
  await write('/llms.txt', index('Curve Finance Documentation', 'Official Curve user, developer, and protocol documentation.', pages, siteUrl, extras) + optional);
  await write('/llms-full.txt', '# Curve Finance Documentation\n\n> Combined reference. Prefer individual pages for focused retrieval.\n\n' + pages.map((page) => page.content).join('\n---\n\n'));
  await write('/llms-manifest.json', JSON.stringify({schemaVersion: 1, pages: pages.map(({content, ...page}) => page), bundles}, null, 2) + '\n');
  console.log(`[ai-docs] Exported ${pages.length} pages and ${bundles.length} bounded bundles`);
}

module.exports = {generate, toMarkdown, description, codeText, htmlFile, maxBundleBytes};
