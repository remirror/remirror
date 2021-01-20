import { fireEvent } from '@testing-library/dom';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { EventsExtension } from '../';

extensionValidityTest(EventsExtension);

describe('events', () => {
  it('responds to editor `focus` events', () => {
    const eventsExtension = new EventsExtension();
    const focusHandler = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('focus', focusHandler);

    editor.add(doc(p('first')));
    fireEvent.focus(editor.dom);

    expect(focusHandler).toHaveBeenCalled();
  });

  it('responds to editor `blur` events', () => {
    const eventsExtension = new EventsExtension();
    const blurHandler = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('blur', blurHandler);

    editor.add(doc(p('first')));
    fireEvent.blur(editor.dom);

    expect(blurHandler).toHaveBeenCalled();
  });

  it('responds to editor `mousedown` events', () => {
    const eventsExtension = new EventsExtension();
    const mouseDownHandler = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('mousedown', mouseDownHandler);

    editor.add(doc(p('first')));
    fireEvent.mouseDown(editor.dom);

    expect(mouseDownHandler).toHaveBeenCalled();
  });

  it('responds to editor `mouseup` events', () => {
    const eventsExtension = new EventsExtension();
    const mouseUpHandler = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('mouseup', mouseUpHandler);

    editor.add(doc(p('first')));
    fireEvent.mouseUp(editor.dom);

    expect(mouseUpHandler).toHaveBeenCalled();
  });

  it('responds to editor `click` events', () => {
    const eventsExtension = new EventsExtension();
    const clickHandler = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { view, add } = editor;
    const { doc, p } = editor.nodes;
    const node = p('first');

    eventsExtension.addHandler('click', clickHandler);
    add(doc(p('first')));

    // JSDOM doesn't pass events through so the only way to simulate is to
    // directly simulate the `handleClick` prop.
    view.someProp('handleClickOn', (fn) => fn(view, 2, node, 1, {}, true));
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should not throw when clicked on before first state called', () => {
    const eventsExtension = new EventsExtension();
    const editor = renderEditor([eventsExtension]);
    const { view } = editor;
    const { p } = editor.nodes;
    const node = p('first');

    expect(() =>
      editor.view.someProp('handleClickOn', (fn) => fn(view, 2, node, 1, {}, true)),
    ).not.toThrow();
  });
});
