import { jest } from '@jest/globals';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { BoldExtension, ItalicExtension } from 'remirror/extensions';
import { AllSelection } from '@remirror/pm/state';

import { CommandsExtension } from '../';

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

test('can create a new command chain with `new()`', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { italic } = editor.marks;
  const { chain } = editor;

  editor.add(doc(p('<start>my content<end>')));
  chain.toggleBold();
  chain.new().toggleItalic().run();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(italic('my content'))));
});

test('can use multiple commands chains with `.new()`', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { bold, italic } = editor.marks;
  const { chain: chain1 } = editor;

  editor.add(doc(p('<start>my content<end>')));
  chain1.toggleBold();

  const chain2 = chain1.new();
  chain2.toggleItalic().run();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(italic('my content'))));

  chain1.run();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('my content')))));
});

test('clears range selection', () => {
  const text = 'my content';

  const editor = renderEditor<never>([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p(`<start>${text}<end>`)));

  // Pre-condition: range selection covers complete text
  expect(editor.state.selection.to).toBe(editor.state.selection.from + text.length);

  expect(commands.emptySelection()).toBeTrue();

  expect(editor.state.selection.to).toBe(editor.state.selection.from);
  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(text)));
});

test('rejects clearing range selection if there is none', () => {
  const editor = renderEditor<never>([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p('my content')));

  expect(commands.emptySelection()).toBeFalse();
});

test('it can select text', () => {
  const editor = renderEditor<never>([]);
  const { doc, p } = editor.nodes;

  editor.add(doc(p('my <cursor>content')));

  editor.commands.selectText('all');
  expect(editor.state.selection).toBeInstanceOf(AllSelection);

  editor.commands.selectText('end');
  expect(editor.state.selection.from).toBe(11);

  editor.commands.selectText('start');
  expect(editor.state.selection.from).toBe(1);

  editor.commands.selectText(2);
  expect(editor.state.selection.from).toBe(2);

  editor.commands.selectText({ from: 1, to: 3 });
  expect(editor.state.selection.empty).toBeFalse();
});

function sleep(msDelay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, msDelay);
  });
}

describe('commands.clearRangeSelection', () => {
  it('clears the selection', () => {
    const editor = renderEditor<never>([]);
    const { doc, p } = editor.nodes;

    editor.add(doc(p('my <head>content<anchor> is chill')));
    editor.commands.emptySelection();
    expect(editor.state.selection.from).toBe(11);

    editor.insertText(' vibe');
    expect(editor.state.doc).toEqualRemirrorDocument(doc(p('my content vibe is chill')));
  });

  it('does nothing when the selection is empty', () => {
    const editor = renderEditor<never>([]);
    const { doc, p } = editor.nodes;
    editor.add(doc(p('my content<head><anchor> is chill')));

    expect(editor.commands.emptySelection.enabled()).toBeFalse();
  });
});

describe('commands.insertText', () => {
  jest.useFakeTimers();

  afterAll(() => {
    jest.useRealTimers();
  });

  it('can insert text with marks', () => {
    const editor = renderEditor<BoldExtension>([new BoldExtension()]);
    const { doc, p } = editor.nodes;
    const { bold } = editor.marks;

    editor.add(doc(p('awesome <cursor>')));
    editor.commands.insertText('hello there', {
      marks: {
        bold: {},
      },
    });

    expect(editor.doc).toEqualProsemirrorNode(doc(p('awesome ', bold('hello there'))));
  });

  it('can insert a range of text', () => {
    const editor = renderEditor<never>([]);
    const { doc, p } = editor.nodes;

    editor.add(doc(p('my <cursor>content')));
    editor.commands.insertText('awesome ');

    expect(editor.doc).toEqualProsemirrorNode(doc(p('my awesome content')));

    editor.commands.insertText('all ', { from: 1 });

    expect(editor.doc).toEqualProsemirrorNode(doc(p('all my awesome content')));
  });

  it('can insert text asynchronously', async () => {
    const editor = renderEditor<never>([]);
    const { doc, p } = editor.nodes;
    editor.add(doc(p('my <cursor>CODE!')));
    const promise = sleep(100).then(() => 'AWESOME ');
    editor.commands.insertText(() => promise);

    editor.selectText('end').press('Enter').insertText('More text here.');

    jest.runAllTimers();
    await promise;

    expect(editor.view.state.doc).toEqualRemirrorDocument(
      doc(p('my AWESOME CODE!'), p('More text here.')),
    );
  });

  it('can recover after a rejected promise', async () => {
    const editor = renderEditor<never>([]);
    const { doc, p } = editor.nodes;
    editor.add(doc(p('my <cursor>CODE!')));
    const promise = Promise.reject();
    editor.commands.insertText(() => promise);
    editor.selectText('end').press('Enter').insertText('More text here.');

    await expect(promise).toReject();
    expect(editor.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        my CODE!
      </p>
      <p>
        More text here.
      </p>
    `);
  });
});

describe('setContent', () => {
  it('can set the content while preserving history', () => {
    const editor = renderEditor<never>([], { stringHandler: 'html' });
    const { doc, p } = editor.nodes;
    editor.add(doc(p('my content')));

    editor.commands.setContent('<p>new content</p>', 'start');

    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('new content')));
    editor.commands.undo();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('my content')));
  });

  it('can reset the content while preserving history', () => {
    const editor = renderEditor<never>([], { stringHandler: 'html' });
    const { doc, p } = editor.nodes;
    editor.add(doc(p('my content')));

    editor.commands.resetContent();

    expect(editor.state.doc).toEqualProsemirrorNode(doc(p()));
    editor.commands.undo();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('my content')));
  });
});

describe('removeMark', () => {
  it('can remove a mark by named type', () => {
    const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;

    editor.add(doc(p('<start>my ', bold('bold ', italic('italic')), ' content<end>')));

    editor.commands.removeMark({ type: 'italic' });

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(p('my ', bold('bold italic'), ' content')),
    );
  });

  it('can remove multiple marks ranges by named type', () => {
    const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;

    editor.add(
      doc(
        p(
          '<start>my ',
          bold('bold ', italic('italic')),
          ' content ',
          italic('with'),
          ' a ',
          bold('bold'),
          ' suffix<end>',
        ),
      ),
    );

    editor.commands.removeMark({ type: 'bold' });

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(p('my bold ', italic('italic'), ' content ', italic('with'), ' a bold suffix')),
    );
  });

  it('can remove all marks by passing type === null', () => {
    const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;

    editor.add(doc(p('<start>my ', bold('bold ', italic('italic')), ' content<end>')));

    editor.commands.removeMark({ type: null });

    expect(editor.state.doc).toEqualRemirrorDocument(doc(p('my bold italic content')));
  });

  it('can remove multiple marks ranges when passing type === null', () => {
    const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;

    editor.add(
      doc(
        p(
          '<start>my ',
          bold('bold ', italic('italic')),
          ' content ',
          italic('with'),
          ' a ',
          bold('bold'),
          ' suffix<end>',
        ),
      ),
    );

    editor.commands.removeMark({ type: null });

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(p('my bold italic content with a bold suffix')),
    );
  });
});
