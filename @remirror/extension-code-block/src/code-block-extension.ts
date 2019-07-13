import {
  Attrs,
  BooleanExtensionCheck,
  CommandNodeTypeParams,
  GetAttrs,
  getMatchString,
  isElementDOMNode,
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
// import { wrappingInputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import refractor from 'refractor/core';
import createCodeBlockPlugin from './code-block-plugin';
import { CodeBlockExtensionCommands, CodeBlockExtensionOptions } from './code-block-types';
import { getSupportedLanguagesMap, isSupportedLanguage, updateNodeAttrs } from './code-block-utils';
import { syntaxTheme, SyntaxTheme } from './themes';

export class CodeBlockExtension extends NodeExtension<
  CodeBlockExtensionOptions,
  CodeBlockExtensionCommands,
  {}
> {
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
   * Gets the supported languages
   */
  get supportedLanguageMap() {
    return getSupportedLanguagesMap(this.options.supportedLanguages);
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
    return {
      toggleCodeBlock: (attrs?: Attrs) =>
        toggleBlockItem({ type, toggleType: schema.nodes.paragraph, attrs }),
      createCodeBlock: (attrs?: Attrs) => setBlockType(type, attrs),
      updateCodeBlock: updateNodeAttrs(type),
    };
  }

  public active({
    type,
    getState,
  }: CommandNodeTypeParams): BooleanExtensionCheck<CodeBlockExtensionCommands> {
    return ({ command }) => {
      switch (command) {
        case 'toggleCodeBlock':
        case 'createCodeBlock':
          return isNodeActive({ state: getState(), type });

        default:
          return false;
      }
    };
  }

  public enabled({
    type,
    getState,
  }: CommandNodeTypeParams): BooleanExtensionCheck<CodeBlockExtensionCommands> {
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
  public inputRules({ type }: SchemaNodeTypeParams) {
    const regexp = /^```([a-zA-Z]*)? $/;
    const getAttrs: GetAttrs = match => {
      let lang = getMatchString(match, 1);
      if (!isSupportedLanguage(lang, this.options.supportedLanguages)) {
        lang = this.options.defaultLanguage;
      }

      const language = this.supportedLanguageMap[lang];
      return { language };
    };
    return [
      nodeInputRule({
        regexp,
        type,
        updateSelection: true,
        getAttrs,
      }),
      // wrappingInputRule(/^```(?:[a-zA-Z]*)? $/, type, getAttrs),
    ];
  }

  public keys({ type }: SchemaNodeTypeParams): KeyboardBindings {
    return {
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

        let [, lang] = matches;
        // create the node with the language, etc. & set the selection inside it
        // you may also want to assert a depth in the document, etc. if you have blockquotes, etc as otherwise this would get triggered in there too
        if (!isSupportedLanguage(lang, this.options.supportedLanguages)) {
          lang = this.options.defaultLanguage;
        }

        const language = this.supportedLanguageMap[lang];

        const pos = selection.$from.before();
        const end = pos + nodeBefore.nodeSize + 1; // +1 to account for the extra pos a node takes up
        tr.replaceWith(pos, end, type.create({ language }));

        // Set the selection to within the codeBlock
        const $pos = tr.doc.resolve(pos + 1);
        tr.setSelection(new TextSelection($pos));

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
