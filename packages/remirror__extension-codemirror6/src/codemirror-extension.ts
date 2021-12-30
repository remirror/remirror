import type { LanguageDescription, LanguageSupport } from '@codemirror/language';
import {
  ApplySchemaAttributes,
  assertGet,
  EditorView,
  extension,
  findParentNodeOfType,
  GetAttributes,
  InputRule,
  isElementDomNode,
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
  removeNodeAtPosition,
  replaceNodeAtPosition,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

import { CodeMirror6NodeView } from './codemirror-node-view';
import { CodeMirrorExtensionOptions } from './codemirror-types';
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
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
      return new CodeMirror6NodeView({
        node,
        view,
        getPos: getPos as () => number,
        extensions: this.options.extensions,
        loadLanguage: this.loadLanguage.bind(this),
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
          tr.setSelection(new TextSelection($pos));
        },
        getAttributes: getAttributes,
      }),
    ];
  }

  @keyBinding({ shortcut: 'Backspace' })
  backspaceKey({ dispatch, tr, state }: KeyBindingProps): boolean {
    // If the selection is not empty, return false and let other extension
    // (ie: BaseKeymapExtension) to do the deleting operation.
    if (!tr.selection.empty) {
      return false;
    }

    // Check that this is the correct node.
    const parent = findParentNodeOfType({ types: this.type, selection: tr.selection });

    if (parent?.start !== tr.selection.from) {
      return false;
    }

    const { pos, node, start } = parent;
    const toggleNode = assertGet(state.schema.nodes, this.options.toggleName);

    if (node.textContent.trim() === '') {
      // eslint-disable-next-line unicorn/consistent-destructuring
      if (tr.doc.lastChild === node && tr.doc.firstChild === node) {
        replaceNodeAtPosition({ pos, tr, content: toggleNode.create() });
      } else {
        removeNodeAtPosition({ pos, tr });
      }
    } else if (start > 2) {
      // Jump to the previous node.
      tr.setSelection(TextSelection.near(tr.doc.resolve(start - 2), -1));
    } else {
      // There is no content before the codeBlock so simply create a new
      // block and jump into it.
      tr.insert(0, toggleNode.create());
      tr.setSelection(TextSelection.near(tr.doc.resolve(1), -1));
    }

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }

  @keyBinding({ shortcut: 'Enter' })
  enterKey({ dispatch, tr }: KeyBindingProps): boolean {
    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const { nodeBefore, parent } = tr.selection.$anchor;

    if (!nodeBefore || !nodeBefore.isText || !parent.type.isTextblock) {
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
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));

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
}
