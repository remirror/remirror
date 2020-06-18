import {
  ApplyExtraAttributes,
  CommandFunction,
  CreatePluginReturn,
  getMarkRange,
  getMatchString,
  getSelectedWord,
  Handler,
  HandlerKeyList,
  isMarkActive,
  isSelectionEmpty,
  isTextSelection,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markPasteRule,
  ProsemirrorAttributes,
  removeMark,
  updateMark,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

export interface LinkOptions {
  /**
   * Called when the user activates the keyboard shortcut.
   */
  onActivateLink?: Handler<(selectedText: string) => void>;
}

export type LinkExtensionCommands = 'updateLink' | 'removeLink';

export class LinkExtension extends MarkExtension<LinkOptions> {
  static readonly handlerKeys: HandlerKeyList<LinkOptions> = ['onActivateLink'];

  get name() {
    return 'link' as const;
  }

  get defaultOptions() {
    return {
      activationHandler: () => false,
    };
  }

  createMarkSpec(extra: ApplyExtraAttributes): MarkExtensionSpec {
    return {
      group: MarkGroup.Link,
      attrs: {
        ...extra.defaults(),
        href: {},
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (node) => ({
            ...extra.parse(node),
            href: (node as Element).getAttribute('href'),
          }),
        },
      ],
      toDOM: (node) => [
        'a',
        { ...node.attrs, ...extra.dom(node), rel: 'noopener noreferrer nofollow' },
        0,
      ],
    };
  }

  createKeymap = (): KeyBindings => {
    return {
      'Mod-k': ({ state, dispatch }) => {
        // if the selection is empty, expand it
        const range = state.selection.empty ? getSelectedWord(state) : state.selection;

        if (!range) {
          return false;
        }

        const { from, to } = range;
        const tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));

        if (dispatch) {
          dispatch(tr);
        }

        this.options.onActivateLink(tr.doc.textBetween(from, to));

        return true;
      },
    };
  };

  createCommands = () => {
    return {
      /**
       * Create or update the link if it doesn't currently exist at the current selection.
       */
      updateLink: (attributes: ProsemirrorAttributes): CommandFunction => {
        return ({ state, dispatch, view }) => {
          const { selection } = state;

          if (
            isSelectionEmpty(selection) ||
            (!isTextSelection(selection) &&
              !isMarkActive({ stateOrTransaction: state.tr, type: this.type }))
          ) {
            return false;
          }

          return updateMark({ type: this.type, attrs: attributes })({
            state,
            dispatch,
            view,
            tr: this.store.getTransaction(),
          });
        };
      },

      /**
       * Remove the link at the current selection
       */
      removeLink: (): CommandFunction => {
        return ({ state, dispatch, view }) => {
          if (!isMarkActive({ stateOrTransaction: state.tr, type: this.type })) {
            return false;
          }

          return removeMark({ type: this.type, expand: true })(state, dispatch, view);
        };
      },
    };
  };

  createPasteRules = () => {
    return [
      markPasteRule({
        regexp: /https?:\/\/(www\.)?[\w#%+.:=@~-]{2,256}\.[a-z]{2,6}\b([\w#%&+./:=?@~-]*)/g,
        type: this.type,
        getAttributes: (url) => ({ href: getMatchString(url) }),
      }),
    ];
  };

  createPlugin = (): CreatePluginReturn => {
    return {
      props: {
        handleClick: (view, pos) => {
          const { doc, tr } = view.state;
          const range = getMarkRange(doc.resolve(pos), this.type);
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
    };
  };
}
