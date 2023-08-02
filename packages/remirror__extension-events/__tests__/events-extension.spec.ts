import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { LinkExtension } from 'remirror/extensions';

import {
  ClickMarkHandlerState,
  ContextMenuEventHandlerState,
  EventsExtension,
  HoverEventHandlerState,
} from '../';

extensionValidityTest(EventsExtension);

describe('events', () => {
  it('responds to editor `focus` events', () => {
    const eventsExtension = new EventsExtension();
    const focusHandler: any = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('focus', focusHandler);

    editor.add(doc(p('first')));
    fireEvent.focus(editor.dom);

    expect(focusHandler).toHaveBeenCalled();
  });

  it('responds to editor `blur` events', () => {
    const eventsExtension = new EventsExtension();
    const blurHandler: any = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('blur', blurHandler);

    editor.add(doc(p('first')));
    fireEvent.blur(editor.dom);

    expect(blurHandler).toHaveBeenCalled();
  });

  it('responds to editor `mousedown` events', () => {
    const eventsExtension = new EventsExtension();
    const mouseDownHandler: any = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('mousedown', mouseDownHandler);

    editor.add(doc(p('first')));
    fireEvent.mouseDown(editor.dom);

    expect(mouseDownHandler).toHaveBeenCalled();
  });

  it('responds to editor `mouseup` events', () => {
    const eventsExtension = new EventsExtension();
    const mouseUpHandler: any = jest.fn(() => true);
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('mouseup', mouseUpHandler);

    editor.add(doc(p('first')));
    fireEvent.mouseUp(editor.dom);

    expect(mouseUpHandler).toHaveBeenCalled();
  });

  it.each([
    ['click', 'handleClickOn'],
    ['doubleClick', 'handleDoubleClickOn'],
    ['tripleClick', 'handleTripleClickOn'],
  ] as const)(
    'responds to editor `%s` events',
    (remirrorEventName, prosemirrorEventHandlerName) => {
      const eventsExtension = new EventsExtension();
      const clickHandler: any = jest.fn(() => true);
      const editor = renderEditor([eventsExtension]);
      const { view, add } = editor;
      const { doc, p } = editor.nodes;
      const node = p('first');

      eventsExtension.addHandler(remirrorEventName, clickHandler);
      add(doc(p('first')));

      // JSDOM doesn't pass events through so the only way to simulate is to
      // directly simulate the `handleClick` prop.
      view.someProp(prosemirrorEventHandlerName, (fn) =>
        fn(view, 2, node, 1, {} as MouseEvent, true),
      );
      expect(clickHandler).toHaveBeenCalled();
    },
  );

  it('click events can be obtained for individual string link', () => {
    const eventsExtension = new EventsExtension();
    const editor = renderEditor([eventsExtension, new LinkExtension()]);
    const { doc, p } = editor.nodes;
    const { link } = editor.attributeMarks;
    const { view, add } = editor;
    const clickHandler: any = jest.fn((_: MouseEvent, __: ClickMarkHandlerState) => true);
    eventsExtension.addHandler('clickMark', clickHandler);
    const node = p('1', link({ href: 'https://example.com' })('l'));

    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 2, node, 0, {} as MouseEvent, true));
    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler.mock.calls[0]?.[1].getMark).toBeFunction();
    expect(clickHandler.mock.calls[0]?.[1].getMark('link')).toBeDefined();
  });

  it('should not throw when clicked on before first state called', () => {
    const eventsExtension = new EventsExtension();
    const editor = renderEditor([eventsExtension]);
    const { view } = editor;
    const { p } = editor.nodes;
    const node = p('first');

    expect(() =>
      editor.view.someProp('handleClickOn', (fn) => fn(view, 2, node, 1, {} as MouseEvent, true)),
    ).not.toThrow();
  });

  it('responds to editor `hover` events', () => {
    const eventsExtension = new EventsExtension();
    const hoverHandler: any = jest.fn((_: MouseEvent, __: HoverEventHandlerState) => true);
    const editor = renderEditor([eventsExtension, new LinkExtension()]);
    const { doc, p } = editor.nodes;
    const { link } = editor.attributeMarks;
    eventsExtension.addHandler('hover', hoverHandler);

    editor.add(
      doc(p('paragraph 1'), p('paragraph 2', link({ href: 'https://example.com' })('link'))),
    );

    const paragraphElement = editor.dom.querySelector('p') as Element;
    expect(paragraphElement.textContent).toBe('paragraph 1');

    fireEvent.mouseOver(paragraphElement);

    expect(hoverHandler).toHaveBeenCalledTimes(1);
    expect(hoverHandler.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(hoverHandler.mock.calls[0]?.[1]).not.toHaveProperty('event');
    expect(hoverHandler.mock.calls[0]?.[1]?.getNode).toBeFunction();
    expect(hoverHandler.mock.calls[0]?.[1]).toHaveProperty('hovering', true);
    expect(hoverHandler.mock.calls[0]?.[1]?.marks).toHaveLength(0);

    fireEvent.mouseOut(paragraphElement);

    expect(hoverHandler).toHaveBeenCalledTimes(2);
    expect(hoverHandler.mock.calls[1]?.[0]).toBeInstanceOf(Event);
    expect(hoverHandler.mock.calls[1]?.[1]).not.toHaveProperty('event');
    expect(hoverHandler.mock.calls[1]?.[1]?.getNode).toBeFunction();
    expect(hoverHandler.mock.calls[1]?.[1]).toHaveProperty('hovering', false);
    expect(hoverHandler.mock.calls[1]?.[1]?.marks).toHaveLength(0);

    const linkElement = editor.dom.querySelector('a') as Element;
    expect(linkElement.attributes.getNamedItem('href')?.value).toBe('https://example.com');

    fireEvent.mouseOver(linkElement);

    expect(hoverHandler).toHaveBeenCalledTimes(3);
    expect(hoverHandler.mock.calls[2]?.[0]).toBeInstanceOf(Event);
    expect(hoverHandler.mock.calls[2]?.[1]).not.toHaveProperty('event');
    expect(hoverHandler.mock.calls[2]?.[1]?.getNode).toBeFunction();
    expect(hoverHandler.mock.calls[2]?.[1]).toHaveProperty('hovering', true);
    expect(hoverHandler.mock.calls[2]?.[1]?.marks).toHaveLength(1);
    expect(hoverHandler.mock.calls[2]?.[1]?.marks[0].mark.type.name).toBe('link');

    fireEvent.mouseOut(linkElement);

    expect(hoverHandler).toHaveBeenCalledTimes(4);
    expect(hoverHandler.mock.calls[3]?.[0]).toBeInstanceOf(Event);
    expect(hoverHandler.mock.calls[3]?.[1]).not.toHaveProperty('event');
    expect(hoverHandler.mock.calls[3]?.[1]?.getNode).toBeFunction();
    expect(hoverHandler.mock.calls[3]?.[1]).toHaveProperty('hovering', false);
    expect(hoverHandler.mock.calls[3]?.[1]?.marks).toHaveLength(1);
    expect(hoverHandler.mock.calls[3]?.[1]?.marks[0].mark.type.name).toBe('link');
  });

  it('responds to editor `contextmenu` events', () => {
    const eventsExtension = new EventsExtension();
    const contextMenuHandler: any = jest.fn(
      (_: MouseEvent, __: ContextMenuEventHandlerState) => true,
    );
    const editor = renderEditor([eventsExtension]);
    const { doc, p } = editor.nodes;
    eventsExtension.addHandler('contextmenu', contextMenuHandler);

    editor.add(doc(p('first')));
    fireEvent.contextMenu(editor.dom.querySelector('p') as Element);

    expect(contextMenuHandler).toHaveBeenCalledTimes(1);
    expect(contextMenuHandler.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(contextMenuHandler.mock.calls[0]?.[1]).not.toHaveProperty('event');
    expect(contextMenuHandler.mock.calls[0]?.[1]?.getNode).toBeFunction();
  });
});
