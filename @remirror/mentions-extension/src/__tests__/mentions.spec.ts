import { Mentions } from '..';

describe('Mentions Extension', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
    };
    const mentions = new Mentions({
      items: [{ username: 'Bob' }],
      matcher,
    });

    expect(mentions.options.matcher).toEqual(matcher);
    expect(mentions.name).toEqual('mentions');
  });
  it('uses dynamic naming', () => {
    const mentionOne = new Mentions({
      type: 'simple',
    });

    expect(mentionOne.name).toBe('mentions_simple');
  });
});
