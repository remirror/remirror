import { transform } from '@babel/standalone';
import React, { FC, useMemo } from 'react';

import { CodeOptions } from './interfaces';

export interface ViewerProps {
  options: CodeOptions;
  code: string;
}

function compile(code: string): string {
  const result = transform(code, {
    presets: ['env'],
  });
  if (result?.code) {
    return String(result.code);
  } else {
    throw new Error('Failed to compile');
  }
}

export const Viewer: FC<ViewerProps> = props => {
  const { code } = props;
  const compiledCode = useMemo(() => {
    try {
      return compile(code);
    } catch (e) {
      return e;
    }
  }, [code]);

  return (
    <div style={{ flex: '1 0 0', overflow: 'auto' }}>
      {typeof compiledCode === 'string' ? (
        <pre>
          <code>{compiledCode}</code>
        </pre>
      ) : (
        <div>
          <h1>Error occurred compiling code</h1>
          <pre>
            <code>{String(compiledCode)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
