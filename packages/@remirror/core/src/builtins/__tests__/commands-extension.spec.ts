import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { BoldExtension, ItalicExtension } from '@remirror/testing';

import { CommandsExtension } from '..';

extensionValidityTest(CommandsExtension);

test('can call multiple commands', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { bold, italic } = editor.marks;
  const { commands } = editor;

  editor.add(doc(p('<start>my content<end>')));
  commands.toggleBold();
  commands.toggleItalic();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('my content')))));
});

test('can chain commands', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { bold, italic } = editor.marks;
  const { chain } = editor;

  editor.add(doc(p('<start>my content<end>')));
  chain.toggleBold().toggleItalic().run();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('my content')))));
});

test('clears range selection', () => {
  const text = 'my content';

  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p(`<start>${text}<end>`)));

  // Pre-condition: range selection covers complete text
  expect(editor.state.selection.to).toBe(editor.state.selection.from + text.length);

  expect(commands.clearRangeSelection()).toBeTrue();

  expect(editor.state.selection.to).toBe(editor.state.selection.from);
  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(text)));
});

test('rejects clearing range selection if there is none', () => {
  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p('my content')));

  expect(commands.clearRangeSelection()).toBeFalse();
});
