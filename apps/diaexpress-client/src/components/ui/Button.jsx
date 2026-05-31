import React from 'react';
import styles from './styles.module.css';
import { cx, mapSize, mapState } from './utils';

const VARIANT_MAP = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
};

const SIZE_MAP = {
  sm: styles.buttonSm,
  md: styles.buttonMd,
  lg: styles.buttonLg,
};

const STATE_MAP = {
  disabled: styles.buttonDisabled,
};

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  state = 'default',
  className,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading || state === 'disabled';

  return (
    <Component
      className={cx(
        styles.button,
        styles.baseTransition,
        VARIANT_MAP[variant] || VARIANT_MAP.primary,
        mapSize(size, SIZE_MAP),
        mapState(state, STATE_MAP),
        !isDisabled && styles.buttonHover,
        className
      )}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-busy={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </Component>
  );
};

export default Button;
