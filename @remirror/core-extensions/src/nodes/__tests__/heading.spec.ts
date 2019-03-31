import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { Bold } from '../../marks';
import { Heading, HeadingOptions } from '../heading';

describe('schema', () => {
  const schema = createBaseTestManager([{ extension: new Heading(), priority: 1 }]).createSchema();
  const { h1, h2, h3, doc } = pmBuild(schema, {
    h1: { nodeType: 'heading' },
    h2: { nodeType: 'heading', level: 2 },
    h3: { nodeType: 'heading', level: 3 },
  });

  it('defaults to level 1', () => {
    expect(toHTML({ node: h1('Heading'), schema })).toBe('<h1>Heading</h1>');
  });

  it('changes level based on attributes', () => {
    expect(toHTML({ node: h2('Heading'), schema })).toBe('<h2>Heading</h2>');
    expect(toHTML({ node: h3('Heading'), schema })).toBe('<h3>Heading</h3>');
  });

  it('it can parse content', () => {
    const node = fromHTML({ content: '<h2>Hello</h2>', schema });
    const expected = doc(h2('Hello'));
    expect(node).toEqualPMNode(expected);
  });
});

describe('plugins', () => {
  const create = (params: HeadingOptions = {}) =>
    renderEditor({
      attrNodes: [new Heading({ ...params })],
      plainNodes: [],
      plainMarks: [new Bold()],
    });

  it('falls back to the default level when unsupported level passed through', () => {
    const {
      attrNodes: { heading },
      add,
      utils: { baseElement },
      nodes: { doc },
    } = create({ levels: [1, 2], defaultLevel: 2 });
    const h5 = heading({ level: 5 });
    add(doc(h5('Heading<cursor>')));

    expect(baseElement).toContainHTML('<h2>Heading</h2>');
  });

  it('shows the heading as active', () => {
    const {
      attrNodes: { heading },
      add,
      nodes: { doc },
      actions,
    } = create();
    const h5 = heading({ level: 5 });
    add(doc(h5('<cursor>Heading')));

    expect(actions.heading.isActive({ level: 5 })).toBeTrue();
  });

  it('responds to keyboard shortcuts', () => {
    const {
      attrNodes: { heading },
      add,
      nodes: { doc, paragraph: p },
    } = create();
    const h1 = heading({ level: 1 });
    const h3 = heading({ level: 3 });
    const text = 'Welcome to the jungle';
    expect(add(doc(p(`<cursor>${text}`))).shortcut('Shift-Ctrl-1').state).toContainRemirrorDocument(h1(text));
    expect(add(doc(p(`<cursor>${text}`))).shortcut('Shift-Ctrl-3').state).toContainRemirrorDocument(h3(text));
  });
});
