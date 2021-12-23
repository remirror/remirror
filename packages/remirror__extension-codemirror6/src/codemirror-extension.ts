import { oneDark } from '@codemirror/theme-one-dark';
import {
  ApplySchemaAttributes,
  EditorView,
  extension,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
  ProsemirrorNode,
} from '@remirror/core';

import { CodeMirrorExtensionOptions } from '.';
import { CodeMirror6NodeView } from './codemirror-node-view';
import { arrowHandler } from './codemirror-utils';

@extension<CodeMirrorExtensionOptions>({
  defaultOptions: {
    extensions: [oneDark],
  },
})
export class CodeMirror6Extension extends NodeExtension<CodeMirrorExtensionOptions> {
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
      return new CodeMirror6NodeView({
        node,
        view,
        getPos: getPos as () => number,
        extensions: this.options.extensions,
      });
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
