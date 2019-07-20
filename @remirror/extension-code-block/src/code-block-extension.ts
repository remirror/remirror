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
  mod,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  Plugin,
  SchemaNodeTypeParams,
  toggleBlockItem,
} from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { TextSelection } from 'prosemirror-state';
import refractor from 'refractor/core';
import { CodeBlockComponent } from './code-block-component';
import createCodeBlockPlugin from './code-block-plugin';
import { CodeBlockExtensionCommands, CodeBlockExtensionOptions } from './code-block-types';
import { formatCodeBlockFactory, getLanguage, updateNodeAttrs } from './code-block-utils';
import { syntaxTheme, SyntaxTheme } from './themes';

export const codeBlockDefaultOptions: CodeBlockExtensionOptions = {
  SSRComponent: CodeBlockComponent,
  supportedLanguages: [],
  syntaxTheme: 'atomDark' as SyntaxTheme,
  defaultLanguage: 'markup',
  formatter: () => undefined,
  keyboardShortcut: mod('ShiftAlt', 'f'),
};

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
      group: 'block',
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
    const { defaultLanguage, supportedLanguages, formatter } = this.options;
    return {
      toggleCodeBlock: (attrs?: Attrs) =>
        toggleBlockItem({ type, toggleType: schema.nodes.paragraph, attrs }),
      createCodeBlock: (attrs?: Attrs) => setBlockType(type, attrs),
      updateCodeBlock: updateNodeAttrs(type),
      formatCodeBlock: formatCodeBlockFactory({ type, formatter, defaultLanguage, supportedLanguages }),
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
      // wrappingInputRule(/^```(?:[a-zA-Z]*)? $/, type, getAttrs),
    ];
  }

  public keys({ type, getActions }: SchemaNodeTypeParams): KeyboardBindings {
    const { keyboardShortcut = mod('ShiftAlt', 'f') } = this.options;

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

  public plugin(params: SchemaNodeTypeParams): Plugin {
    return createCodeBlockPlugin({ extension: this, ...params });
  }
}

export { getLanguage };
