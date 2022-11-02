import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { FindExtension, FindOptions } from '../';

extensionValidityTest(FindExtension);

function create(options?: FindOptions) {
  const {
    add,
    nodes: { p, doc },
    view,
    commands,
    helpers,
  } = renderEditor<FindExtension>([new FindExtension(options)]);
  const node = doc(p('Welcome'), p('friend'), p('welcome friend'));
  add(node);
  return { p, doc, view, commands, helpers, node, add };
}

describe('helpers and commands', () => {
  it('find', () => {
    const { view, helpers } = create();

    let result = helpers.find({ text: 'welcome', caseSensitive: true });
    expect(result.activeIndex).toBeUndefined();
    expect(result.ranges).toHaveLength(1);
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Welcome
      </p>
      <p>
        friend
      </p>
      <p>
        <span style="background-color: yellow;">
          welcome
        </span>
        friend
      </p>
    `);

    result = helpers.find({ text: 'friend', activeIndex: -1 });
    expect(result.activeIndex).toBe(1);
    expect(result.ranges).toHaveLength(2);
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Welcome
      </p>
      <p>
        <span style="background-color: yellow;">
          friend
        </span>
      </p>
      <p>
        welcome
        <span style="background-color: orange;">
          friend
        </span>
      </p>
    `);
  });

  it('can handle invalid regexp', () => {
    const { add, doc, p, helpers } = create();

    // C++ is an invalid regexp
    const text = 'C++';
    expect(() => new RegExp(text)).toThrow();
    add(doc(p('C++'), p('++C C++')));
    expect(helpers.find({ text }).ranges).toHaveLength(2);
  });

  it('can handle a regexp-like find term', () => {
    const { add, doc, p, helpers } = create();

    const text = '.*';
    expect(() => new RegExp(text)).not.toThrow();
    add(doc(p('Hello world'), p('')));

    // This find term should not be treat as a regexp and it should not match anything
    expect(helpers.find({ text }).ranges).toHaveLength(0);

    add(doc(p('Hello world'), p('.*')));
    expect(helpers.find({ text }).ranges).toHaveLength(1);
  });

  it('findAndReplace', () => {
    const { view, commands } = create();
    commands.findAndReplace({
      text: 'friend',
      caseSensitive: true,
      replacement: 'FRIEND',
    });
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Welcome
      </p>
      <p>
        FRIEND
      </p>
      <p>
        welcome
        <span style="background-color: yellow;">
          friend
        </span>
      </p>
    `);
  });

  it('findAndReplaceAll', () => {
    const { view, commands } = create();
    commands.findAndReplaceAll({
      text: 'friend',
      caseSensitive: false,
      replacement: 'FRIEND',
    });
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Welcome
      </p>
      <p>
        FRIEND
      </p>
      <p>
        welcome FRIEND
      </p>
    `);
  });

  it('clearResult', () => {
    const { view, commands } = create();
    commands.startFind({ text: 'friend' });
    expect(view.dom.innerHTML).toContain('background-color');
    commands.stopFind();
    expect(view.dom.innerHTML).not.toContain('background-color');
  });
});
