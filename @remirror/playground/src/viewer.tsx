import React, { FC } from 'react';

import { CodeOptions } from './interfaces';

export interface ViewerProps {
  options: CodeOptions;
  code: string;
}

export const Viewer: FC<ViewerProps> = props => {
  const { code } = props;
  return (
    <div style={{ flex: '1 0 0', overflow: 'auto' }}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};
