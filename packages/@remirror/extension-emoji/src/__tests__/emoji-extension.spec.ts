import { renderEditor } from 'jest-remirror';

import { KeymapExtension, object } from '@remirror/core';

import type {
  EmojiChangeHandler,
  EmojiCommand,
  EmojiObject,
  EmojiOptions,
} from '../emoji-extension';
import {
  EmojiExtension,
  getEmojiFromEmoticon,
  isEmojiName,
  sortEmojiMatches,
} from '../emoji-extension';

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

function create(options: EmojiOptions = object()) {
  const extension = new EmojiExtension(options);

  let emoji: EmojiObject | undefined;
  let command: EmojiCommand | undefined;

  const onExit = jest.fn();
  const onChange: EmojiChangeHandler = jest.fn((parameter, cmd) => {
    if (parameter.exitReason) {
      onExit();
      command = undefined;
      emoji = undefined;
    } else {
      command = cmd;
      emoji = parameter.emojiMatches[0];
    }
  });

  const keymap = {
    Enter: jest.fn(() => {
      if (!emoji || !command) {
        return false;
      }

      command(emoji);
      return true;
    }),
  };

  const editor = renderEditor([extension]);

  extension.addHandler('onChange', onChange);
  editor.manager.getExtension(KeymapExtension).addCustomHandler('keymap', keymap);

  return { ...editor, editor, onChange, onExit, getEmoji: () => emoji, keymap };
}

describe('inputRules', () => {
  it('replaces emoticons with emoji', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':-) ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 ')));
      })
      .insertText('hello :@ ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 ')));
      })
      .insertText(':o')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 :o')));
      })
      .insertText(' ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 😮 ')));
      });
  });

  it('replaces colons with the exact name match', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':smiley:')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
      })
      .insertText(' :frowning:')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
      });
  });
});

describe('suggestions', () => {
  it('creates suggestions from the defaultList first', () => {
    const {
      onExit,
      onChange,
      keymap,
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback((content) => {
        expect(keymap.Enter).toHaveBeenCalledTimes(1);
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('👍')));
        expect(onExit).toHaveBeenCalledTimes(1);
      });
  });

  it('supports a custom defaultList', () => {
    const {
      nodes: { doc, p },
      add,
    } = create({ defaultEmoji: ['heart'] });

    add(doc(p('<cursor>')))
      .insertText(':')
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });

  it('suggests emoji after another emoji', () => {
    const {
      onChange,
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText('😃')
      .insertText(':')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃👍')));
      });
  });

  it('does not suggest emoji mid-word', () => {
    const {
      onChange,
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('a<cursor>')))
      .insertText(':')
      .callback(() => {
        expect(onChange).not.toHaveBeenCalled();
      })
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('a:'), p('')));
      });
  });
});

describe('commands', () => {
  it('`suggestEmoji`', () => {
    const {
      onChange,
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ commands, view }) => {
        commands.suggestEmoji();

        expect(view.state.doc).toEqualRemirrorDocument(doc(p(':')));
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .overwrite(doc(p('abcde')))
      .callback(({ commands, view }) => {
        commands.suggestEmoji({ from: 3, to: 4 });

        expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab:de')));
      });
  });

  it('`insertEmojiByName`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ commands, view }) => {
        commands.insertEmojiByName('heart');
        expect(view.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      })
      .overwrite(doc(p('abcde')))
      .callback(({ commands, view }) => {
        commands.insertEmojiByName('heart', { from: 3, to: 4 });
        expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab❤️de')));
      });
  });
});

describe('helpers', () => {
  it('`updateFrequentlyUsed`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ helpers }) => {
        helpers.updateFrequentlyUsed(['heart']);
      })
      .insertText(':')
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });
});
