const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const domino = require('@mixmark-io/domino');
const {htmlFile, maxBundleBytes, codeText} = require('../plugins/ai-docs/generate.cjs');

async function validate(outDir = path.join(__dirname, '../build')) {
  const {unified} = await import('unified');
  const {default: remarkParse} = await import('remark-parse');
  const {default: remarkGfm} = await import('remark-gfm');
  const parser = unified().use(remarkParse).use(remarkGfm);
  const manifest = JSON.parse(await fs.readFile(path.join(outDir, 'llms-manifest.json'), 'utf8'));
  const index = await fs.readFile(path.join(outDir, 'llms.txt'), 'utf8');
  const full = await fs.readFile(path.join(outDir, 'llms-full.txt'), 'utf8');
  const failures = new Set();
  const exists = new Map();
  const directories = new Map();
  const exactFile = async (file) => {
    const parts = path.relative(outDir, file).split(path.sep);
    let folder = outDir;
    for (const [position, name] of parts.entries()) {
      if (!directories.has(folder)) directories.set(folder, fs.readdir(folder, {withFileTypes: true}).catch(() => []));
      const entry = (await directories.get(folder)).find((entry) => entry.name === name);
      if (!entry) return false;
      if (position === parts.length - 1) return entry.isFile();
      if (!entry.isDirectory()) return false;
      folder = path.join(folder, name);
    }
    return false;
  };
  const check = async (target, source) => {
    if (/^(mailto:|tel:|data:|#)/.test(target)) return;
    const url = new URL(target, 'https://docs.curve.finance' + source);
    if (url.origin !== 'https://docs.curve.finance') return;
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith('/cdn-cgi/')) return;
    if (!exists.has(pathname)) {
      const file = path.join(outDir, pathname);
      const candidates = [file, file + '.html', path.join(file, 'index.html')];
      exists.set(pathname, (await Promise.all(candidates.map(exactFile))).some(Boolean));
    }
    if (!exists.get(pathname)) failures.add(`${source}: ${url.href}`);
  };
  const inspectMarkdown = async (content, source) => {
    const links = [];
    const traverse = (node) => {
      if (['link', 'image', 'definition'].includes(node.type)) links.push(node.url);
      for (const child of node.children || []) traverse(child);
    };
    traverse(parser.parse(content));
    await Promise.all(links.map((url) => check(url, source)));
    return new Set(links.map((url) => new URL(url, 'https://docs.curve.finance' + source).href));
  };
  assert(manifest.pages.length > 0, 'No published documentation');
  assert.equal(new Set(manifest.pages.map((page) => page.html)).size, manifest.pages.length, 'Duplicate documentation routes');
  const sitemap = await fs.readFile(path.join(outDir, 'sitemap.xml'), 'utf8');
  const sitemapDocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname).filter((url) => /^\/(user|developer|protocol)\//.test(url));
  assert.deepEqual(sitemapDocs.sort(), manifest.pages.map((page) => page.html).sort(), 'Sitemap/export coverage differs');
  for (const page of manifest.pages) {
    assert(index.includes(`](${new URL(page.markdown, 'https://docs.curve.finance')})`), `Unindexed page: ${page.html}`);
    const content = await fs.readFile(path.join(outDir, page.markdown), 'utf8');
    assert.equal(createHash('sha256').update(content).digest('hex'), page.sha256, `Export hash differs: ${page.markdown}`);
    assert(full.includes(content.trim()), `Missing full-export page: ${page.markdown}`);
    assert(content.includes('Source: ['), `Missing provenance: ${page.markdown}`);
    assert(content.split('\n\n').length > 2, `Empty export: ${page.markdown}`);
    for (const alias of page.aliases) assert.equal(await fs.readFile(path.join(outDir, alias), 'utf8'), content, `Stale alias: ${alias}`);
    const document = domino.createDocument(await fs.readFile(htmlFile(outDir, page.html), 'utf8'));
    const alternate = document.querySelector('link[rel="alternate"][type="text/markdown"]');
    assert.equal(alternate?.getAttribute('href'), page.markdown, `Missing Markdown discovery: ${page.html}`);
    assert.equal(document.querySelector('link[rel="describedby"]')?.getAttribute('href'), `/${page.section}/llms.txt`, `Missing section discovery: ${page.html}`);
    const article = document.querySelector('article .theme-doc-markdown');
    const codes = new Set();
    const collectCode = (node) => {
      if (node.type === 'code') codes.add(node.value.trim());
      for (const child of node.children || []) collectCode(child);
    };
    collectCode(parser.parse(content));
    for (const pre of Array.from(article.querySelectorAll('pre'))) {
      const code = codeText(pre).trim();
      if (code) assert(codes.has(code), `Code changed: ${page.markdown}`);
    }
    for (const address of new Set(article.textContent.match(/0x[0-9a-fA-F]{40}\b/g))) assert(content.includes(address), `Missing address: ${page.markdown}`);
    for (const node of Array.from(document.querySelectorAll('a[href], img[src], video[src], source[src]'))) {
      await check(node.getAttribute(node.tagName.toUpperCase() === 'A' ? 'href' : 'src'), page.html);
    }
    const markdownLinks = await inspectMarkdown(content, page.markdown);
    if (page.html.endsWith('/deployments')) {
      const table = parser.parse(content).children.find((node) => node.type === 'table');
      assert.equal(table?.children.length, article.querySelectorAll('tr').length, `Incomplete deployment table: ${page.markdown}`);
    }
    if (page.html.includes('/security')) {
      const reports = Array.from(article.querySelectorAll('a[href]')).filter((node) => node.getAttribute('href').includes('/pdf/audits/'));
      for (const report of reports) assert(markdownLinks.has(new URL(report.getAttribute('href'), 'https://docs.curve.finance' + page.html).href), `Missing audit report: ${page.markdown}`);
    }
  }
  await inspectMarkdown(index, '/llms.txt');
  await inspectMarkdown(full, '/llms-full.txt');
  for (const bundle of manifest.bundles) {
    const content = await fs.readFile(path.join(outDir, bundle.url), 'utf8');
    assert.equal(Buffer.byteLength(content), bundle.bytes, `Bundle size differs: ${bundle.url}`);
    assert(Buffer.byteLength(content) <= maxBundleBytes, `Oversized bundle: ${bundle.url}`);
    for (const page of manifest.pages.filter((page) => bundle.pages.includes(page.markdown))) assert(content.includes(await fs.readFile(path.join(outDir, page.markdown), 'utf8')), `Incomplete bundle: ${bundle.url}`);
    await inspectMarkdown(content, bundle.url);
  }
  for (const section of ['user', 'developer', 'protocol']) await inspectMarkdown(await fs.readFile(path.join(outDir, section, 'llms.txt'), 'utf8'), `/${section}/llms.txt`);
  const redirects = require('../vercel.json').redirects;
  for (const redirect of redirects) {
    assert.notEqual(redirect.source, redirect.destination, `Redirect loop: ${redirect.source}`);
    assert(redirect.permanent, `Non-permanent redirect: ${redirect.source}`);
    await check(redirect.destination, redirect.source);
  }
  if (failures.size) throw new Error(`Broken documentation targets:\n${[...failures].join('\n')}`);
  console.log(`[ai-docs] Validated ${manifest.pages.length} pages, ${manifest.bundles.length} bundles, and ${exists.size} link targets`);
}

module.exports = {validate};
if (require.main === module) validate().catch((error) => { console.error(error.message); process.exitCode = 1; });
