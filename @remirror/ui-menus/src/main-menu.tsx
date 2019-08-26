import { useRemirrorTheme } from '@remirror/ui';
import React from 'react';

const MenuDivider = () => {
  const { sx } = useRemirrorTheme();

  return (
    <span
      css={sx({
        width: '1px',
        height: '24px',
        background: 'rgb(235, 236, 240)',
        margin: 0,
        marginLeft: '8px',
        marginRight: '8px',
      })}
    />
  );
};

export const MenuBar = () => {
  return (
    <div>
      <MenuDivider />
    </div>
  );
};
