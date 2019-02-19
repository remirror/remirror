import {
  Attrs,
  Cast,
  // getMarkRange,
  EditorSchema,
  KeyboardBindings,
  markActive,
  MarkExtension,
  MarkExtensionSpec,
  pasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { EditorState, Plugin, Transaction } from 'prosemirror-state';
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

  public keys({  }: SchemaMarkTypeParams): KeyboardBindings {
    console.log(this);
    return {
      // Backspace: onBackSpace(this.pluginKey),
    };
  }

  // public inputRules({ type }: SchemaMarkTypeParams) {
  //   return [
  //     // markInputRule(extractUrl, type, (match: string[]) => {
  //     //   console.log(match);
  //     //   return { href: extractHref(match[0]) };
  //     // }),
  //     // new InputRule(extractUrl, (state, match, start, end) => {
  //     //   const twitterLink = type.create({ href: extractHref(match[0]) });
  //     //   console.log(match);
  //     //   const displayUrl = match[1]; // Part of the url to display to the user
  //     //   const tr = state.tr.insertText(displayUrl, start, start + displayUrl.length);
  //     //   // .delete(start + displayUrl.length - 1, end - 1)
  //     //   // .insertText(' ', start + displayUrl.length);
  //     //   return tr.addMark(start, start + displayUrl.length, twitterLink);
  //     // }),
  //   ];
  // }

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
            return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
          },
        },
        appendTransaction(_transactions, _oldState, newState) {
          // console.log(transactions);
          const a = markActive(newState, newState.schema.marks.twitterLink);
          console.log(a);
        },
        props: {
          handleTextInput(view, from, to, text) {
            console.log(from, to, text);
            const state = view.state;
            const $from = state.doc.resolve(from);
            const $to = state.doc.resolve(to);
            if ($from.parent.type.spec.code) {
              return false;
            }

            console.log('start of node', $from.start());
            console.log('end of node', $from.end());

            const textAfter = $to.parent.textBetween(
              $to.parentOffset,
              $to.parent.content.size,
              undefined,
              '\ufffc',
            );
            console.log('TExtafter', textAfter);
            const _start = Math.max(0, $from.parentOffset - MAX_MATCH);
            const _end = Math.max($to.parentOffset, $from.parent.content.size);
            console.log(_end, $from.parent.content.size);

            const textBefore =
              $from.parent.textBetween(_start, $from.parentOffset, undefined, OBJECT_REPLACING_CHARACTER) +
              text +
              textAfter;
            console.log('Textbefore', textBefore);
            const match = textBefore.match(extractUrl);
            const startIndex = textBefore.search(extractUrl);
            console.log('$from.pos', $from.pos, 'start index', startIndex, '$from.parent.resolve()');
            const tr =
              match && handler(state, match, from - (match[0].length - text.length), to + textAfter.length);
            if (match) {
              console.log('end', _end);
              console.log('start', from - (match[0].length - text.length), _start);
            }
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
const MAX_MATCH = 500;

const handler = (state: EditorState<EditorSchema>, match: string[], start: number, end: number) => {
  const twitterLink = state.schema.marks.twitterLink.create({ href: extractHref(match[0]) });
  const displayUrl = match[0]; // Part of the url to display to the user
  const tr = state.tr.insertText(displayUrl, start, end);
  // .delete(start + displayUrl.length - 1, end - 1)
  // .insertText(' ', start + displayUrl.length);

  return tr.addMark(start, start + displayUrl.length, twitterLink);
};
