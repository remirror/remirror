import { FC, useMemo } from 'react';

import { compile } from './compile';
import { Execute } from './execute';
import type { CodeOptions } from './interfaces';

export interface ViewerProps {
  options: CodeOptions;
  code: string;
}

export const Viewer: FC<ViewerProps> = function (props) {
  const { code } = props;
  const result = useMemo(() => compile(code), [code]);

  const { code: compiledCode, error, requires } = result;

  return (
    <div>
      {!error && typeof compiledCode === 'string' ? (
        <Execute code={compiledCode} requires={requires} />
      ) : (
        <div>
          <h1>Error occurred compiling code</h1>
          <pre>
            <code>{String(error ?? 'Unknown error')}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
