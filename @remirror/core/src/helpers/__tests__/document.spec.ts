import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import domino from 'domino';
import {
  atomInline,
  blockquote,
  createEditor,
  doc,
  em,
  h2,
  hardBreak,
  p,
  pm,
  schema as testSchema,
  table,
  tableRow,
} from 'jest-prosemirror';
import { TextSelection } from 'prosemirror-state';
import { NodeMatch } from '../../types';
import {
  atDocEnd,
  atDocStart,
  canInsertNode,
  createDocumentNode,
  endPositionOfParent,
  fromHTML,
  getCursor,
  getMarkAttrs,
  getMarkRange,
  getNearestNonTextNode,
  isDocNode,
  isDocNodeEmpty,
  isElementDOMNode,
  isObjectNode,
  isProsemirrorNode,
  isTextDOMNode,
  isTextSelection,
  markActive,
  nodeActive,
  nodeNameMatchesList,
  startPositionOfParent,
  toDOM,
  toHTML,
} from '../document';

describe('markActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is <cursor>italic'), ' here')));
    expect(markActive(state, schema.marks.em)).toBeTrue();
  });

  it('returns false when not within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something<cursor>', em('is italic'), ' here')));
    expect(markActive(state, schema.marks.em)).toBeFalse();
  });

  it('returns true when surrounding an active region', () => {
    const { state, schema } = createEditor(doc(p('Something<start>', em('is italic'), '<end> here')));
    expect(markActive(state, schema.marks.em)).toBeTrue();
  });
});

describe('nodeActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something', blockquote('is <cursor>in blockquote'))));
    expect(nodeActive(state, schema.nodes.blockquote)).toBeTrue();
  });

  it('returns false when not within the node', () => {
    const { state, schema } = createEditor(doc(p('Something<cursor>', blockquote('hello'))));
    expect(nodeActive(state, schema.nodes.blockquote)).toBeFalse();
  });

  it('returns false with text selection surrounds the node', () => {
    const { state, schema } = createEditor(doc(p('Something<start>', blockquote('is italic'), '<end> here')));
    expect(nodeActive(state, schema.nodes.blockquote)).toBeFalse();
  });

  it('returns true when node selection directly before node', () => {
    const { state, schema } = createEditor(doc(p('Something<node>', blockquote('is italic'), 'here')));
    expect(nodeActive(state, schema.nodes.blockquote)).toBeTrue();
  });

  it('returns false nested within other nodes', () => {
    const { state, schema } = createEditor(doc(p('a<node>', p(p(blockquote('is italic')), 'here'))));
    expect(nodeActive(state, schema.nodes.blockquote)).toBeFalse();
  });

  it("returns false when attributes don't match", () => {
    const { state, schema } = createEditor(doc(p('Something<node>', h2('is heading'), 'here')));
    expect(nodeActive(state, schema.nodes.heading, { level: 1 })).toBeFalse();
    expect(nodeActive(state, schema.nodes.heading, { level: 2 })).toBeTrue();
  });
});

describe('canInsertNode', () => {
  it('returns true when node can be inserted', () => {
    const { state, schema } = createEditor(doc(p('Something<cursor>')));
    expect(canInsertNode(state, schema.nodes.heading)).toBeTrue();
  });

  it('returns false when node cannot be inserted into table row', () => {
    const { state, schema } = createEditor(doc(tableRow('<cursor>')));
    expect(canInsertNode(state, schema.nodes.paragraph)).toBeFalse();
  });

  it('does not throw error for inserting into leaf node', () => {
    const { state, schema } = createEditor(doc(atomInline('<cursor>')));
    expect(canInsertNode(state, schema.nodes.paragraph)).toBeFalse();
  });
});

describe('isDocNodeEmpty', () => {
  it('returns true for a doc with an empty paragraph', () => {
    expect(isDocNodeEmpty(doc(p()))).toBeTrue();
  });

  it('returns false for a doc with nothing inside', () => {
    expect(isDocNodeEmpty(doc())).toBeFalse();
  });

  it('returns false for a doc with content', () => {
    expect(isDocNodeEmpty(doc(p(blockquote('quote this...'))))).toBeFalse();
  });
});

describe('isProsemirrorNode', () => {
  it('return true for prosemirror nodes', () => {
    expect(isProsemirrorNode(p())).toBeTrue();
    expect(isProsemirrorNode(blockquote())).toBeTrue();
  });

  it('returns false for non-prosemirror nodes', () => {
    expect(isProsemirrorNode(em())).toBeFalse();
  });
});

describe('getMarkAttrs', () => {
  it('returns correct mark attrs', () => {
    const attrs = { href: '/awesome', title: 'awesome' };
    const { aHref } = pm.builders(testSchema, {
      aHref: { markType: 'link', ...attrs },
    });
    const { state, schema } = createEditor(doc(p('a link', aHref('linked <cursor>here'))));
    expect(getMarkAttrs(state, schema.marks.link)).toEqual(attrs);
  });

  it('returns an empty object when mark not found', () => {
    const { state, schema } = createEditor(doc(p('a link', em('linked <cursor>here'))));
    expect(getMarkAttrs(state, schema.marks.link)).toEqual({});
  });
});

describe('isTextDOMNode', () => {
  it('returns true for text domNodes', () => {
    const node = document.createTextNode('Text node');
    expect(isTextDOMNode(node)).toBeTrue();
  });

  it('returns false for non-text domNodes', () => {
    const node = document.createElement('div');
    expect(isTextDOMNode(node)).toBeFalse();
  });
});

describe('isElementDOMNode', () => {
  it('returns true for element domNodes', () => {
    const node = document.createElement('div');
    expect(isElementDOMNode(node)).toBeTrue();
  });

  it('returns false for non-element domNodes', () => {
    const node = document.createTextNode('Text node');
    expect(isElementDOMNode(node)).toBeFalse();
  });
});

describe('getMarkRange', () => {
  it('returns the the mark range when in an active mark', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is <cursor>italic'))));
    expect(getMarkRange(state.selection.$from, schema.marks.em)).toEqual({ from: 10, to: 19 });
  });

  it('returns false when no active selection', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is italic'))));
    expect(getMarkRange(state.selection.$from, schema.marks.em)).toBeFalse();
  });

  it('only returns true when $pos starts within mark', () => {
    const { state, schema } = createEditor(doc(p('Some<start>thing', em('is<end> italic'))));
    expect(getMarkRange(state.selection.$from, schema.marks.em)).toBeFalse();
  });
});

test('getNearestNonTextNode', () => {
  const div = document.createElement('div');
  const text = document.createTextNode('hello');
  div.appendChild(text);
  expect(getNearestNonTextNode(text)).toBe(div);
  expect(getNearestNonTextNode(div)).toBe(div);
});

describe('isTextSelection', () => {
  it('returns true for a valid text selection', () => {
    const { state } = createEditor(doc(p('Some<start>thing<end>')));
    expect(isTextSelection(state.selection)).toBeTrue();
  });

  it('returns false for a node selection', () => {
    const { state } = createEditor(doc(p('Some<node>thing')));
    expect(isTextSelection(state.selection)).toBeFalse();
  });

  it('returns false for `undefined`', () => {
    expect(isTextSelection(undefined)).toBeFalse();
  });
});

describe('atDocEnd', () => {
  it('returns true at the end of the document', () => {
    const { state } = createEditor(doc(p('Something<cursor>')));
    expect(atDocEnd(state)).toBeTrue();
  });

  it('returns false when no selection', () => {
    const { state } = createEditor(doc(p('Something')));
    expect(atDocEnd(state)).toBeFalse();
  });

  it('returns true for a node selection', () => {
    const { state } = createEditor(doc(p('<node>Something')));
    expect(atDocEnd(state)).toBeTrue();
  });

  it('returns true for full selection', () => {
    const { state } = createEditor(doc(p('<all>Something')));
    expect(atDocEnd(state)).toBeTrue();
  });
});
describe('atDocStart', () => {
  it('returns true at the start of the document', () => {
    const { state } = createEditor(doc(p('<cursor>Something')));
    expect(atDocStart(state)).toBeTrue();
  });

  it('returns true for full selection', () => {
    const { state } = createEditor(doc(p('Some<all>thing')));
    expect(atDocStart(state)).toBeTrue();
  });

  it('returns false elsewhere', () => {
    const { state } = createEditor(doc(p('Someth<cursor>ing')));
    expect(atDocStart(state)).toBeFalse();
  });
});

test('startPositionOfParent', () => {
  const { state } = createEditor(doc(p('Something', p('This has a position<cursor>'))));
  expect(startPositionOfParent(state.selection.$from)).toBe(11);
});

test('endPositionOfParent', () => {
  const { state } = createEditor(doc(p('Something', p('This has a position<cursor>'), 'what becomes')));
  expect(endPositionOfParent(state.selection.$from)).toBe(31);
});

describe('getCursor', () => {
  it('returns cursor for a valid text selection', () => {
    const { state } = createEditor(doc(p('Something<cursor>')));
    expect(getCursor(state.selection)).toEqual((state.selection as TextSelection).$cursor);
  });

  it('returns undefined for non-text selection', () => {
    const { state } = createEditor(doc(p('<node>Something')));
    expect(getCursor(state.selection)).toBeUndefined();
  });
});

describe('nodeNameMatchesList', () => {
  const matchers: NodeMatch[] = ['paragraph', name => name === 'blockquote', ['table', 'gi']];

  it('returns true when it successfully matches', () => {
    expect(nodeNameMatchesList(p(), matchers)).toBeTrue();
    expect(nodeNameMatchesList(blockquote(), matchers)).toBeTrue();
    expect(nodeNameMatchesList(table(), matchers)).toBeTrue();
  });

  it('returns false when no match found', () => {
    expect(nodeNameMatchesList(hardBreak(), matchers)).toBeFalse();
  });

  it('returns false no node passed in', () => {
    expect(nodeNameMatchesList(undefined, matchers)).toBeFalse();
  });
});

describe('isDocNode', () => {
  it('returns true for doc nodes', () => {
    expect(isDocNode(doc(), testSchema)).toBeTrue();
    expect(isDocNode(doc())).toBeTrue();
  });

  it('returns false for non-doc nodes', () => {
    expect(isDocNode(p())).toBeFalse();
    expect(isDocNode(undefined)).toBeFalse();
  });
});

describe('isObjectNode', () => {
  it('returns true for doc objects', () => {
    expect(isObjectNode({ type: 'doc', content: [{ type: 'paragraph' }] })).toBeTrue();
  });

  it('returns false for non-doc nodes', () => {
    expect(isObjectNode({ type: 'paragraph' })).toBeFalse();
  });

  it('return false when doc node missing content array', () => {
    expect(isObjectNode({ type: 'doc' })).toBeFalse();
    expect(isObjectNode({ type: 'doc', content: {} })).toBeFalse();
  });
});

describe('createDocumentNode', () => {
  it('returns the same node if already a document node', () => {
    const content = doc(p('Content'));
    expect(createDocumentNode({ content, schema: testSchema })).toBe(content);
  });

  it('creates content via an ObjectNode', () => {
    expect(createDocumentNode({ content: docNodeBasicJSON, schema: testSchema })!.textContent).toContain(
      'basic',
    );
  });

  it('creates content via html', () => {
    expect(createDocumentNode({ content: '<p>basic html</p>', schema: testSchema })!.textContent).toContain(
      'basic html',
    );
  });
});

describe('toHTML', () => {
  const node = doc(p('hello'));
  it('transforms a doc to its inner html', () => {
    expect(toHTML({ node, schema: testSchema })).toBe('<p>hello</p>');
  });

  it('allows for custom document to be passed in', () => {
    expect(toHTML({ node, schema: testSchema, doc: domino.createDocument() })).toBe('<p>hello</p>');
  });
});

describe('toDOM', () => {
  const node = doc(p('hello'));
  it('transforms a doc into a documentFragment', () => {
    expect(toDOM({ node, schema: testSchema })).toBeInstanceOf(DocumentFragment);
  });

  it('allows for custom document to be passed in', () => {
    expect(toDOM({ node, schema: testSchema, doc: domino.createDocument() })).toBeTruthy();
  });
});

describe('fromHTML', () => {
  const content = `<p>Hello</p>`;
  it('transform html into a prosemirror node', () => {
    expect(fromHTML({ content, schema: testSchema })).toEqualPMNode(doc(p('Hello')));
  });

  it('allows for custom document to be passed in', () => {
    expect(fromHTML({ content, schema: testSchema, doc: domino.createDocument() })).toEqualPMNode(
      doc(p('Hello')),
    );
  });
});
