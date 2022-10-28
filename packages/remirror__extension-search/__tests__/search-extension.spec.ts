import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { SearchExtension, SearchOptions } from '../';

extensionValidityTest(SearchExtension);

function create(options?: SearchOptions) {
  const {
    add,
    nodes: { p, doc },
    view,
    commands,
    helpers,
  } = renderEditor<SearchExtension>([new SearchExtension(options)]);
  const node = doc(p('Welcome'), p('friend'), p('welcome friend'));
  add(node);
  return { p, doc, view, commands, helpers, node, add };
}

describe('helpers and commands', () => {
  it('search', () => {
    const { view, helpers } = create();

    let result = helpers.search({ searchTerm: 'welcome', caseSensitive: true });
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

    result = helpers.search({ searchTerm: 'friend', activeIndex: -1 });
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
    const searchTerm = 'C++';
    expect(() => new RegExp(searchTerm)).toThrow();
    add(doc(p('C++'), p('++C C++')));
    expect(helpers.search({ searchTerm }).ranges).toHaveLength(2);
  });

  it('can handle a regexp-like search term', () => {
    const { add, doc, p, helpers } = create();

    const searchTerm = '.*';
    expect(() => new RegExp(searchTerm)).not.toThrow();
    add(doc(p('Hello world'), p('')));

    // This search term should not be treat as a regexp and it should not match anything
    expect(helpers.search({ searchTerm }).ranges).toHaveLength(0);

    add(doc(p('Hello world'), p('.*')));
    expect(helpers.search({ searchTerm }).ranges).toHaveLength(1);
  });

  it('replaceSearchResult', () => {
    const { view, commands } = create();
    commands.startSearch({ searchTerm: 'friend', caseSensitive: true });
    commands.replaceSearchResult({ replacement: 'FRIEND' });
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

  it('replaceAllSearchResults', () => {
    const { view, commands } = create();
    commands.startSearch({ searchTerm: 'friend', caseSensitive: false });
    commands.replaceAllSearchResults({ replacement: 'FRIEND' });
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
    commands.startSearch({ searchTerm: 'friend' });
    expect(view.dom.innerHTML).toContain('background-color');
    commands.stopSearch();
    expect(view.dom.innerHTML).not.toContain('background-color');
  });
});
