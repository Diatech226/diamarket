import React from 'react';
import styles from './styles.module.css';
import { cx } from '../ui/utils';

const SectionContainer = ({ as: Component = 'div', className, children, ...props }) => (
  <Component className={cx(styles.sectionContainer, className)} {...props}>
    {children}
  </Component>
);

export default SectionContainer;
