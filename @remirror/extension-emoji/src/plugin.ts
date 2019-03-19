import { EditorSchema } from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { Data } from 'emoji-mart';
import emojiRegex from 'emoji-regex/es2015/text';
import { NodeType } from 'prosemirror-model';
import { Plugin, Transaction } from 'prosemirror-state';
import { DefaultEmoji } from './components/emoji';
import { getEmojiDataByNativeString } from './helpers';
import { CreateEmojiPluginParams } from './types';

const defaultStyle = `
  user-select: all;
  display: inline-block;

  span {
    display: inline-block;
  }
`;

export const createEmojiPlugin = ({
  key,
  getPortalContainer,
  set,
  size,
  emojiData,
  EmojiComponent = DefaultEmoji,
  type,
  style,
}: CreateEmojiPluginParams) => {
  const dynamicStyle = `
    span {
      height: ${size};
      width: ${size};
    }
  `;
  return new Plugin({
    key,
    props: {
      nodeViews: {
        emoji: ReactNodeView.createNodeView({
          Component: EmojiComponent,
          getPortalContainer,
          props: {
            set,
            size,
            emojiData,
          },
          style: [defaultStyle, dynamicStyle, style],
        }),
      },
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

interface ReplaceNativeEmojiParams {
  text: string;
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
