/** @jsx jsx */

import { jsx } from '@emotion/core';

import { AnyExtension, EditorStateParameter, ManagerParameter, PlainObject } from '@remirror/core';
import { mapProps, ReactSerializer } from '@remirror/react-renderer';

export interface RemirrorSSRProps<GExtension extends AnyExtension = any>
  extends EditorStateParameter,
    ManagerParameter<GExtension> {
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
  const outerProperties = mapProps(attributes);
  const ssrElement = ReactSerializer.fromManager(manager).serializeFragment(state.doc.content);
  const transformedElement = manager.store.ssrTransformer(ssrElement);

  return (
    <div {...outerProperties} suppressContentEditableWarning={true} contentEditable={editable}>
      {transformedElement}
    </div>
  );
};
