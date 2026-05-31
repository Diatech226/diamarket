import React from 'react';
import styles from './HomePage.module.css';
import SectionHeader from './SectionHeader';

const Section = ({ id, title, description, muted = false, blockId, children, eyebrow }) => {
  return (
    <section
      id={id}
      className={`${styles.section} ${muted ? styles.sectionMuted : ''} reveal-on-scroll`}
      data-cms-block={blockId || id}
      data-reveal
    >
      <div className={styles.container}>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        {children}
      </div>
    </section>
  );
};

export default Section;
