import React from 'react';
import styles from './styles.module.css';
import { cx } from '../ui/utils';

const PageHeader = ({
  kicker,
  title,
  description,
  align = 'left',
  className,
  actions,
}) => (
  <header
    className={cx(styles.pageHeader, className)}
    style={{ textAlign: align }}
  >
    {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
    {title ? <h1 className={styles.title}>{title}</h1> : null}
    {description ? <p className={styles.description}>{description}</p> : null}
    {actions}
  </header>
);

export default PageHeader;
