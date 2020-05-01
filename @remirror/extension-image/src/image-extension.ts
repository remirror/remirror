import { ResolvedPos } from 'prosemirror-model';

import {
  bool,
  Cast,
  CommandNodeTypeParameter,
  isElementDOMNode,
  NodeExtension,
  NodeExtensionSpec,
  ProsemirrorAttributes,
  ProsemirrorCommandFunction,
} from '@remirror/core';

import { createImageExtensionPlugin } from './image-plugin';
import { getAttributes } from './image-utils';

const hasCursor = <T extends object>(argument: T): arg is T & { $cursor: ResolvedPos } => {
  return bool(Cast(argument).$cursor);
};

export class ImageExtension extends NodeExtension {
  get name() {
    return 'image' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      inline: true,
      attrs: {
        ...this.extraAttributes(null),
        align: { default: null },
        alt: { default: '' },
        crop: { default: null },
        height: { default: null },
        width: { default: null },
        rotate: { default: null },
        src: { default: null },
        title: { default: '' },
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (domNode) =>
            isElementDOMNode(domNode) ? getAttributes(this.getExtraAttributes(domNode)) : {},
        },
      ],
      toDOM: node => {
        return ['img', node.attrs];
      },
    };
  }

  public commands({ type }: CommandNodeTypeParameter) {
    return {
      insertImage: (attributes: ProsemirrorAttributes): ProsemirrorCommandFunction => (
        state,
        dispatch,
      ) => {
        const { selection } = state;
        const position = hasCursor(selection) ? selection.$cursor.pos : selection.$to.pos;
        const node = type.create(attributes);
        const transaction = state.tr.insert(position, node);

        if (dispatch) {
          dispatch(transaction);
        }

        return true;
      },
    };
  }

  public plugin() {
    return createImageExtensionPlugin();
  }
}
