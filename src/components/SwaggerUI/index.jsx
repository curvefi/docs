import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import SwaggerUIBundle from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUIContent = ({ src, ...props }) => {
  return (
    <div className="swagger-ui-wrapper">
      <SwaggerUIBundle
        url={src}
        deepLinking={true}
        displayOperationId={false}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        docExpansion="list"
        filter={true}
        showExtensions={true}
        showCommonExtensions={true}
        {...props}
      />
    </div>
  );
};

export default function SwaggerUIComponent({ src, ...props }) {
  return (
    <BrowserOnly fallback={
      <div style={{
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <a href={src}>OpenAPI specification (JSON)</a>
      </div>
    }>
      {() => <SwaggerUIContent src={src} {...props} />}
    </BrowserOnly>
  );
}
