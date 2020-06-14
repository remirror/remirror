import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/test-fixtures';

import { SearchExtension, SearchOptions } from '..';

test('is valid', () => {
  expect(isExtensionValid(SearchExtension, {}));
});

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
  test('#find', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('welcome');
    expect(view.dom).toMatchSnapshot();

    commands.findNext();
    expect(view.dom).toMatchSnapshot();

    commands.findPrevious();
    expect(view.dom).toMatchSnapshot();
  });

  test('#replace', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('we');
    commands.replace('me');
    expect(view.dom).toMatchSnapshot();
  });

  test('#replaceAll', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('friend');
    commands.replaceAll('enemy');
    expect(view.dom).toMatchSnapshot();
  });

  test('#clearSearch', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('friend');
    commands.clearSearch();
    expect(view.dom).toMatchSnapshot();
  });
});
