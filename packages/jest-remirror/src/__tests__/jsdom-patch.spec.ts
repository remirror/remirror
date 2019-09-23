import { Cast } from '@remirror/core';
import { EditorView } from 'prosemirror-view';
import { jsdomSelectionPatch, NullSelectionReader } from '../jsdom-patch';
import { jsdomPolyfill } from '../jsdom-polyfills';

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

  it('should provide properties for NullSelectionReader', () => {
    const mock = jest.fn();
    const reader = new NullSelectionReader(mock);
    expect(reader.editableChanged()).toBeUndefined();
    expect(reader.storeDOMState()).toBeUndefined();
    expect(reader.readFromDOM()).toBeTrue();
    expect(mock).toHaveBeenCalledTimes(2);
  });
});

describe('jsdomPolyfill', () => {
  jsdomPolyfill();
  it('should create an innerText attribute', () => {
    const div = document.createElement('div');
    document.documentElement.appendChild(div);
    div.innerText = 'Hello';
    expect(div.innerText).toBe('Hello');
  });

  it('sets up cancelAnimationFrame', () => {
    expect(window.cancelAnimationFrame(1)).toBeUndefined();
  });
});
