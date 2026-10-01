import React from 'react';
import Head from '@docusaurus/Head';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import TagsListInline from '@theme/TagsListInline';
import EditMetaRow from '@theme/EditMetaRow';
import {markdownPath} from '@site/src/utils/markdown-path';

export default function DocItemFooter() {
  const {metadata} = useDoc();
  const {editUrl, lastUpdatedAt, lastUpdatedBy, tags, permalink} = metadata;
  const canDisplayTagsRow = tags.length > 0;
  const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);

  const llmFilePath = markdownPath(permalink);
  const sectionIndex = `/${permalink.split('/')[1]}/llms.txt`;

  return (
    <footer
      className={clsx(ThemeClassNames.docs.docFooter, 'docusaurus-mt-lg')}>
      <Head>
        <link rel="alternate" type="text/markdown" href={llmFilePath} />
        <link rel="describedby" type="text/plain" href={sectionIndex} />
      </Head>
      {canDisplayTagsRow && (
        <div
          className={clsx(
            'row margin-top--sm',
            ThemeClassNames.docs.docFooterTagsRow,
          )}>
          <div className="col">
            <TagsListInline tags={tags} />
          </div>
        </div>
      )}
      {canDisplayEditMetaRow && (
        <EditMetaRow
          className={clsx(
            'margin-top--sm',
            ThemeClassNames.docs.docFooterEditMetaRow,
          )}
          editUrl={editUrl}
          lastUpdatedAt={lastUpdatedAt}
          lastUpdatedBy={lastUpdatedBy}
        />
      )}
      <div className="llm-txt-link margin-top--md">
        <span className="llm-txt-label">LLM-friendly docs:</span>
        <a href={llmFilePath} target="_blank" rel="noopener noreferrer">
          This page (.md)
        </a>
        <span className="llm-txt-separator"> | </span>
        <a href={sectionIndex} target="_blank" rel="noopener noreferrer">
          Section index
        </a>
        <span className="llm-txt-separator"> | </span>
        <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
          llms.txt
        </a>
      </div>
    </footer>
  );
}
