import { extensionValidityTest, renderEditor } from 'jest-remirror';
import data from 'svgmoji/emoji.json';
import { KeymapExtension, object } from '@remirror/core';

import { EmojiExtension, EmojiOptions, EmojiSuggestHandler, EmojiSuggestHandlerCommand } from '../';

extensionValidityTest(EmojiExtension);

function create(options: EmojiOptions = object()) {
  const extension = new EmojiExtension(options);
  let apply: EmojiSuggestHandlerCommand | undefined;
  let firstMatch: string | undefined;

  const exit = jest.fn();
  const suggestEmoji: EmojiSuggestHandler = jest.fn((props) => {
    if (props.exit) {
      exit();
      apply = undefined;
      firstMatch = undefined;
    } else {
      apply = props.apply;
      firstMatch = props.moji.search(props.query)[0]?.emoji;
    }
  });

  const keymap = {
    Enter: jest.fn(() => {
      if (!firstMatch || !apply) {
        return false;
      }

      apply(firstMatch);
      return true;
    }),
  };

  const editor = renderEditor([extension]);

  extension.addHandler('suggestEmoji', suggestEmoji);
  editor.manager.getExtension(KeymapExtension).addCustomHandler('keymap', keymap);

  return { ...editor, editor, suggestEmoji, exit, getQuery: () => firstMatch, keymap };
}

describe('plainText', () => {
  describe('inputRules', () => {
    it('replaces emoticons with emoji', () => {
      const {
        nodes: { p, doc },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .insertText(':-) ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('🙂 ')));
        })
        .insertText('hello :@ ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('🙂 hello 🤬 ')));
        })
        .insertText(':o')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('🙂 hello 🤬 :o')));
        })
        .insertText(' ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('🙂 hello 🤬 😲 ')));
        });
    });

    it('replaces colons with the exact name match', () => {
      const {
        nodes: { p, doc },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .insertText(':grinning_face_with_big_eyes:')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
        })
        .insertText(' :frowning_face_with_open_mouth:')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
        });
    });
  });

  describe('suggestions', () => {
    it('creates suggestions from the defaultList first', () => {
      const {
        exit,
        suggestEmoji,
        keymap,
        nodes: { doc, p },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .insertText(':red_heart')
        .callback(() => {
          expect(suggestEmoji).toHaveBeenCalledTimes(10);
        })
        .press('Enter')
        .callback((content) => {
          expect(keymap.Enter).toHaveBeenCalledTimes(1);
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
          expect(exit).toHaveBeenCalledTimes(1);
        });
    });

    it('suggests emoji after another emoji', () => {
      const {
        suggestEmoji,
        nodes: { doc, p },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .insertText('😃')
        .insertText(':heart')
        .callback(() => {
          expect(suggestEmoji).toHaveBeenCalledTimes(6);
        })
        .press('Enter')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃💌')));
        });
    });

    it('does not suggest emoji mid-word', () => {
      const {
        suggestEmoji,
        nodes: { doc, p },
        add,
      } = create({ plainText: true, data });

      add(doc(p('a<cursor>')))
        .insertText(':')
        .callback(() => {
          expect(suggestEmoji).not.toHaveBeenCalled();
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
        suggestEmoji,
        nodes: { doc, p },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .callback(({ commands, view }) => {
          commands.suggestEmoji();

          expect(view.state.doc).toEqualRemirrorDocument(doc(p(':')));
          expect(suggestEmoji).toHaveBeenCalledTimes(1);
        })
        .overwrite(doc(p('a:cde')))
        .callback(({ commands }) => {
          expect(commands.suggestEmoji.isEnabled({ from: 3, to: 4 })).toBe(false);
          expect(commands.suggestEmoji.isEnabled('end')).toBe(true);
          expect(commands.suggestEmoji.isEnabled('start')).toBe(true);
        });
    });

    it('`addEmoji`', () => {
      const {
        nodes: { doc, p },
        add,
      } = create({ plainText: true, data });

      add(doc(p('<cursor>')))
        .callback(({ commands, view }) => {
          commands.addEmoji('red_heart');
          expect(view.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
        })
        .overwrite(doc(p('abcde')))
        .callback(({ commands, view }) => {
          commands.addEmoji('red_heart', { selection: { from: 3, to: 4 } });
          expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab❤️de')));
        });
    });
  });
});

describe('node', () => {
  describe('inputRules', () => {
    it('replaces emoticons with emoji', () => {
      const {
        nodes: { p, doc },
        attributeNodes: { emoji },
        add,
      } = create({ data });

      const smiley = emoji({ code: '🙂' })();
      const anger = emoji({ code: '🤬' })();
      const surprise = emoji({ code: '😲' })();

      add(doc(p('<cursor>')))
        .insertText(':-) ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley, ' ')));
        })
        .insertText('hello :@ ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley, ' hello ', anger, ' ')));
        })
        .insertText(':o')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(
            doc(p(smiley, ' hello ', anger, ' :o')),
          );
        })
        .insertText(' ')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(
            doc(p(smiley, ' hello ', anger, ' ', surprise, ' ')),
          );
        });
    });

    it('replaces colons with the exact name match', () => {
      const {
        nodes: { p, doc },
        attributeNodes: { emoji },
        add,
      } = create({ data });
      const smiley = emoji({ code: '😃' })();
      const frowning = emoji({ code: '😦' })();

      add(doc(p('<cursor>')))
        .insertText(':grinning_face_with_big_eyes:')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley)));
        })
        .insertText(' :frowning_face_with_open_mouth:')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley, ' ', frowning)));
        });
    });

    it('replaces plain text emoji with the exact node', () => {
      const {
        nodes: { p, doc },
        attributeNodes: { emoji },
        add,
      } = create({ data });
      const smiley = emoji({ code: '😃' })();
      const frowning = emoji({ code: '😦' })();

      add(doc(p('<cursor>')))
        .insertText('😃')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley)));
        })
        .insertText(' 😦')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley, ' ', frowning)));
        });
    });
  });

  describe('suggestions', () => {
    it('creates suggestions from the defaultList first', () => {
      const {
        exit,
        keymap,
        nodes: { doc, p },
        add,
        attributeNodes: { emoji },
      } = create({ data });
      const heart = emoji({ code: '❤️' })();

      add(doc(p('<cursor>')))
        .insertText(':red_heart')
        .press('Enter')
        .callback((content) => {
          expect(keymap.Enter).toHaveBeenCalledTimes(1);
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(heart)));
          expect(exit).toHaveBeenCalledTimes(1);
        });
    });

    it('suggests emoji after another emoji', () => {
      const {
        nodes: { p, doc },
        attributeNodes: { emoji },
        add,
      } = create({ data });
      const smiley = emoji({ code: '😃' })();
      const heart = emoji({ code: '💌' })();

      add(doc(p('<cursor>')))
        .insertText('😃')
        .insertText(':heart')
        .press('Enter')
        .callback((content) => {
          expect(content.state.doc).toEqualRemirrorDocument(doc(p(smiley, heart)));
        });
    });
  });

  describe('commands', () => {
    it('`addEmoji`', () => {
      const {
        nodes: { doc, p },
        add,
        attributeNodes: { emoji },
      } = create({ data });
      const heart = emoji({ code: '❤️' })();

      add(doc(p('<cursor>')))
        .callback(({ commands, view }) => {
          commands.addEmoji('red_heart');
          expect(view.state.doc).toEqualRemirrorDocument(doc(p(heart)));
        })
        .overwrite(doc(p('abcde')))
        .callback(({ commands, view }) => {
          commands.addEmoji('red_heart', { selection: { from: 3, to: 4 } });
          expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab', heart, 'de')));
        });
    });
  });
});
