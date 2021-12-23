import type { LanguageDescription, LanguageSupport } from '@codemirror/language';
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

import { CodeMirror6NodeView } from './codemirror-node-view';
import { CodeMirrorExtensionOptions } from './codemirror-types';
import { arrowHandler } from './codemirror-utils';

@extension<CodeMirrorExtensionOptions>({
  defaultOptions: {
    extensions: [oneDark],
    languages: null,
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
    inputLanguage: string,
  ): Promise<LanguageSupport> | LanguageSupport | undefined {
    const languageMap = this.getLanguageMap();
    const language = languageMap[inputLanguage.toLowerCase()];

    if (!language) {
      return undefined;
    }

    return language.support || language.load();
  }
}
