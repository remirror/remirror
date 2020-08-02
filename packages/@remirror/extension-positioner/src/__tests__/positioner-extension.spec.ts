import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { centeredSelectionPositioner, cursorPopupPositioner, PositionerExtension } from '../..';

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

  expect(
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
      .selectText(1, 5)
      .callback(() => {
        expect(cursorMock.onUpdate).toHaveBeenCalledWith([]);
      }),
  );
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

  expect(
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
      .selectText(1, 5)
      .callback(() => {
        expect(centeredMock.onUpdate).toHaveBeenCalledWith([
          { setElement: expect.any(Function), id: '0' },
        ]);
        expect(centeredMock.onDone).toHaveBeenCalledWith([
          { position: expect.any(Object), element: centeredElement, id: '0' },
        ]);
      }),
  );
});
