import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { isNodeSelection, isTextSelection } from '@remirror/core';

import { HorizontalRuleExtension } from '../';

extensionValidityTest(HorizontalRuleExtension);

describe('insertHorizontalRule', () => {
  it('can insert into the middle of content', () => {
    const { add, nodes, commands, view } = renderEditor([new HorizontalRuleExtension()]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This <cursor>is content')));
    commands.insertHorizontalRule();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This '), hr(), p('is content')));
    expect(isTextSelection(view.state.selection)).toBe(true);
  });

  it('adds a trailing node when at the end of a block node', () => {
    const { add, nodes, commands, view } = renderEditor([new HorizontalRuleExtension()]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content<cursor>')));
    commands.insertHorizontalRule();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content'), hr(), p()));
    expect(isTextSelection(view.state.selection)).toBe(true);
  });

  it('does not add a trailing node when set to false', () => {
    const { add, nodes, commands, view } = renderEditor([
      new HorizontalRuleExtension({ insertionNode: false }),
    ]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content<cursor>')));
    commands.insertHorizontalRule();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content'), hr()));
    expect(isNodeSelection(view.state.selection)).toBe(true);
  });

  it('can insert multiple horizontal rules without clashes', () => {
    const { add, nodes, commands, view, insertText } = renderEditor([
      new HorizontalRuleExtension({}),
    ]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content<cursor>')));
    commands.insertHorizontalRule();
    commands.insertHorizontalRule();
    commands.insertHorizontalRule();
    commands.insertHorizontalRule();

    const initialExpected = doc(p('This is content'), hr(), hr(), hr(), hr(), p());
    const finalExpected = doc(p('This is content'), hr(), hr(), hr(), hr(), p(' amazing!'));

    expect(view.state.doc).toEqualRemirrorDocument(initialExpected);
    expect(view.state.selection.$anchor.parent.type.name).toBe('paragraph');
    expect(view.state.selection.anchor).toBe(22);

    insertText(' amazing!');
    expect(view.state.doc).toEqualRemirrorDocument(finalExpected);
  });

  it('does not split content when adding the hr', () => {
    const editor = renderEditor([new HorizontalRuleExtension()]);
    const { add, nodes, view } = editor;
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('Hello'), p('<cursor>'), p('ABC'), p('123'))).commands.insertHorizontalRule();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello'), hr(), p(), p('ABC'), p('123')));
    expect(view.state.selection.from).toBe(9);

    editor.insertText('More');

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(p('Hello'), hr(), p('More'), p('ABC'), p('123')),
    );
  });
});

describe('inputRules', () => {
  it('adds a trailing node by default', () => {
    const { add, nodes, view, insertText } = renderEditor([new HorizontalRuleExtension()]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content'), p('<cursor>'))).insertText('---');
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content'), hr(), p()));

    insertText('Amazing!');
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content'), hr(), p('Amazing!')));
  });

  it('does not add a trailing node when set to false', () => {
    const { add, nodes, view } = renderEditor([
      new HorizontalRuleExtension({ insertionNode: false }),
    ]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content'), p('<cursor>'))).insertText('---');

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content'), hr()));
    expect(isNodeSelection(view.state.selection)).toBe(true);
  });

  it('can insert multiple horizontal rules without clashes', () => {
    const { add, nodes, view, insertText } = renderEditor([new HorizontalRuleExtension({})]);
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('This is content'), p('<cursor>')))
      .insertText('---')
      .insertText('---')
      .insertText('---')
      .insertText('---');

    const initialExpected = doc(p('This is content'), hr(), hr(), hr(), hr(), p());
    const finalExpected = doc(p('This is content'), hr(), hr(), hr(), hr(), p(' amazing!'));

    expect(view.state.doc.toJSON()).toEqual(initialExpected.toJSON());
    expect(view.state.selection.$anchor.parent.type.name).toBe('paragraph');
    expect(view.state.selection.anchor).toBe(22);

    insertText(' amazing!');
    expect(view.state.doc.toJSON()).toEqual(finalExpected.toJSON());
  });

  it('can split content at the start of line', () => {
    const editor = renderEditor([new HorizontalRuleExtension()]);
    const { add, nodes, view } = editor;
    const { doc, horizontalRule: hr, p } = nodes;

    add(doc(p('<cursor>a'))).insertText('---');
    expect(view.state.doc).toEqualRemirrorDocument(doc(hr(), p('a')));
    expect(view.state.selection.from).toBe(2);

    editor.insertText('hello ');
    expect(view.state.doc).toEqualRemirrorDocument(doc(hr(), p('hello a')));
  });
});
