import { Mentions } from '../mentions';

describe('Mentions Extension', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
    };
    const mentions = new Mentions({
      matcher,
    });

    expect(mentions.options.matcher).toEqual(matcher);
    expect(mentions.name).toEqual('mentions');
  });
  it('uses dynamic naming', () => {
    const mentionOne = new Mentions({
      type: 'hash',
      matcher: { char: '#' },
    });

    expect(mentionOne.name).toBe('mentionsHash');
  });
});
