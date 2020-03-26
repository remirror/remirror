import * as crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as babelRuntimeHelpersInteropRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { debounce } from 'remirror';

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

const fetchedModules: {
  [id: string]: {
    name: string;
    modulePromise: Promise<any>;
  };
} = {};

const hash = (str: string): string => {
  return `_${crypto
    .createHash('sha1')
    .update(str)
    .digest('hex')}`;
};

function bundle(moduleName: string, id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.onload = () => {
      console.log(`LOADED ${moduleName}`);
      resolve((window as any)[id]);
    };
    el.onerror = event => {
      reject(new Error(`Failed to load ${el.src}`));
    };
    el.src = `http://bundle.run/${encodeURIComponent(moduleName)}@latest?name=${encodeURIComponent(id)}`;
    document.body.appendChild(el);
  });
}

async function makeRequire(requires: string[]) {
  const tasks: Array<Promise<void>> = [];
  const modules: { [moduleName: string]: any } = {};
  for (const moduleName of requires) {
    if (knownRequires[moduleName]) {
      modules[moduleName] = knownRequires[moduleName];
    } else {
      const id = hash(moduleName);
      if (!fetchedModules[id]) {
        fetchedModules[id] = {
          name: moduleName,
          modulePromise: bundle(moduleName, id),
        };
      }
      tasks.push(
        fetchedModules[id].modulePromise.then(remoteModule => {
          modules[moduleName] = remoteModule;
        }),
      );
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

function runCode(code: string, requireFn: (mod: string) => any) {
  const userModule = { exports: {} as any };
  eval(`(function userCode(require, module, exports) {${code}})`)(requireFn, userModule, userModule.exports);
  return userModule;
}

function runCodeInDiv(div: HTMLDivElement, { code, requires }: { code: string; requires: string[] }) {
  let active = true;
  (async function doIt() {
    try {
      // First do the requires.
      const requireFn = await makeRequire(requires);
      if (!active) {
        return;
      }

      // Then run the code to generate the React element
      const userModule = runCode(code, requireFn);
      const Component = userModule.exports.default || userModule.exports;

      // Then mount the React element into the div
      render(
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>,
        div,
      );
    } catch (e) {
      console.error(e);
      render(
        <div>
          <h1>Error occurred</h1>
          <pre>
            <code>{String(e)}</code>
          </pre>
        </div>,
        div,
      );
    }
  })();

  return () => {
    active = false;
    unmountComponentAtNode(div);
  };
}

export const Execute: FC<ExecuteProps> = props => {
  const { code, requires } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const debouncedRunCodeInDiv = useMemo(
    () =>
      debounce(500, false, (code: string, requires: string[]) => {
        if (ref.current) {
          const release = runCodeInDiv(ref.current, { code, requires });
          return release;
        }
        return;
      }),
    [],
  );
  useEffect(() => {
    return debouncedRunCodeInDiv(code, requires);
  }, [debouncedRunCodeInDiv, code, requires]);

  return <div ref={ref} />;
};
