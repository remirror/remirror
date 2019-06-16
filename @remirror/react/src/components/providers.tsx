import React, { ProviderProps } from 'react';

import { MakeOptional } from '@remirror/core';
import { InjectedRemirrorProps, RemirrorElementType, RemirrorFC, RemirrorProps } from '@remirror/react-utils';
import { defaultProps } from '../constants';
import { RemirrorContext } from '../contexts';
import { useRemirrorManager } from '../hooks';
import { Remirror } from './remirror';

export type RemirrorProviderProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps>;

/**
 * This purely exists so that we know when the remirror editor has been called with a provider as opposed
 * to directly as a render prop by the user.
 *
 * It's important because when called directly by the user `getRootProps` is automatically called when the render prop
 * is called. However when called via a Provider the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested components is called.
 */
const RemirrorContextProvider: RemirrorFC<ProviderProps<InjectedRemirrorProps>> = props => {
  console.log('WRAPPED REMIRROR_CONTEXT_PROVIDER');
  return <RemirrorContext.Provider {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorElementType.ContextProvider;

/**
 * The RemirrorProvider which injects context into any of it child components.
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 *
 * Or the higher order components
 * - `withRemirror`
 * - `withPositioner`
 */
export const RemirrorProvider: RemirrorFC<RemirrorProviderProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => {
        console.log('Within <RemirrorProvider />');
        return <RemirrorContextProvider value={value}>{children}</RemirrorContextProvider>;
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
