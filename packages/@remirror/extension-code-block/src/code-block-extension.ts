import refractor from 'refractor/core';

import {
  ApplySchemaAttributes,
  CreatePluginReturn,
  extensionDecorator,
  ExtensionTag,
  findNodeAtSelection,
  findParentNodeOfType,
  GetAttributes,
  getMatchString,
  InputRule,
  isElementDomNode,
  isNodeActive,
  isNodeOfType,
  isTextSelection,
  KeyBindings,
  mod,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  OnSetOptionsParameter,
  PosParameter,
  removeNodeAtPosition,
  replaceNodeAtPosition,
  setBlockType,
  toggleBlockItem,
} from '@remirror/core';
import { keydownHandler } from '@remirror/pm/keymap';
import { TextSelection } from '@remirror/pm/state';

import { CodeBlockState } from './code-block-plugin';
import type { CodeBlockAttributes, CodeBlockOptions } from './code-block-types';
import {
  codeBlockToDOM,
  dataAttribute,
  formatCodeBlockFactory,
  getLanguage,
  updateNodeAttributes,
} from './code-block-utils';

@extensionDecorator<CodeBlockOptions>({
  defaultOptions: {
    supportedLanguages: [],
    keyboardShortcut: mod('ShiftAlt', 'f'),
    toggleName: 'paragraph',
    formatter: ({ source }) => ({ cursorOffset: 0, formatted: source }),
    syntaxTheme: 'atomDark',
    defaultLanguage: 'markup',
  },
})
export class CodeBlockExtension extends NodeExtension<CodeBlockOptions> {
  get name() {
    return 'codeBlock' as const;
  }

  readonly tags = [ExtensionTag.BlockNode, ExtensionTag.Code];

  /**
   * Add the languages to the environment if they have not yet been added.
   */
  protected init(): void {
    this.registerLanguages();
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        language: { default: this.options.defaultLanguage },
      },
      content: 'text*',
      marks: '',
      code: true,
      defining: true,
      isolating: true,
      draggable: false,
      parseDOM: [
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

            const language = codeElement.getAttribute(dataAttribute);
            return { ...extra.parse(node), language };
          },
        },
      ],
      toDOM: (node) => codeBlockToDOM(node, extra.dom),
    };
  }

  createCommands() {
    return {
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
      toggleCodeBlock: (attributes: Partial<CodeBlockAttributes>) =>
        toggleBlockItem({
          type: this.type,
          toggleType: this.store.schema.nodes[this.options.toggleName],
          attrs: { language: this.options.defaultLanguage, ...attributes },
        }),

      /**
       * Creates a code at the current position.
       *
       * ```ts
       * commands.createCodeBlock({ language: 'js' });
       * ```
       */
      createCodeBlock: (attributes: CodeBlockAttributes) => {
        return setBlockType(this.type, attributes);
      },

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
      updateCodeBlock: updateNodeAttributes(this.type),

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
      formatCodeBlock: (parameter?: Partial<PosParameter>) => {
        return formatCodeBlockFactory({
          type: this.type,
          formatter: this.options.formatter,
          defaultLanguage: this.options.defaultLanguage,
        })(parameter);
      },
    };
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

  protected onSetOptions(parameter: OnSetOptionsParameter<CodeBlockOptions>): void {
    const { changes } = parameter;

    if (changes.supportedLanguages) {
      this.registerLanguages();
    }
  }

  /**
   * Create specific keyboard bindings for the code block.
   */
  createKeymap(): KeyBindings {
    return {
      Tab: ({ state, dispatch }) => {
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
      },

      Backspace: ({ dispatch, tr, state }) => {
        const { selection } = tr;

        // If the selection is not empty, return false and let other extension
        // (ie: BaseKeymapExtension) to do the deleting operation.
        if (!selection.empty) {
          return false;
        }

        // Check that this is the correct node.
        const parent = findParentNodeOfType({ types: this.type, selection });

        if (parent?.start !== selection.from) {
          return false;
        }

        const { pos, node, start } = parent;
        const toggleNode = state.schema.nodes[this.options.toggleName];

        if (node.textContent.trim() === '') {
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
      },

      Enter: ({ dispatch, tr }) => {
        const { selection } = tr;

        if (!isTextSelection(selection) || !selection.$cursor) {
          return false;
        }

        const { nodeBefore, parent } = selection.$from;

        if (!nodeBefore || !nodeBefore.isText || !parent.type.isTextblock) {
          return false;
        }

        const regex = /^```([A-Za-z]*)?$/;
        const { text } = nodeBefore;
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

        const pos = selection.$from.before();
        const end = pos + nodeBefore.nodeSize + 1; // +1 to account for the extra pos a node takes up
        tr.replaceWith(pos, end, this.type.create({ language }));

        // Set the selection to within the codeBlock
        tr.setSelection(TextSelection.create(tr.doc, pos + 1));

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },

      [this.options.keyboardShortcut]: ({ tr }) => {
        const commands = this.store.getCommands();

        if (!isNodeActive({ type: this.type, state: tr })) {
          return false;
        }

        const enabled = commands.formatCodeBlock.isEnabled();

        if (enabled) {
          commands.formatCodeBlock();
        }

        return enabled;
      },
    };
  }

  /**
   * Create the custom code block plugin which handles the delete key amongst other things.
   */
  createPlugin(): CreatePluginReturn<CodeBlockState> {
    const pluginState = new CodeBlockState(this.type, this);

    /**
     * Handles deletions within the plugin state.
     */
    const handler = () => {
      pluginState.setDeleted(true);

      // Delegate to the next key handler.
      return false;
    };

    return {
      state: {
        init(_, state) {
          return pluginState.init(state);
        },
        apply(tr, _, oldState, newState) {
          return pluginState.apply({ tr, oldState, newState });
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
   * Register passed in languages.
   */
  private registerLanguages() {
    for (const language of this.options.supportedLanguages) {
      refractor.register(language);
    }
  }
}

export { getLanguage };
