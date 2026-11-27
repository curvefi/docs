import React from 'react';
import Content from '@theme-original/DocItem/Content';
import CopyMarkdownButton from '@site/src/components/CopyMarkdownButton';

export default function ContentWrapper(props) {
  return (
    <>
      <CopyMarkdownButton />
      <Content {...props} />
    </>
  );
}
