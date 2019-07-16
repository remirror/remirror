import { EditorState, ExtensionManager, PlainObject } from '@remirror/core';
import { mapProps, ReactSerializer } from '@remirror/renderer-react';
import React, { FC } from 'react';

export interface RemirrorSSRProps {
  state: EditorState;
  attributes: PlainObject;
  manager: ExtensionManager;
  editable: boolean;
}

/**
 * Remirror SSR component used for rendering in non dom environments
 */
export const RemirrorSSR: FC<RemirrorSSRProps> = ({ attributes, manager, state, editable }) => {
  const outerProps = mapProps(attributes);
  const ssrElement = ReactSerializer.fromExtensionManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.ssrTransformer(ssrElement);
  return (
    <div {...outerProps} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
