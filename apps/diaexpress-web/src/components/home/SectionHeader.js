import React from 'react';
import styles from './HomePage.module.css';

const SectionHeader = ({ eyebrow, title, description }) => {
  if (!title && !description) {
    return null;
  }

  return (
    <header className={styles.sectionHeader}>
      {eyebrow ? <span className={styles.sectionEyebrow}>{eyebrow}</span> : null}
      {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
      {description ? <p className={styles.sectionText}>{description}</p> : null}
    </header>
  );
};

export default React.memo(SectionHeader);
