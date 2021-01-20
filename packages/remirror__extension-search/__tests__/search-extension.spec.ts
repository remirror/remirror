import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { SearchExtension, SearchOptions } from '../';

extensionValidityTest(SearchExtension);

function create(options?: SearchOptions) {
  const {
    add,
    nodes: { p, doc },
    view,
    commands,
  } = renderEditor([new SearchExtension(options)]);
  const node = doc(p('welcome'), p('friend'), p('hello'), p('welcome friend'));

  return { add, p, doc, view, commands, node };
}

describe('commands', () => {
  it('#find', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.search('welcome');
    expect(view.dom).toMatchSnapshot();

    commands.searchNext();
    expect(view.dom).toMatchSnapshot();

    commands.searchPrevious();
    expect(view.dom).toMatchSnapshot();
  });

  it('#replace', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.search('we');
    commands.replaceSearchResult('me');
    expect(view.dom).toMatchSnapshot();
  });

  it('#findNext, #replace', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.search('e');
    commands.searchNext();
    commands.replaceSearchResult('E');
    expect(view.dom).toHaveTextContent('welcomE');

    commands.replaceSearchResult('E');
    expect(view.dom).toHaveTextContent('friEnd');

    commands.search('hello');
    commands.replaceSearchResult('goodbye');
    expect(view.dom).toHaveTextContent('goodbye');
    expect(view.dom).toMatchSnapshot();

    commands.replaceSearchResult('abcd');
    expect(view.dom).not.toHaveTextContent('abcd');
  });

  it('#replaceAll', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.search('friend');
    expect(commands.replaceAllSearchResults.isEnabled('')).toBeTrue();

    commands.replaceAllSearchResults('enemy');
    expect(view.dom).toMatchSnapshot();

    expect(commands.replaceAllSearchResults.isEnabled('')).toBeFalse();
  });

  it('#clearSearch', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.search('friend');
    commands.clearSearch();
    expect(view.dom).toMatchSnapshot();
  });
});
