import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

// Logos that have separate light/dark variants (keyed by light filename)
const THEMED_LOGOS = {
  'mixbytes_light.svg': { dark: 'mixbytes_dark.svg' },
  'statemind_light.svg': { dark: 'statemind_dark.svg' },
  'tob_light.svg': { dark: 'tob_dark.svg' },
};

export default function AuditCard({
  auditor,
  date,
  reportUrl,
  logo,
  info
}) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const getLogoPath = () => {
    if (!logo) return null;
    const themed = THEMED_LOGOS[logo];
    if (themed && isDarkMode) {
      return `/img/auditors/${themed.dark}`;
    }
    return `/img/auditors/${logo}`;
  };

  return (
    <div className={styles.auditCard}>
      <div className={styles.auditCardHeader}>
        <div className={styles.auditCardLogo}>
          {logo ? (
            <img 
              src={getLogoPath()} 
              alt={auditor} 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div className={styles.auditCardLogoFallback} aria-hidden="true" style={{ display: logo ? 'none' : 'block' }}>
            {auditor.charAt(0)}
          </div>
        </div>
        <div className={styles.auditCardTitle}>
          {auditor}
        </div>
      </div>
      {info && (
        <div className={styles.auditCardScope}>
          {info}
        </div>
      )}
      <div className={styles.auditCardContent}>
        <div className={styles.auditCardDate}>
          <strong>Date:</strong> {date}
        </div>
        <a href={reportUrl} className={styles.auditCardLink} target="_blank" rel="noopener noreferrer">
          View Full Report →
        </a>
      </div>
    </div>
  );
}
