import {
  atomInline,
  blockquote,
  codeBlock,
  createEditor,
  doc,
  h1,
  p,
  schema,
  strong,
} from 'jest-prosemirror';

import { removeMark, replaceText, toggleBlockItem, toggleWrap, updateMark } from '../';

describe('removeMark', () => {
  const type = schema.marks.strong;

  it('removes the contained mark', () => {
    const from = doc(p(strong('<start>bold<end>')));
    const to = doc(p('bold'));

    expect(removeMark({ type })).toTransform({ from, to });
  });

  it('removes the uncontained mark', () => {
    const from = doc(p('Hel<start>lo ', strong('bo<end>ld')));
    const to = doc(p('Hello bold'));

    expect(removeMark({ type })).toTransform({ from, to });
  });

  it('leaves mark untouched when `expand` is `false`', () => {
    const from = doc(p(strong('bo<cursor>ld')));

    expect(removeMark({ type, expand: false })).toTransform({ from });
  });

  it('removes mark when `expand` is `true`', () => {
    const from = doc(p(strong('bo<cursor>ld')));
    const to = doc(p('bold'));

    expect(removeMark({ type })).toTransform({ from, to });
  });

  it('removes the mark from a custom selection', () => {
    const from = doc(p('start ', strong('bold'), ' and not<cursor>'));
    const to = doc(p('start bold and not'));

    expect(removeMark({ type, selection: { from: 7, to: 11 } })).toTransform({ from, to });
    expect(removeMark({ type, selection: 8 })).toTransform({ from, to });
    expect(removeMark({ type, selection: { from: 3, to: 7 } })).toTransform({
      from,
    });
  });

  it('does not mutate the provided transaction', () => {
    const from = doc(p('start ', strong('bo<cursor>ld'), ' and not'));
    const editor = createEditor(from);
    const tr = editor.state.tr;
    const view = editor.view;

    removeMark({ type })({ state: editor.state, tr, view });
    removeMark({ type })({ state: editor.state, tr, view });

    // Make sure that no steps have been added when dispatch is not enabled.
    expect(tr.steps).toHaveLength(0);

    // Dispatch the transaction to make sure nothing has changed.
    view.dispatch(tr);
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
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

    editor.remirrorCommand((props) =>
      replaceText({ content: 'Content', keepSelection: true })(props),
    );

    const { head, anchor } = editor.view.state.selection;
    expect(head).toBe(1);
    expect(anchor).toBe(5);
  });
});

describe('updateMark', () => {
  const type = schema.marks.strong;

  it('adds the mark to the selection', () => {
    const from = doc(p('Make <start>bold<end>'));
    const to = doc(p('Make ', strong('bold')));

    expect(updateMark({ type })).toTransform({ from, to });
  });

  it('does not add the mark if it is not applicable', () => {
    const from = doc(codeBlock('Not <start>bold<end> in code block'));
    const to = doc(codeBlock('Not bold in code block'));

    expect(updateMark({ type })).toTransform({ from, to });
  });

  it('adds the mark to a custom range', () => {
    const from = doc(p('Make bold with range<cursor>'));
    const to = doc(p('Make ', strong('bold'), ' with range'));

    expect(updateMark({ type, range: { from: 6, to: 10 } })).toTransform({ from, to });
  });

  it('does not add the mark to a custom range if it is not applicable', () => {
    const from = doc(codeBlock('Not bold in code block<cursor>'));
    const to = doc(codeBlock('Not bold in code block'));

    expect(updateMark({ type, range: { from: 5, to: 9 } })).toTransform({ from, to });
  });
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
