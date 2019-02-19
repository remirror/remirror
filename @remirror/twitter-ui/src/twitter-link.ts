import {
  Attrs,
  Cast,
  // getMarkRange,
  CommandFunction,
  EditorSchema,
  getPluginKeyState,
  KeyboardBindings,
  MarkExtension,
  MarkExtensionSpec,
  pasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';

import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { extractUrl } from './extract-url';

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
      Backspace: onBackSpace(this.pluginKey),
    };
  }

  public inputRules({ type }: SchemaMarkTypeParams) {
    return [
      // markInputRule(extractUrl, type, (match: string[]) => {
      //   console.log(match);
      //   return { href: extractHref(match[0]) };
      // }),
      // new InputRule(extractUrl, (state, match, start, end) => {
      //   const twitterLink = type.create({ href: extractHref(match[0]) });
      //   console.log(match);
      //   const displayUrl = match[1]; // Part of the url to display to the user
      //   const tr = state.tr.insertText(displayUrl, start, start + displayUrl.length);
      //   // .delete(start + displayUrl.length - 1, end - 1)
      //   // .insertText(' ', start + displayUrl.length);
      //   return tr.addMark(start, start + displayUrl.length, twitterLink);
      // }),
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
            return stored ? stored : tr.selectionSet || tr.docChanged ? null : prev;
          },
        },
        appendTransaction(transactions, oldState, newState) {
          console.log(transactions, oldState, newState);
        },
        props: {
          handleTextInput(view, from, to, text) {
            console.log(from, to, text);
            const state = view.state;
            const $from = state.doc.resolve(from);
            if ($from.parent.type.spec.code) {
              return false;
            }

            // const textAfter =
            const textBefore =
              $from.parent.textBetween(
                Math.max(0, $from.parentOffset - MAX_MATCH),
                $from.parentOffset,
                undefined,
                '\ufffc', // Object replacing character
              ) + text;
            console.log('Textbefore', textBefore);
            const match = textBefore.match(extractUrl);
            console.log(match);
            const tr = match && handler(state, match, from - (match[0].length - text.length), to);
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
  const tr = state.tr.insertText(displayUrl, start, start + displayUrl.length);
  // .delete(start + displayUrl.length - 1, end - 1)
  // .insertText(' ', start + displayUrl.length);

  return tr.addMark(start, start + displayUrl.length, twitterLink);
};

const onBackSpace = (key: PluginKey): CommandFunction => (state, dispatch) => {
  const undoable = getPluginKeyState<TwitterLinkPluginState>(key, state);
  console.log(undoable);
  const plugin = key.get(state);
  if (!plugin || !undoable) {
    return false;
  }

  if (dispatch) {
    const tr = state.tr;
    const toUndo = undoable.transform;
    for (let j = toUndo.steps.length - 1; j >= 0; j--) {
      tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
    }
    const marks = tr.doc.resolve(undoable.from).marks();
    dispatch(tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks)));
  }
  return true;
};
