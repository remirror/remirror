import React from 'react';
import type { AnyExtension, EditorStateProps, RemirrorManager, Shape } from '@remirror/core';

import { ReactSerializer } from './react-serializer';
import { mapProps } from './ssr-utils';

export interface RemirrorSSRProps<Extension extends AnyExtension> extends EditorStateProps {
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
  manager: RemirrorManager<Extension>;
}

/**
 * Remirror SSR component used for rendering in non dom environments.
 */
export const RemirrorSSR = <Extension extends AnyExtension>(
  props: RemirrorSSRProps<Extension>,
): JSX.Element => {
  const { attributes, manager, state, editable } = props;
  const outerProperties = mapProps(attributes);
  const ssrElement = ReactSerializer.fromManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.store.ssrTransformer(ssrElement, state);

  return (
    <div {...outerProperties} suppressContentEditableWarning={true} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
