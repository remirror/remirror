// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as babelRuntimeHelpersInteropRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import React, { FC, useEffect, useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import * as remirrorCoreExtensions from '@remirror/core-extensions';
import * as remirrorReact from '@remirror/react';

import { ErrorBoundary } from './error-boundary';

export interface ExecuteProps {
  code: string;
  requires: string[];
}
const knownRequires: { [moduleName: string]: any } = {
  '@babel/runtime/helpers/interopRequireDefault': babelRuntimeHelpersInteropRequireDefault,
  '@remirror/core-extensions': remirrorCoreExtensions,
  '@remirror/react': remirrorReact,
  react: React,
};

async function makeRequire(requires: string[]) {
  const tasks: Array<Promise<void>> = [];
  const modules: { [moduleName: string]: any } = {};
  for (const moduleName of requires) {
    if (knownRequires[moduleName]) {
      modules[moduleName] = knownRequires[moduleName];
    } else {
      throw new Error('TODO');
    }
  }

  await Promise.all(tasks);

  return (moduleName: string) => {
    if (modules[moduleName]) {
      return modules[moduleName];
    } else {
      throw new Error(`Could not require('${moduleName}')`);
    }
  };
}

function runCodeInDiv(div: HTMLDivElement, { code, requires }: { code: string; requires: string[] }) {
  let active = true;
  (async function doIt() {
    // First do the requires.
    const requireFn = await makeRequire(requires);
    if (!active) {
      return;
    }

    // Then run the code to generate the React element
    const mod = { exports: {} as any };
    eval(`\
(function userCode(require, module, exports) {
  ${code}
})
`)(requireFn, mod, mod.exports);
    const Component = mod.exports.default || mod.exports;

    // Then mount the React element into the div
    render(
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>,
      div,
    );
    console.dir(mod);
  })();

  return () => {
    active = false;
    unmountComponentAtNode(div);
  };
}

export const Execute: FC<ExecuteProps> = props => {
  const { code, requires } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const release = runCodeInDiv(ref.current, { code, requires });
    return release;
  }, [code, requires]);

  return <div ref={ref} />;
};
