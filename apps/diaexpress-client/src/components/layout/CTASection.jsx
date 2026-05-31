import React from 'react';
import { Button, Card } from '../ui';
import styles from './styles.module.css';
import { cx } from '../ui/utils';

const ActionButton = ({ action, fallbackVariant }) => {
  if (!action) {
    return null;
  }

  const { label, variant, ...buttonProps } = action;

  return (
    <Button {...buttonProps} variant={variant || fallbackVariant}>
      {label}
    </Button>
  );
};

const CTASection = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}) => (
  <Card variant="elevated" size="lg" className={cx(styles.ctaSection, className)}>
    <div>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>

    <div className={styles.ctaActions}>
      <ActionButton action={primaryAction} fallbackVariant="primary" />
      <ActionButton action={secondaryAction} fallbackVariant="secondary" />
    </div>
  </Card>
);

export default CTASection;
