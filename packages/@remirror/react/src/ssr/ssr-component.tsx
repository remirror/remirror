import type {
  AnyExtension,
  EditorStateParameter,
  GetSchema,
  RemirrorManager,
  Shape,
} from '@remirror/core';

import { mapProps, ReactSerializer } from '../renderers';

export interface RemirrorSSRProps<ExtensionUnion extends AnyExtension>
  extends EditorStateParameter<GetSchema<ExtensionUnion>> {
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
  manager: RemirrorManager<ExtensionUnion>;
}

/**
 * Remirror SSR component used for rendering in non dom environments.
 */
export const RemirrorSSR = <ExtensionUnion extends AnyExtension>(
  props: RemirrorSSRProps<ExtensionUnion>,
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
