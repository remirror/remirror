import { renderEditor } from 'jest-remirror';

import { BoldExtension, isExtensionValid, ItalicExtension } from '@remirror/testing';

import { CommandsExtension } from '..';

test('is commands extension valid', () => {
  expect(isExtensionValid(CommandsExtension, {}));
});

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
