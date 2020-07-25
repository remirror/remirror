import { renderEditor } from 'jest-remirror';

import { isNodeSelection, isTextSelection } from '@remirror/core';
import { isExtensionValid } from '@remirror/testing';

import { HorizontalRuleExtension } from '..';

test('`HorizontalRuleExtension`: is valid', () => {
  expect(isExtensionValid(HorizontalRuleExtension)).toBeTrue();
});

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
});
