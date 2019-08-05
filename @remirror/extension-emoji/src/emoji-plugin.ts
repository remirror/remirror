import { EditorSchema, TextParams } from '@remirror/core';
import { Data } from 'emoji-mart';
import emojiRegex from 'emoji-regex/es2015/text';
import { NodeType } from 'prosemirror-model';
import { Plugin, Transaction } from 'prosemirror-state';
import { getEmojiDataByNativeString } from './emoji-helpers';
import { CreateEmojiPluginParams } from './emoji-types';

export const createEmojiPlugin = ({ key, emojiData, type }: CreateEmojiPluginParams) => {
  return new Plugin({
    key,
    props: {
      handleTextInput(view, from, to, text) {
        const { state } = view;
        const originalTr = state.tr;
        let tr: Transaction<EditorSchema> | undefined;
        if (emojiRegex().exec(text)) {
          tr = replaceNativeEmoji({ from, to, text, emojiData, type, tr: originalTr }) || tr;
        }

        if (tr) {
          view.dispatch(tr);
          return true;
        }
        return false;
      },
    },
  });
};

interface ReplaceNativeEmojiParams extends TextParams {
  from: number;
  to: number;
  emojiData: Data;
  type: NodeType;
  tr: Transaction<EditorSchema>;
}

export const replaceNativeEmoji = ({
  text,
  from,
  to,
  emojiData,
  type,
  tr,
}: ReplaceNativeEmojiParams): Transaction | undefined => {
  const data = getEmojiDataByNativeString(text, emojiData);
  if (!data) {
    return;
  }
  return tr.replaceWith(from, to, type.create(data));
};
