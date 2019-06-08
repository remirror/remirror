import React from 'react';

import { MakeOptional } from '@remirror/core';
import { RemirrorElementType, RemirrorFC, RemirrorProps } from '@remirror/react-utils';
import { defaultProps } from '../constants';
import { RemirrorEditorContext } from '../contexts';
import { useRemirrorManager } from '../hooks';
import { Remirror } from './remirror';

export type RemirrorEditorProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps>;

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
export const RemirrorEditor: RemirrorFC<RemirrorEditorProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => {
        return <RemirrorEditorContext.Provider value={value}>{children}</RemirrorEditorContext.Provider>;
      }}
    </Remirror>
  );
};

RemirrorEditor.$$remirrorType = RemirrorElementType.EditorProvider;

export type ManagedRemirrorEditorProps = Omit<RemirrorEditorProps, 'manager'>;

/**
 * Renders the content while pulling the manager from the context and passing it on to the
 * RemirrorProvider.
 *
 * If no manager exists the child components are not rendered.
 */
export const ManagedRemirrorEditor: RemirrorFC<ManagedRemirrorEditorProps> = ({ children, ...props }) => {
  const manager = useRemirrorManager();

  return manager ? (
    <RemirrorEditor {...props} manager={manager}>
      {children}
    </RemirrorEditor>
  ) : null;
};

ManagedRemirrorEditor.$$remirrorType = RemirrorElementType.ManagedEditorProvider;
