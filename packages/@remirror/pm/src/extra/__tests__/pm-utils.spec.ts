import { createEditor, doc, p } from 'jest-prosemirror';

import { chainableEditorState } from '../pm-utils';

describe('chainableEditorState', () => {
  it('creates a state like object', () => {
    const editor = createEditor(doc(p('An editor')));

    const tr = editor.state.tr;
    const state = chainableEditorState(tr, editor.state);

    expect(state).toEqual(
      expect.objectContaining({
        tr,
        schema: expect.any(Object),
        plugins: expect.any(Array),
        apply: expect.any(Function),
        applyTransaction: expect.any(Function),
        reconfigure: expect.any(Function),
        toJSON: expect.any(Function),
        storedMarks: expect.any(Object),
        selection: expect.any(Object),
        doc: expect.any(Object),
      }),
    );
  });

  it('maintains a constant `selection` and `doc` until the tr is accessed', () => {
    const editor = createEditor(doc(p('An editor<cursor>')));

    const tr = editor.state.tr;
    const state = chainableEditorState(tr, editor.state);

    expect(state.doc).toBe(tr.doc);
    expect(state.selection).toBe(tr.selection);

    tr.insertText(' "hello"!');
    expect(state.doc).not.toBe(tr.doc);
    expect(state.selection).not.toBe(tr.selection);

    // Accessing the transaction should reset the state.
    const _ = state.tr;

    expect(state.doc).toBe(tr.doc);
    expect(state.selection).toBe(tr.selection);
  });
});
