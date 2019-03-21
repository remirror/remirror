import { Cast } from '@remirror/core';
import { EditorView } from 'prosemirror-view';
import { jsdomSelectionPatch, NullSelectionReader } from '../jsdom-patch';

describe('jsdomSelectionPatch', () => {
  it('should be a function', () => {
    expect(jsdomSelectionPatch).toBeFunction();
  });

  it('should extend mutate the passed view', () => {
    const view = Cast<EditorView>({});
    jsdomSelectionPatch(view);
    expect((view as any).selectionReader).toBeInstanceOf(NullSelectionReader);
    expect(view.updateState).toBeFunction();
    expect((view as any).setSelection).toBeFunction();
    expect(view.destroy).toBeFunction();
  });
});
