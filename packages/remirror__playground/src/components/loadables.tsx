/**
 * @module
 *
 * The loadable components with their loaders applied.
 */

import type { ComponentType, FC } from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';
import { ConditionalPick } from '@remirror/core';

import { codeEditorHelper } from '../playground-state';
import type * as CodeEditor from './code-editor';
import { LoadingCode, LoadingContent } from './content-loaders';
import type * as RenderEditor from './renderer';

/**
 * Wrap the the content loaders for the `Loadable` component.
 */
function wrapLoader(Component: ComponentType<object>): FC<LoadingComponentProps> {
  const LoaderWrapper: FC<LoadingComponentProps> = (props) => {
    if (props.error) {
      return (
        <div>
          Error! <button onClick={props.retry}>Retry</button>
        </div>
      );
    }

    if (props.timedOut) {
      return (
        <div>
          Taking a long time... <button onClick={props.retry}>Retry</button>
        </div>
      );
    }

    if (props.pastDelay) {
      return <div>Loading...</div>;
    }

    return <Component />;
  };

  Object.defineProperty(LoaderWrapper, 'name', {
    value: `Wrapped${Component.displayName ?? 'LoadingComponent'}`,
  });

  return LoaderWrapper;
}

/**
 * Allows picking the render via a key rather than creating the function
 * manually.
 */
function wrapRender<Props, Exports extends object>(
  key: keyof ConditionalPick<Exports, ComponentType<Props>>,
) {
  const WrappedRender = (loaded: Exports, props: Props) => {
    const Component: ComponentType<Props> = loaded[key] as any;
    return <Component {...props} />;
  };

  return WrappedRender;
}

/**
 * The code editor which only shows once the loadable editor is made available.
 */
export const LoadableCodeEditor = Loadable<object, typeof CodeEditor>({
  loader: async () => {
    // Setup the editor once loaded.
    await codeEditorHelper.initialize();

    return import('./code-editor');
  },
  render: wrapRender('CodeEditor'),
  loading: wrapLoader(LoadingCode),
  delay: 200,
  timeout: 8000,
});

export const LoadableRenderEditor = Loadable<object, typeof RenderEditor>({
  loader: async () => {
    // await setupInternalModules()
    return import('./renderer');
  },
  render: wrapRender('RenderEditor'),
  loading: wrapLoader(LoadingContent),
  delay: 200,
  timeout: 8000,
});
