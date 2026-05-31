import React from 'react';
import { Card, Badge, Button } from '../ui';
import styles from './styles.module.css';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected issue occurred. Please retry.',
  onRetry,
  retryLabel = 'Try again',
}) => (
  <Card variant="outlined" size="md">
    <div className={styles.container} role="alert">
      <Badge variant="warning">Error</Badge>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  </Card>
);

export default ErrorState;
