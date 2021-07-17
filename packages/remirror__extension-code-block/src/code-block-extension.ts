import refractor from 'refractor/core';
import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  extension,
  ExtensionTag,
  findNodeAtSelection,
  findParentNodeOfType,
  GetAttributes,
  getMatchString,
  getStyle,
  InputRule,
  isElementDomNode,
  isNodeActive,
  isNodeOfType,
  isTextSelection,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  OnSetOptionsProps,
  PosProps,
  ProsemirrorAttributes,
  removeNodeAtPosition,
  replaceNodeAtPosition,
  setBlockType,
  toggleBlockItem,
} from '@remirror/core';
import { keydownHandler } from '@remirror/pm/keymap';
import { TextSelection } from '@remirror/pm/state';
import { ExtensionCodeBlockTheme as Theme } from '@remirror/theme';

import { CodeBlockState } from './code-block-plugin';
import type { CodeBlockAttributes, CodeBlockOptions } from './code-block-types';
import {
  codeBlockToDOM,
  formatCodeBlockFactory,
  getLanguage,
  getLanguageFromDom,
  toggleCodeBlockOptions,
  updateNodeAttributes,
} from './code-block-utils';

@extension<CodeBlockOptions>({
  defaultOptions: {
    supportedLanguages: [],
    toggleName: 'paragraph',
    formatter: ({ source }) => ({ cursorOffset: 0, formatted: source }),
    syntaxTheme: 'a11y_dark',
    defaultLanguage: 'markup',
    defaultWrap: false,
    // See https://github.com/remirror/remirror/issues/624 for the ''
    plainTextClassName: '',
    getLanguageFromDom,
  },
  staticKeys: ['getLanguageFromDom'],
})
export class CodeBlockExtension extends NodeExtension<CodeBlockOptions> {
  get name() {
    return 'codeBlock' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.Code];
  }

  /**
   * Add the languages to the environment if they have not yet been added.
   */
  protected init(): void {
    this.registerLanguages();
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const githubHighlightRegExp = /highlight-(?:text|source)-([\da-z]+)/;

    return {
      content: 'text*',
      marks: '',
      defining: true,
      isolating: true,
      draggable: false,
      ...override,
      code: true,

      attrs: {
        ...extra.defaults(),
        language: { default: this.options.defaultLanguage },
        wrap: { default: this.options.defaultWrap },
      },
      parseDOM: [
        // Add support for github code blocks.
        {
          tag: 'div.highlight',
          preserveWhitespace: 'full',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const codeElement = node.querySelector('pre.code');

            if (!isElementDomNode(codeElement)) {
              return false;
            }

            const wrap = getStyle(codeElement, 'white-space') === 'pre-wrap';
            const language = node.className
              .match(githubHighlightRegExp)?.[1]
              ?.replace('language-', '');

            return { ...extra.parse(node), language, wrap };
          },
        },
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const codeElement = node.querySelector('code');

            if (!isElementDomNode(codeElement)) {
              return false;
            }

            const wrap = getStyle(codeElement, 'white-space') === 'pre-wrap';
            const language = this.options.getLanguageFromDom(codeElement, node);

            return { ...extra.parse(node), language, wrap };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => codeBlockToDOM(node, extra),
    };
  }

  /**
   * Add the syntax theme class to the editor.
   */
  createAttributes(): ProsemirrorAttributes {
    return { class: (Theme as any)[this.options.syntaxTheme.toUpperCase()] };
  }

  /**
   * Create an input rule that listens converts the code fence into a code block
   * when typing triple back tick followed by a space.
   */
  createInputRules(): InputRule[] {
    const regexp = /^```([\dA-Za-z]*) $/;

    const getAttributes: GetAttributes = (match) => {
      const language = getLanguage({
        language: getMatchString(match, 1),
        fallback: this.options.defaultLanguage,
      });

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

  protected onSetOptions(props: OnSetOptionsProps<CodeBlockOptions>): void {
    const { changes } = props;

    if (changes.supportedLanguages.changed) {
      // Update the registered languages when language support is dynamically
      // added.
      this.registerLanguages();
    }

    if (changes.syntaxTheme.changed) {
      // Update the attributes when the syntax theme changes to add the new
      // style to the main editor element.
      this.store.updateAttributes();
    }
  }

  /**
   * Create the custom code block plugin which handles the delete key amongst other things.
   */
  createPlugin(): CreateExtensionPlugin<CodeBlockState> {
    const pluginState = new CodeBlockState(this.type, this);

    /**
     * Handles deletions within the plugin state.
     */
    const handler = () => {
      pluginState.setDeleted(true);

      // Return false to allow any lower priority keyboard handlers to run.
      return false;
    };

    return {
      state: {
        init(_, state) {
          return pluginState.init(state);
        },
        apply(tr, _, __, state) {
          return pluginState.apply(tr, state);
        },
      },
      props: {
        handleKeyDown: keydownHandler({
          Backspace: handler,
          'Mod-Backspace': handler,
          Delete: handler,
          'Mod-Delete': handler,
          'Ctrl-h': handler,
          'Alt-Backspace': handler,
          'Ctrl-d': handler,
          'Ctrl-Alt-Backspace': handler,
          'Alt-Delete': handler,
          'Alt-d': handler,
        }),
        decorations() {
          pluginState.setDeleted(false);
          return pluginState.decorationSet;
        },
      },
    };
  }

  /**
   * Call this method to toggle the code block.
   *
   * @remarks
   *
   * ```ts
   * actions.toggleCodeBlock({ language: 'ts' });
   * ```
   *
   * The above makes the current node a codeBlock with the language ts or
   * remove the code block altogether.
   */
  @command(toggleCodeBlockOptions)
  toggleCodeBlock(attributes: Partial<CodeBlockAttributes>): CommandFunction {
    return toggleBlockItem({
      type: this.type,
      toggleType: this.options.toggleName,
      attrs: { language: this.options.defaultLanguage, ...attributes },
    });
  }

  /**
   * Creates a code at the current position.
   *
   * ```ts
   * commands.createCodeBlock({ language: 'js' });
   * ```
   */
  @command()
  createCodeBlock(attributes: CodeBlockAttributes): CommandFunction {
    return setBlockType(this.type, attributes);
  }

  /**
   * Update the code block at the current position. Primarily this is used
   * to change the language.
   *
   * ```ts
   * if (commands.updateCodeBlock.isEnabled()) {
   *   commands.updateCodeBlock({ language: 'markdown' });
   * }
   * ```
   */
  @command()
  updateCodeBlock(attributes: CodeBlockAttributes): CommandFunction {
    return updateNodeAttributes(this.type)(attributes);
  }

  /**
   * Format the code block with the code formatting function passed as an
   * option.
   *
   * Code formatters (like prettier) add a lot to the bundle size and hence
   * it is up to you to provide a formatter which will be run on the entire
   * code block when this method is used.
   *
   * ```ts
   * if (actions.formatCodeBlock.isActive()) {
   *   actions.formatCodeBlockFactory();
   *   // Or with a specific position
   *   actions.formatCodeBlock({ pos: 100 }) // to format a separate code block
   * }
   * ```
   */
  @command()
  formatCodeBlock(props?: Partial<PosProps>): CommandFunction {
    return formatCodeBlockFactory({
      type: this.type,
      formatter: this.options.formatter,
      defaultLanguage: this.options.defaultLanguage,
    })(props);
  }

  @keyBinding({ shortcut: 'Tab' })
  tabKey({ state, dispatch }: KeyBindingProps): boolean {
    const { selection, tr, schema } = state;

    // Check to ensure that this is the correct node.
    const { node } = findNodeAtSelection(selection);

    if (!isNodeOfType({ node, types: this.type })) {
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
      tr.setSelection(TextSelection.create(tr.doc, start - 2));
    } else {
      // There is no content before the codeBlock so simply create a new
      // block and jump into it.
      tr.insert(0, toggleNode.create());
      tr.setSelection(TextSelection.create(tr.doc, 1));
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

    const regex = /^```([A-Za-z]*)?$/;
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

    const [, lang] = matchesNodeBefore;

    const language = getLanguage({
      language: lang,
      fallback: this.options.defaultLanguage,
    });

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

  @keyBinding({ shortcut: NamedShortcut.Format })
  formatShortcut({ tr }: KeyBindingProps): boolean {
    const commands = this.store.commands;

    if (!isNodeActive({ type: this.type, state: tr })) {
      return false;
    }

    const enabled = commands.formatCodeBlock.isEnabled();

    if (enabled) {
      commands.formatCodeBlock();
    }

    return enabled;
  }

  /**
   * Register passed in languages.
   */
  private registerLanguages() {
    for (const language of this.options.supportedLanguages) {
      refractor.register(language);
    }
  }
}

export { getLanguage };

declare global {
  namespace Remirror {
    interface AllExtensions {
      codeBlock: CodeBlockExtension;
    }
  }
}
