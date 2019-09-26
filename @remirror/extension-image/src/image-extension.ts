import {
  Attrs,
  bool,
  Cast,
  CommandFunction,
  CommandNodeTypeParams,
  isElementDOMNode,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { ResolvedPos } from 'prosemirror-model';
import { createImageExtensionPlugin } from './image-plugin';
import { getAttrs } from './image-utils';

const hasCursor = <T extends object>(arg: T): arg is T & { $cursor: ResolvedPos } => {
  return bool(Cast(arg).$cursor);
};

export class ImageExtension extends NodeExtension {
  get name() {
    return 'image' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      inline: true,
      attrs: {
        ...this.extraAttrs(null),
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
          getAttrs: domNode => (isElementDOMNode(domNode) ? getAttrs(this.getExtraAttrs(domNode)) : {}),
        },
      ],
      toDOM(node) {
        return ['img', node.attrs];
      },
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return {
      insertImage: (attrs?: Attrs): CommandFunction => (state, dispatch) => {
        const { selection } = state;
        const position = hasCursor(selection) ? selection.$cursor.pos : selection.$to.pos;
        const node = type.create(attrs);
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
