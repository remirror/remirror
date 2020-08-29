import {
  ApplySchemaAttributes,
  CommandFunction,
  CreatePluginReturn,
  extensionDecorator,
  ExtensionTag,
  FromToParameter,
  getMarkRange,
  getMatchString,
  getSelectedWord,
  Handler,
  isAllSelection,
  isMarkActive,
  isSelectionEmpty,
  isTextSelection,
  KeyBindings,
  MarkAttributes,
  MarkExtension,
  MarkExtensionSpec,
  markPasteRule,
  removeMark,
  updateMark,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

export interface LinkOptions {
  /**
   * Called when the user activates the keyboard shortcut.
   */
  onActivateLink?: Handler<(selectedText: string) => void>;

  /**
   * Whether whether to select the text of the full active link when clicked.
   */
  selectTextOnClick?: boolean;
}

export type LinkAttributes = MarkAttributes<{
  /**
   * The link which is required property for the link mark.
   */
  href: string;
}>;

@extensionDecorator<LinkOptions>({
  defaultOptions: { selectTextOnClick: false },
  handlerKeys: ['onActivateLink'],
})
export class LinkExtension extends MarkExtension<LinkOptions> {
  get name() {
    return 'link' as const;
  }

  readonly tags = [ExtensionTag.Link];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        href: {},
      },
      inclusive: false,
      spanning: false,
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
        { ...extra.dom(node), ...node.attrs, rel: 'noopener noreferrer nofollow' },
        0,
      ],
    };
  }

  createKeymap(): KeyBindings {
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
  }

  createCommands() {
    return {
      /**
       * Create or update the link if it doesn't currently exist at the current
       * selection or provided range.
       */
      updateLink: (attrs: LinkAttributes, range?: FromToParameter): CommandFunction => {
        return (parameter) => {
          const { tr } = parameter;
          const { selection } = tr;
          const selectionIsValid =
            (isTextSelection(selection) && !isSelectionEmpty(tr.selection)) ||
            isAllSelection(selection) ||
            isMarkActive({ trState: tr, type: this.type });

          if (!selectionIsValid && !range) {
            return false;
          }

          return updateMark({ type: this.type, attrs, range })(parameter);
        };
      },

      /**
       * Remove the link at the current selection
       */
      removeLink: (): CommandFunction => {
        return (parameter) => {
          const { tr } = parameter;

          if (!isMarkActive({ trState: tr, type: this.type })) {
            return false;
          }

          return removeMark({ type: this.type, expand: true })(parameter);
        };
      },
    };
  }

  createPasteRules() {
    return [
      markPasteRule({
        regexp: /https?:\/\/(www\.)?[\w#%+.:=@~-]{2,256}\.[a-z]{2,6}\b([\w#%&+./:=?@~-]*)/g,
        type: this.type,
        getAttributes: (url) => ({ href: getMatchString(url) }),
      }),
    ];
  }

  createPlugin(): CreatePluginReturn {
    return {
      props: {
        handleClick: (view, pos) => {
          if (!this.options.selectTextOnClick) {
            return false;
          }

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
  }
}
