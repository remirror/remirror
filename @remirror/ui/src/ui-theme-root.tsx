import { Global } from '@emotion/core';
import React, { FC } from 'react';
import { useRemirrorTheme } from './ui-hooks';

export interface RemirrorThemeRootProps {
  /**
   * Whether or not the styles applied should be applied globally.
   *
   * @defaultValue `false`
   */
  makeGlobal?: boolean;
}

/**
 * Provides the root component which can be placed within the remirror theme content
 * to apply the default body font to all children.
 */
export const RemirrorThemeRoot: FC<RemirrorThemeRootProps> = ({ children, makeGlobal = false }) => {
  const { sxx } = useRemirrorTheme();

  const styles = sxx({
    fontFamily: 'body',
  });

  return (
    <div css={styles} id='remirror-theme-root'>
      {makeGlobal && <Global styles={styles} />}
      {children}
    </div>
  );
};
