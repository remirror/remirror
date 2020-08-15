import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { isNodeSelection, isTextSelection } from '@remirror/core';

import { HorizontalRuleExtension } from '..';

extensionValidityTest(HorizontalRuleExtension);

describe('insertHorizontalRule', () => {
  it('adds a trailing node by default', () => {
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

    expect(view.state.doc.toJSON()).toEqual(initialExpected.toJSON());
    expect(view.state.selection.$anchor.parent.type.name).toBe('paragraph');
    expect(view.state.selection.anchor).toBe(22);

    insertText(' amazing!');
    expect(view.state.doc.toJSON()).toEqual(finalExpected.toJSON());
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
});
