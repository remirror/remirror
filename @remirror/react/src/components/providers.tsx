import React, { Children, ProviderProps } from 'react';

import { MakeOptional } from '@remirror/core';
import { InjectedRemirrorProps, RemirrorElementType, RemirrorFC, RemirrorProps } from '@remirror/react-utils';
import { defaultProps } from '../constants';
import { RemirrorContext } from '../contexts';
import { useRemirrorManager } from '../hooks';
import { Remirror } from './remirror';

export interface RemirrorContextProviderProps extends ProviderProps<InjectedRemirrorProps> {
  /**
   * Whether to set the first child as a the root prop (where the editor is rendered).
   *
   * If this is set to true then the outer element must be able to receive a ref prop which will mount
   * the editor to it. If not set then the children are responsible for calling `getRootProps`.
   *
   * @default false
   */
  setChildAsRoot?: boolean;
}

export type RemirrorProviderProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps> &
  Pick<RemirrorContextProviderProps, 'setChildAsRoot'>;

/**
 * This purely exists so that we know when the remirror editor has been called with a provider as opposed
 * to directly as a render prop by the user.
 *
 * It's important because when called directly by the user `getRootProps` is automatically called when the render prop
 * is called. However when called via a Provider the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested components is called.
 */
const RemirrorContextProvider: RemirrorFC<RemirrorContextProviderProps> = ({
  setChildAsRoot: _,
  ...props
}) => {
  return <RemirrorContext.Provider {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorElementType.ContextProvider;
RemirrorContextProvider.defaultProps = {
  setChildAsRoot: false,
};

/**
 * The RemirrorProvider which injects context into it's child component.
 *
 * @remarks
 * This only supports one child. At the moment if that that child is an built in html string element
 * then it is also treated as the
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 *
 * Or the higher order components
 * - `withRemirror`
 * - `withPositioner`
 */
export const RemirrorProvider: RemirrorFC<RemirrorProviderProps> = ({
  children,
  setChildAsRoot,
  ...props
}) => {
  return (
    <Remirror {...props}>
      {value => {
        return (
          <RemirrorContextProvider value={value} setChildAsRoot={setChildAsRoot}>
            {Children.only(children)}
          </RemirrorContextProvider>
        );
      }}
    </Remirror>
  );
};

RemirrorProvider.$$remirrorType = RemirrorElementType.EditorProvider;

export type ManagedRemirrorProviderProps = Omit<RemirrorProviderProps, 'manager'>;

/**
 * Renders the content while pulling the manager from the context and passing it on to the
 * RemirrorProvider.
 *
 * If no manager exists the child components are not rendered.
 */
export const ManagedRemirrorProvider: RemirrorFC<ManagedRemirrorProviderProps> = ({ children, ...props }) => {
  const manager = useRemirrorManager();

  return manager ? (
    <RemirrorProvider {...props} manager={manager}>
      {children}
    </RemirrorProvider>
  ) : null;
};

ManagedRemirrorProvider.$$remirrorType = RemirrorElementType.ManagedEditorProvider;
