import {
  ApplySchemaAttributes,
  EditorView,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
  ProsemirrorNode,
} from '@remirror/core';

import { CodeMirror6NodeView } from './codemirror6-node-view';
import { arrowHandler } from './codemirror6-utils';

export class CodeMirror6Extension extends NodeExtension {
  name = 'codeMirror6';

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      group: 'block',
      content: 'text*',
      marks: '',
      defining: true,
      ...override,
      code: true,
      attrs: {
        ...extra.defaults(),
        codeMirrorConfig: { default: undefined },
        language: { default: undefined },
      },
      parseDOM: [
        {
          tag: 'pre',
          getAttrs: (node) => (isElementDomNode(node) ? extra.parse(node) : false),
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM() {
        return ['pre', ['code', 0]];
      },
      isolating: true,
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
      return new CodeMirror6NodeView({ node, view, getPos: getPos as () => number });
    };
  }

  createKeymap(): PrioritizedKeyBindings {
    return {
      ArrowLeft: arrowHandler('left'),
      ArrowRight: arrowHandler('right'),
      ArrowUp: arrowHandler('up'),
      ArrowDown: arrowHandler('down'),
    };
  }
}
