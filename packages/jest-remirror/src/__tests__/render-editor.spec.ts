import { toHTML } from '@remirror/core';
import { Blockquote, Bold, Heading, Link } from '@remirror/core-extensions';
import { renderEditor } from '../render-editor';

test('renders an editor into the dom', () => {
  const {
    utils: { getByRole },
  } = renderEditor();
  const editor = getByRole('textbox');
  expect(editor).toBeVisible();
});

test('allows for injection of basic content', () => {
  const expected = 'This is a p';
  const {
    view,
    nodes: { doc, p },
    add,
  } = renderEditor({ plainNodes: [] }); // TODO for some reason typescript autocomplete on plain nodes doesn't work without at least an empty array
  add(doc(p(expected)));
  expect(view.dom).toHaveTextContent(expected);
});

test('can be configured with plain node extensions', () => {
  const expected = 'A simple blockquote';
  const {
    view: { dom },
    nodes: { blockquote, doc, p },
    add,
  } = renderEditor({ plainNodes: [new Blockquote()] });
  add(doc(blockquote(p(expected)), p('This is a p')));
  expect(dom).toHaveTextContent('A simple blockquote');
});

test('can be configured with plain node extensions', () => {
  const expected = 'A simple blockquote';
  const {
    view: { dom },
    nodes: { blockquote, doc, p },
    add,
  } = renderEditor({ plainNodes: [new Blockquote()] });
  add(doc(blockquote(p(expected)), p('This is a p')));
  expect(dom).toHaveTextContent('A simple blockquote');
});

test('can be configured with attribute node extensions', () => {
  const expected = 'A heading';
  const {
    view: { dom },
    schema,
    nodes: { doc },
    attrNodes: { heading },
    add,
  } = renderEditor({ attrNodes: [new Heading()] });

  const h3 = heading({ level: 3 });
  const h2 = heading({ level: 2 });
  add(doc(h2(expected), h3(expected)));
  expect(dom).toContainHTML(toHTML({ node: h3(expected), schema }));
  expect(dom).toContainHTML(toHTML({ node: h2(expected), schema }));
});

test('can be configured with plain mark extensions', () => {
  const expected = 'BOLD';
  const {
    view: { dom },
    nodes: { doc, p },
    add,
    marks: { bold },
  } = renderEditor({ plainNodes: [], plainMarks: [new Bold()] });
  add(doc(p('Text is ', bold(expected))));
  expect(dom.querySelector('strong')!.innerText).toBe(expected);
});

test('can be configured with attribute mark extensions', () => {
  const expected = 'google';
  const href = 'https://google.com';
  const {
    view: { dom },
    nodes: { doc, p },
    add,
    attrMarks: { link },
  } = renderEditor({ attrMarks: [new Link()] });
  const googleLink = link({ href });
  add(doc(p('Link to ', googleLink(expected))));

  const linkElement = dom.querySelector('a');
  expect(linkElement).toHaveAttribute('href', href);
  expect(linkElement).toHaveTextContent(expected);
});

describe('add', () => {
  const params = { plainMarks: [new Bold()], plainNodes: [] };
  let {
    view: { dom },
    schema,
    nodes: { doc, p },
    marks: { bold },
    add,
  } = renderEditor(params);

  beforeEach(() => {
    ({
      view: { dom },
      schema,
      nodes: { doc, p },
      marks: { bold },
      add,
    } = renderEditor({ plainNodes: [], plainMarks: [new Bold()] }));
  });

  it('overwrites the whole doc on each call', () => {
    const node = p('Hello');
    const nodeTwo = p('Tolu');
    const expected = toHTML({ node, schema });
    const expectedTwo = toHTML({ node: nodeTwo, schema });

    add(doc(node));
    expect(dom).toContainHTML(expected);

    add(doc(nodeTwo));
    expect(dom).toContainHTML(expectedTwo);
    expect(dom).not.toContainHTML(expected);
  });

  it('can be chained', () => {
    const node = p('New me');
    add(doc(p('Hello'))).overwrite(doc(node));
    expect(dom).toContainHTML(toHTML({ node, schema }));
  });

  it('can insert text', () => {
    const expected = 'Welcome friend';
    add(doc(p('Welcome <cursor>'))).insertText('friend');
    expect(dom).toHaveTextContent(expected);
  });

  it('can fire a shortcut', () => {
    const node = p(bold('Welcome'));
    add(doc(p('<start>Welcome<end>'))).shortcut('Mod-b');
    expect(dom).toContainHTML(toHTML({ node, schema }));
  });

  it('can replace text with text', () => {
    const expected = 'Today is a happy day';
    add(doc(p('Today is a <start>sad<end> day'))).replace('happy');
    expect(dom).toHaveTextContent(expected);
  });

  it('can replace text with nodes', () => {
    const node = p('Brilliant');
    const nodeTwo = p('Wonderful');
    const expected = toHTML({ node, schema });
    const expectedTwo = toHTML({ node: nodeTwo, schema });
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
  } = renderEditor({ plainNodes: [] });

  beforeEach(() => {
    ({
      view,
      nodes: { doc, p },
      add,
    } = renderEditor({ plainNodes: [] }));
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
    // ? Crashes if node is placed at the beginning of the p
    const { start, end } = add(doc(p('Hello'), p('T<node>ext here')));
    expect(start).toBe(9);
    expect(start).toBe(view.state.selection.from);
    expect(end).toBe(17);
    expect(end).toBe(view.state.selection.to);
  });
});
