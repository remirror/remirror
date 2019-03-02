import { Cast, EditorState } from '@remirror/core';
import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { CreateEmojiPluginParams } from './create-emoji-plugin';
import { getEmojiDataByNativeString } from './helpers';

export const nativeEmojiInputRule = (
  regexp: RegExp,
  type: NodeType,
  emojiData: CreateEmojiPluginParams['data'],
) => {
  return new InputRule(regexp, (state: EditorState, match, start, end) => {
    end = start > end ? start : end;
    const regMatch: RegExpMatchArray = Cast(match);
    const { tr } = state;
    console.log('match', match, start, end, regMatch.index, match[0].length);
    const str = match[0];
    if (!str) {
      return tr;
    }
    const data = getEmojiDataByNativeString(str, emojiData);
    console.log(data);
    if (!data) {
      return tr.insertText(str + ' ', start);
    }
    return tr.replaceWith(start, end, type.create(data));
  });
};
