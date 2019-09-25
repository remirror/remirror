import { createEditor, doc, p } from 'jest-prosemirror';
import { ExitReason } from '../suggest-constants';
import { suggest } from '../suggest-plugin';
import { SuggestExitHandlerParams, SuggestKeyBindingParams } from '../suggest-types';

describe('Suggest Handlers', () => {
  it('should call `onChange`, `onExit` and `createCommand` handlers', () => {
    const command = jest.fn();
    const expected = 'suggest';
    const handlers = {
      onExit: jest.fn((params: SuggestExitHandlerParams) => {
        params.command('command');
        expect(params.queryText.full).toBe(expected);
        expect(params.reason).toBe(ExitReason.MoveEnd);
      }),
      onChange: jest.fn(),
      createCommand: () => command,
    };
    const plugin = suggest({ char: '@', name: 'at', ...handlers, matchOffset: 0 });

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@')
      .callback(() => {
        expect(handlers.onChange).toHaveBeenCalledTimes(1);
      })
      .insertText(`${expected} `)
      .callback(() => {
        expect(handlers.onChange).toHaveBeenCalledTimes(8);
        expect(command).toHaveBeenCalledWith('command');
      });
  });

  it('should not call `onChange` for the activation character when matchOffset is greater than 0', () => {
    const handlers = {
      onChange: jest.fn(),
    };
    const plugin = suggest({ char: '@', name: 'at', ...handlers, matchOffset: 1 });
    createEditor(doc(p('<cursor>')), { plugins: [plugin] }).insertText('@');
    expect(handlers.onChange).not.toHaveBeenCalled();
  });

  it('should respond to keyBindings', () => {
    const keyBindings = {
      Enter: jest.fn((params: SuggestKeyBindingParams) => {
        params.command();
      }),
    };
    const plugin = suggest({
      char: '@',
      name: 'at',
      keyBindings,
      matchOffset: 0,
      createCommand: ({ view }) => () => view.dispatch(view.state.tr.insertText('awesome')),
    });

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@')
      .press('Enter')
      .callback(content => {
        expect(content.state.doc).toEqualProsemirrorNode(doc(p('@awesome')));
      });
  });

  it('calls the correct handlers when jumping between two suggesters', () => {
    const handlers1 = {
      onChange: jest.fn(),
      onExit: jest.fn(),
    };
    const handlers2 = {
      onChange: jest.fn(),
      onExit: jest.fn(),
    };
    const plugin = suggest(
      { char: '@', name: 'at', ...handlers1 },
      { char: '#', name: 'hash', ...handlers2 },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc #xyz')
      .callback(() => {
        expect(handlers1.onChange).toHaveBeenCalledTimes(4);
        expect(handlers1.onExit).toHaveBeenCalledTimes(1);
        expect(handlers2.onChange).toHaveBeenCalledTimes(4);
        jest.clearAllMocks();
      })
      .jumpTo(5)
      .callback(() => {
        expect(handlers1.onChange).toHaveBeenCalledTimes(1);
        expect(handlers1.onExit).not.toHaveBeenCalled();
        expect(handlers2.onExit).toHaveBeenCalledTimes(1);
        expect(handlers2.onChange).not.toHaveBeenCalled();
      });
  });
});

describe('Suggest Ignore', () => {
  it('should ignore matches when called', () => {
    const handlers = {
      onExit: jest.fn(
        ({ addIgnored, range: { from }, suggester: { char, name } }: SuggestExitHandlerParams) => {
          addIgnored({ from, char, name });
        },
      ),
      onChange: jest.fn(),
    };
    const plugin = suggest({ char: '@', name: 'at', ...handlers });

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc ')
      .callback(() => {
        expect(handlers.onExit).toHaveBeenCalledTimes(1);
        expect(handlers.onChange).toHaveBeenCalledTimes(4);
        jest.clearAllMocks();
      })
      .backspace(3)
      .callback(() => expect(handlers.onChange).not.toHaveBeenCalled());
  });

  it('should clear ignored', () => {
    const clear = {
      at: (_name?: string) => {},
      tag: (_name?: string) => {},
    };

    const onExitMaker = (type: keyof typeof clear) => (params: SuggestExitHandlerParams) => {
      const { name, char } = params.suggester;
      params.addIgnored({ from: params.range.from, char, name });
      clear[type] = params.clearIgnored;
    };

    const atHandlers = {
      onExit: jest.fn(onExitMaker('at')),
      onChange: jest.fn(),
    };

    const tagHandlers = {
      onExit: jest.fn(onExitMaker('tag')),
      onChange: jest.fn(),
    };

    const plugin = suggest(
      { char: '@', name: 'at', ...atHandlers },
      { char: '#', name: 'tag', ...tagHandlers },
    );

    createEditor(doc(p('<cursor>')), { plugins: [plugin] })
      .insertText('@abc #xyz ')
      .callback(() => {
        jest.clearAllMocks();
      })
      .jumpTo(2)
      .callback(() => {
        expect(atHandlers.onChange).not.toHaveBeenCalled();
        clear.at('at');
      })
      .jumpTo(3)
      .callback(() => {
        expect(atHandlers.onChange).toHaveBeenCalledTimes(1);
      })
      .jumpTo(7)
      .callback(() => {
        expect(tagHandlers.onChange).not.toHaveBeenCalled();
        clear.tag('tag');
      })
      .jumpTo(8)
      .callback(() => {
        expect(tagHandlers.onChange).toHaveBeenCalledTimes(1);
      })
      .jumpTo('end')
      .callback(() => {
        expect(atHandlers.onExit).toHaveBeenCalledTimes(1);
        expect(tagHandlers.onExit).toHaveBeenCalledTimes(1);
        // jest.clearAllMocks();
        // clear.at('at');
      });
    // .backspace(10)
    // .callback(({ debug }) => {
    //   debug();
    //   expect(atHandlers.onChange).toHaveBeenCalledTimes(4);
    //   expect(atHandlers.onExit).toHaveBeenCalledTimes(1);
    //   expect(tagHandlers.onChange).toHaveBeenCalledTimes(4);
    //   expect(tagHandlers.onExit).toHaveBeenCalledTimes(1);
    // });
  });
});
