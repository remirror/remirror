import { atomInline, blockquote, doc, h1, li, p, schema, strong, ul } from 'jest-prosemirror';
import {
  removeMark,
  replaceText,
  toggleBlockItem,
  toggleList,
  toggleWrap,
  updateMark,
} from '../command-utils';

describe('removeMark', () => {
  const type = schema.marks.strong;
  it('removes the contained mark', () => {
    const from = doc(p(strong('<start>bold<end>')));
    const to = doc(p('bold'));
    expect(removeMark({ type })).toTransformNode({ from, to });
  });

  it('leaves mark untouched when `expand` is `false`', () => {
    const from = doc(p(strong('bo<cursor>ld')));
    expect(removeMark({ type })).toTransformNode({ from });
  });

  it('removes mark when `expand` is `true`', () => {
    const from = doc(p(strong('bo<cursor>ld')));
    const to = doc(p('bold'));
    expect(removeMark({ type, expand: true })).toTransformNode({ from, to });
  });

  it('removes the mark from a custom range', () => {
    const from = doc(p('start ', strong('bold'), ' and not<cursor>'));
    const to = doc(p('start bold and not'));
    expect(removeMark({ type, range: { from: 7, to: 11 } })).toTransformNode({ from, to });
    expect(removeMark({ type, range: { from: 8 }, expand: true })).toTransformNode({ from, to });
    expect(removeMark({ type, range: { from: 3, to: 7 }, expand: true })).toTransformNode({ from, to });
  });
});

describe('replaceText', () => {
  it('replaces valid content', () => {
    const from = doc(p('replace <start>me<end>'));
    const to = doc(p('replace ', atomInline()));
    expect(replaceText({ appendText: '', type: schema.nodes.atomInline })).toTransformNode({ from, to });
  });

  it('does not replace invalid content', () => {
    const from = doc(p('replace <start>me<end>'));
    expect(replaceText({ appendText: '', type: schema.nodes.heading })).toTransformNode({ from });
  });

  it('can specify from and to', () => {
    const from = doc(p('Ignore'), '<cursor>');
    const to = doc(p('Ignore'), h1('Content'));
    expect(
      replaceText({
        appendText: '',
        type: schema.nodes.heading,
        content: 'Content',
        range: { from: 8, to: 8 },
      }),
    ).toTransformNode({
      from,
      to,
    });
  });

  it('can append text', () => {
    const from = doc(p('Ignore'), '<cursor>');
    const to = doc(p('Ignore'), p('Content '));
    expect(
      replaceText({ appendText: ' ', type: schema.nodes.paragraph, content: 'Content' }),
    ).toTransformNode({
      from,
      to,
    });
  });
});

test('updateMark', () => {
  const from = doc(p('Make <start>bold<end>'));
  const to = doc(p('Make ', strong('bold')));
  expect(updateMark({ type: schema.marks.strong })).toTransformNode({ from, to });
});

describe('toggleWrap', () => {
  it('adds the node wrapping the selection', () => {
    const from = doc(p('Wrap ', '<cursor>me'));
    const to = doc(blockquote(p('Wrap me')));
    expect(toggleWrap(schema.nodes.blockquote)).toTransformNode({ from, to });
  });

  it('lifts the node when already wrapped', () => {
    const from = doc(p(blockquote('Lift <cursor>me')));
    const to = doc(blockquote('Lift me'));
    expect(toggleWrap(schema.nodes.blockquote)).toTransformNode({ from, to });
  });
});

describe('toggleBlockItem', () => {
  it('toggles to the specified type', () => {
    const from = doc(p('toggled<cursor>'));
    const to = doc(h1('toggled'));
    expect(
      toggleBlockItem({
        type: schema.nodes.heading,
        toggleType: schema.nodes.paragraph,
        attrs: { level: 1 },
      }),
    ).toTransformNode({
      from,
      to,
    });
  });

  it('removes the toggled type', () => {
    const from = doc(h1('<cursor>toggled'));
    const to = doc(p('toggled'));
    expect(
      toggleBlockItem({
        type: schema.nodes.heading,
        toggleType: schema.nodes.paragraph,
        attrs: { level: 1 },
      }),
    ).toTransformNode({
      from,
      to,
    });
  });
});

describe('toggleList', () => {
  it('toggles to the specified list type', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(ul(li(p('make list'))));
    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).toTransformNode({
      from,
      to,
    });
  });
});
