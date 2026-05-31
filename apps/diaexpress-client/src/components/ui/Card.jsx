import React from 'react';
import styles from './styles.module.css';
import { cx, mapSize } from './utils';

const VARIANT_MAP = {
  default: styles.cardDefault,
  outlined: styles.cardOutlined,
  elevated: styles.cardElevated,
};

const SIZE_MAP = {
  sm: styles.cardSm,
  md: styles.cardMd,
  lg: styles.cardLg,
};

const Card = ({
  as: Component = 'div',
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => (
  <Component
    className={cx(
      styles.card,
      styles.baseTransition,
      VARIANT_MAP[variant] || VARIANT_MAP.default,
      mapSize(size, SIZE_MAP),
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

export default Card;
