import {
  Attrs,
  Cast,
  CommandMarkTypeParams,
  EditorState,
  EditorStateParams,
  EditorView,
  ExtensionManagerMarkTypeParams,
  findMatches,
  FromToParams,
  getMatchString,
  LEAF_NODE_REPLACING_CHARACTER,
  Mark,
  MarkExtension,
  MarkExtensionOptions,
  MarkExtensionSpec,
  markPasteRule,
  MarkTypeParams,
  removeMark,
  TransactionParams,
  updateMark,
} from '@remirror/core';
import { Plugin, TextSelection } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { extractUrl } from './extract-url';

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

const extractHref = (url: string) => (url.startsWith('http') || url.startsWith('//') ? url : `http://${url}`);

interface EnhancedLinkHandlerProps
  extends EditorStateParams,
    FromToParams,
    Partial<TransactionParams>,
    MarkTypeParams {
  /**
   * The url to add as a mark to the range provided.
   */
  url: string;
}

/**
 * Add the provided URL as a mark to the text range provided
 */
const enhancedLinkHandler = ({ state, url, from, to, tr, type }: EnhancedLinkHandlerProps) => {
  const endPosition = state.selection.to;
  const enhancedLink = type.create({ href: extractHref(url) });

  tr = (tr || state.tr).replaceWith(from, to, state.schema.text(url, [enhancedLink]));

  // Ensure that the selection doesn't jump when the the current selection is within the range
  if (endPosition < to) {
    return tr.setSelection(TextSelection.create(state.doc, endPosition));
  }

  return tr;
};

/**
 * Retrieves all the automatically applied URLs from the state.
 */
const getUrlsFromState = (state: EditorState, markName: string) => {
  const $pos = state.doc.resolve(0);
  let marks: Mark[] = [];

  state.doc.nodesBetween($pos.start(), $pos.end(), node => {
    marks = [...marks, ...node.marks];
  });

  const urls = marks.filter(markItem => markItem.type.name === markName).map(mark => mark.attrs.href);
  return { set: new Set(urls), urls };
};

/**
 * Checks whether two sets are equal
 * @param setOne
 * @param setTwo
 */
const isSetEqual = <GSetType>(setOne: Set<GSetType>, setTwo: Set<GSetType>) => {
  if (setOne.size !== setTwo.size) {
    return false;
  }

  for (const val of setOne) {
    if (!setTwo.has(val)) {
      return false;
    }
  }

  return true;
};
