import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { entries, GetHandler } from '@remirror/core';

import { DiffExtension, DiffOptions } from '../';

extensionValidityTest(DiffExtension);

function create(options?: DiffOptions, handlers: GetHandler<DiffOptions> = {}) {
  const extension = new DiffExtension(options);
  const {
    add,
    nodes: { p, doc },
    view,
    commands,
    helpers,
  } = renderEditor([extension]);
  const node = doc(p('This is not yet committed'));

  for (const [name, handler] of entries(handlers)) {
    extension.addHandler(name, handler);
  }

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
});

describe('#highlightCommit', () => {
  it('can highlight and remove highlights from commits', () => {
    const { add, commands, node, view } = create();

    const { insertText } = add(node);
    commands.commitChange('first commit');
    insertText(' more stuff');
    commands.commitChange('commit two');
    insertText(' final changes');
    commands.commitChange('final commit');

    commands.highlightCommit(1);
    expect(view.dom).toMatchSnapshot();

    commands.highlightCommit('last');
    expect(view.dom).toMatchSnapshot();

    commands.removeHighlightedCommit('last');
    expect(view.dom).toMatchSnapshot();
  });
});

describe('handlers', () => {
  it('can call selection handlers', () => {
    const mocks = { onSelectCommits: jest.fn(), onDeselectCommits: jest.fn() };
    const { add, commands, node } = create(undefined, mocks);
    const { insertText } = add(node);

    commands.commitChange('first commit');

    insertText(' welcome');
    commands.commitChange('commit two');
    expect(mocks.onSelectCommits).toHaveBeenCalled();

    insertText(' not committed').jumpTo('end');

    // TODO this is broken
    expect(mocks.onDeselectCommits).toHaveBeenCalledTimes(1);
  });
});
