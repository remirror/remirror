import {
  Attrs,
  Cast,
  EditorSchema,
  EditorState,
  MarkExtension,
  MarkExtensionSpec,
  pasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { isEqual } from 'lodash';
import { Mark } from 'prosemirror-model';
import { Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { enhancedExtractUrl } from '../extract-url';

const OBJECT_REPLACING_CHARACTER = '\ufffc';

export interface TwitterLinkOptions {
  onUrlsChange?(params: { set: Set<string>; urls: string[] }): void;
}

// TODO Fix bug with URL regex and how the matches are sourced
export class TwitterLink extends MarkExtension<TwitterLinkOptions> {
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
      pasteRule(
        // /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        enhancedExtractUrl,
        type,
        url => {
          return {
            href: extractHref(url as string),
          };
        },
      ),
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
          apply(tr, prev: TwitterLinkPluginState) {
            const stored = tr.getMeta(pluginKey);
            return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
          },
        },
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
            doc.textBetween($from.start(), from, undefined, OBJECT_REPLACING_CHARACTER) +
            doc.textBetween(to, $to.end());

          let match = enhancedExtractUrl.exec(searchText);
          let tr = state.tr;
          const collectedParams: TwitterLinkHandlerProps[] = [];

          // If at the start of a new line (i.e. new block added and not at the start of the document)
          if (from === $from.start() && from >= 2) {
            const $pos = doc.resolve(from - 2);
            const prevSearchText = doc.textBetween($pos.start(), $pos.end());
            let prevMatch = enhancedExtractUrl.exec(prevSearchText);
            while (prevMatch !== null) {
              const startIndex = prevMatch.index;

              const url = prevMatch[1];
              const start = $pos.start() + startIndex;
              const end = $pos.start() + startIndex + prevMatch[0].length;
              collectedParams.push({ state, url, start, end });
              prevMatch = enhancedExtractUrl.exec(prevSearchText);
            }
            tr = tr.removeMark($pos.start(), $pos.end(), type);
          }

          while (match !== null) {
            const startIndex = match.index;

            const url = match[1];
            const start = $from.start() + startIndex;
            const end = $from.start() + startIndex + match[0].length;

            const textBefore = doc.textBetween(start - 1, start); // The text directly before the match
            if (!/[\w\d]/.test(textBefore)) {
              collectedParams.push({ state, url, start, end });
            }

            match = enhancedExtractUrl.exec(searchText);
          }

          // Remove all marks
          // const range = getMarkRange(lastCharacter ? state.doc.resolve(from - 1) : $from, type);
          // const pos: [number, number] = [range ? range.from : from, range ? range.to : to];
          tr = tr.removeMark($from.start(), $from.end(), type);

          // Add all marks again for the block
          collectedParams.forEach(params => {
            tr = twitterLinkHandler({ ...params, transaction: tr });
          });

          // if (!matchFound) {
          //   const range = getMarkRange(lastCharacter ? state.doc.resolve(from - 1) : $from, type);
          //   const pos: [number, number] = [range ? range.from : from, range ? range.to : to];
          //   return tr.removeMark(pos[0], pos[1], type);
          // }
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

interface TwitterLinkPluginState {
  transform: Transaction;
  from: number;
  to: number;
  text: string;
}

const extractHref = (url: string) => (url.startsWith('http') || url.startsWith('//') ? url : `http://${url}`);

interface TwitterLinkHandlerProps {
  state: EditorState;
  url: string;
  start: number;
  end: number;
  transaction?: Transaction<EditorSchema>;
}

const twitterLinkHandler = ({ state, url, start, end, transaction }: TwitterLinkHandlerProps) => {
  const endPosition = state.selection.to;
  const twitterLink = state.schema.marks.twitterLink.create({ href: extractHref(url) });
  // let tr = state.tr.insertText(displayUrl, start, end);
  // tr = tr.addMark(start, end, twitterLink);
  const tr = (transaction || state.tr).replaceWith(start, end, state.schema.text(url, [twitterLink]));

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
