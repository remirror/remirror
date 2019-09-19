import { NodeMatch } from '@remirror/core-types';
import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import {
  atomInline,
  blockquote,
  createEditor,
  doc,
  em,
  hardBreak,
  p,
  pm,
  schema as testSchema,
  table,
  tableRow,
} from 'jest-prosemirror';
import { TextSelection } from 'prosemirror-state';
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
  getSelectedWord,
  isDocNode,
  isDocNodeEmpty,
  isElementDOMNode,
  isMarkActive,
  isNodeSelection,
  isObjectNode,
  isProsemirrorNode,
  isSelection,
  isTextDOMNode,
  isTextSelection,
  nodeNameMatchesList,
  startPositionOfParent,
  toDOM,
  toHTML,
} from '../dom-utils';

// tslint:disable-next-line: no-implicit-dependencies
import domino from 'domino';

describe('markActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is <cursor>italic'), ' here')));
    expect(isMarkActive({ state, type: schema.marks.em })).toBeTrue();
  });

  it('returns false when not within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something<cursor>', em('is italic'), ' here')));
    expect(isMarkActive({ state, type: schema.marks.em })).toBeFalse();
  });

  it('returns false with no selection', () => {
    const { state, schema } = createEditor(doc(p(' ', em('italic'))));
    expect(isMarkActive({ state, type: schema.marks.em })).toBeFalse();
  });

  it('returns true when surrounding an active region', () => {
    const { state, schema } = createEditor(doc(p('Something<start>', em('is italic'), '<end> here')));
    expect(isMarkActive({ state, type: schema.marks.em })).toBeTrue();
  });

  it('can override from and to', () => {
    const { state, schema } = createEditor(doc(p('<start>Something<end>', em('is italic'), ' here')));
    expect(isMarkActive({ state, type: schema.marks.em, from: 11, to: 20 })).toBeTrue();
  });

  it('is false when empty document with from and to specified', () => {
    const { state, schema } = createEditor(doc(p('')));
    expect(isMarkActive({ state, type: schema.marks.em, from: 11, to: 20 })).toBeFalse();
  });
  it('is false when from and to specified in empty node', () => {
    const { state, schema } = createEditor(doc(p(em('is italic')), p('')));
    expect(isMarkActive({ state, type: schema.marks.em, from: 11, to: 20 })).toBeFalse();
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

describe('selections', () => {
  it('recognises a valid text selection', () => {
    const { state } = createEditor(doc(p('Some<start>thing<end>')));
    expect(isTextSelection(state.selection)).toBeTrue();
    expect(isSelection(state.selection)).toBeTrue();
    expect(isNodeSelection(state.selection)).toBeFalse();
  });

  it('recognises a node selection', () => {
    const { state } = createEditor(doc(p('Some<node>thing')));
    expect(isTextSelection(state.selection)).toBeFalse();
    expect(isNodeSelection(state.selection)).toBeTrue();
  });

  it('returns false for `undefined`', () => {
    expect(isTextSelection(undefined)).toBeFalse();
    expect(isNodeSelection(undefined)).toBeFalse();
    expect(isSelection(undefined)).toBeFalse();
  });
});

describe('getSelectedWord', () => {
  it('should select the word the cursor is currently within', () => {
    const { state } = createEditor(doc(p('Something thi<cursor>s is a word')));
    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15 });
  });

  it('should select the word the cursor is before', () => {
    const { state } = createEditor(doc(p('Something <cursor>this is a word')));
    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15 });
  });

  it('should still select the word for partial selection is before', () => {
    const { state } = createEditor(doc(p('Something <start>t<end>his is a word')));
    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15 });
  });

  it('should expand the selection', () => {
    const { state } = createEditor(doc(p('Something th<start>is <end>is a word')));
    expect(getSelectedWord(state)).toEqual({ from: 11, to: 18 });
  });

  it('should return false for ambiguous locations', () => {
    const { state } = createEditor(doc(p('Something this <cursor> is a word')));
    expect(getSelectedWord(state)).toBeFalse();
  });

  it('should return false for completely empty locations', () => {
    const { state } = createEditor(doc(p('   <cursor>   ')));
    expect(getSelectedWord(state)).toBeFalse();
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

  it('creates content via custom string handler', () => {
    expect(
      createDocumentNode({ content: '<p>basic html</p>', schema: testSchema, stringHandler: fromHTML })!
        .textContent,
    ).toContain('basic html');
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
    expect(fromHTML({ content, schema: testSchema })).toEqualProsemirrorNode(doc(p('Hello')));
  });

  it('allows for custom document to be passed in', () => {
    expect(fromHTML({ content, schema: testSchema, doc: domino.createDocument() })).toEqualProsemirrorNode(
      doc(p('Hello')),
    );
  });
});
