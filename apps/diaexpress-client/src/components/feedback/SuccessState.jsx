import React from 'react';
import { Card, Badge, Button } from '../ui';
import styles from './styles.module.css';

const SuccessState = ({
  title = 'Success',
  message = 'Your action was completed successfully.',
  actionLabel,
  onAction,
}) => (
  <Card variant="elevated" size="md">
    <div className={styles.container}>
      <Badge variant="default">Success</Badge>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction ? (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  </Card>
);

export default SuccessState;
