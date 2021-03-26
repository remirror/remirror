import domino from 'domino';
import {
  atomInline,
  blockquote,
  createEditor,
  doc,
  em,
  p,
  pm,
  schema as testSchema,
  strong,
  tableRow,
} from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  HeadingExtension,
  ItalicExtension,
} from 'remirror/extensions';
import { docNodeBasicJSON } from 'testing';
import { object } from '@remirror/core-helpers';
import { Mark } from '@remirror/pm/model';
import { TextSelection } from '@remirror/pm/state';

import {
  areSchemasCompatible,
  areStatesEqual,
  atDocEnd,
  atDocStart,
  canInsertNode,
  createDocumentNode,
  endPositionOfParent,
  getChangedNodeRanges,
  getCursor,
  getInvalidContent,
  getMarkAttributes,
  getMarkRange,
  getMarkRanges,
  getRemirrorJSON,
  getSelectedWord,
  htmlToProsemirrorNode,
  isDocNode,
  isDocNodeEmpty,
  isElementDomNode,
  isEmptyBlockNode,
  isMarkActive,
  isNodeSelection,
  isProsemirrorNode,
  isRemirrorJSON,
  isSelection,
  isTextDomNode,
  isTextSelection,
  prosemirrorNodeToDom,
  prosemirrorNodeToHtml,
  startPositionOfParent,
} from '../';

describe('isEmptyBlockNode', () => {
  it('should be true for empty nodes', () => {
    const { state } = createEditor(doc(p('<cursor>')));
    expect(isEmptyBlockNode(state.selection.$from.node())).toBeTrue();
  });

  it('should be false for non-empty nodes', () => {
    const { state } = createEditor(doc(p('abc<cursor>')));
    expect(isEmptyBlockNode(state.selection.$from.node())).toBeFalse();
  });
});

describe('markActive', () => {
  it('shows active when within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is <cursor>italic'), ' here')));

    expect(isMarkActive({ trState: state, type: schema.marks.em })).toBeTrue();
  });

  it('returns false when not within an active region', () => {
    const { state, schema } = createEditor(doc(p('Something<cursor>', em('is italic'), ' here')));

    expect(isMarkActive({ trState: state, type: schema.marks.em })).toBeFalse();
  });

  it('returns false with no selection', () => {
    const { state, schema } = createEditor(doc(p(' ', em('italic'))));

    expect(isMarkActive({ trState: state, type: schema.marks.em })).toBeFalse();
  });

  it('returns true when surrounding an active region', () => {
    const { state, schema } = createEditor(
      doc(p('Something<start>', em('is italic'), '<end> here')),
    );

    expect(isMarkActive({ trState: state, type: schema.marks.em })).toBeTrue();
  });

  it('can override from and to', () => {
    const { state, schema } = createEditor(
      doc(p('<start>Something<end>', em('is italic'), ' here')),
    );

    expect(isMarkActive({ trState: state, type: schema.marks.em, from: 11, to: 20 })).toBeTrue();
  });

  it('is false when empty document with from and to specified', () => {
    const { state, schema } = createEditor(doc(p('')));

    expect(isMarkActive({ trState: state, type: schema.marks.em, from: 11, to: 20 })).toBeFalse();
  });

  it('is false when from and to specified in empty node', () => {
    const { state, schema } = createEditor(doc(p(em('is italic')), p('')));

    expect(isMarkActive({ trState: state, type: schema.marks.em, from: 11, to: 20 })).toBeFalse();
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

describe('getMarkAttributes', () => {
  it('returns correct mark attrs', () => {
    const attributes = object({ href: '/awesome', title: 'awesome' });
    const { aHref } = pm.builders(testSchema, {
      aHref: { markType: 'link', ...attributes },
    });
    const { state, schema } = createEditor(doc(p('a link', aHref('linked <cursor>here'))));

    expect(getMarkAttributes(state, schema.marks.link)).toEqual(attributes);
  });

  it('returns false when mark not found', () => {
    const { state, schema } = createEditor(doc(p('a link', em('linked <cursor>here'))));

    expect(getMarkAttributes(state, schema.marks.link)).toBeFalse();
  });
});

describe('isTextDOMNode', () => {
  it('returns true for text domNodes', () => {
    const node = document.createTextNode('Text node');

    expect(isTextDomNode(node)).toBeTrue();
  });

  it('returns false for non-text domNodes', () => {
    const node = document.createElement('div');

    expect(isTextDomNode(node)).toBeFalse();
  });
});

describe('isElementDOMNode', () => {
  it('returns true for element domNodes', () => {
    const node = document.createElement('div');

    expect(isElementDomNode(node)).toBeTrue();
  });

  it('returns false for non-element domNodes', () => {
    const node = document.createTextNode('Text node');

    expect(isElementDomNode(node)).toBeFalse();
  });
});

describe('getMarkRange', () => {
  it('returns the the mark range when in an active mark', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is <cursor>italic'))));
    const { from, to, mark } = getMarkRange(state.selection.$from, schema.marks.em) ?? {};

    expect(from).toBe(10);
    expect(to).toBe(19);
    expect(mark?.type.name).toBe('em');
  });

  it('supports markType as a string', () => {
    const { state } = createEditor(doc(p('Something', em('is <cursor>italic'))));
    const { from, to, mark } = getMarkRange(state.selection.$from, 'em') ?? {};

    expect(from).toBe(10);
    expect(to).toBe(19);
    expect(mark?.type.name).toBe('em');
  });

  it('returns false when no active selection', () => {
    const { state, schema } = createEditor(doc(p('Something', em('is italic'))));

    expect(getMarkRange(state.selection.$from, schema.marks.em)).toBeUndefined();
  });

  it('only returns true when $pos starts within mark', () => {
    const { state, schema } = createEditor(doc(p('Some<start>thing', em('is<end> italic'))));

    expect(getMarkRange(state.selection.$from, schema.marks.em)).toBeUndefined();
  });

  it('provides the text and a mark', () => {
    const expected = 'is italic';
    const { state, schema } = createEditor(doc(p('Something <cursor>', em(expected))));
    const range = getMarkRange(state.selection.$from, schema.marks.em);

    expect(range?.mark).toBeInstanceOf(Mark);
    expect(range?.text).toBe(expected);
  });

  it('returns the entire range when marks are mixed', () => {
    const { state, schema } = createEditor(
      doc(p('Something <cursor>', strong(em('italic')), strong(' but still strong'))),
    );
    const range = getMarkRange(state.selection.$from, schema.marks.strong);

    expect(range?.mark).toBeInstanceOf(Mark);
    expect(range?.text).toBe('italic but still strong');
  });

  it('returns first matched range when provided with $end', () => {
    const { state, schema } = createEditor(
      doc(p('Something <start>', em('italic'), strong(' <end>but still strong'))),
    );
    const { $from, $to } = state.selection;
    const range = getMarkRange($from, schema.marks.strong, $to);

    expect(range?.mark).toBeInstanceOf(Mark);
    expect(range?.text).toBe(' but still strong');
  });
});

describe('getMarkRanges', () => {
  it('returns all the marks within provided range', () => {
    const { state } = createEditor(
      doc(
        p(
          'Something <start>',
          strong('hi'),
          em(' my '),
          strong('friend. '),
          em('Bye'),
          strong(' for<en> now... 😼'),
        ),
      ),
    );
    const ranges = getMarkRanges(state.selection, 'strong');

    expect(ranges).toHaveLength(3);
    expect(ranges[0]?.text).toBe('hi');
    expect(ranges[1]?.text).toBe('friend. ');
    expect(ranges[2]?.text).toBe(' for now... 😼');
  });
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
    const noValue = undefined;

    expect(isTextSelection(noValue)).toBeFalse();
    expect(isNodeSelection(noValue)).toBeFalse();
    expect(isSelection(noValue)).toBeFalse();
  });
});

describe('getSelectedWord', () => {
  it('should select the word the cursor is currently within', () => {
    const { state } = createEditor(doc(p('Something thi<cursor>s is a word.')));

    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15, text: 'this' });
  });

  it('should select the word the cursor is before', () => {
    const { state } = createEditor(doc(p('Something <cursor>this is a word.')));

    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15, text: 'this' });
  });

  it('should still select the word for partial selection is before', () => {
    const { state } = createEditor(doc(p('Something <start>t<end>his is a word.')));

    expect(getSelectedWord(state)).toEqual({ from: 11, to: 15, text: 'this' });
  });

  it('should expand the selection', () => {
    const { state } = createEditor(doc(p('Something th<start>is <end>is a word.')));

    expect(getSelectedWord(state)).toEqual({ from: 11, to: 18, text: 'this is' });
  });

  it('should return undefined for ambiguous locations', () => {
    const { state } = createEditor(doc(p('Something this <cursor> is a word.')));

    expect(getSelectedWord(state)).toBeUndefined();
  });

  it('should not include punctuation', () => {
    const { state } = createEditor(doc(p('Something this is a w<cursor>ord.')));

    expect(getSelectedWord(state)).toEqual({ from: 21, to: 25, text: 'word' });
  });

  it('should return undefined for completely empty locations', () => {
    const { state } = createEditor(doc(p('   <cursor>   ')));

    expect(getSelectedWord(state)).toBeUndefined();
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
  const { state } = createEditor(
    doc(p('Something', p('This has a position<cursor>'), 'what becomes')),
  );

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

describe('getChangedNodeRanges', () => {
  it('can get changed node ranges', () => {
    const { state } = createEditor(doc(p('start'), p('change<cursor>'), p('end')));
    const tr = state.tr;
    tr.insertText('abc');
    const nodeRanges = getChangedNodeRanges(tr);

    expect(nodeRanges).toHaveLength(1);
    expect(nodeRanges[0]?.parent.type.name).toBe('doc');
    expect(nodeRanges[0]?.start).toBe(7);
    expect(nodeRanges[0]?.end).toBe(18);
    expect(nodeRanges[0]?.startIndex).toBe(1);
    expect(nodeRanges[0]?.endIndex).toBe(2);
  });

  it('can understand insertions and complex changes', () => {
    const { state } = createEditor(doc(p('start'), p('change<cursor>'), p('end')));
    const tr = state.tr;
    tr.setSelection(TextSelection.create(tr.doc, tr.doc.nodeSize - 2))
      .insert(tr.selection.from, p('a new paragraph'))
      .setSelection(TextSelection.create(tr.doc, 1))
      .insertText('abc');
    const nodeRanges = getChangedNodeRanges(tr);

    expect(nodeRanges).toHaveLength(2);
    expect(nodeRanges[0]?.start).toBe(0);
    expect(nodeRanges[0]?.end).toBe(10);
    expect(nodeRanges[0]?.startIndex).toBe(0);
    expect(nodeRanges[0]?.endIndex).toBe(1);

    expect(nodeRanges[1]?.start).toBe(18);
    expect(nodeRanges[1]?.end).toBe(40);
    expect(nodeRanges[1]?.startIndex).toBe(2);
    expect(nodeRanges[1]?.endIndex).toBe(4);
  });
});

describe('isDocNode', () => {
  it('returns true for doc nodes', () => {
    expect(isDocNode(doc(), testSchema)).toBeTrue();
    expect(isDocNode(doc())).toBeTrue();
  });

  it('returns false for non-doc nodes', () => {
    expect(isDocNode(p())).toBeFalse();
    // @ts-expect-error
    expect(isDocNode()).toBeFalse();
  });
});

describe('isRemirrorJSON', () => {
  it('returns true for doc objects', () => {
    expect(isRemirrorJSON({ type: 'doc', content: [{ type: 'paragraph' }] })).toBeTrue();
  });

  it('returns false for non-doc nodes', () => {
    expect(isRemirrorJSON({ type: 'paragraph' })).toBeFalse();
  });

  it('return false when doc node missing content array', () => {
    expect(isRemirrorJSON({ type: 'doc' })).toBeFalse();
    expect(isRemirrorJSON({ type: 'doc', content: {} })).toBeFalse();
  });
});

describe('createDocumentNode', () => {
  it('returns the same node if already a document node', () => {
    const content = doc(p('Content'));

    expect(createDocumentNode({ content, schema: testSchema })).toBe(content);
  });

  it('creates content via an ObjectNode', () => {
    expect(
      createDocumentNode({ content: docNodeBasicJSON, schema: testSchema }).textContent,
    ).toContain('basic');
  });

  it('creates content via custom string handler', () => {
    expect(
      createDocumentNode({
        content: '<p>basic html</p>',
        schema: testSchema,
        stringHandler: htmlToProsemirrorNode,
      }).textContent,
    ).toContain('basic html');
  });
});

describe('prosemirrorNodeToHtml', () => {
  const node = doc(p('hello'));

  it('transforms a doc to its inner html', () => {
    expect(prosemirrorNodeToHtml(node)).toBe('<p>hello</p>');
  });

  it('allows for custom document to be passed in', () => {
    expect(prosemirrorNodeToHtml(node, document)).toBe('<p>hello</p>');
  });
});

describe('toDOM', () => {
  const node = doc(p('hello'));

  it('transforms a doc into a documentFragment', () => {
    expect(prosemirrorNodeToDom(node)).toBeInstanceOf(DocumentFragment);
  });

  it('allows for custom document to be passed in', () => {
    expect(prosemirrorNodeToDom(node, domino.createDocument())).toBeObject();
  });
});

describe('htmlToProsemirrorNode', () => {
  const content = `<p>Hello</p>`;

  it('transform html into a prosemirror node', () => {
    expect(htmlToProsemirrorNode({ content: content, schema: testSchema })).toEqualProsemirrorNode(
      doc(p('Hello')),
    );
  });

  it('allows for custom document to be passed in', () => {
    expect(
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: domino.createDocument(),
      }),
    ).toEqualProsemirrorNode(doc(p('Hello')));
  });
});

test('getRemirrorJSON', () => {
  const { state } = createEditor(doc(p('Hello')));

  expect(getRemirrorJSON(state)).toEqual({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
  });
});

describe('isStateEqual', () => {
  it('matches identical states', () => {
    const { state } = createEditor(doc(p('Hello')));
    expect(areStatesEqual(state, state)).toBeTrue();
  });

  it('ignores selection by default', () => {
    const { state: a } = createEditor(doc(p('<cursor>Hello')));
    const { state: b } = createEditor(doc(p('Hello<cursor>')));
    expect(areStatesEqual(a, b)).toBeTrue();
  });

  it('can fail for different selection', () => {
    const { state: a } = createEditor(doc(p('<cursor>Hello')));
    const { state: b } = createEditor(doc(p('Hello<cursor>')));
    expect(areStatesEqual(a, b, { checkSelection: true })).toBeFalse();
  });

  it('returns false with non identical schema', () => {
    const a = renderEditor([]);
    const b = renderEditor([]);
    a.add(a.nodes.doc(a.nodes.p('Hello')));
    b.add(b.nodes.doc(b.nodes.p('Hello')));
    expect(areStatesEqual(a.state, b.state)).toBeFalse();
  });
});

describe('areSchemasCompatible', () => {
  it('is true for identical schema', () => {
    const { schema } = renderEditor([]);
    expect(areSchemasCompatible(schema, schema)).toBe(true);
  });

  it('is true for similar schema', () => {
    const { schema: a } = renderEditor([]);
    const { schema: b } = renderEditor([]);
    expect(areSchemasCompatible(a, b)).toBe(true);
  });

  it('is false for schemas with different mark lengths', () => {
    const { schema: a } = renderEditor([new BoldExtension()]);
    const { schema: b } = renderEditor([]);
    expect(areSchemasCompatible(a, b)).toBe(false);
  });

  it('is false schemas with different marks', () => {
    const { schema: a } = renderEditor([new BoldExtension()]);
    const { schema: b } = renderEditor([new ItalicExtension()]);
    expect(areSchemasCompatible(a, b)).toBe(false);
  });

  it('is false schemas with different node lengths', () => {
    const { schema: a } = renderEditor([new BlockquoteExtension()]);
    const { schema: b } = renderEditor([]);
    expect(areSchemasCompatible(a, b)).toBe(false);
  });

  it('is false schemas with different nodes', () => {
    const { schema: a } = renderEditor([new BlockquoteExtension()]);
    const { schema: b } = renderEditor([new HeadingExtension()]);
    expect(areSchemasCompatible(a, b)).toBe(false);
  });
});

describe('getInvalidContent', () => {
  const validJSON = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is the content ' },
          {
            type: 'text',
            marks: [{ type: 'em' }, { type: 'strong' }],
            text: 'That is strong and italic',
          },
        ],
      },
    ],
  };

  const invalidJSONMarks = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is the content ' },
          {
            type: 'text',
            marks: [
              { type: 'em', attrs: { href: '//test.com' } },
              { type: 'invalid' },
              { type: 'strong' },
              { type: 'asdf' },
            ],
            text: 'That is strong and italic',
          },
        ],
      },
    ],
  };

  const invalidJSONNode = {
    type: 'doc',
    content: [
      {
        type: 'invalid',
        content: [
          { type: 'text', text: 'This is the content ' },
          {
            type: 'text',
            marks: [{ type: 'em' }, { type: 'strong' }],
            text: 'That is strong and italic',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'invalid',
            content: [{ type: 'text', marks: [{ type: 'em' }], text: 'asdf' }],
          },
        ],
      },
    ],
  };

  it('returns a transformer which passes for valid json', () => {
    expect(getInvalidContent({ json: validJSON, schema: testSchema }).invalidContent).toHaveLength(
      0,
    );
  });

  it('`transformers.remove` removes invalid nodes', () => {
    const { invalidContent, transformers } = getInvalidContent({
      json: invalidJSONNode,
      schema: testSchema,
    });

    expect(transformers.remove(invalidJSONNode, invalidContent)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    });
  });

  it('`transformers.remove` removes invalid marks', () => {
    const { invalidContent, transformers } = getInvalidContent({
      json: invalidJSONMarks,
      schema: testSchema,
    });

    expect(transformers.remove(invalidJSONMarks, invalidContent)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is the content ' },
            {
              type: 'text',
              marks: [{ type: 'em', attrs: { href: '//test.com' } }, { type: 'strong' }],
              text: 'That is strong and italic',
            },
          ],
        },
      ],
    });
  });
});
