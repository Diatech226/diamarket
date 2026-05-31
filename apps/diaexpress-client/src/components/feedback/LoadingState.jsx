import React from 'react';
import { Card, Badge } from '../ui';
import styles from './styles.module.css';

const LoadingState = ({ title = 'Loading', message = 'Please wait while data is being prepared.' }) => (
  <Card variant="outlined" size="md">
    <div className={styles.container} role="status" aria-live="polite">
      <Badge variant="neutral">In progress</Badge>
      <div className={styles.spinner} aria-hidden="true" />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
    </div>
  </Card>
);

export default LoadingState;
