import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { isAllSelection } from '@remirror/core';

import {
  blockNodePositioner,
  cursorPositioner,
  PositionerExtension,
  selectionPositioner,
} from '../';

extensionValidityTest(PositionerExtension);

test('`cursorPositioner` can position itself', () => {
  const positionerExtension = new PositionerExtension();
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([positionerExtension]);

  const cursorElement = document.createElement('div');
  document.body.append(cursorElement);
  const cursorMock = {
    onUpdate: jest.fn((items) => items?.[0]?.setElement(cursorElement)),
    onDone: jest.fn(),
  };

  add(doc(p('hello <cursor>')))
    .callback(() => {
      positionerExtension.addCustomHandler('positioner', cursorPositioner);
      cursorPositioner.addListener('update', cursorMock.onUpdate);
      cursorPositioner.addListener('done', cursorMock.onDone);
    })
    .insertText('a')
    .callback(() => {
      expect(cursorMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: expect.any(String) },
      ]);
      expect(cursorMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: cursorElement, id: '0' },
      ]);
    })
    .selectText({ from: 1, to: 5 })
    .callback(() => {
      expect(cursorMock.onUpdate).toHaveBeenCalledWith([]);
    });
});

test('`selectionPositioner` can position itself', () => {
  const positionerExtension = new PositionerExtension();
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([positionerExtension]);

  const centeredElement = document.createElement('div');
  document.body.append(centeredElement);
  const centeredMock = {
    onUpdate: jest.fn((items) => items?.[0]?.setElement(centeredElement)),
    onDone: jest.fn(),
  };

  add(doc(p('hello <cursor>')))
    .callback(() => {
      positionerExtension.addCustomHandler('positioner', selectionPositioner);
      selectionPositioner.addListener('update', centeredMock.onUpdate);
      selectionPositioner.addListener('done', centeredMock.onDone);
    })
    .insertText('a')
    .callback(() => {
      expect(centeredMock.onUpdate).toHaveBeenCalledWith([]);
    })
    .selectText({ from: 1, to: 5 })
    .callback(() => {
      expect(centeredMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: '0' },
      ]);
      expect(centeredMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: centeredElement, id: '0' },
      ]);
    });
});

test('`positionerExtension` can position itself', () => {
  const positionerExtension = new PositionerExtension();
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([positionerExtension]);

  const floatingElement = document.createElement('div');
  document.body.append(floatingElement);
  const floatingMock = {
    onUpdate: jest.fn((items) => items?.[0]?.setElement(floatingElement)),
    onDone: jest.fn(),
  };

  add(doc(p('<cursor>')))
    .callback(() => {
      positionerExtension.addCustomHandler('positioner', blockNodePositioner);
      blockNodePositioner.addListener('update', floatingMock.onUpdate);
      blockNodePositioner.addListener('done', floatingMock.onDone);
    })
    .insertText('a \n')
    .callback(() => {
      expect(floatingMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: '0' },
      ]);
      expect(floatingMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: floatingElement, id: '0' },
      ]);
    });
});

test("a custom positioner can define it's own hasChanged behaviour", () => {
  const positionerExtension = new PositionerExtension();
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([positionerExtension]);

  const customElement = document.createElement('div');
  document.body.append(customElement);
  const customMock = {
    onUpdate: jest.fn((items) => items?.[0]?.setElement(customElement)),
    onDone: jest.fn(),
  };

  const customSelectionPositioner = cursorPositioner.clone({ hasChanged: () => true });

  add(doc(p('<cursor>')))
    .callback(() => {
      customSelectionPositioner.addListener('update', customMock.onUpdate);
      customSelectionPositioner.addListener('done', customMock.onDone);
      positionerExtension.addCustomHandler('positioner', customSelectionPositioner);
    })
    .callback(() => {
      expect(customMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: '0' },
      ]);
      expect(customMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: customElement, id: '0' },
      ]);
    });
});

test("a custom positioner can determine it's own active state", () => {
  const positionerExtension = new PositionerExtension();
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([positionerExtension]);

  const customElement = document.createElement('div');
  document.body.append(customElement);
  const customMock = {
    onUpdate: jest.fn((items) => items?.[0]?.setElement(customElement)),
    onDone: jest.fn(),
  };

  const customSelectionPositioner = selectionPositioner.clone({
    getActive: (props) => {
      const { state, view } = props;

      if (isAllSelection(state.selection) === false) {
        return [];
      }

      const from = view.coordsAtPos(state.selection.from);
      const to = view.coordsAtPos(state.selection.to);

      return [{ from, to }];
    },
  });

  add(doc(p('<cursor>')))
    .callback(() => {
      positionerExtension.addCustomHandler('positioner', customSelectionPositioner);
      customSelectionPositioner.addListener('update', customMock.onUpdate);
      customSelectionPositioner.addListener('done', customMock.onDone);
    })
    .insertText('hello')
    .callback(() => {
      expect(customMock.onUpdate).toHaveBeenCalledWith([]);
    })
    .selectText({ from: 1, to: 5 })
    .callback(() => {
      expect(customMock.onUpdate).toHaveBeenCalledWith([]);
    })
    .selectText('all')
    .callback(() => {
      expect(customMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: '0' },
      ]);
      expect(customMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: customElement, id: '0' },
      ]);
    });
});
