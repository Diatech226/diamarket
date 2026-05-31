import React from 'react';
import styles from './styles.module.css';
import { cx, mapSize, mapState } from './utils';

const SIZE_MAP = {
  sm: styles.controlSm,
  md: styles.controlMd,
  lg: styles.controlLg,
};

const STATE_MAP = {
  error: styles.stateError,
  success: styles.stateSuccess,
  disabled: styles.stateDisabled,
};

const Textarea = ({
  label,
  hint,
  error,
  size = 'md',
  state = 'default',
  className,
  rows = 4,
  ...props
}) => {
  const mergedState = error ? 'error' : state;

  return (
    <label className={styles.controlWrapper}>
      {label ? <span className={styles.controlLabel}>{label}</span> : null}
      <textarea
        className={cx(
          styles.textarea,
          mapSize(size, SIZE_MAP),
          mapState(mergedState, STATE_MAP),
          className
        )}
        rows={rows}
        disabled={mergedState === 'disabled' || props.disabled}
        {...props}
      />
      {error ? <span className={styles.controlError}>{error}</span> : null}
      {!error && hint ? <span className={styles.controlHint}>{hint}</span> : null}
    </label>
  );
};

export default Textarea;
