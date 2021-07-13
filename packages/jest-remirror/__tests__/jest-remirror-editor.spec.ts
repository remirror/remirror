import {
  BlockquoteExtension,
  BoldExtension,
  HeadingExtension,
  LinkExtension,
} from 'remirror/extensions';
import { cleanup } from 'testing/react';
import { PlainExtension, prosemirrorNodeToHtml } from '@remirror/core';
import { NodeSelection } from '@remirror/pm/state';

import { renderEditor } from '../';

beforeEach(cleanup);

test('renders an editor into the dom', () => {
  const { view } = renderEditor([]);

  expect(view.dom).toBeVisible();
});

test('add content', () => {
  const expected = 'This is a p';
  const {
    view,
    nodes: { doc, p },
    add,
  } = renderEditor([]);
  add(doc(p(expected)));

  expect(view.dom).toHaveTextContent(expected);
});

test('can be configured with plain node extensions', () => {
  const expected = 'A simple blockquote';
  const {
    view: { dom },
    nodes: { blockquote, doc, p },
    add,
  } = renderEditor([new BlockquoteExtension()]);
  add(doc(blockquote(p(expected)), p('This is a p')));

  expect(dom).toHaveTextContent('A simple blockquote');
});

test('can be configured with attribute node extensions', () => {
  const expected = 'A heading';
  const {
    view: { dom },
    nodes: { doc },
    attributeNodes: { heading },
    add,
  } = renderEditor([new HeadingExtension()]);

  const h3 = heading({ level: 3 });
  const h2 = heading({ level: 2 });
  add(doc(h2(expected), h3(expected)));

  expect(dom).toContainHTML(prosemirrorNodeToHtml(h3(expected)));
  expect(dom).toContainHTML(prosemirrorNodeToHtml(h2(expected)));
});

test('can be configured with plain mark extensions', () => {
  const expected = 'BOLD';
  const {
    view: { dom },
    nodes: { doc, p },
    add,
    marks: { bold },
  } = renderEditor([new BoldExtension()]);
  add(doc(p('Text is ', bold(expected))));

  expect(dom.querySelector('strong')!.textContent).toBe(expected);
});

test('can be configured with attribute mark extensions', () => {
  const expected = 'google';
  const href = 'https://google.com';
  const {
    view: { dom },
    nodes: { doc, p },
    add,
    attributeMarks: { link },
  } = renderEditor([new LinkExtension()]);
  const googleLinkExtension = link({ href });
  add(doc(p('LinkExtension to ', googleLinkExtension(expected))));

  const linkElement = dom.querySelector('a');

  expect(linkElement).toHaveAttribute('href', href);
  expect(linkElement).toHaveTextContent(expected);
});

const tripleClickMock = jest.fn(() => false);
const doubleClickMock = jest.fn(() => false);
const clickMock = jest.fn(() => false);

class CustomExtension extends PlainExtension {
  get name() {
    return 'custom' as const;
  }

  createPlugin() {
    return {
      props: {
        handleTripleClick: tripleClickMock,
        handleDoubleClick: doubleClickMock,
        handleClick: clickMock,
      },
    };
  }
}

function create() {
  return renderEditor([new BoldExtension(), new CustomExtension()], {
    builtin: { persistentSelectionClass: undefined },
  });
}

describe('add', () => {
  let {
    view: { dom },
    nodes: { doc, p },
    marks: { bold },
    add,
  } = create();

  beforeEach(() => {
    ({
      view: { dom },
      nodes: { doc, p },
      marks: { bold },
      add,
    } = create());
  });

  it('overwrites the whole doc on each call', () => {
    const node = p('Hello');
    const nodeTwo = p('Tolu');
    const expected = prosemirrorNodeToHtml(node);
    const expectedTwo = prosemirrorNodeToHtml(nodeTwo);

    add(doc(node));
    expect(dom).toContainHTML(expected);

    add(doc(nodeTwo));
    expect(dom).toContainHTML(expectedTwo);
    expect(dom).not.toContainHTML(expected);
  });

  it('can be chained', () => {
    const node = p('New me');
    add(doc(p('Hello'))).overwrite(doc(node));

    expect(dom).toContainHTML(prosemirrorNodeToHtml(node));
  });

  it('can insert text', () => {
    const expected = 'Welcome friend';
    add(doc(p('Welcome <cursor>'))).insertText('friend');

    expect(dom).toHaveTextContent(expected);
  });

  it('can use keyboard shortcuts', () => {
    const node = p(bold('Welcome'));
    add(doc(p('<start>Welcome<end>'))).shortcut('Mod-b');

    expect(dom).toContainHTML(prosemirrorNodeToHtml(node));
  });

  it('can fire custom events', () => {
    add(doc(p('Simple'))).fire({ event: 'dblClick' });

    expect(doubleClickMock).toHaveBeenCalled();

    add(doc(p('Simple'))).fire({ event: 'click' });

    expect(clickMock).toHaveBeenCalled();

    add(doc(p('Simple'))).fire({ event: 'tripleClick' as any });

    expect(tripleClickMock).toHaveBeenCalled();
  });

  it('can replace text with text', () => {
    const expected = 'Today is a happy day';
    add(doc(p('Today is a <start>sad<end> day'))).replace('happy');

    expect(dom).toHaveTextContent(expected);
  });

  it('can replace text with nodes', () => {
    const node = p('Brilliant');
    const nodeTwo = p('Wonderful');
    const expected = prosemirrorNodeToHtml(node);
    const expectedTwo = prosemirrorNodeToHtml(nodeTwo);
    add(doc(p('Today is a <start>sad<end> day'))).replace(node, nodeTwo);

    expect(dom).toContainHTML(expected);
    expect(dom).toContainHTML(expectedTwo);
  });
});

describe('tags', () => {
  let {
    view,
    nodes: { doc, p },
    add,
  } = renderEditor([]);

  beforeEach(() => {
    ({
      view,
      nodes: { doc, p },
      add,
    } = renderEditor([]));
  });

  it('supports <cursor>', () => {
    const { start, end } = add(doc(p('This is a <cursor>position')));

    expect(start).toBe(11);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(11);
    expect(end).toBe(view.state.selection.to);
  });

  it('supports <start>', () => {
    const { start, end } = add(doc(p('This is a <start>position')));

    expect(start).toBe(11);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(19);
    expect(end).toBe(view.state.selection.to);
  });

  it('supports <start> / <end>', () => {
    const { start, end } = add(doc(p('This is a <start>pos<end>ition')));

    expect(start).toBe(11);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(14);
    expect(end).toBe(view.state.selection.to);
  });

  it('supports <all>', () => {
    const { start, end } = add(doc(p('This is an <all>position')));

    expect(start).toBe(0);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(21);
    expect(end).toBe(view.state.selection.to);
  });

  it('supports <node>', () => {
    const { start, end, state } = add(doc(p('Hello'), p('<node>Text here')));

    expect(state.selection).toBeInstanceOf(NodeSelection);
    expect(start).toBe(7);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(18);
    expect(end).toBe(view.state.selection.to);
  });
});
