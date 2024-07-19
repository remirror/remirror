import type { LanguageDescription, LanguageSupport } from '@codemirror/language';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  EditorView,
  extension,
  findParentNodeOfType,
  GetAttributes,
  InputRule,
  isElementDomNode,
  isEqual,
  isTextSelection,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  PrioritizedKeyBindings,
  ProsemirrorNode,
  setBlockType,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

import { CodeMirror6NodeView } from './codemirror-node-view';
import { CodeMirrorExtensionAttributes, CodeMirrorExtensionOptions } from './codemirror-types';
import { arrowHandler } from './codemirror-utils';

@extension<CodeMirrorExtensionOptions>({
  defaultOptions: {
    extensions: null,
    languages: null,
    toggleName: 'paragraph',
  },
})
export class CodeMirrorExtension extends NodeExtension<CodeMirrorExtensionOptions> {
  get name() {
    return 'codeMirror' as const;
  }

  private languageMap: Record<string, LanguageDescription> | null = null;

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
        language: { default: '' },
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
    return (node: ProsemirrorNode, view: EditorView, getPos: () => number | undefined) =>
      new CodeMirror6NodeView({
        node,
        view,
        getPos: getPos as () => number,
        extensions: this.options.extensions,
        loadLanguage: this.loadLanguage.bind(this),
        toggleName: this.options.toggleName,
      });
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
   * Create an input rule that listens converts the code fence into a code block
   * when typing triple back tick followed by a space.
   */
  createInputRules(): InputRule[] {
    const regexp = /^```(\S+) $/;

    const getAttributes: GetAttributes = (match) => {
      const language = match[1] ?? '';
      return { language };
    };

    return [
      nodeInputRule({
        regexp,
        type: this.type,
        beforeDispatch: ({ tr, start }) => {
          const $pos = tr.doc.resolve(start);
          tr.setSelection(TextSelection.near($pos));
        },
        getAttributes: getAttributes,
      }),
    ];
  }

  @keyBinding({ shortcut: 'Enter' })
  enterKey({ dispatch, tr }: KeyBindingProps): boolean {
    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const { nodeBefore, parent } = tr.selection.$anchor;

    if (!nodeBefore?.isText || !parent.type.isTextblock) {
      return false;
    }

    const regex = /^```(\S*)?$/;
    const { text, nodeSize } = nodeBefore;
    const { textContent } = parent;

    if (!text) {
      return false;
    }

    const matchesNodeBefore = text.match(regex);
    const matchesParent = textContent.match(regex);

    if (!matchesNodeBefore || !matchesParent) {
      return false;
    }

    const language = matchesNodeBefore[1] ?? '';

    const pos = tr.selection.$from.before();
    const end = pos + nodeSize + 1; // +1 to account for the extra pos a node takes up
    tr.replaceWith(pos, end, this.type.create({ language }));

    // Set the selection to within the codeBlock
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }

  private getLanguageMap(): Record<string, LanguageDescription> {
    if (!this.languageMap) {
      this.languageMap = {};

      for (const language of this.options.languages ?? []) {
        for (const alias of language.alias) {
          this.languageMap[alias] = language;
        }
      }
    }

    return this.languageMap;
  }

  private loadLanguage(
    languageName: string,
  ): Promise<LanguageSupport> | LanguageSupport | undefined {
    if (typeof languageName !== 'string') {
      return undefined;
    }

    const languageMap = this.getLanguageMap();
    const language = languageMap[languageName.toLowerCase()];

    if (!language) {
      return undefined;
    }

    return language.support || language.load();
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
   * if (commands.updateCodeMirror.enabled()) {
   *   commands.updateCodeMirror({ language: 'markdown' });
   * }
   * ```
   */
  @command()
  updateCodeMirror(attributes: CodeMirrorExtensionAttributes): CommandFunction {
    const type = this.type;
    return ({ state, dispatch, tr }) => {
      const parent = findParentNodeOfType({ types: type, selection: state.selection });

      if (!parent || isEqual(attributes, parent.node.attrs)) {
        // Do nothing since the attrs are the same
        return false;
      }

      tr.setNodeMarkup(parent.pos, type, { ...parent.node.attrs, ...attributes });

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
  }
}
