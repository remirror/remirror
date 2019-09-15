import { getEmojiFromEmoticon, isEmojiName } from '../emoji-utils';

test('isEmojiName', () => {
  expect(isEmojiName('')).toBeFalse();
  expect(isEmojiName('toString')).toBeFalse();
  expect(isEmojiName('rofl')).toBeTrue();
});

test('getEmojiFromEmoticon', () => {
  expect(getEmojiFromEmoticon(':-)')!.char).toBe('😃');
  expect(getEmojiFromEmoticon(':-(')!.char).toBe('😦');
  expect(getEmojiFromEmoticon(':-(12')).toBeUndefined();
});
