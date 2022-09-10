import { Cast } from 'remirror';
import { BoldExtension } from 'remirror/extensions';

import { renderEditor } from '../';

describe('toContainRemirrorDocument', () => {
  it('should match when state contains node', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const expected = p('simple');
    const { state } = add(doc(expected));

    expect(state).toContainRemirrorDocument(expected);
  });

  it('should not match when invalid state / node passed', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const expected = p('simple');
    const { state } = add(doc(expected));

    expect(state).not.toContainRemirrorDocument(Cast({}));
    expect(Cast({})).not.toContainRemirrorDocument(expected);
  });

  it('should not match for stale copies of the state', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const { state } = add(doc(p('old')));
    const { state: newState } = add(doc(p('new')));

    expect(state).not.toContainRemirrorDocument(p('new'));
    expect(newState).toContainRemirrorDocument(p('new'));
  });

  it('should not match for different schema', () => {
    const {
      nodes: { doc: docOld, p: pOld },
      add: addOld,
    } = renderEditor<never>([]);

    const {
      nodes: { doc, p },
      add,
    } = renderEditor<BoldExtension>([new BoldExtension()]);
    const oldNode = pOld('simple');
    const newNode = p('simple');
    const { state: oldState } = addOld(docOld(oldNode));
    const { state: newState } = add(doc(newNode));

    expect(oldState).not.toContainRemirrorDocument(newNode);
    expect(newState).not.toContainRemirrorDocument(oldNode);
  });
});

describe('toEqualRemirrorDocument', () => {
  it('should match for matching nodes', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const expected = p('simple');
    const { state } = add(doc(expected));

    expect(state.doc.content.child(0)).toEqualRemirrorDocument(expected);
  });

  it('should not match when invalid state / node passed', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const expected = p('simple');
    const { state } = add(doc(expected));

    expect(state.doc.content.child(0)).not.toEqualRemirrorDocument(Cast({}));
    expect(Cast({})).not.toEqualRemirrorDocument(expected);
  });

  it('should not match for stale copies of the state', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const { state } = add(doc(p('old')));
    const { state: newState } = add(doc(p('new')));

    expect(state.doc.content.child(0)).not.toEqualRemirrorDocument(p('new'));
    expect(newState.doc.content.child(0)).toEqualRemirrorDocument(p('new'));
  });

  it('should not match for different schema', () => {
    const {
      nodes: { doc: docOld, p: pOld },
      add: addOld,
    } = renderEditor<never>([]);

    const {
      nodes: { doc, p },
      add,
    } = renderEditor<BoldExtension>([new BoldExtension()]);
    const oldNode = pOld('simple');
    const newNode = p('simple');
    const { state: oldState } = addOld(docOld(oldNode));
    const { state: newState } = add(doc(newNode));

    expect(oldState.doc.content.child(0)).not.toEqualRemirrorDocument(newNode);
    expect(newState.doc.content.child(0)).not.toEqualRemirrorDocument(oldNode);
  });
});

describe('toEqualRemirrorState', () => {
  it('should not match for different selection', () => {
    const {
      nodes: { doc, p },
      add,
    } = renderEditor<never>([]);
    const { state } = add(doc(p('Foo <start>bar<end>')));
    expect(state).toEqualRemirrorState(doc(p('Foo <start>bar<end>')));
    expect(state).not.toEqualRemirrorState(doc(p('Foo <cursor>bar')));
  });
});
