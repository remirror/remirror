import {
  Attrs,
  BooleanExtensionCheck,
  Cast,
  CommandMarkTypeParams,
  ExtensionCommands,
  getMarkRange,
  getMatchString,
  getSelectedWord,
  isMarkActive,
  isTextSelection,
  KeyboardBindings,
  MarkExtension,
  MarkExtensionOptions,
  MarkExtensionSpec,
  markPasteRule,
  removeMark,
  SchemaMarkTypeParams,
  selectionEmpty,
  updateMark,
} from '@remirror/core';
import { Plugin, TextSelection } from 'prosemirror-state';

export type InvokedFromType = 'keyboard' | 'input-rule';

export interface LinkExtensionOptions extends MarkExtensionOptions {
  /**
   * Return true to intercept the activation. This is useful for showing a dialog to replace the selected text.
   */
  activationHandler?(): void;
}

export type LinkExtensionCommands = 'updateLink' | 'removeLink';

export class LinkExtension extends MarkExtension<LinkExtensionOptions, LinkExtensionCommands, {}> {
  get name() {
    return 'link' as const;
  }

  get defaultOptions() {
    return {
      activationHandler: () => false,
    };
  }

  get schema(): MarkExtensionSpec {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: node => ({
            href: Cast<Element>(node).getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          ...node.attrs,
          rel: 'noopener noreferrer nofollow',
        },
        0,
      ],
    };
  }

  public keys(): KeyboardBindings {
    return {
      'Mod-k': (state, dispatch) => {
        // Expand selection
        const range = getSelectedWord(state);
        if (!range) {
          return false;
        }
        const { from, to } = range;
        const tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));
        if (dispatch) {
          dispatch(tr);
        }

        this.options.activationHandler();

        return true;
      },
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return {
      updateLink: (attrs?: Attrs) => updateMark({ type, attrs }),
      removeLink: () => {
        return removeMark({ type, expand: true });
      },
    };
  }

  public isEnabled({ getState, type }: SchemaMarkTypeParams): BooleanExtensionCheck<ExtensionCommands<this>> {
    return ({ command }) => {
      switch (command) {
        case 'removeLink':
          return isMarkActive({ state: getState(), type });
        case 'updateLink':
          const { selection } = getState();
          if (selectionEmpty(selection) || !isTextSelection(selection)) {
            return false;
          }
          return true;
        default:
          return true;
      }
    };
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [
      markPasteRule({
        regexp: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        type,
        getAttrs: url => ({ href: getMatchString(url) }),
      }),
    ];
  }

  public plugin({ type }: SchemaMarkTypeParams) {
    return new Plugin({
      props: {
        handleClick(view, pos) {
          const { doc, tr } = view.state;
          const range = getMarkRange(doc.resolve(pos), type);
          if (!range) {
            return false;
          }

          const $start = doc.resolve(range.from);
          const $end = doc.resolve(range.to);
          const transaction = tr.setSelection(new TextSelection($start, $end));

          view.dispatch(transaction);
          return true;
        },
      },
    });
  }
}
