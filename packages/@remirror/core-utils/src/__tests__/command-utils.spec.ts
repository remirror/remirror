import { atomInline, blockquote, createEditor, doc, h1, p, schema, strong } from 'jest-prosemirror';

import { removeMark, replaceText, toggleBlockItem, toggleWrap, updateMark } from '../command-utils';

describe('removeMark', () => {
  const type = schema.marks.strong;

  it('removes the contained mark', () => {
    const from = doc(p(strong('<start>bold<end>')));
    const to = doc(p('bold'));

    expect(removeMark({ type })).toTransform({ from, to });
  });

  it('leaves mark untouched when `expand` is `false`', () => {
    const from = doc(p(strong('bo<cursor>ld')));

    expect(removeMark({ type })).toTransform({ from });
  });

  it('removes mark when `expand` is `true`', () => {
    const from = doc(p(strong('bo<cursor>ld')));
    const to = doc(p('bold'));

    expect(removeMark({ type, expand: true })).toTransform({ from, to });
  });

  it('removes the mark from a custom range', () => {
    const from = doc(p('start ', strong('bold'), ' and not<cursor>'));
    const to = doc(p('start bold and not'));

    expect(removeMark({ type, range: { from: 7, to: 11 } })).toTransform({ from, to });
    expect(removeMark({ type, range: { from: 8 }, expand: true })).toTransform({ from, to });
    expect(removeMark({ type, range: { from: 3, to: 7 }, expand: true })).toTransform({
      from,
      to,
    });
  });
});

describe('replaceText', () => {
  it('replaces valid content', () => {
    const from = doc(p('replace <start>me<end>'));
    const to = doc(p('replace ', atomInline()));

    expect(replaceText({ appendText: '', type: schema.nodes.atomInline })).toTransform({
      from,
      to,
    });
  });

  it('does not replace invalid content', () => {
    const from = doc(p('replace <start>me<end>'));

    expect(replaceText({ appendText: '', type: schema.nodes.heading })).toTransform({ from });
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
    ).toTransform({
      from,
      to,
    });
  });

  it('can append text', () => {
    const from = doc(p('Ignore'), '<cursor>');
    const to = doc(p('Ignore'), p('Content '));

    expect(
      replaceText({ appendText: ' ', type: schema.nodes.paragraph, content: 'Content' }),
    ).toTransform({
      from,
      to,
    });
  });

  it('can preserve the non-empty selection', () => {
    const editor = createEditor(doc(p('<head>Hell<anchor>o')));

    editor.remirrorCommand((parameter) =>
      replaceText({ content: 'Content', keepSelection: true })(parameter),
    );

    const { head, anchor } = editor.view.state.selection;
    expect(head).toBe(1);
    expect(anchor).toBe(5);
  });
});

test('updateMark', () => {
  const from = doc(p('Make <start>bold<end>'));
  const to = doc(p('Make ', strong('bold')));

  expect(updateMark({ type: schema.marks.strong })).toTransform({ from, to });
});

describe('toggleWrap', () => {
  it('adds the node wrapping the selection', () => {
    const from = doc(p('Wrap ', '<cursor>me'));
    const to = doc(blockquote(p('Wrap me')));

    expect(toggleWrap(schema.nodes.blockquote)).toTransform({ from, to });
  });

  it('lifts the node when already wrapped', () => {
    const from = doc(p(blockquote('Lift <cursor>me')));
    const to = doc(blockquote('Lift me'));

    expect(toggleWrap(schema.nodes.blockquote)).toTransform({ from, to });
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
    ).toTransform({
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
    ).toTransform({
      from,
      to,
    });
  });
});
