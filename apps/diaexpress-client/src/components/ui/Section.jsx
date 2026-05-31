import React from 'react';
import styles from './styles.module.css';
import { cx, mapSize } from './utils';

const VARIANT_MAP = {
  default: styles.sectionDefault,
  muted: styles.sectionMuted,
  accent: styles.sectionAccent,
};

const SIZE_MAP = {
  sm: styles.sectionSm,
  md: styles.sectionMd,
  lg: styles.sectionLg,
};

const Section = ({
  as: Component = 'section',
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => (
  <Component
    className={cx(
      styles.section,
      VARIANT_MAP[variant] || VARIANT_MAP.default,
      mapSize(size, SIZE_MAP),
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

export default Section;
