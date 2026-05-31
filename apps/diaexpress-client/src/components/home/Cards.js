import React from 'react';
import styles from './HomePage.module.css';

export const ThreeCards = React.memo(({ items }) => (
  <div className={styles.grid3}>
    {items.map((item, index) => (
      <article className={`${styles.card} ${styles.featureCard}`} key={item.title}>
        <span className={styles.cardMeta}>{`0${index + 1}`}</span>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </article>
    ))}
  </div>
));

export const StepsCards = React.memo(({ steps }) => (
  <div className={styles.grid4}>
    {steps.map((step, index) => (
      <article className={`${styles.card} ${styles.stepCard}`} key={step}>
        <span className={styles.stepIndex}>{`Étape ${index + 1}`}</span>
        <h3>{step}</h3>
      </article>
    ))}
  </div>
));

ThreeCards.displayName = 'ThreeCards';
StepsCards.displayName = 'StepsCards';
