import {
  BooleanFlexibleConfig,
  CommandFlexibleConfig,
  CommandNodeTypeParams,
  findParentNodeOfType,
  getMatchString,
  isElementDOMNode,
  isEqual,
  isNodeActive,
  isTextSelection,
  KeyboardBindings,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  Plugin,
  SchemaNodeTypeParams,
  toggleBlockItem,
} from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import refractor from 'refractor/core';
import createCodeBlockPlugin from './code-block-plugin';
import { CodeBlockExtensionOptions } from './code-block-types';
import { isSupportedLanguage, updateNodeAttrs } from './code-block-utils';
import { syntaxTheme, SyntaxTheme } from './themes';

export class CodeBlockExtension extends NodeExtension<CodeBlockExtensionOptions> {
  get name() {
    return 'codeBlock' as const;
  }

  /**
   * Provide the default options for this extension
   */
  get defaultOptions() {
    return {
      supportedLanguages: [],
      syntaxTheme: 'atomDark' as SyntaxTheme,
      defaultLanguage: 'markup',
    };
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
      group: 'block',
      code: true,
      defining: true,
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
        const attrs = { ...rest, class: `language-${language}`, [dataAttribute]: language };

        return ['pre', ['code', attrs, 0]];
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

  public commands({ type, schema }: CommandNodeTypeParams): CommandFlexibleConfig {
    return {
      toggle: attrs => toggleBlockItem({ type, toggleType: schema.nodes.paragraph, attrs }),
      create: attrs => setBlockType(type, attrs),
      updateAttrs: updateNodeAttrs(type),
    };
  }

  public active({ type, getState }: CommandNodeTypeParams): BooleanFlexibleConfig {
    return {
      // Here active just reflects whether the node is active.
      toggle: () => isNodeActive({ state: getState(), type }),

      // Create is active when the current selection is within a code block.
      create: () => isNodeActive({ state: getState(), type }),
    };
  }

  public enabled({ type, getState }: CommandNodeTypeParams): BooleanFlexibleConfig {
    return {
      // Toggle is always enabled
      toggle: () => true,

      // Create is only enabled when the current selection is not active.
      create: () => !isNodeActive({ state: getState(), type }),
    };
  }

  /**
   * Create an input rule that listens converts the code fence into a code block with space.
   */
  public inputRules({ type }: SchemaNodeTypeParams) {
    return [nodeInputRule(/^```([a-zA-Z]*)? $/, type, match => ({ language: getMatchString(match, 1) }))];
  }

  public keys({ type }: SchemaNodeTypeParams): KeyboardBindings {
    return {
      Enter: (state, dispatch) => {
        console.log('enter key pressed');
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

        const [, language] = matches;
        // create the node with the language, etc. & set the selection inside it
        // you may also want to assert a depth in the document, etc. if you have blockquotes, etc as otherwise this would get triggered in there too
        if (!isSupportedLanguage(language, this.options.supportedLanguages)) {
          return false;
        }

        console.log({ before: selection.$from.before(), start: selection.$from.start() });
        const pos = selection.$from.before();
        const end = selection.$from.after();
        // tr.replaceWith(pos, end, type.create({ language }));

        if (!dispatch) {
          return false;
        }

        dispatch(tr);

        return true;
      },
    };
  }

  public plugin(params: SchemaNodeTypeParams): Plugin {
    return createCodeBlockPlugin({ extension: this, ...params });
  }
}
