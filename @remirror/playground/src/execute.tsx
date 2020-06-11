// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as babelRuntimeHelpersInteropRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import * as crypto from 'crypto';
import { languages } from 'monaco-editor';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

// addImport('@remirror/react', 'RemirrorProvider');
// addImport('@remirror/react', 'useManager');
// addImport('@remirror/react', 'useExtension');
import { debounce } from '@remirror/core-helpers';
// import * as remirrorCoreExtensions from '@remirror/core-extensions';
//import * as remirrorReact from '@remirror/react';
import { RemirrorProvider, useExtension, useManager, useRemirror } from '@remirror/react';
import * as remirrorCore from 'remirror/core';

//import * as remirror from 'remirror';
import { ErrorBoundary } from './error-boundary';
import { useRemirrorPlayground } from './use-remirror-playground';
import { acquiredTypeDefs, dtsCache } from './vendor/type-acquisition';

export const REQUIRED_MODULES = [
  'remirror/extension/doc',
  'remirror/extension/text',
  'remirror/extension/paragraph',
  'remirror/extension/bold',
  'remirror/extension/italic',
];

const tsOptions = {
  // Maybe need to do manual syntax highlighting like found here:
  // http://demo.rekit.org/element/src%2Ffeatures%2Feditor%2Fworkers%2FsyntaxHighlighter.js/code

  jsx: languages.typescript.JsxEmit.React,
};
languages.typescript.typescriptDefaults.setCompilerOptions(tsOptions);
languages.typescript.javascriptDefaults.setCompilerOptions(tsOptions);

const remirrorReact = { RemirrorProvider, useManager, useExtension, useRemirror };
// const remirrorCore = { DocExtension, TextExtension, ParagraphExtension };
export const addLibraryToRuntime = (code: string, path: string) => {
  languages.typescript.typescriptDefaults.addExtraLib(code, path);
};

/*

## IMPORTANT! ##

For every module added here, you must provided `acquiredTypeDefs` below,
otherwise it will fetch out-of-sync typedefs from npm

*/

// Hack it so ESModule imports and CommonJS both work
babelRuntimeHelpersInteropRequireDefault.default.default =
  babelRuntimeHelpersInteropRequireDefault.default;

const knownRequires: { [moduleName: string]: any } = {
  '@babel/runtime/helpers/interopRequireDefault': babelRuntimeHelpersInteropRequireDefault.default,
  // '@remirror/core-extensions': remirrorCoreExtensions,
  remirror: require('remirror'),
  'remirror/extension/doc': require('remirror/extension/doc'),
  'remirror/extension/text': require('remirror/extension/text'),
  'remirror/extension/paragraph': require('remirror/extension/paragraph'),
  'remirror/extension/bold': require('remirror/extension/bold'),
  'remirror/extension/italic': require('remirror/extension/italic'),
  'remirror/react': remirrorReact,
  'remirror/core': remirrorCore,
  '@remirror/playground': { useRemirrorPlayground },
  //remirror: remirror,
  react: React,
};
REQUIRED_MODULES.forEach((moduleName) => {
  acquiredTypeDefs[moduleName] = {
    types: {
      ts: 'included',
    },
  };
  // This is a really bad hack, really there should just be one `package.json`
  // at the root of the module.
  acquiredTypeDefs[`node_modules/${moduleName}/package.json`] = JSON.stringify({
    // This should be the package.json
    name: moduleName,
    types: 'index.d.ts',
  });
  dtsCache[moduleName] = {
    'index.d.ts': `
declare module "${moduleName}" {
  const foo: any;
  export default foo;
}
`,
  };
  addLibraryToRuntime(
    acquiredTypeDefs[`node_modules/${moduleName}/package.json`] as any,
    `node_modules/${moduleName}/package.json`,
  );
  addLibraryToRuntime(dtsCache[moduleName]['index.d.ts'], `node_modules/${moduleName}/index.d.ts`);
});

const fetchedModules: {
  [id: string]: {
    name: string;
    modulePromise: Promise<any>;
  };
} = {};

function hash(str: string): string {
  return `_${crypto.createHash('sha1').update(str).digest('hex')}`;
}

function bundle(moduleName: string, id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.addEventListener('load', () => {
      console.log(`LOADED ${moduleName}`);
      resolve((window as any)[id]);
    });
    el.addEventListener('error', (_event) => {
      // We cannot really get details from the event because browsers prevent that for security reasons.
      reject(new Error(`Failed to load ${el.src}`));
    });
    el.src = `http://bundle.run/${encodeURIComponent(moduleName)}@latest?name=${encodeURIComponent(
      id,
    )}`;
    document.body.append(el);
  });
}

export async function makeRequire(requires: string[]) {
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
        fetchedModules[id].modulePromise.then((remoteModule) => {
          modules[moduleName] = remoteModule;
        }),
      );
    }
  }

  await Promise.all(tasks);

  return function require(moduleName: string) {
    if (modules[moduleName]) {
      return modules[moduleName];
    } else {
      throw new Error(`Could not require('${moduleName}')`);
    }
  };
}

/**
 * Fakes CommonJS stuff so that we can run the user code as if it were a
 * CommonJS module.
 */
function runCode(code: string, requireFn: (mod: string) => any) {
  const userModule = { exports: {} as any };
  eval(`(function userCode(require, module, exports) {${code}})`)(
    requireFn,
    userModule,
    userModule.exports,
  );
  return userModule;
}

function runCodeInDiv(
  div: HTMLDivElement,
  { code, requires }: { code: string; requires: string[] },
) {
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
    } catch (error) {
      console.error(error);
      render(
        <div>
          <h1>Error occurred</h1>
          <pre>
            <code>{String(error)}</code>
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

export interface ExecuteProps {
  /** The JavaScript code to execute (in CommonJS syntax) */
  code: string;

  /** A list of the modules this code `require()`s */
  requires: string[];
}

/**
 * Executes the given `code`, mounting the React component that it exported (via
 * `export default`) into the DOM. Is automatically debounced to prevent
 * over-fetching npm modules during typing.
 */
export const Execute: FC<ExecuteProps> = function (props) {
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
