const assert = require('node:assert/strict');
const test = require('node:test');
const {toMarkdown, description} = require('../plugins/ai-docs/generate.cjs');
const {markdownPath} = require('../src/utils/markdown-path');

const canonical = 'https://docs.curve.finance/developer/example/';
const render = (body) => toMarkdown({html: `<article><div class="theme-doc-markdown"><h1>Example</h1>${body}</div></article>`, title: 'Example', canonical, routes: new Map([['/developer/target', '/developer/target.md']])});

test('Canonical Markdown follows the published route', () => {
  assert.equal(markdownPath('/developer/target'), '/developer/target.md');
  assert.equal(markdownPath('/developer/example/'), '/developer/example/index.md');
});

test('Relative links retain their origin in combined exports', () => {
  const text = render('<p><a href="../target#method">Method</a><img src="../../assets/image.svg" alt="Diagram"></p>');
  assert(text.includes('(https://docs.curve.finance/developer/target.md#method)'));
  assert(text.includes('(https://docs.curve.finance/assets/image.svg)'));
  assert(text.includes('Source: [https://docs.curve.finance/developer/example/]'));
});

test('Collapsed source and alternate tabs keep code and line breaks', () => {
  const text = render('<details><summary>Source</summary><div role="tablist"><button id="tab">ownable.vy</button></div><div role="tabpanel" aria-labelledby="tab"><pre class="language-vyper"><code><span class="token-line">@external</span><span class="token-line">def transfer():</span><span class="token-line">    ownable.check()</span></code></pre></div></details>');
  assert(text.includes('ownable.vy'));
  assert(text.includes('```vyper\n@external\ndef transfer():\n    ownable.check()\n```'));
});

test('Tables retain deployment addresses and audit URLs', () => {
  const text = render('<table><thead><tr><th>Chain</th><th>Address</th></tr></thead><tbody><tr><td>Ethereum</td><td><a href="https://etherscan.io/address/0x123">0x123</a></td></tr></tbody></table><p><a href="/pdf/audits/report.pdf">Audit</a></p>');
  assert(text.includes('| Chain | Address |'));
  assert(text.includes('[0x123](https://etherscan.io/address/0x123)'));
  assert(text.includes('[Audit](https://docs.curve.finance/pdf/audits/report.pdf)'));
});

test('Adjacent expandable examples keep separate code fences', async () => {
  const {unified} = await import('unified');
  const {default: remarkParse} = await import('remark-parse');
  const text = render('<details><summary>Source</summary><pre><code>first()</code></pre>            </details>            <details><summary>Example</summary><pre><code>second()</code></pre></details>');
  const codes = unified().use(remarkParse).parse(text).children.filter((node) => node.type === 'code');
  assert.deepEqual(codes.map((node) => node.value), ['first()', 'second()']);
});

test('Table cells with block wrappers stay on one line', async () => {
  const {unified} = await import('unified');
  const {default: remarkParse} = await import('remark-parse');
  const {default: remarkGfm} = await import('remark-gfm');
  const text = render('<table><thead><tr><th>Chain</th><th>Address</th></tr></thead><tbody><tr><td><div>Ethereum</div></td><td><div><a href="https://etherscan.io/address/0x123"><code>0x123</code></a></div></td></tr></tbody></table>');
  const table = unified().use(remarkParse).use(remarkGfm).parse(text).children.find((node) => node.type === 'table');
  assert.equal(table.children.length, 2);
  assert(text.includes('| Ethereum | [`0x123`](https://etherscan.io/address/0x123) |'));
});

test('Inline SVG keeps visible labels and links', () => {
  const text = render('<svg><text>Deposit crvUSD</text><a href="/developer/target"><text>Vault</text></a></svg>');
  assert(text.includes('Deposit crvUSD'));
  assert(text.includes('[Vault](https://docs.curve.finance/developer/target.md)'));
});

test('Descriptions preserve identifiers and omit decorative logos', () => {
  const html = '<article><div class="theme-doc-markdown"><p>The <code>GAUGE_CONTROLLER</code> reads collateral: it runs on <span class="inline-logo">logos-ethereum</span>Ethereum.</p></div></article>';
  assert.equal(description({description: 'Truncated legacy description'}, html), 'The GAUGE_CONTROLLER reads collateral: it runs on Ethereum.');
  assert.equal(description({frontMatter: {description: 'Explicit summary'}}, html), 'Explicit summary');
});

test('Math keeps its original TeX', () => {
  const text = render('<p>Value <span class="katex"><annotation encoding="application/x-tex">x_i \\times y</annotation></span>.</p><span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\frac{a}{b}</annotation></span></span>');
  assert(text.includes('$x_i \\times y$'));
  assert(text.includes('$$\n\\frac{a}{b}\n$$'));
});

test('Missing rendered content fails generation', () => {
  assert.throws(() => toMarkdown({html: '<main>Missing</main>', title: 'Example', canonical, routes: new Map()}), /Missing documentation content/);
});
