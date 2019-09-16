import { createEditor, doc, p } from 'jest-prosemirror';
import { suggest } from '../suggest-plugin';
import { OnExitCallbackParams } from '../suggest-types';

test('`onChange` and `onExit` handlers are called', () => {
  expect.assertions(3);
  const expected = 'suggest';
  const handlers = {
    onExit: jest.fn((params: OnExitCallbackParams) => {
      expect(params.query.full).toBe(expected);
    }),
    onChange: jest.fn(),
  };
  const plugin = suggest({ char: '@', name: 'at', ...handlers, immediateMatch: true });
  const editor = createEditor(doc(p('<cursor>')), { plugins: [plugin] }).insertText('@');
  expect(handlers.onChange).toHaveBeenCalledTimes(1);

  editor.insertText(`${expected} `);
  expect(handlers.onChange).toHaveBeenCalledTimes(8);
});

test('`onChange` not called for character when immediateMatch is false', () => {
  const handlers = {
    onChange: jest.fn(),
  };
  const plugin = suggest({ char: '@', name: 'at', ...handlers, immediateMatch: false });
  createEditor(doc(p('<cursor>')), { plugins: [plugin] }).insertText('@');
  expect(handlers.onChange).not.toHaveBeenCalled();
});
