import React from 'react';

import { MakeOptional, Omit } from '@remirror/core';
import { RemirrorEditorContext } from '../contexts';
import { defaultProps } from '../helpers';
import { useRemirrorManagerContext } from '../hooks';
import { RemirrorElementType, RemirrorFC, RemirrorProps } from '../types';
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
export const RemirrorEditor: RemirrorFC<RemirrorProviderProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => {
        return <RemirrorEditorContext.Provider value={value}>{children}</RemirrorEditorContext.Provider>;
      }}
    </Remirror>
  );
};

RemirrorEditor.$$remirrorType = RemirrorElementType.EditorProvider;

/**
 * Renders the content while pulling the manager from the context and passing it on to the
 * RemirrorProvider.
 *
 * If no manager exists the child components are not rendered.
 */
export const ManagedRemirrorEditor: RemirrorFC<Omit<RemirrorProviderProps, 'manager'>> = ({
  children,
  ...props
}) => {
  const manager = useRemirrorManagerContext();

  return manager ? (
    <RemirrorEditor {...props} manager={manager}>
      {children}
    </RemirrorEditor>
  ) : null;
};

ManagedRemirrorEditor.$$remirrorType = RemirrorElementType.ManagedEditorProvider;
