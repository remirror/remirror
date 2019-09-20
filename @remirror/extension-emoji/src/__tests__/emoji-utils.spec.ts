import { getEmojiFromEmoticon, isEmojiName, sortEmojiMatches } from '../emoji-utils';

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

test('sortEmojiMatches', () => {
  expect(sortEmojiMatches('+1', 10)[0].char).toBe('👍');
  expect(sortEmojiMatches('thumbsup', 10)[0].char).toBe('👍');
  expect(sortEmojiMatches('').length).toBeGreaterThan(1000);
});
