import React, {useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {markdownPath} from '@site/src/utils/markdown-path';

const LABELS = {idle: 'Copy page as Markdown', copied: 'Copied', failed: 'Copy failed'};

// Copies the per-page Markdown export that plugins/ai-docs writes at build time.
export default function CopyMarkdownButton() {
  const {metadata} = useDoc();
  const [state, setState] = useState('idle');
  const href = markdownPath(metadata.permalink);

  const copy = async () => {
    try {
      const response = await fetch(href);
      const text = await response.text();
      // The .md export exists only in production builds; the dev server answers with the HTML page.
      if (!response.ok || text.trimStart().startsWith('<')) throw new Error('Markdown export not found');
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div className="copy-md">
      <button type="button" className="copy-md__button" onClick={copy} aria-live="polite">
        {LABELS[state]}
      </button>
      <a className="copy-md__link" href={href} target="_blank" rel="noopener noreferrer">
        View .md
      </a>
    </div>
  );
}
