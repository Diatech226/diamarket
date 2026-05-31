import React from 'react';
import styles from './HomePage.module.css';

const TrustStatsRow = ({ items, compact = false }) => (
  <div className={`${styles.kpiStrip} ${compact ? styles.kpiStripCompact : ''}`} role="list" aria-label="indicateurs de confiance">
    {items.map((item) => (
      <span key={item} role="listitem">{item}</span>
    ))}
  </div>
);

export default React.memo(TrustStatsRow);
