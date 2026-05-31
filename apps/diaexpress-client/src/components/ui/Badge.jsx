import React from 'react';
import styles from './styles.module.css';
import { cx, mapSize } from './utils';

const VARIANT_MAP = {
  default: styles.badgeDefault,
  warning: styles.badgeWarning,
  neutral: styles.badgeNeutral,
};

const SIZE_MAP = {
  sm: styles.badgeSm,
  md: styles.badgeMd,
};

const Badge = ({
  as: Component = 'span',
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => (
  <Component
    className={cx(
      styles.badge,
      VARIANT_MAP[variant] || VARIANT_MAP.default,
      mapSize(size, SIZE_MAP),
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

export default Badge;
