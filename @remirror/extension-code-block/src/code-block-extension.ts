import { setBlockType } from 'prosemirror-commands';
import { TextSelection } from 'prosemirror-state';
import refractor from 'refractor/core';

import {
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  findNodeAtSelection,
  findParentNodeOfType,
  GetAttributes,
  getMatchString,
  isElementDOMNode,
  isNodeActive,
  isTextSelection,
  KeyBindings,
  mod,
  nodeEqualsType,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
  Plugin,
  removeNodeAtPosition,
  toggleBlockItem,
} from '@remirror/core';

import { CodeBlockComponent } from './code-block-component';
import createCodeBlockPlugin from './code-block-plugin';
import {
  CodeBlockAttrs as CodeBlockAttributes,
  CodeBlockExtensionOptions,
} from './code-block-types';
import {
  formatCodeBlockFactory,
  getLanguage,
  updateNodeAttrs as updateNodeAttributes,
} from './code-block-utils';
import { SyntaxTheme, syntaxTheme } from './themes';

export const codeBlockDefaultOptions: CodeBlockExtensionOptions = {
  SSRComponent: CodeBlockComponent,
  supportedLanguages: [],
  syntaxTheme: 'atomDark' as SyntaxTheme,
  defaultLanguage: 'markup',
  formatter: () => undefined,
  keyboardShortcut: mod('ShiftAlt', 'f'),
  toggleType: 'paragraph',
};

export class CodeBlockExtension extends NodeExtension<CodeBlockExtensionOptions> {
  get name() {
    return 'codeBlock' as const;
  }

  /**
   * Provide the default options for this extension
   */
  get defaultOptions() {
    return codeBlockDefaultOptions;
  }

  /**
   * Register the configured languages.
   */
  protected init() {
    super.init();
    for (const language of this.options.supportedLanguages) {
      refractor.register(language);
    }
  }

  /**
   * Provides the codeBlock schema.
   */
  get schema(): NodeExtensionSpec {
    const dataAttribute = 'data-code-block-language';
    return {
      attrs: {
        ...this.extraAttrs(),
        language: { default: this.options.defaultLanguage },
      },
      content: 'text*',
      marks: '',
      group: NodeGroup.Block,
      code: true,
      defining: true,
      isolating: true,
      draggable: false,
      parseDOM: [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (node) => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const codeElement = node.querySelector('code');

            if (!isElementDOMNode(codeElement)) {
              return false;
            }

            const language = codeElement.getAttribute(dataAttribute);
            return { language };
          },
        },
      ],
      toDOM: (node) => {
        const { language, ...rest } = node.attrs as CodeBlockAttrs;
        const attributes = { ...rest, class: `language-${language}` };

        return ['pre', attributes, ['code', { [dataAttribute]: language }, 0]];
      },
    };
  }

  /**
   * Add styles for the editor into the dom.
   */
  public styles() {
    const { syntaxTheme: theme } = this.options;
    if (theme) {
      return syntaxTheme[theme];
    }
    return;
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    const {
      defaultLanguage,
      supportedLanguages,
      formatter,
      toggleType = 'paragraph',
    } = this.options;
    return {
      /**
       * Call this method to toggle the code block.
       *
       * ```ts
       * actions.toggleCodeBlock({ language: 'ts' });
       * ```
       *
       * The above makes the current node a codeBlock with the language ts or remove the
       * code block altogether.
       */
      toggleCodeBlock: (attributes: Partial<CodeBlockAttrs>) =>
        toggleBlockItem({
          type,
          toggleType: schema.nodes[toggleType],
          attrs: { language: defaultLanguage, ...attributes },
        }),

      /**
       * Creates a code at the current position.
       *
       * ```ts
       * actions.createCodeBlock({ language: 'js' });
       * ```
       */
      createCodeBlock: (attributes: CodeBlockAttrs) =>
        setBlockType(type, { language: defaultLanguage, ...attributes }),

      /**
       * Update the code block at the current position. Primarily this is used to change the language.
       *
       * ```ts
       * if (actions.updateCodeBlock.isActive()) {
       *   actions.updateCodeBlock({ language: 'markdown' });
       * }
       * ```
       */
      updateCodeBlock: updateNodeAttributes(type),

      /**
       * Format the code block with the code formatting function passed as an option.
       *
       * Code formatters (like prettier) add a lot to the bundle size and hence it is up to you
       * to provide a formatter which will be run on the entire code block when this method is used.
       *
       * ```ts
       * if (actions.formatCodeBlock.isActive()) {
       *   actions.formatCodeBlockFactory();
       *   // Or with a specific position
       *   actions.formatCodeBlock({ pos: 100 }) // to format a seperate code block
       * }
       * ```
       */
      formatCodeBlock: formatCodeBlockFactory({
        type,
        formatter,
        defaultLanguage,
        supportedLanguages,
      }),
    };
  }

  /**
   * Create an input rule that listens converts the code fence into a code block with space.
   */
  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    const regexp = /^```([A-Za-z]*)? $/;
    const getAttributes: GetAttributes = (match) => {
      const language = getLanguage({
        language: getMatchString(match, 1),
        fallback: this.options.defaultLanguage,
        supportedLanguages: this.options.supportedLanguages,
      });
      return { language };
    };

    return [
      nodeInputRule({
        regexp,
        type,
        updateSelection: true,
        getAttributes: getAttributes,
      }),
    ];
  }

  public keys({ type, getActions }: ExtensionManagerNodeTypeParams): KeyBindings {
    const { keyboardShortcut, toggleType } = this.options;

    return {
      Tab: ({ state, dispatch }) => {
        const { selection, tr, schema } = state;
        // Check that this is the correct node.
        const { node } = findNodeAtSelection(selection);

        if (!nodeEqualsType({ node, types: type })) {
          return false;
        }

        if (selection.empty) {
          tr.insertText('\t');
        } else {
          const { from, to } = selection;
          tr.replaceWith(from, to, schema.text('\t'));
        }

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },
      Backspace: ({ state, dispatch }) => {
        const { selection } = state;

        // If the selection is not empty, return false and let other extension (ie: BaseKeymapExtension) to do
        // the deleting operation.
        if (!selection.empty) {
          return false;
        }

        let tr = state.tr;

        // Check that this is the correct node.
        const parent = findParentNodeOfType({ types: type, selection });

        if (parent?.start !== selection.from) {
          return false;
        }

        const { pos, node, start } = parent;

        if (node.textContent.trim() === '') {
          tr = removeNodeAtPosition({ pos, tr });
        } else if (start - 2 > 0) {
          // Make the cursor jump to the previous node.
          tr.setSelection(TextSelection.create(tr.doc, start - 2));
        } else {
          // There is no content before the codeBlock so simply create a new block and jump into it.
          tr.insert(0, state.schema.nodes[toggleType].create());
          tr.setSelection(TextSelection.create(tr.doc, 1));
        }

        if (dispatch) {
          dispatch(tr);
        }
        return true;
      },
      Enter: ({ state, dispatch }) => {
        const { selection, tr } = state;
        if (!isTextSelection(selection) || !selection.$cursor) {
          return false;
        }

        const { nodeBefore } = selection.$from;

        if (!nodeBefore || !nodeBefore.isText) {
          return false;
        }

        const regex = /^```([A-Za-z]*)?$/;
        const { text } = nodeBefore;

        if (!text) {
          return false;
        }

        const matches = text.match(regex);

        if (!matches) {
          return false;
        }

        const [, lang] = matches;

        const language = getLanguage({
          language: lang,
          fallback: this.options.defaultLanguage,
          supportedLanguages: this.options.supportedLanguages,
        });

        const pos = selection.$from.before();
        const end = pos + nodeBefore.nodeSize + 1; // +1 to account for the extra pos a node takes up
        tr.replaceWith(pos, end, type.create({ language }));

        // Set the selection to within the codeBlock
        tr.setSelection(TextSelection.create(tr.doc, pos + 1));

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },
      [keyboardShortcut]: ({ state }) => {
        const command = getActions('formatCodeBlock');

        if (!isNodeActive({ type, state }) || !command) {
          return false;
        }

        command();
        return true;
      },
    };
  }

  public plugin(parameters: ExtensionManagerNodeTypeParams): Plugin {
    return createCodeBlockPlugin({ extension: this, ...parameters });
  }
}

export { getLanguage };
