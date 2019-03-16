import { MentionNode } from '../mention.extension';

describe('Mentions Extension', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
    };
    const mentions = new MentionNode({
      matcher,
    });

    expect(mentions.options.matcher).toEqual(matcher);
    expect(mentions.name).toEqual('mentions');
  });
  it('uses dynamic naming', () => {
    const mentionOne = new MentionNode({
      type: 'hash',
      matcher: { char: '#' },
    });

    expect(mentionOne.name).toBe('mentionsHash');
  });
});
