import { clone } from '@remirror/core';
import { schema } from '@test-fixtures/schema-helpers';
import { markFactory, nodeFactory, sequence, text } from '../builder';
import { TagTracker } from '../jest-remirror-types';

describe('text', () => {
  it('returns tracker for empty string', () => {
    const nodes = text('', schema);
    expect(nodes).toBeInstanceOf(TagTracker);
    expect(nodes.tags).toEqual({});
  });

  it('returns tracker for string with single tag only', () => {
    const nodes = text('<a>', schema);
    expect(nodes).toBeInstanceOf(TagTracker);
    expect(nodes.tags).toEqual({ a: 0 });
  });

  it('returns tracker for string with multiple tags only', () => {
    const nodes = text('<a><b>', schema);
    expect(nodes).toBeInstanceOf(TagTracker);
    expect(nodes.tags).toEqual({ a: 0, b: 0 });
  });

  it('returns single text node for non-empty string', () => {
    const nodes = text('0', schema);

    expect(nodes).not.toBeNull();
  });

  it('adds tag property to returned node', () => {
    const node = text('0', schema);

    expect(node).toHaveProperty('tags');
    expect(node.tags).toEqual({});
  });

  it('supports tags at start of string', () => {
    const node = text('<a>0', schema);

    expect(node.tags).toEqual({ a: 0 });
  });

  it('supports multiple tags at start of string', () => {
    const node = text('<a><b>0', schema);

    expect(node.tags).toEqual({ a: 0, b: 0 });
  });

  it('supports tag in middle of string', () => {
    const node = text('0<a>1', schema);

    expect(node.tags).toEqual({ a: 1 });
  });

  it('supports multiple tags in middle of string', () => {
    const node = text('0<a><b>1', schema);

    expect(node.tags).toEqual({ a: 1, b: 1 });
  });

  it('supports tag at end of string', () => {
    const node = text('0<a>', schema);

    expect(node.tags).toEqual({ a: 1 });
  });

  it('supports text with no tags', () => {
    const node = text('0', schema);

    expect(Object.keys(node.tags).length).toBe(0);
  });

  it('supports escaping tags with backslash', () => {
    const node = text('\\<a>', schema);
    expect((node as any).text).toBe('<a>');
  });

  it('supports escaping backslash adjacent to tags', () => {
    const node = text('\\\\<a>', schema);

    expect((node as any).text).toBe('\\');
    expect(node.tags).toEqual({ a: 1 });
  });

  it('supports escaping tags with multiple backslashes', () => {
    const node = text('\\\\\\<a>', schema);

    expect((node as any).text).toBe('\\<a>');
  });
});

const p = nodeFactory({ name: 'paragraph', schema, attrs: {} });
const doc = nodeFactory({ name: 'doc', schema, attrs: {} });
const blockquote = nodeFactory({ name: 'blockquote', schema, attrs: {} });

describe('nodeFactory', () => {
  it('returns a function', () => {
    expect(nodeFactory({ name: 'paragraph', schema, attrs: {} })).toBeFunction();
  });

  it("returns a factory that returns tag'd nodes", () => {
    expect(p('')).toHaveProperty('tags');
  });

  it('correctly calculates flat node tag positions', () => {
    const node = p('t<a>ex<b>t');
    const { a, b } = node.tags;

    expect(node.textBetween(a, b)).toBe('ex');
  });

  it('correctly calculates flat node tag positions with tags tracking node', () => {
    const node = p('<a>', 'text', '<b>');
    const { a, b } = node.tags;

    expect(node.textBetween(a, b)).toBe('text');
  });

  it('correctly calculates single nested node tag positions', () => {
    const node = doc(p('t<a>ex<b>t'));
    const { a, b } = node.tags;
    expect(node.textBetween(a, b)).toBe('ex');
  });

  it('correctly calculates twice nested node tag positions', () => {
    const node = doc(blockquote(p('t<a>ex<b>t')));
    const { a, b } = node.tags;
    expect(node.textBetween(a, b)).toBe('ex');
  });

  it('supports a start tag', () => {
    const node = text('<start>0', schema);
    expect(node.tags).toEqual({ start: 0 });
  });
});

const em = markFactory({ name: 'italic', schema, attrs: {} });
describe('markFactory', () => {
  it('returns a function', () => {
    expect(em).toBeFunction();
  });

  it('returns a builder that returns an array', () => {
    expect(em()).toBeArray();
  });

  it('correctly calculates tags', () => {
    const node = p(em('t<a>ex<b>t'));
    const { a, b } = node.tags;
    expect(node.textBetween(a, b)).toBe('ex');
  });

  it('supports being composed with text() and maintaining tags', () => {
    const node = p(em('t<a>ex<b>t'));
    const { a, b } = node.tags;
    expect(node.textBetween(a, b)).toBe('ex');
  });

  it('supports being composed with multiple text() and maintaining tags', () => {
    const node = p(em('t<a>ex<b>t', 't<c>ex<d>t'));
    const { a, b, c, d } = node.tags;
    expect(node.textBetween(a, b)).toBe('ex');
    expect(node.textBetween(c, d)).toBe('ex');
  });
});

describe('sequence', () => {
  it('makes no changes to nodes with no tags', () => {
    const a = text('0', schema);
    const b = text('0', schema);
    const tagSnapshotA = clone(a.tags);
    const tagSnapshotB = clone(b.tags);

    sequence(a, b);
    expect(a.tags).toEqual(tagSnapshotA);
    expect(b.tags).toEqual(tagSnapshotB);
  });

  it('makes no changes to nodes with tags', () => {
    const a = text('0<a>', schema);
    const b = text('0<a>', schema);
    const tagSnapshotA = clone(a.tags);
    const tagSnapshotB = clone(b.tags);

    sequence(a, b);
    expect(a.tags).toEqual(tagSnapshotA);
    expect(b.tags).toEqual(tagSnapshotB);
  });

  it('returns an array of the nodes', () => {
    const a = text('0<a>', schema);
    const b = text('0<b>', schema);
    const c = text('0<c>', schema);

    const { nodes } = sequence(a, b, c);
    expect(nodes).toEqual([a, b, c]);
  });

  it('returns tags with keys for each tag in the children node tags', () => {
    const a = text('0<a>', schema);
    const b = text('0<b>', schema);
    const c = text('0<c>', schema);

    const { tags } = sequence(a, b, c);
    expect(Object.keys(tags)).toEqual(['a', 'b', 'c']);
  });

  it('returns tags with correct positions for text nodes', () => {
    const a = text('0<a>', schema);
    const b = text('0<b>', schema);
    const c = text('0<c>', schema);

    const { tags } = sequence(a, b, c);
    expect(tags.a).toBe(1);
    expect(tags.b).toBe(2);
    expect(tags.c).toBe(3);
  });

  it('returns tags with correct positions for tags tracking nodes', () => {
    const a = text('<a>', schema);
    const b = text('b', schema);
    const c = text('<c>', schema);

    const { tags } = sequence(a, b, c);
    expect(tags.a).toBe(0);
    expect(tags.c).toBe(1);
  });

  it('returns tags with correct positions for mixed nodes', () => {
    const a = text('0<a>', schema);
    const b = p('0<b>');
    const c = text('0<c>', schema);

    const { tags } = sequence(a, b, c);
    expect(tags.a).toBe(1);
    expect(tags.b).toBe(3);
    expect(tags.c).toBe(5);
  });

  it('returns tags with correct positions for nested tracking nodes', () => {
    const a = doc(p('<a>'));

    const { tags } = sequence(a);
    expect(tags.a).toBe(2);
  });
});
