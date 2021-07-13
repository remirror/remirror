import React from 'react';

import styles from './components.module.css';

/**
 * An external icon svg.
 */
export const ExternalIcon: React.FC = () => {
  return (
    <svg viewBox='0 0 24 24' className={styles.externalIcon}>
      <path fill='none' d='M0 0h24v24H0z' />
      <path
        stroke='currentColor'
        strokeWidth='0.7px'
        fill='currentColor'
        d='M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z'
      />
    </svg>
  );
};
