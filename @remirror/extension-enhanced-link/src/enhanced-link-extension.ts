import {
  Attrs,
  Cast,
  CommandMarkTypeParams,
  EditorState,
  EditorView,
  ExtensionManagerMarkTypeParams,
  findMatches,
  getMatchString,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkExtension,
  MarkExtensionOptions,
  MarkExtensionSpec,
  markPasteRule,
  removeMark,
  updateMark,
} from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { extractUrl } from './extract-url';
import {
  extractHref,
  EnhancedLinkHandlerProps,
  enhancedLinkHandler,
  getUrlsFromState,
  isSetEqual,
} from './enhanced-link-utils';

export interface EnhancedLinkExtensionOptions extends MarkExtensionOptions {
  /**
   * This handler is called every time the matched urls are updated.
   */
  onUrlsChange?(params: { set: Set<string>; urls: string[] }): void;
}

/**
 * An auto complete auto decorated linker.
 *
 * There's nothing enhanced about it.
 *
 * TODO Consider renaming this extension
 */
export class EnhancedLinkExtension extends MarkExtension<EnhancedLinkExtensionOptions> {
  get name() {
    return 'enhancedLink' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      spanning: false,
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
          role: 'presentation',
        },
        0,
      ],
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return {
      enhancedLink: (attrs?: Attrs) => {
        if (attrs && attrs.href) {
          return updateMark({ type, attrs });
        }

        return removeMark({ type });
      },
    };
  }

  public pasteRules({ type }: ExtensionManagerMarkTypeParams) {
    return [
      markPasteRule({
        regexp: extractUrl,
        type,
        getAttrs: url => {
          return {
            href: extractHref(getMatchString(url)),
          };
        },
      }),
    ];
  }

  public plugin = ({ type }: ExtensionManagerMarkTypeParams) => {
    const key = this.pluginKey;
    const name = this.name;
    const onUrlsChange = this.options.onUrlsChange;

    return new Plugin({
      key,
      state: {
        init() {
          return null;
        },
        apply(tr, prev) {
          const stored = tr.getMeta(key);
          return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
        },
      },

      // Runs through the current line (and previous line if it exists) to reapply
      // social link marks to the relevant parts of text.
      // TODO extract this as a standalone prosemirror plugin
      appendTransaction(transactions, _oldState, state: EditorState) {
        // Used to represent leaf nodes as text otherwise they just get replaced
        const leafChar = ' ';
        const { selection, doc } = state;
        const { $from, $to, from, to } = selection;
        const hasReplaceTransactions = transactions.some(({ steps }) =>
          steps.some(step => step instanceof ReplaceStep),
        );

        if (!hasReplaceTransactions) {
          return;
        }

        // Check that the mark should still be active
        const searchText =
          doc.textBetween($from.start(), from, LEAF_NODE_REPLACING_CHARACTER, leafChar) +
          doc.textBetween(to, $to.end(), LEAF_NODE_REPLACING_CHARACTER, leafChar);
        const tr = state.tr;
        const collectedParams: EnhancedLinkHandlerProps[] = [];

        // If at the start of a new line (i.e. new block added and not at the start of the document)
        if (from === $from.start() && from >= 2) {
          const $pos = doc.resolve(from - 2);
          const prevSearchText = doc.textBetween(
            $pos.start(),
            $pos.end(),
            LEAF_NODE_REPLACING_CHARACTER,
            leafChar,
          );
          findMatches(prevSearchText, extractUrl).forEach(match => {
            const startIndex = match.index;
            const url = match[1];
            const start = $pos.start() + startIndex;
            const end = $pos.start() + startIndex + match[0].length;

            collectedParams.push({ state, url, from: start, to: end, type });
          });

          tr.removeMark($pos.start(), $pos.end(), type);
        }

        // Finds matches within the current node when in the middle of a node
        findMatches(searchText, extractUrl).forEach(match => {
          const startIndex = match.index;
          const url = match[1];
          const start = $from.start() + startIndex;
          const end = $from.start() + startIndex + match[0].length;
          // The text directly before the match
          const textBefore = doc.textBetween(start - 1, start, LEAF_NODE_REPLACING_CHARACTER, leafChar);

          if (!/[\w\d]/.test(textBefore)) {
            collectedParams.push({ state, url, from: start, to: end, type });
          }
        });

        // Remove all marks within the current block
        tr.removeMark($from.start(), $from.end(), type);

        // Add all marks again for the nodes
        collectedParams.forEach(params => {
          enhancedLinkHandler({ ...params, tr });
        });

        return tr;
      },
      view: () => ({
        update(view: EditorView, prevState: EditorState) {
          if (!onUrlsChange) {
            return;
          }

          const next = getUrlsFromState(view.state, name);
          const prev = getUrlsFromState(prevState, name);

          if (!isSetEqual(next.set, prev.set)) {
            onUrlsChange(next);
          }
        },
      }),
    });
  };
}
