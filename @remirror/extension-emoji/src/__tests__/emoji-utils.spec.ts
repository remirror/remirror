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
  expect(sortEmojiMatches({ query: '+1', maxResults: 10 })[0].char).toBe('👍');
  expect(sortEmojiMatches({ query: 'thumbsup', maxResults: 10 })[0].char).toBe('👍');
  expect(sortEmojiMatches({ query: '' }).length).toBeGreaterThan(1000);
});
