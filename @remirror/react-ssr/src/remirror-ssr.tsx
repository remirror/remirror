import { EditorState, ExtensionManager, PlainObject } from '@remirror/core';
import { mapProps, ReactSerializer } from '@remirror/renderer-react';
import React, { FC } from 'react';

export interface RemirrorSSRProps {
  state: EditorState;
  attributes: PlainObject;
  manager: ExtensionManager;
}

/**
 * Remirror SSR component used for rendering in non dom environments
 */
export const RemirrorSSR: FC<RemirrorSSRProps> = ({ attributes, manager, state }) => {
  const outerProps = mapProps(attributes);
  return (
    <div {...outerProps}>
      {ReactSerializer.fromExtensionManager(manager).serializeFragment(state.doc.content)}
    </div>
  );
};
