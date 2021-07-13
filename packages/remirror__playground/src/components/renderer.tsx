/**
 * @module
 *
 * This is the renderer which handles rendering the playground editor into the
 * browser.
 */

import styled from '@emotion/styled';
import { FC, Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { assert, isString } from '@remirror/core-helpers';

import {
  GLOBAL_INTERNAL_MODULES,
  INTERNAL_MODULE_PREFIX,
  LOCAL_MODULE_PREFIX,
} from '../playground-constants';
import { usePlaygroundExports } from '../playground-hooks';
import { ConfigurationSelector, useConfiguration } from '../playground-state';
import { CompileWorkerOutput, EntryFile, ImportMap, WorkerData } from '../playground-types';
import { TypedPromiseWorker } from '../playground-utils';
import { createDebugComponent, PlaygroundProvider } from './create-debug-component';
import { RendererErrorBoundary } from './error-boundary';

const Container = styled.div`
  width: 100%;
`;

export const RenderEditor: FC = () => {
  // Track the element which is used to inject
  const contextProps = useConfiguration(ConfigurationSelector.props);
  const [loaded, setLoaded] = useState(false);

  const contextPropsRef = useRef(contextProps);
  contextPropsRef.current = contextProps;

  useLayoutEffect(() => {
    setupInternalModules(async () => contextPropsRef.current.files).then(() => {
      setLoaded(true);
    });
  }, []);

  return (
    <PlaygroundProvider>
      <Container>{loaded && <DynamicEditor />}</Container>
    </PlaygroundProvider>
  );
};
const DynamicEditor = (): JSX.Element => {
  const [playgroundExports, updateComponent] = usePlaygroundExports();
  const { files } = useConfiguration();

  useEffect(() => {
    updateComponent();
  }, [files, updateComponent]);

  if (!playgroundExports) {
    return <div>No editor found</div>;
  }

  return (
    <RendererErrorBoundary onReset={() => updateComponent()} resetKeys={files}>
      {Object.entries(playgroundExports).map(([name, Component]) => {
        const DebugComponent = createDebugComponent(name);

        return (
          <Fragment key={name}>
            <div>{name}</div>
            <Component DebugComponent={DebugComponent} />
          </Fragment>
        );
      })}
    </RendererErrorBoundary>
  );
};

function insertImportMap(importMap: ImportMap) {
  const script = document.createElement('script');
  script.type = 'importmap-shim';
  script.textContent = JSON.stringify(importMap);
  document.head.append(script);
}

export type GetFiles = () => Promise<EntryFile[]>;

function getBareFileName(path: string) {
  return path.replace(/^\.\/?|[jt]sx?$/g, '') || 'index';
}

/**
 * Override the import shim.
 */
function overrideImportShim(modules: Record<string, any>, getFiles: GetFiles) {
  // Store the modules as a global variable.
  window[GLOBAL_INTERNAL_MODULES] = modules;

  // Cache of the content for the modules.
  const internalContentCache: Record<string, string> = {};

  // The worker that is used to compile code.
  const babelWorker = new TypedPromiseWorker<CompileWorkerOutput, WorkerData>(
    new Worker('../../worker.babel', { type: 'module', name: 'babelWorker' }),
  );

  importShim.skipRegistry = (url) => url.includes(LOCAL_MODULE_PREFIX);
  importShim.fetch = async (url) => {
    const destination = isString(url) ? url : url.url;
    const [, internalName] = destination.split(INTERNAL_MODULE_PREFIX);
    const [, localName] = destination.split(LOCAL_MODULE_PREFIX);

    // This is a local file that needs to be transpiled first.
    if (localName) {
      // if (destination.startsWith('./')) {
      const files = await getFiles();
      // const bareName = getBareFileName(destination);
      const bareName = getBareFileName(localName ?? './');
      const file = files.find((file) => bareName === getBareFileName(file.path));

      assert(file, `'${localName}' is not a valid path`);

      const result = await babelWorker.send({
        type: 'compile',
        code: file.content,
        filename: file.path,
        versions: {},
      });

      if (result.type === 'compile-failure') {
        throw result.error;
      }

      return new Response(new Blob([result.code], { type: 'application/javascript' }));
    }

    // This is not a module that should be intercepted.
    if (!internalName || !modules[internalName]) {
      return fetch(url);
    }

    let moduleContent = internalContentCache[internalName];

    if (!moduleContent) {
      const keys = Object.keys(modules[internalName]).filter((key) => key !== 'default');
      moduleContent = internalContentCache[internalName] = `export const {${keys.join(
        ', ',
      )}} = window['${GLOBAL_INTERNAL_MODULES}']['${internalName}'];\nexport default window['${GLOBAL_INTERNAL_MODULES}']['${internalName}']['default'];`;
    }

    return new Response(new Blob([moduleContent], { type: 'application/javascript' }));
  };
}

/**
 * Setup the internal modules to correctly map to the expected value.
 *
 * @param getFiles - a function to retrieve the latest code from the editor
 * instance.
 */
async function setupInternalModules(getFiles: GetFiles): Promise<void> {
  if (typeof document === 'undefined') {
    return;
  }

  const { IMPORT_MAP, IMPORT_CACHE_MODULES } = await import('../generated/modules');

  insertImportMap(IMPORT_MAP);

  // Force the import shim to be updated.
  importShim.load();

  overrideImportShim(IMPORT_CACHE_MODULES, getFiles);
}
