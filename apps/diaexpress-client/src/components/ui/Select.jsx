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

const Select = ({
  label,
  hint,
  error,
  options = [],
  placeholder,
  size = 'md',
  state = 'default',
  className,
  ...props
}) => {
  const mergedState = error ? 'error' : state;

  return (
    <label className={styles.controlWrapper}>
      {label ? <span className={styles.controlLabel}>{label}</span> : null}
      <select
        className={cx(
          styles.select,
          mapSize(size, SIZE_MAP),
          mapState(mergedState, STATE_MAP),
          className
        )}
        disabled={mergedState === 'disabled' || props.disabled}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          if (typeof option === 'object') {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          }

          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
      {error ? <span className={styles.controlError}>{error}</span> : null}
      {!error && hint ? <span className={styles.controlHint}>{hint}</span> : null}
    </label>
  );
};

export default Select;
