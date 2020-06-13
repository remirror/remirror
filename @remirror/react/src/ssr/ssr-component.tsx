import React from 'react';

import {
  AnyCombinedUnion,
  EditorManager,
  EditorStateParameter,
  SchemaFromCombined,
  Shape,
} from '@remirror/core';

import { mapProps, ReactSerializer } from '../renderers';

export interface RemirrorSSRProps<Combined extends AnyCombinedUnion>
  extends EditorStateParameter<SchemaFromCombined<Combined>> {
  /**
   * The attributes to pass into the root div element.
   */
  attributes: Shape;
  /**
   * Whether or not the editor is in an editable state
   */
  editable: boolean;

  /**
   * The manager.
   */
  manager: EditorManager<Combined>;
}

/**
 * Remirror SSR component used for rendering in non dom environments.
 */
export const RemirrorSSR = <Combined extends AnyCombinedUnion>({
  attributes,
  manager,
  state,
  editable,
}: RemirrorSSRProps<Combined>) => {
  const outerProperties = mapProps(attributes);
  const ssrElement = ReactSerializer.fromManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.store.ssrTransformer(ssrElement, state);

  return (
    <div {...outerProperties} suppressContentEditableWarning={true} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
