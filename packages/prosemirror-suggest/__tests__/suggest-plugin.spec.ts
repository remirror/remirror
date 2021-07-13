import { createEditor, doc, h1, p, strong } from 'jest-prosemirror';
import { Transaction } from 'prosemirror-state';

import type { SuggestChangeHandler } from '../';
import { addSuggester, ChangeReason, ExitReason, suggest } from '../';

describe('suggester', () => {
  it('should call `onChange`', () => {
    const expected = 'suggest';
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn((param) => {
      const { exitReason, text: matchText, query: queryText, range } = param;

      if (exitReason) {
        exit(exitReason, matchText, queryText, range);
      }
    });
    const plugin = suggest({ char: '@', name: 'at', onChange, matchOffset: 0 });

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .insertText(`${expected} `)
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(9);
        expect(exit).toHaveBeenCalledTimes(1);
        expect(exit).toHaveBeenCalledWith(
          ExitReason.MoveEnd,
          { full: '@suggest', partial: '@suggest' },
          { full: 'suggest', partial: 'suggest' },
          { from: 1, cursor: 9, to: 9 },
        );
      });
  });

  it('supports `textBefore` and `textAfter` `onChange`', () => {
    const expected = 'suggest';
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn((param) => {
      const { exitReason, textBefore, textAfter } = param;

      if (exitReason) {
        exit({ textBefore, textAfter });
      }
    });
    const plugin = suggest({ char: '@', name: 'at', onChange, matchOffset: 0 });

    createEditor(doc(p('hello'), p(strong('Hello'), ' <cursor>friend')), { plugins: [plugin] })
      .insertText(`@${expected} `)
      .callback(() => {
        expect(exit).toHaveBeenCalledWith({ textBefore: 'Hello ', textAfter: ' friend' });
      });
  });

  it('supports priority', () => {
    const _1 = jest.fn();
    const _2 = jest.fn();
    const _3 = jest.fn();
    const plugin = suggest(
      { char: '@', name: '3', onChange: _3, supportedCharacters: /[1-3]+/, priority: 10 },
      { char: '@', name: '2', onChange: _2, supportedCharacters: /[12]+/, priority: 20 },
      { char: '@', name: '1', onChange: _1, supportedCharacters: /1+/, priority: 30 },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@')
      .callback(() => {
        expect(_1).toHaveBeenCalledTimes(1);
        expect(_2).not.toHaveBeenCalled();
        expect(_3).not.toHaveBeenCalled();
      })
      .insertText('1')
      .callback(() => {
        expect(_1).toHaveBeenCalledTimes(2);
        expect(_2).not.toHaveBeenCalled();
        expect(_3).not.toHaveBeenCalled();
      })
      .insertText('2')
      .callback(() => {
        expect(_1).toHaveBeenCalledTimes(2);
        expect(_2).toHaveBeenCalledTimes(1);
        expect(_3).not.toHaveBeenCalled();
      })
      .insertText('3')
      .callback(() => {
        expect(_1).toHaveBeenCalledTimes(2);
        expect(_2).toHaveBeenCalledTimes(1);
        expect(_3).toHaveBeenCalledTimes(1);
      })
      .insertText(' ')

      .callback(() => {
        expect(_3).toHaveBeenCalledTimes(2);
        expect(_3).toHaveBeenCalledWith(
          expect.objectContaining({
            exitReason: ExitReason.MoveEnd,
            text: { full: '@123', partial: '@123' },
            query: { full: '123', partial: '123' },
            range: { from: 1, cursor: 5, to: 5 },
          }),
          expect.any(Transaction),
        );
      });
  });

  it('supports regex for character matches', () => {
    const expected = 'suggest';
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn((param) => {
      const { exitReason, text: matchText, query: queryText, range } = param;

      if (exitReason) {
        exit(exitReason, matchText, queryText, range);
      }
    });
    const at = jest.fn();

    const plugin = suggest(
      { char: '@', name: 'at', onChange: at, matchOffset: 0 },
      { name: 'whitespace', char: /\s/, onChange, supportedCharacters: /[A-Za-z]+/ },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText(' ')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .insertText(`${expected}_`)
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(9);
        expect(exit).toHaveBeenCalledTimes(1);
        expect(exit).toHaveBeenCalledWith(
          ExitReason.MoveEnd,
          { full: ' suggest', partial: ' suggest' },
          { full: 'suggest', partial: 'suggest' },
          { from: 1, cursor: 9, to: 9 },
        );
      });
  });

  it('should not call `onChange` for the activation character when matchOffset is greater than 0', () => {
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn(({ exitReason }) => {
      if (exitReason) {
        exit(exitReason);
      }
    });
    const plugin = suggest(
      { char: '@', name: 'at', onChange, matchOffset: 1 },
      { char: '#', name: 'tags', onChange, matchOffset: 2 },
    );

    const editor = createEditor(doc(p('<cursor>')), { plugins: [plugin] }).insertText('@ #a ');

    expect(onChange).not.toHaveBeenCalled();

    editor.insertText('@a #ab ');
    expect(exit).toHaveBeenCalledTimes(2);
    expect(exit).toHaveBeenCalledWith(ExitReason.MoveEnd);
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('responds to different kinds of exits', () => {
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn(({ exitReason, range }) => {
      if (exitReason) {
        exit(exitReason, range);
      }
    });

    const plugin = suggest({ char: '@', onChange, name: 'at', matchOffset: 0 });

    const editor = createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc')
      .selectText(3)
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(5);
        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ changeReason: ChangeReason.Move }),
          expect.any(Transaction),
        );
        expect(exit).not.toHaveBeenCalled();
      })
      .insertText(' ')
      .callback(() => {
        expect(exit).toHaveBeenCalledWith(ExitReason.Split, { from: 1, cursor: 3, to: 3 });
      })
      .insertText('@')
      .callback(() => {
        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            range: { from: 4, cursor: 5, to: 7 },
            changeReason: ChangeReason.Start,
          }),
          expect.any(Transaction),
        );
      });

    editor.overwrite(doc(p('Hello ')));
    expect(exit).toHaveBeenLastCalledWith(ExitReason.InvalidSplit, { from: 4, cursor: 5, to: 7 });

    editor
      .insertText('@abc')
      .selectText('start')
      .callback(() => {
        expect(exit).toHaveBeenLastCalledWith(ExitReason.MoveStart, {
          from: 7,
          cursor: 11,
          to: 11,
        });
      });
  });

  it('calls the correct handlers when jumping between two suggesters', () => {
    const change1 = jest.fn();
    const exit1 = jest.fn();
    const onChange1: SuggestChangeHandler = jest.fn(({ exitReason, changeReason }) => {
      if (exitReason) {
        exit1(exitReason);
      } else {
        change1(changeReason);
      }
    });

    const change2 = jest.fn();
    const exit2 = jest.fn();
    const onChange2: SuggestChangeHandler = jest.fn(({ exitReason, changeReason }) => {
      if (exitReason) {
        exit2(exitReason);
      } else {
        change2(changeReason);
      }
    });

    const plugin = suggest(
      { char: '@', name: 'at', onChange: onChange1 },
      { char: '#', name: 'hash', onChange: onChange2 },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc #xyz')
      .callback(() => {
        expect(change1).toHaveBeenCalledTimes(4);
        expect(exit1).toHaveBeenCalledTimes(1);
        expect(change2).toHaveBeenCalledTimes(4);

        jest.clearAllMocks();
      })
      .selectText(5)
      .callback(() => {
        expect(change1).toHaveBeenCalledTimes(1);
        expect(exit1).not.toHaveBeenCalled();
        expect(exit2).toHaveBeenCalledTimes(1);
        expect(change2).not.toHaveBeenCalled();
      });
  });
});

describe('Suggest Ignore', () => {
  it('should ignore matches when called', () => {
    const change = jest.fn();
    const exit = jest.fn();
    const onChange: SuggestChangeHandler = jest.fn(
      ({ exitReason, range, addIgnored, suggester }) => {
        if (exitReason) {
          addIgnored({ from: range.from, name: suggester.name });
          exit(exitReason, range);
        } else {
          change(range);
        }
      },
    );
    const plugin = suggest({ char: '@', name: 'at', onChange, ignoredClassName: 'ignored' });

    const editor = createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc ')
      .callback(() => {
        expect(exit).toHaveBeenCalledTimes(1);
        expect(change).toHaveBeenCalledTimes(4);

        jest.clearAllMocks();
      })
      .backspace(4)
      .callback(() => expect(change).not.toHaveBeenCalled());

    expect(editor.view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class="ignored">
          @
        </span>
      </p>
    `);
  });

  it('should clear ignored', () => {
    const clear = {
      at: (_name?: string) => {},
      tag: (_name?: string) => {},
    };

    const exitAt = jest.fn();
    const onChangeAt: SuggestChangeHandler = jest.fn(
      ({ exitReason, range, addIgnored, suggester, clearIgnored }) => {
        if (exitReason) {
          const { name } = suggester;
          addIgnored({ from: range.from, name });
          clear.at = clearIgnored;
          exitAt();
        }
      },
    );

    const exitTag = jest.fn();
    const onChangeTag: SuggestChangeHandler = jest.fn(
      ({ exitReason, range, addIgnored, suggester, clearIgnored }) => {
        if (exitReason) {
          const { name } = suggester;
          addIgnored({ from: range.from, name });
          clear.tag = clearIgnored;
          exitTag();
        }
      },
    );

    const plugin = suggest(
      { char: '@', name: 'at', onChange: onChangeAt },
      { char: '#', name: 'tag', onChange: onChangeTag },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc #xyz ')
      .callback(() => {
        jest.clearAllMocks();
      })
      .selectText(2)
      .callback(() => {
        expect(onChangeAt).not.toHaveBeenCalled();

        clear.at('at');
      })
      .selectText(3)
      .callback(() => {
        expect(onChangeAt).toHaveBeenCalledTimes(1);
      })
      .selectText(7)
      .callback(() => {
        expect(onChangeTag).not.toHaveBeenCalled();

        clear.tag('tag');
      })
      .selectText(8)
      .callback(() => {
        expect(onChangeTag).toHaveBeenCalledTimes(1);
      })
      .selectText('end')
      .callback(() => {
        expect(exitAt).toHaveBeenCalledTimes(1);
        expect(exitTag).toHaveBeenCalledTimes(1);
      });
  });
});

test('addSuggester', () => {
  const exit = jest.fn();
  const onChange: SuggestChangeHandler = jest.fn(({ exitReason, range }) => {
    if (exitReason) {
      exit(exitReason, range);
    }
  });

  const plugin = suggest();
  const editor = createEditor(doc(p('<cursor>')), { plugins: [plugin] });

  const remove = addSuggester(editor.view.state, {
    char: '@',
    name: 'at',
    onChange,
    matchOffset: 0,
  });

  editor
    .insertText('@')
    .callback(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    })
    .insertText('suggest ');

  expect(exit).toHaveBeenCalledTimes(1);
  remove();

  jest.clearAllMocks();

  editor
    .insertText('@')
    .callback(() => {
      expect(onChange).not.toHaveBeenCalled();
    })
    .insertText('suggest ');

  expect(exit).not.toHaveBeenCalled();
});

describe('validity', () => {
  it('can register invalid marks', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, invalidMarks: ['strong'] });

    createEditor(doc(p(strong('@<cursor>'))), { plugins: [plugin] }).insertText('abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can register invalid nodes', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, invalidNodes: ['heading'] });

    createEditor(doc(h1('@<cursor>')), { plugins: [plugin] }).insertText('abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can register valid marks', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, validMarks: ['strong'] });

    const editor = createEditor(doc(p(strong('@<cursor>')), p('')), {
      plugins: [plugin],
    }).insertText('abc ');
    expect(onChange).toHaveBeenCalledTimes(4);

    jest.resetAllMocks();

    editor.selectText(8).insertText('@abc ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can register valid nodes', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, validNodes: ['heading'] });

    const editor = createEditor(doc(h1('@<cursor>'), p('')), { plugins: [plugin] }).insertText(
      'abc ',
    );
    expect(onChange).toHaveBeenCalledTimes(4);

    jest.resetAllMocks();

    editor.selectText(8).insertText('@abc ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects `invalidMarks` option when covering part of the match', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, invalidMarks: ['strong'] });

    createEditor(doc(p(strong('@'), 'ab<cursor>')), { plugins: [plugin] }).insertText('c');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should reject `invalidMarks` option not at the start or cursor', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, invalidMarks: ['strong'] });

    createEditor(doc(p('@', strong('ab'), 'c<cursor>')), { plugins: [plugin] }).insertText('c');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts `validMarks` only when the whole match is covered', () => {
    const onChange: SuggestChangeHandler = jest.fn();
    const plugin = suggest({ char: '@', name: 'at', onChange, validMarks: ['strong'] });

    const editor = createEditor(doc(p(strong('@<cursor>')), p('@a', strong('b'))), {
      plugins: [plugin],
    })
      .insertText('abc')
      .selectText(10);
    expect(onChange).toHaveBeenCalledTimes(4);

    jest.resetAllMocks();

    editor.insertText('c');
    expect(onChange).not.toHaveBeenCalled();
  });
});

test('should support whitespace characters in `supportedCharacters`', () => {
  const exit = jest.fn();
  const onChange: SuggestChangeHandler = jest.fn((param) => {
    const { exitReason, text: matchText, query: queryText, range } = param;

    if (exitReason) {
      exit(exitReason, matchText, queryText, range);
    }
  });
  const plugin = suggest({
    char: '/',
    name: 'at',
    onChange,
    matchOffset: 0,
    supportedCharacters: /[ a-z]+/,
  });

  createEditor(doc(p('<cursor>')), { plugins: [plugin] })
    .insertText('/')
    .callback(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    })
    .insertText(` abc space ? `)
    .callback(() => {
      expect(onChange).toHaveBeenCalledTimes(13);
      expect(exit).toHaveBeenCalledTimes(1);
    });
});

describe('checkNextValidSelection', () => {
  it('updates the next selection', () => {
    const mocks = {
      checkNextValidSelection: jest.fn(),
      onChange: jest.fn(),
    };

    const plugin = suggest({ char: '@', name: 'at', invalidMarks: ['strong'], ...mocks });

    const editor = createEditor(doc(p(strong('@<cursor>'))), { plugins: [plugin] }).insertText(
      'abc',
    );
    expect(mocks.checkNextValidSelection).not.toHaveBeenCalled();

    editor.insertText(' abcd').selectText(6);

    expect(mocks.checkNextValidSelection).toHaveBeenCalledWith(
      expect.objectContaining({ pos: 7 }),
      expect.any(Transaction),
      { change: undefined, exit: undefined },
    );
  });

  it('is not called when selecting `all`', () => {
    const mocks = {
      checkNextValidSelection: jest.fn(),
      onChange: jest.fn(),
    };

    const plugin = suggest({ char: '@', name: 'at', invalidMarks: ['strong'], ...mocks });

    const editor = createEditor(doc(p(strong('@<cursor>'))), { plugins: [plugin] }).insertText(
      'abc',
    );
    expect(mocks.checkNextValidSelection).not.toHaveBeenCalled();

    editor.insertText(' abcd').selectText('all');
    expect(mocks.checkNextValidSelection).not.toHaveBeenCalled();
  });

  it('is not called when selecting `node`', () => {
    const mocks = {
      checkNextValidSelection: jest.fn(),
      onChange: jest.fn(),
    };

    const plugin = suggest({ char: '@', name: 'at', invalidMarks: ['strong'], ...mocks });

    const editor = createEditor(doc(p(strong('@<cursor>'))), { plugins: [plugin] }).insertText(
      'abc',
    );
    expect(mocks.checkNextValidSelection).not.toHaveBeenCalled();

    editor.insertText(' abcd').selectText('all');
    expect(mocks.checkNextValidSelection).not.toHaveBeenCalled();
  });
});
