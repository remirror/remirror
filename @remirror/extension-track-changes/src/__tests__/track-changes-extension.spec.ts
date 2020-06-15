import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/test-fixtures';

import { TrackChangesExtension, TrackChangesOptions } from '..';

test('is valid', () => {
  expect(isExtensionValid(TrackChangesExtension, {}));
});

function create(options?: TrackChangesOptions) {
  const {
    add,
    nodes: { p, doc },
    view,
    commands,
    helpers,
  } = renderEditor([new TrackChangesExtension(options)]);
  const node = doc(p('This is not yet committed'));

  return { add, p, doc, view, commands, node, helpers };
}

test('#commitChange', () => {
  const { add, commands, node, helpers } = create();

  const { insertText } = add(node);

  commands.commitChange('first commit');
  expect(helpers.getCommits()).toHaveLength(1);

  insertText('\nmore stuff');
  commands.commitChange('commit two');

  expect(helpers.getCommits().map((commit) => commit.message)).toMatchInlineSnapshot(`
    Array [
      "first commit",
      "commit two",
    ]
  `);
});

describe('#revertCommit', () => {
  it('can revert the commit', () => {
    const { add, commands, node, helpers, view } = create();

    const { insertText } = add(node);
    commands.commitChange('first commit');

    insertText('\nmore stuff');
    commands.commitChange('commit two');

    commands.revertCommit();

    expect(helpers.getCommits().map((commit) => commit.message)).toMatchInlineSnapshot(`
      Array [
        "first commit",
        "commit two",
        "Revert: 'commit two'",
      ]
    `);

    expect(view.state.doc).toEqualRemirrorDocument(node);
  });

  it('can revert any of the commits', () => {
    const { add, commands, node, helpers, view, doc, p } = create();

    const { insertText } = add(node);
    commands.commitChange('first commit');

    insertText('\nmore stuff');
    commands.commitChange('commit two');
    insertText(' final changes');
    commands.commitChange('final commit');

    const commit = helpers.getCommit(1);
    commands.revertCommit(commit);

    expect(helpers.getCommits().map((commit) => commit.message)).toMatchInlineSnapshot(`
      Array [
        "first commit",
        "commit two",
        "final commit",
        "Revert: 'commit two'",
      ]
    `);

    expect(view.state.doc).toEqualRemirrorDocument(
      doc(p('This is not yet committed final changes')),
    );
  });

  it.todo('test when the first commit is reverted');
});
