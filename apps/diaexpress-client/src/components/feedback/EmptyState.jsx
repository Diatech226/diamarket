import React from 'react';
import { Card, Badge, Button } from '../ui';
import styles from './styles.module.css';

const EmptyState = ({
  title = 'No results yet',
  message = 'There is nothing to show in this section right now.',
  actionLabel,
  onAction,
}) => (
  <Card variant="default" size="md">
    <div className={styles.container}>
      <Badge variant="neutral">Empty</Badge>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction ? (
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  </Card>
);

export default EmptyState;
