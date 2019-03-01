import {
  Attrs,
  Cast,
  EditorSchema,
  EditorState,
  findMatches,
  getMatchString,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkExtension,
  MarkExtensionSpec,
  markPasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { isEqual } from 'lodash';
import { Mark } from 'prosemirror-model';
import { Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { extractUrl } from './extract-url';

export interface EnhancedLinkOptions {
  onUrlsChange?(params: { set: Set<string>; urls: string[] }): void;
}

// TODO Fix bug with URL regex and how the matches are sourced
export class EnhancedLink extends MarkExtension<EnhancedLinkOptions> {
  get name() {
    return 'enhancedLink';
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
          getAttrs: dom => ({
            href: Cast<Element>(dom).getAttribute('href'),
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

  public commands({ type }: SchemaMarkTypeParams) {
    return (attrs?: Attrs) => {
      if (attrs && attrs.href) {
        return updateMark(type, attrs);
      }

      return removeMark(type);
    };
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [
      markPasteRule(extractUrl, type, url => {
        return {
          href: extractHref(getMatchString(url)),
        };
      }),
    ];
  }

  public plugins = ({ type }: SchemaMarkTypeParams) => {
    const pluginKey = this.pluginKey;
    const name = this.name;
    const onUrlsChange = this.options.onUrlsChange;
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return null;
          },
          apply(tr, prev: EnhancedLinkPluginState) {
            const stored = tr.getMeta(pluginKey);
            return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
          },
        },
        /** Runs through the current line (and previous line if it exists) to reapply twitter link marks to the relevant parts of text */
        appendTransaction(transactions, _oldState, state: EditorState) {
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
            doc.textBetween($from.start(), from, undefined, LEAF_NODE_REPLACING_CHARACTER) +
            doc.textBetween(to, $to.end());

          let tr = state.tr;
          const collectedParams: EnhancedLinkHandlerProps[] = [];

          // If at the start of a new line (i.e. new block added and not at the start of the document)
          if (from === $from.start() && from >= 2) {
            const $pos = doc.resolve(from - 2);
            const prevSearchText = doc.textBetween($pos.start(), $pos.end());
            findMatches(prevSearchText, extractUrl).forEach(match => {
              const startIndex = match.index;

              const url = match[1];
              const start = $pos.start() + startIndex;
              const end = $pos.start() + startIndex + match[0].length;
              collectedParams.push({ state, url, start, end });
            });

            tr = tr.removeMark($pos.start(), $pos.end(), type);
          }

          // Finds matches within the current node when in the middle of a node
          findMatches(searchText, extractUrl).forEach(match => {
            const startIndex = match.index;

            const url = match[1];
            const start = $from.start() + startIndex;
            const end = $from.start() + startIndex + match[0].length;

            const textBefore = doc.textBetween(start - 1, start); // The text directly before the match
            if (!/[\w\d]/.test(textBefore)) {
              collectedParams.push({ state, url, start, end });
            }
          });
          // Remove all marks
          tr = tr.removeMark($from.start(), $from.end(), type);

          // Add all marks again for the nodes
          collectedParams.forEach(params => {
            tr = enhancedLinkHandler({ ...params, transaction: tr });
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

            if (!isEqual(next.set, prev.set)) {
              onUrlsChange(next);
            }
          },
        }),
      }),
    ];
  };
}

interface EnhancedLinkPluginState {
  transform: Transaction;
  from: number;
  to: number;
  text: string;
}

const extractHref = (url: string) => (url.startsWith('http') || url.startsWith('//') ? url : `http://${url}`);

interface EnhancedLinkHandlerProps {
  state: EditorState;
  url: string;
  start: number;
  end: number;
  transaction?: Transaction<EditorSchema>;
}

const enhancedLinkHandler = ({ state, url, start, end, transaction }: EnhancedLinkHandlerProps) => {
  const endPosition = state.selection.to;
  const enhancedLink = state.schema.marks.enhancedLink.create({ href: extractHref(url) });
  // let tr = state.tr.insertText(displayUrl, start, end);
  // tr = tr.addMark(start, end, enhancedLink);
  const tr = (transaction || state.tr).replaceWith(start, end, state.schema.text(url, [enhancedLink]));

  if (endPosition < end) {
    return tr.setSelection(TextSelection.create(state.doc, endPosition));
  }

  return tr;
};

const getUrlsFromState = (state: EditorState, markName: string) => {
  const $pos = state.doc.resolve(0);
  let marks: Mark[] = [];

  state.doc.nodesBetween($pos.start(), $pos.end(), node => {
    marks = [...marks, ...node.marks];
  });

  const urls = marks.filter(markItem => markItem.type.name === markName).map(mark => mark.attrs.href);
  return { set: new Set(urls), urls };
};
