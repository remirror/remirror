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
});
