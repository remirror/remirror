import { EditorSchema, NodeViewPortalContainer } from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { Data } from 'emoji-mart/dist-es/utils/data';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import emojiRegex from 'emoji-regex/es2015/text';
import { css, Interpolation } from 'emotion';
import { NodeType } from 'prosemirror-model';
import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { ComponentType } from 'react';
import { DefaultEmoji, DefaultEmojiProps } from './components/emoji';
import { getEmojiDataByNativeString } from './helpers';

export interface CreateEmojiPluginParams {
  key: PluginKey;
  getPortalContainer(): NodeViewPortalContainer;
  /**
   * The emoji collection to use. See https://github.com/missive/emoji-mart#components
   */
  set: EmojiSet;
  /**
   * Set the size of the image used. Once I find a way to use SVG it would be awesome to allow ems that match
   * up with the font size.
   */
  size: number | string;

  /**
   * The data used for emoji
   */
  emojiData: Data;
  type: NodeType;
  EmojiComponent: ComponentType<DefaultEmojiProps>;

  /**
   * Allow customization of the styles passed through to the emoji component
   */
  style: Interpolation;
}

const defaultStyle = css`
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
  const dynamicStyle = css`
    span {
      height: ${size};
      width: ${size};
    }
  `;
  return new Plugin({
    key,
    // appendTransaction(_transaction, _prevState, state) {
    //   const { from, to, $from } = state.selection;
    //   console.log(from, to, $from.index());
    // },
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
          style: css([defaultStyle, dynamicStyle, style]),
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
