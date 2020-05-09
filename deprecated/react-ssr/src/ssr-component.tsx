import React from 'react';
import {
  EditorManager,
  EditorStateParameter,
  GetExtensionUnion,
  PlainObject,
  SchemaFromExtensionUnion,
} from '@remirror/core';
import { mapProps, ReactSerializer } from '@remirror/react-renderer';

export interface RemirrorSSRProps<ManagerType extends EditorManager = any>
  extends EditorStateParameter<SchemaFromExtensionUnion<GetExtensionUnion<ManagerType>>> {
  /**
   * The attributes to pass into the root div element.
   */
  attributes: PlainObject;
  /**
   * Whether or not the editor is in an editable state
   */
  editable: boolean;

  /**
   * The manager.
   */
  manager: ManagerType;
}

/**
 * Remirror SSR component used for rendering in non dom environments
 */
export const RemirrorSSR = <ManagerType extends EditorManager = any>({
  attributes,
  manager,
  state,
  editable,
}: RemirrorSSRProps<ManagerType>) => {
  const outerProperties = mapProps(attributes);
  const ssrElement = ReactSerializer.fromManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.store.ssrTransformer(ssrElement);

  return (
    <div {...outerProperties} suppressContentEditableWarning={true} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
