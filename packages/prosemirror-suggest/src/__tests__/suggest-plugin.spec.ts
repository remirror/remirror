import { createEditor, doc, p } from 'jest-prosemirror';
import { ExitReason } from '../suggest-constants';
import { suggest } from '../suggest-plugin';
import { SuggestExitHandlerParams, SuggestKeyBindingParams } from '../suggest-types';

test('`onChange`, `onExit` and `createCommand` handlers are called', () => {
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

test('`keyBindings`', () => {
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

test('`onChange` not called for the char when matchOffset is greater than 0', () => {
  const handlers = {
    onChange: jest.fn(),
  };
  const plugin = suggest({ char: '@', name: 'at', ...handlers, matchOffset: 1 });
  createEditor(doc(p('<cursor>')), { plugins: [plugin] }).insertText('@');
  expect(handlers.onChange).not.toHaveBeenCalled();
});

test('handles jumping with two suggesters', () => {
  const handlers1 = {
    onChange: jest.fn(),
    onExit: jest.fn(),
  };
  const handlers2 = {
    onChange: jest.fn(),
    onExit: jest.fn(),
  };
  const plugin = suggest({ char: '@', name: 'at', ...handlers1 }, { char: '#', name: 'hash', ...handlers2 });

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

test('ignore matches', () => {
  let clearIgnored: () => void;
  const handlers = {
    onExit: jest.fn(
      ({
        addIgnored,
        range: { from },
        suggester: { char, name },
        clearIgnored: clear,
      }: SuggestExitHandlerParams) => {
        addIgnored({ from, char, name });
        clearIgnored = clear;
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
    .callback(() => expect(handlers.onChange).not.toHaveBeenCalled())
    .insertText('b ')
    .callback(() => {
      expect(handlers.onExit).not.toHaveBeenCalled();
      clearIgnored();
    })
    .backspace(2)
    .insertText('bc')
    .callback(() => {
      expect(handlers.onChange).toHaveBeenCalledTimes(3);
    });
});
