import React from 'react';

import { MakeOptional } from '@remirror/core';
import { RemirrorElementType, RemirrorFC, RemirrorProps } from '@remirror/react-utils';
import { defaultProps } from '../constants';
import { RemirrorContext } from '../contexts';
import { useRemirrorManager } from '../hooks';
import { Remirror } from './remirror';

export type RemirrorProviderProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps>;

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
        return <RemirrorContext.Provider value={value}>{children}</RemirrorContext.Provider>;
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
