import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  EditorView,
  extension,
  ExtensionTag,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
  ProsemirrorNode,
  setBlockType,
} from '@remirror/core';

import { CodeMirrorNodeView } from './codemirror-node-view';
import ref from './codemirror-ref';
import type { CodeMirrorExtensionAttributes, CodeMirrorExtensionOptions } from './codemirror-types';
import { arrowHandler, parseLanguageToMode, updateNodeAttributes } from './codemirror-utils';

@extension<CodeMirrorExtensionOptions>({
  defaultOptions: {
    CodeMirror: ref.CodeMirror,
    defaultCodeMirrorConfig: null,
  },
  staticKeys: ['CodeMirror'],
})
export class CodeMirrorExtension extends NodeExtension<CodeMirrorExtensionOptions> {
  get name() {
    return 'codeMirror' as const;
  }

  readonly tags = [ExtensionTag.Block, ExtensionTag.Code];

  init(): void {
    // Update the reference to the codemirror instance.
    if (this.options.CodeMirror) {
      ref.CodeMirror = this.options.CodeMirror;
    }
  }

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
      const codeMirrorConfig = {
        ...this.options.defaultCodeMirrorConfig,
        ...node.attrs.codeMirrorConfig,
      };

      if (node.attrs.language) {
        const mode = parseLanguageToMode(node.attrs.language);

        if (mode) {
          codeMirrorConfig.mode = mode;
        }
      }

      return new CodeMirrorNodeView(node, view, getPos as () => number, codeMirrorConfig);
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

  /**
   * Creates a CodeMirror block at the current position.
   *
   * ```ts
   * commands.createCodeMirror({ language: 'js' });
   * ```
   */
  @command()
  createCodeMirror(attributes: CodeMirrorExtensionAttributes): CommandFunction {
    return setBlockType(this.type, attributes);
  }

  /**
   * Update the code block at the current position. Primarily this is used
   * to change the language.
   *
   * ```ts
   * if (commands.updateCodeMirror.isEnabled()) {
   *   commands.updateCodeMirror({ language: 'markdown' });
   * }
   * ```
   */
  @command()
  updateCodeMirror(attributes: CodeMirrorExtensionAttributes): CommandFunction {
    return updateNodeAttributes(this.type)(attributes);
  }
}
