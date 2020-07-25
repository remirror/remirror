import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/testing';

import { SearchExtension, SearchOptions } from '..';

test('`SearchExtension`: is valid', () => {
  expect(isExtensionValid(SearchExtension)).toBeTrue();
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

  test('#findNext, #replace', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('e');
    commands.findNext();
    commands.replace('E');
    expect(view.dom).toHaveTextContent('welcomE');

    commands.replace('E');
    expect(view.dom).toHaveTextContent('friEnd');

    commands.find('hello');
    commands.replace('goodbye');
    expect(view.dom).toHaveTextContent('goodbye');
    expect(view.dom).toMatchSnapshot();

    commands.replace('abcd');
    expect(view.dom).not.toHaveTextContent('abcd');
  });

  test('#replaceAll', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('friend');
    expect(commands.replaceAll.isEnabled()).toBeTrue();

    commands.replaceAll('enemy');
    expect(view.dom).toMatchSnapshot();

    expect(commands.replaceAll.isEnabled()).toBeFalse();
  });

  test('#clearSearch', () => {
    const { view, add, commands, node } = create();
    add(node);

    commands.find('friend');
    commands.clearSearch();
    expect(view.dom).toMatchSnapshot();
  });
});
