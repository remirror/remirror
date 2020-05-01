import { Plugin, TextSelection } from 'prosemirror-state';

import {
  Cast,
  CommandMarkTypeParameter,
  getMarkRange,
  getMatchString,
  getSelectedWord,
  isMarkActive,
  isTextSelection,
  KeyBindings,
  ManagerMarkTypeParameter,
  MarkExtension,
  MarkExtensionConfig,
  MarkExtensionSpec,
  MarkGroup,
  markPasteRule,
  ProsemirrorAttributes,
  ProsemirrorCommandFunction,
  removeMark,
  selectionEmpty,
  updateMark,
} from '@remirror/core';

export interface LinkExtensionOptions extends MarkExtensionConfig {
  /**
   * Return true to intercept the activation. This is useful for showing a dialog to replace the selected text.
   */
  activationHandler?: () => void;
}

export type LinkExtensionCommands = 'updateLink' | 'removeLink';

export class LinkExtension extends MarkExtension<LinkExtensionOptions> {
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
      group: MarkGroup.Link,
      attrs: {
        ...this.extraAttributes(null),
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (node) => ({
            href: Cast<Element>(node).getAttribute('href'),
            ...this.getExtraAttributes(Cast<Element>(node)),
          }),
        },
      ],
      toDOM: (node) => [
        'a',
        {
          ...node.attrs,
          rel: 'noopener noreferrer nofollow',
        },
        0,
      ],
    };
  }

  public keys(): KeyBindings {
    return {
      'Mod-k': ({ state, dispatch }) => {
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

  public commands({ type }: CommandMarkTypeParameter) {
    return {
      /**
       * A command to update the selected link
       */
      updateLink: (attributes: ProsemirrorAttributes): ProsemirrorCommandFunction => {
        return (state, dispatch, view) => {
          const { selection } = state;
          if (
            selectionEmpty(selection) ||
            (!isTextSelection(selection) && !isMarkActive({ stateOrTransaction: state, type }))
          ) {
            return false;
          }
          return updateMark({ type, attrs: attributes })(state, dispatch, view);
        };
      },
      /**
       * Remove the link at the current position
       */
      removeLink: (): ProsemirrorCommandFunction => {
        return (state, dispatch, view) => {
          if (!isMarkActive({ stateOrTransaction: state, type })) {
            return false;
          }
          return removeMark({ type, expand: true })(state, dispatch, view);
        };
      },
    };
  }

  public pasteRules({ type }: ManagerMarkTypeParameter) {
    return [
      markPasteRule({
        regexp: /https?:\/\/(www\.)?[\w#%+.:=@~-]{2,256}\.[a-z]{2,6}\b([\w#%&+./:=?@~-]*)/g,
        type,
        getAttributes: (url) => ({ href: getMatchString(url) }),
      }),
    ];
  }

  public plugin({ type }: ManagerMarkTypeParameter) {
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
