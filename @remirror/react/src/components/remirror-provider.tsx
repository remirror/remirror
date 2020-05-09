import React, { ProviderProps, ReactElement } from 'react';

import { AnyEditorManager } from '@remirror/core';

import { RemirrorContext } from '../react-contexts';
import { BaseProps, GetRootPropsConfig, InjectedRenderEditorProps } from '../react-types';
import { oneChildOnly, RemirrorType } from '../react-utils';
import { RenderEditor } from './render-editor';

interface RemirrorContextProviderProps<Manager extends AnyEditorManager = any>
  extends ProviderProps<InjectedRenderEditorProps<Manager>>,
    Pick<RemirrorProviderProps<Manager>, 'childAsRoot'> {}

export interface RemirrorProviderProps<Manager extends AnyEditorManager = any>
  extends BaseProps<Manager> {
  /**
   * The `RemirrorProvider` only supports **ONE** child element.
   */
  children: ReactElement;

  /**
   * Sets the first child element as a the root (where the prosemirror editor
   * instance will be rendered).
   *
   * @remarks
   *
   * **Example with directly nested components**
   *
   * When using a remirror provider calling `getRootProps` is mandatory. By
   * setting `childAsRoot` to an object Remirror will inject these props into
   * the first child element.
   *
   * ```tsx
   * import { RemirrorProvider, useManager } from '@remirror/react';
   *
   * const Editor = () => {
   *   const manager = useManager([...myExtensions]);
   *
   *   return (
   *     <RemirrorProvider childAsRoot={{ refKey: 'ref' }}>
   *       <div />
   *     </RemirrorProvider>,
   *   );
   * };
   * ```
   *
   * If this is set to an empty object then the outer element must be able to
   * receive a default ref prop which will mount the editor to it. If left
   * undefined then the children components are responsible for calling
   * `getRootProps`.
   *
   * @defaultValue undefined
   */
  childAsRoot?: GetRootPropsConfig<string> | boolean;
}

/**
 * This purely exists so that we know when the remirror editor has been called
 * with a provider as opposed to directly as a render prop by the user.
 *
 * It's important because, when called directly by the user, `getRootProps` is
 * automatically called when the render prop is called. However, when called via
 * a Provider, the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested
 * components is called.
 */
const RemirrorContextProvider = <Manager extends AnyEditorManager = any>({
  childAsRoot: _,
  ...props
}: RemirrorContextProviderProps<Manager>) => {
  return <RemirrorContext.Provider {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorType.ContextProvider;
RemirrorContextProvider.defaultProps = {
  childAsRoot: false,
};

/**
 * The RemirrorProvider which injects context into it's child component.
 *
 * @remarks
 * This only supports one child. At the moment if that that child is a built in
 * html string element then it is also where the prosemirror editor will be
 * injected (root element).
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 */
export const RemirrorProvider = <Manager extends AnyEditorManager = any>({
  children,
  childAsRoot,
  ...props
}: RemirrorProviderProps<Manager>) => {
  return (
    <RenderEditor {...props}>
      {(value) => {
        return (
          <RemirrorContextProvider value={value} childAsRoot={childAsRoot}>
            {oneChildOnly(children)}
          </RemirrorContextProvider>
        );
      }}
    </RenderEditor>
  );
};

RemirrorProvider.$$remirrorType = RemirrorType.EditorProvider;

export interface ManagedRemirrorProviderProps<Manager extends AnyEditorManager = any>
  extends Omit<BaseProps<Manager>, 'manager'> {}
