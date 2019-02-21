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

  public plugins = (_params: SchemaMarkTypeParams) => {
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
          const { $from, $to, from, to } = state.selection;
          const type = state.schema.marks.twitterLink;
          // const lastCharacter = from > 0 && from === $from.end();
          // const active = lastCharacter ? state.doc.rangeHasMark(from - 1, to, type) : markActive(state, type);
          const hasReplaceTransactions = transactions.some(({ steps }) =>
            steps.some(step => step instanceof ReplaceStep),
          );

          const pluginState = pluginKey.getState(state);

          if (!hasReplaceTransactions || pluginState) {
            return;
          }
          // Check that the mark should still be active
          const searchText =
            state.doc.textBetween($from.start(), from, undefined, OBJECT_REPLACING_CHARACTER) +
            state.doc.textBetween(to, $to.end());

          let match = enhancedExtractUrl.exec(searchText);
          let tr = state.tr;
          const collectedParams: TwitterLinkHandlerProps[] = [];
          while (match !== null) {
            // console.log(`runs: ${runs++}`, match);
            const startIndex = match.index;

            const url = match[1];
            const start = $from.start() + startIndex;
            const end = $from.start() + startIndex + match[0].length;
            collectedParams.push({ state, url, start, end, jump: false });
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
        props: {
          handleTextInput(view, from, to, text) {
            const state = view.state;
            // const type = state.schema.marks.twitterLink;
            const $from = state.doc.resolve(from);
            if ($from.parent.type.spec.code) {
              return false;
            }

            const searchText =
              state.doc.textBetween($from.start(), from, undefined, OBJECT_REPLACING_CHARACTER) +
              text +
              state.doc.textBetween(to, $from.end());

            let match = enhancedExtractUrl.exec(searchText);
            let returnValue = false;
            let tr: Transaction | undefined;
            // let ii = 0;
            // runs++;

            while (match !== null) {
              const startIndex = match.index;
              const start = $from.start() + startIndex;
              let end = $from.start() + startIndex + match[0].length;
              // console.log(`run: ${runs}.${ii++} || start: ${start} end: ${end} - from ${from} to: ${to}`);
              if (
                end <= to || // Text insert occurs after the match
                start > from
              ) {
                // Find mark at this position
                // const range = getMarkRange($from, type);
                // const pos: [number, number] = [range ? range.from : from, range ? range.to : to];
                // Remove the mark
                // tr = state.tr.removeMark(pos[0], pos[1], type);
                // Add the correct mark
                // tr = twitterLinkHandler({ state, url: match[1], start, end, transaction: tr });
                match = enhancedExtractUrl.exec(searchText);
                continue;
              }
              // console.log(
              //   `run: ${runs}.${ii} || start: ${start} end: ${end} - from ${from} to: ${to}`,
              //   $from.end(),
              //   match,
              // );
              if (end > to && to < $from.end() && text !== ' ') {
                end -= 1;
              }
              tr = twitterLinkHandler({ state, url: match[1] || match[0], start, end, transaction: tr });
              match = enhancedExtractUrl.exec(searchText);
            }

            // Allows for continued typing
            if (tr) {
              view.dispatch(tr.setMeta(pluginKey, { transform: tr, from, to, text, searchText }));
              returnValue = true;
            }
            return returnValue;
          },
        },
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
  jump?: boolean;
  transaction?: Transaction<EditorSchema>;
}

const twitterLinkHandler = ({
  state,
  url,
  start,
  end,
  jump = true,
  transaction,
}: TwitterLinkHandlerProps) => {
  // const { from, to } = state.selection;
  // if (from < start || to >= end) {
  //   return;
  // }
  const endPosition = state.selection.to + (jump ? 1 : 0);
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
