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
  it('should remove the mark when selected', () => {
    const from = doc(p(strong('<start>bold<end>')));
    const to = doc(p('bold'));
    expect(removeMark({ type: schema.marks.strong })).transformsPMNode({ from, to });
  });

  it('should not remove when cursor is within the mark', () => {
    const from = doc(p(strong('bo<cursor>ld')));
    expect(removeMark({ type: schema.marks.strong })).transformsPMNode({ from });
  });
});

describe('replaceText', () => {
  it('replaces valid content', () => {
    const from = doc(p('replace <start>me<end>'));
    const to = doc(p('replace ', atomInline()));
    expect(replaceText({ appendText: '', type: schema.nodes.atomInline })).transformsPMNode({ from, to });
  });

  it('does not replace invalid content', () => {
    const from = doc(p('replace <start>me<end>'));
    expect(replaceText({ appendText: '', type: schema.nodes.heading })).transformsPMNode({ from });
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
    ).transformsPMNode({
      from,
      to,
    });
  });

  it('can append text', () => {
    const from = doc(p('Ignore'), '<cursor>');
    const to = doc(p('Ignore'), p('Content '));
    expect(
      replaceText({ appendText: ' ', type: schema.nodes.paragraph, content: 'Content' }),
    ).transformsPMNode({
      from,
      to,
    });
  });
});

test('updateMark', () => {
  const from = doc(p('Make <start>bold<end>'));
  const to = doc(p('Make ', strong('bold')));
  expect(updateMark({ type: schema.marks.strong })).transformsPMNode({ from, to });
});

describe('toggleWrap', () => {
  it('adds the node wrapping the selection', () => {
    const from = doc(p('Wrap ', '<cursor>me'));
    const to = doc(blockquote(p('Wrap me')));
    expect(toggleWrap(schema.nodes.blockquote)).transformsPMNode({ from, to });
  });

  it('lifts the node when already wrapped', () => {
    const from = doc(p(blockquote('Lift <cursor>me')));
    const to = doc(blockquote('Lift me'));
    expect(toggleWrap(schema.nodes.blockquote)).transformsPMNode({ from, to });
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
    ).transformsPMNode({
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
    ).transformsPMNode({
      from,
      to,
    });
  });
});

describe('toggleList', () => {
  it('toggles to the specified list type', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(ul(li(p('make list'))));
    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).transformsPMNode({
      from,
      to,
    });
  });
});
