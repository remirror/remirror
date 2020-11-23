import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { isAllSelection } from '@remirror/core';

import {
  centeredSelectionPositioner,
  cursorPopupPositioner,
  floatingSelectionPositioner,
  Positioner,
  PositionerExtension,
} from '../..';

extensionValidityTest(PositionerExtension);

test('`cursorPopupPositioner` can position itself', () => {
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
      positionerExtension.addCustomHandler('positioner', cursorPopupPositioner);
      cursorPopupPositioner.addListener('update', cursorMock.onUpdate);
      cursorPopupPositioner.addListener('done', cursorMock.onDone);
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

test('`centeredSelectionPositioner` can position itself', () => {
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
      positionerExtension.addCustomHandler('positioner', centeredSelectionPositioner);
      centeredSelectionPositioner.addListener('update', centeredMock.onUpdate);
      centeredSelectionPositioner.addListener('done', centeredMock.onDone);
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

test('`floatingSelectionPositioner` can position itself', () => {
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
      positionerExtension.addCustomHandler('positioner', floatingSelectionPositioner);
      floatingSelectionPositioner.addListener('update', floatingMock.onUpdate);
      floatingSelectionPositioner.addListener('done', floatingMock.onDone);
    })
    .insertText('a')
    .selectText({ from: 1, to: 2 })
    .replace('')
    .callback(() => {
      expect(floatingMock.onUpdate).toHaveBeenCalledWith([
        { setElement: expect.any(Function), id: '0' },
      ]);
      expect(floatingMock.onDone).toHaveBeenCalledWith([
        { position: expect.any(Object), element: floatingElement, id: '0' },
      ]);
    })
    .insertText('hello')
    .callback(() => {
      expect(floatingMock.onUpdate).toHaveBeenCalledWith([]);
    })
    .selectText({ from: 1, to: 5 })
    .callback(() => {
      expect(floatingMock.onUpdate).toHaveBeenCalledWith([]);
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

  const customSelectionPositioner = Positioner.fromPositioner(floatingSelectionPositioner, {
    hasChanged() {
      return true;
    },
  });

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

  const customSelectionPositioner = Positioner.fromPositioner(centeredSelectionPositioner, {
    getActive(parameter) {
      const { state, view } = parameter;

      if (isAllSelection(state.selection) === false) {
        return [];
      }

      const { from, to } = state.selection;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      return [{ start, end }];
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
