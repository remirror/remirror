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
  replaceText,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { ResolvedPos } from 'prosemirror-model';
import { EditorState, Plugin, Selection, TextSelection, Transaction } from 'prosemirror-state';
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

const handler = (state: EditorState<EditorSchema>, match: string[], start: number, end: number) => {
  const endPosition = state.selection.to + 1;
  const twitterLink = state.schema.marks.twitterLink.create({ href: extractHref(match[0]) });
  const displayUrl = match[0]; // Part of the url to display to the user
  const tr = state.tr.replaceWith(start, end, state.schema.text(displayUrl, [twitterLink]));
  if (endPosition < end) {
    return tr.setSelection(TextSelection.create(state.doc, endPosition));
  }
  return tr;
  // return tr.addMark(start, end, twitterLink);
};
