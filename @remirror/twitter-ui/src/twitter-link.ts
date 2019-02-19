import {
  Attrs,
  Cast,
  EditorState,
  getMarkRange,
  markActive,
  MarkExtension,
  MarkExtensionSpec,
  pasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { extractUrl } from './extract-url';

const OBJECT_REPLACING_CHARACTER = '\ufffc';

export class TwitterLink extends MarkExtension {
  get name() {
    return 'twitterLink';
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
          rel: 'noopener noreferrer nofollow',
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
      pasteRule(extractUrl, type, url => {
        return {
          href: extractHref(url as string),
        };
      }),
    ];
  }

  get plugins() {
    const pluginKey = this.pluginKey;
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return null;
          },
          apply(tr, prev: TwitterLinkPluginState) {
            const stored = tr.getMeta(pluginKey);
            console.log('meta stored??', stored);
            return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
          },
        },
        appendTransaction(transactions, _oldState, newState: EditorState) {
          const type = newState.schema.marks.twitterLink;
          const active = markActive(newState, type);
          const { $from, $to, from, to } = newState.selection;
          const hasReplaceTransactions = transactions.some(({ steps }) =>
            steps.some(step => step instanceof ReplaceStep),
          );

          if (active && hasReplaceTransactions) {
            // Check that the mark should still be active
            const searchText =
              newState.doc.textBetween($from.start(), from, undefined, OBJECT_REPLACING_CHARACTER) +
              newState.doc.textBetween(to, $to.end());
            const match = searchText.match(extractUrl);
            console.log('this is the search text', searchText);
            console.log('this is the match', match);
            if (!match) {
              const range = getMarkRange($from, type);
              const pos: [number, number] = [range ? range.from : from, range ? range.to : to];
              console.log('no match removingmark', range, pos);
              return newState.tr.removeMark(pos[0], pos[1], type);
            }
            const startIndex = searchText.search(extractUrl);
            return handler(
              newState,
              match,
              $from.start() + startIndex,
              $from.start() + startIndex + match[0].length,
              false,
            );
          }
          return;
        },
        props: {
          handleTextInput(view, from, to, text) {
            const state = view.state;
            const $from = state.doc.resolve(from);
            if ($from.parent.type.spec.code) {
              return false;
            }

            const searchText =
              state.doc.textBetween($from.start(), from, undefined, OBJECT_REPLACING_CHARACTER) +
              text +
              state.doc.textBetween(to, $from.end());
            const match = searchText.match(extractUrl);
            const startIndex = searchText.search(extractUrl);
            const tr =
              match &&
              handler(state, match, $from.start() + startIndex, $from.start() + startIndex + match[0].length);
            if (tr) {
              view.dispatch(tr.setMeta(pluginKey, { transform: tr, from, to, text }));
              return true;
            }
            return false;
          },
        },
      }),
    ];
  }
}

interface TwitterLinkPluginState {
  transform: Transaction;
  from: number;
  to: number;
  text: string;
}

const extractHref = (url: string) => (url.startsWith('http') || url.startsWith('//') ? url : `http://${url}`);

const handler = (state: EditorState, match: string[], start: number, end: number, jump = true) => {
  const endPosition = state.selection.to + (jump ? 1 : 0);
  const twitterLink = state.schema.marks.twitterLink.create({ href: extractHref(match[0]) });
  const displayUrl = match[0]; // Part of the url to display to the user
  const tr = state.tr.replaceWith(start, end, state.schema.text(displayUrl, [twitterLink]));
  if (endPosition < end) {
    return tr.setSelection(TextSelection.create(state.doc, endPosition));
  }
  return tr;
  // return tr.addMark(start, end, twitterLink);
};
