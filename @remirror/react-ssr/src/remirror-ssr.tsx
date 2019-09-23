import { AnyExtension, EditorStateParams, ManagerParams, PlainObject } from '@remirror/core';
import { mapProps, ReactSerializer } from '@remirror/react-renderer';
import React from 'react';

export interface RemirrorSSRProps<GExtension extends AnyExtension = any>
  extends EditorStateParams,
    ManagerParams<GExtension> {
  /**
   * The attributes to pass into the root div element.
   */
  attributes: PlainObject;
  /**
   * Whether or not the editor is in an editable state
   */
  editable: boolean;
}

/**
 * Remirror SSR component used for rendering in non dom environments
 */
export const RemirrorSSR = <GExtension extends AnyExtension = any>({
  attributes,
  manager,
  state,
  editable,
}: RemirrorSSRProps<GExtension>) => {
  const outerProps = mapProps(attributes);
  const ssrElement = ReactSerializer.fromExtensionManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.ssrTransformer(ssrElement);
  return (
    <div {...outerProps} suppressContentEditableWarning={true} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
