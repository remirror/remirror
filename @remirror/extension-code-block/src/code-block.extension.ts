import {
  isElementDOMNode,
  NodeExtension,
  NodeExtensionSpec,
  Plugin,
  SchemaNodeTypeParams,
  toggleBlockItem,
} from '@remirror/core';
import refractor from 'refractor/core';
import createCodeBlockPlugin from './plugin';
import { CodeBlockState } from './state';
import { syntaxTheme, SyntaxTheme } from './themes';
import { CodeBlockExtensionOptions } from './types';

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
          getAttrs: dom => {
            if (!isElementDOMNode(dom)) {
              return false;
            }

            const codeElement = dom.querySelector('code');

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

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return { toggle: () => toggleBlockItem({ type, toggleType: schema.nodes.paragraph }) };
  }

  public plugin({ type }: SchemaNodeTypeParams): Plugin<CodeBlockState> {
    return createCodeBlockPlugin(this, type);
  }
}
