import React from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';

const QuickActionCard = ({ href, title, subtitle, meta, isPrimary = false, onClick }) => {
  return (
    <Link
      href={href}
      className={`${styles.quickStartCard} ${isPrimary ? styles.quickStartCardPrimary : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <em>{meta}</em>
    </Link>
  );
};

export default React.memo(QuickActionCard);
