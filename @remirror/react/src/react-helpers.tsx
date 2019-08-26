import { ExtensionManager, PlainObject } from '@remirror/core';
import React, { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { useRemirrorManager } from './react-hooks';

export interface GetManagerFromComponentTreeParams {
  /**
   * The full remirror component tree wrapped with an outer <RemirrorManager />
   */
  Component: ComponentType<any>;

  /**
   * A prop for inserting the component which will retrieve the manager
   * @default 'children'
   */
  prop?: string;

  /**
   * Other props that need to be passed into the component
   */
  extraProps?: PlainObject;
}

/**
 * Retrieve the extension manager from your remirror component tree.
 *
 * @remarks
 * When building your multi-platform editor you will want to use **one** schema across
 * all your environments. Since Prosemirror renders in the DOM it makes sense to set
 * up the schema in your DOM based react code.
 *
 * But how to then use that same schema across your platforms?
 *
 * This function provides a way of doing just that. It requires that you set up your
 * editor with with a wrapper component that uses the `RemirrorManager` and then provide
 * an _insertion point_ prop (`children` by default) to place a component within the
 * `RemirrorManager`.
 *
 * This function uses the `prop` you provide to insert a component whose sole purpose is
 * to pull the extension manager from the React context and pass it back to the consumer
 * of this function.
 *
 * ```ts
 * // client.ts
 * export const MyEditorWrapper = ({ children }) => {
 *   return (
 *     <RemirrorManager>
 *       {children}
 *       <RemirrorExtension Constructor={NewExtension} />
 *       <RemirrorExtension Constructor={PlaceholderExtension} emptyNodeClass='empty' />
 *     </RemirrorManager>
 *   );
 * };
 *
 * // server.ts
 * import { MyEditorWrapper } from './client';
 *
 * const manager = await getManagerFromComponentTree({
 *   Component: <MyEditorWrapper />,
 *   prop: 'children',
 * });
 *
 * // For example now you have access to the schema
 * const { schema } =  manager;
 * ```
 *
 * This is useful in DOM-less (server-side rendered) environments.
 */
export const getManagerFromComponentTree = ({
  Component,
  prop = 'children',
  extraProps = {},
}: GetManagerFromComponentTreeParams) =>
  new Promise<ExtensionManager>((resolve, reject) => {
    const MangerRetriever = () => {
      const manager = useRemirrorManager();
      resolve(manager);
      return null;
    };
    const props = { ...extraProps, [prop]: <MangerRetriever /> };

    renderToString(<Component {...props} />);

    reject(
      new Error(
        `The manager was not found. Please check that \`${Component.displayName ||
          Component.name}\` has a prop called \`${prop}\` which is rendered within the \`<RemirrorManager />\` context`,
      ),
    );
  });
