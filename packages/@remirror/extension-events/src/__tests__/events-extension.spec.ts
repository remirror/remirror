import { fireEvent } from '@testing-library/dom';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { EventsExtension } from '..';

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
});
