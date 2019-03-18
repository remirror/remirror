import { createEditorState, pm } from 'jest-prosemirror';
import { markActive } from '../document';
const { p, doc, em, schema } = pm;

describe('markActive', () => {
  it('shows active when within an active region', () => {
    const model = doc(p('Something', em('is <a>italic'), ' here'));
    const state = createEditorState(model);
    expect(markActive(state, schema.marks.em)).toBeTrue();
  });

  it('returns false when not within an active region', () => {
    const model = doc(p('Something<a>', em('is italic'), ' here'));
    const state = createEditorState(model);
    expect(markActive(state, schema.marks.em)).toBeFalse();
  });

  it('returns true when surrounding an active region', () => {
    const model = doc(p('Something<a>', em('is italic'), '<a> here'));
    const state = createEditorState(model);
    expect(markActive(state, schema.marks.em)).toBeTrue();
  });
});
