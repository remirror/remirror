import { renderEditor } from 'jest-remirror';
import { SuggestKeyBindingParams } from 'prosemirror-suggest';
import { EmojiExtension } from '../emoji-extension';
import {
  EmojiExtensionOptions,
  EmojiObject,
  EmojiSuggestCommand,
  EmojiSuggestionChangeHandlerParams,
} from '../emoji-types';

const create = (options: EmojiExtensionOptions = {}) =>
  renderEditor({
    plainNodes: [],
    others: [new EmojiExtension({ onSuggestionChange, onSuggestionExit, suggestionKeyBindings, ...options })],
  });

let emoji: EmojiObject | undefined;

const onSuggestionChange = jest.fn((params: EmojiSuggestionChangeHandlerParams) => {
  emoji = params.emojiMatches[0];
});
const onSuggestionExit = jest.fn(() => {
  emoji = undefined;
});
const suggestionKeyBindings = {
  Enter: jest.fn((params: SuggestKeyBindingParams<EmojiSuggestCommand>) => {
    params.command(emoji!);
    return true;
  }),
};

afterEach(() => {
  emoji = undefined;
});

describe('inputRules', () => {
  it('replaces emoticons with emoji', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':-) ')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 ')));
      })
      .insertText('hello :@ ')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 ')));
      })
      .insertText(':o')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 :o')));
      })
      .insertText(' ')
      .callback(content => {
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
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
      })
      .insertText(' :frowning:')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
      });
  });
});

describe('suggestions', () => {
  it('creates suggestions from the defaultList first', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':')
      .callback(() => {
        expect(onSuggestionChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback(content => {
        expect(suggestionKeyBindings.Enter).toHaveBeenCalledTimes(1);
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('👍')));
        expect(onSuggestionExit).toHaveBeenCalledTimes(1);
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
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });

  it('suggests emoji after another emoji', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText('😃')
      .insertText(':')
      .callback(() => {
        expect(onSuggestionChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃👍')));
      });
  });
});

describe('commands', () => {
  test('`openEmojiSuggestion`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .actionsCallback(actions => {
        actions.openEmojiSuggestions();
      })
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p(':')));
        expect(onSuggestionChange).toHaveBeenCalledTimes(1);
      })
      .overwrite(doc(p('abcde')))
      .actionsCallback(actions => {
        actions.openEmojiSuggestions({ from: 3, to: 4 });
      })
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('ab:de')));
      });
  });

  test('`insertEmojiByName`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .actionsCallback(actions => {
        actions.insertEmojiByName('heart');
      })
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      })
      .overwrite(doc(p('abcde')))
      .actionsCallback(actions => {
        actions.insertEmojiByName('heart', { from: 3, to: 4 });
      })
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('ab❤️de')));
      });
  });
});

describe('helpers', () => {
  test('`updateFrequentlyUsed`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .helpersCallback(helpers => {
        helpers.updateFrequentlyUsed(['heart']);
      })
      .insertText(':')
      .press('Enter')
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });
});
