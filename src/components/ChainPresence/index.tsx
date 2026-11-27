import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

type FullDexPlatform = {
  id?: string;
  chainId?: number;
  name?: string;
};

type CorePlatformsResponse = Record<string, {
  isMainnet?: boolean;
  name?: string;
  chainId?: number;
}>;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Badge({ label }: { label: string }) {
  const slug = toSlug(label);
  const exts = ['svg', 'png', 'webp'];
  const [idx, setIdx] = useState(0);
  const [hasTried, setHasTried] = useState(false);
  const src = idx < exts.length ? `/img/chains/${slug}.${exts[idx]}` : '';

  const handleError = () => {
    if (idx < exts.length - 1) {
      setIdx(idx + 1);
    } else {
      setHasTried(true);
    }
  };

  return (
    <span className={styles.badge}>
      {!hasTried && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={styles.badgeIcon} onError={handleError} />
      )}
      {label.toUpperCase()}
    </span>
  );
}

export default function ChainPresence(): React.ReactNode {
  const [fullDex, setFullDex] = useState<string[]>([]);
  const [liteDex, setLiteDex] = useState<string[]>([]);
  const [lending, setLending] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const safeJson = async (res: Response) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return text as unknown as any; }
      };

      let fullNamesLocal: string[] = [];
      let liteNamesLocal: string[] = [];
      let lendingLocal: string[] = [];

      const results = await Promise.allSettled([
        (async () => {
          // Full deployments from prices API
          const res = await fetch('https://prices.curve.finance/v1/chains/', { mode: 'cors' });
          if (!res.ok) throw new Error(`prices chains ${res.status} ${res.statusText}`);
          const json: any = await safeJson(res);
          const arr: Array<{ name?: string }> = json?.data ?? [];
          fullNamesLocal = arr
            .map((x) => (x?.name || '').toString())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
        })(),
        (async () => {
          // Curve Lite platforms from core API
          const res = await fetch('https://api-core.curve.finance/v1/getPlatforms', { mode: 'cors' });
          if (!res.ok) throw new Error(`core platforms ${res.status} ${res.statusText}`);
          const json: any = await safeJson(res);
          const meta: Record<string, { isMainnet?: boolean; name?: string }> = json?.data?.platformsMetadata ?? {};
          liteNamesLocal = Object.values(meta)
            .filter((m) => m?.isMainnet)
            .map((m) => (m?.name || '').toString())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
        })(),
        (async () => {
          // Lending chains
          const res = await fetch('https://prices.curve.finance/v1/lending/chains/', { mode: 'cors' });
          if (!res.ok) throw new Error(`lending chains ${res.status} ${res.statusText}`);
          const json: any = await safeJson(res);
          const arr: string[] = json?.data ?? [];
          const deprecatedLending = ['sonic'];
          lendingLocal = arr
            .map((n) => (n || '').toString())
            .filter((n) => n && !deprecatedLending.includes(n.toLowerCase()))
            .sort((a, b) => a.localeCompare(b));
        })(),
      ]);

      const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (rejected.length === 2) {
        console.error('ChainPresence fetch errors:', rejected.map((r) => r.reason));
        setError('Unable to load chain presence');
      }

      // Remove overlaps: Full takes precedence over Lite
      const liteOnly = liteNamesLocal.filter((n) => !fullNamesLocal.includes(n));
      setFullDex(fullNamesLocal);
      setLiteDex(liteOnly);
      setLending(lendingLocal);

      setLoading(false);
    };

    fetchData();
  }, []);

  const filterList = (list: string[]) => list;

  return (
    <section className={styles.section}>

      {loading && <div className={styles.loading}>Loading chains…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}> 
          {/* DEX column */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>DEX</div>
            <div className={styles.groupLabel}>Full Deployments</div>
            <div className={styles.badgeWrap}>
              {filterList(fullDex).length === 0 ? <span className={styles.empty}>None</span> : filterList(fullDex).map(n => (
                <Badge key={`full-${n}`} label={n} />
              ))}
            </div>

            <div className={`${styles.groupLabel} ${styles.groupDivider}`}>
              Curve Lite
              <span className={styles.infoIcon} aria-label="About Curve Lite" role="img">ⓘ
                <span className={styles.tooltip}>
                  <strong>Curve Lite</strong> deployments provide essential DEX infrastructure:
                  <ul>
                    <li>Core DEX smart contracts – permissionless Stableswap and Cryptoswap pools</li>
                    <li>Frontend interface integration – networks, pools and swaps in Curve UI</li>
                    <li>CurveDAO integration – DAO owns contracts, admin fees to DAO vault, reward-only gauges (no CRV emissions)</li>
                  </ul>
                </span>
              </span>
            </div>
            <div className={styles.badgeWrap}>
              {filterList(liteDex).length === 0 ? <span className={styles.empty}>None</span> : filterList(liteDex).map(n => (
                <Badge key={`lite-${n}`} label={n} />
              ))}
            </div>
          </div>

          {/* Lending column */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Lending</div>
            <div className={styles.badgeWrap}>
              {lending.length === 0 ? <span className={styles.empty}>None</span> : lending.map(n => (
                <Badge key={`lend-${n}`} label={n} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


