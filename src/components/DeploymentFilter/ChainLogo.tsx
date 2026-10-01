import React from 'react';
import { toSlug } from './constants';
import styles from './styles.module.css';

const EXTS = ['png', 'svg', 'webp'];

export function ChainLogo({ chain }: { chain: string }) {
  const slug = toSlug(chain);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const idxRef = React.useRef(0);

  const handleError = () => {
    idxRef.current += 1;
    if (idxRef.current < EXTS.length) {
      if (imgRef.current) {
        imgRef.current.src = `/img/chains/${slug}.${EXTS[idxRef.current]}`;
      }
    } else {
      if (imgRef.current) {
        imgRef.current.style.display = 'none';
      }
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`/img/chains/${slug}.${slug === 'unichain' ? 'svg' : EXTS[0]}`}
      alt=""
      className={styles.chainLogo}
      onError={handleError}
    />
  );
}
