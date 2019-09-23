import {
  CommandNodeTypeParams,
  CommandStatusCheck,
  ExtensionManagerNodeTypeParams,
  findParentNodeOfType,
  GetAttrs,
  getMatchString,
  isElementDOMNode,
  isNodeActive,
  isTextSelection,
  KeyboardBindings,
  mod,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
  Plugin,
  removeNodeAtPosition,
  toggleBlockItem,
} from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { TextSelection } from 'prosemirror-state';
import refractor from 'refractor/core';
import { CodeBlockComponent } from './code-block-component';
import createCodeBlockPlugin from './code-block-plugin';
import { CodeBlockAttrs, CodeBlockExtensionOptions } from './code-block-types';
import { formatCodeBlockFactory, getLanguage, updateNodeAttrs } from './code-block-utils';
import { syntaxTheme, SyntaxTheme } from './themes';

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
          getAttrs: node => {
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
      toDOM: node => {
        const { language, ...rest } = node.attrs;
        const attrs = { ...rest, class: `language-${language}` };

        return ['pre', attrs, ['code', { [dataAttribute]: language }, 0]];
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
    const { defaultLanguage, supportedLanguages, formatter, toggleType = 'paragraph' } = this.options;
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
      toggleCodeBlock: (attrs?: Partial<CodeBlockAttrs>) =>
        toggleBlockItem({
          type,
          toggleType: schema.nodes[toggleType],
          attrs: { language: defaultLanguage, ...attrs },
        }),

      /**
       * Creates a code at the current position.
       *
       * ```ts
       * actions.createCodeBlock({ language: 'js' });
       * ```
       */
      createCodeBlock: (attrs: CodeBlockAttrs) => setBlockType(type, { language: defaultLanguage, ...attrs }),

      /**
       * Update the code block at the current position. Primarily this is used to change the language.
       *
       * ```ts
       * if (actions.updateCodeBlock.isActive()) {
       *   actions.updateCodeBlock({ language: 'markdown' });
       * }
       * ```
       */
      updateCodeBlock: updateNodeAttrs(type),

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
      formatCodeBlock: formatCodeBlockFactory({ type, formatter, defaultLanguage, supportedLanguages }),
    };
  }

  public active({ type, getState }: CommandNodeTypeParams): CommandStatusCheck {
    return ({ command }) => {
      switch (command) {
        case 'updateCodeBlock':
        case 'createCodeBlock':
        case 'formatCodeBlock': // The formatter could be run to check but this seems expensive
          return isNodeActive({ state: getState(), type });

        default:
          return false;
      }
    };
  }

  public enabled({ type, getState }: CommandNodeTypeParams): CommandStatusCheck {
    return ({ command }) => {
      switch (command) {
        case 'toggleCodeBlock':
          return true;
        case 'createCodeBlock':
          return !isNodeActive({ state: getState(), type });

        default:
          return true;
      }
    };
  }

  /**
   * Create an input rule that listens converts the code fence into a code block with space.
   */
  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    const regexp = /^```([a-zA-Z]*)? $/;
    const getAttrs: GetAttrs = match => {
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
        getAttrs,
      }),
    ];
  }

  public keys({ type, getActions }: ExtensionManagerNodeTypeParams): KeyboardBindings {
    const { keyboardShortcut, toggleType } = this.options;

    return {
      Backspace: (state, dispatch) => {
        const { selection } = state;
        let tr = state.tr;
        const parent = findParentNodeOfType({ types: type, selection })!;

        if (!parent || parent.start !== selection.from) {
          return false;
        }

        const { pos, node, start } = parent;

        if (node.textContent.trim() === '') {
          tr = removeNodeAtPosition({ pos, tr });
        } else if (start - 2 > 0) {
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
      Enter: (state, dispatch) => {
        const { selection, tr } = state;
        if (!isTextSelection(selection) || !selection.$cursor) {
          return false;
        }

        const { nodeBefore } = selection.$from;

        if (!nodeBefore || !nodeBefore.isText) {
          return false;
        }

        const regex = /^```([a-zA-Z]*)?$/;
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
      [keyboardShortcut]: state => {
        const command = getActions('formatCodeBlock');

        if (!isNodeActive({ type, state }) || !command) {
          return false;
        }

        command();
        return true;
      },
    };
  }

  public plugin(params: ExtensionManagerNodeTypeParams): Plugin {
    return createCodeBlockPlugin({ extension: this, ...params });
  }
}

export { getLanguage };
