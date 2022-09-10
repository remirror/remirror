import { jest } from '@jest/globals';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { DocChangedExtension } from '../';

extensionValidityTest(DocChangedExtension);

test('calls the docChanged handler when the document is changed', () => {
  const mock: any = jest.fn();
  const {
    manager,
    add,
    nodes: { p, doc },
  } = renderEditor<never>([]);

  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);

  add(doc(p('<cursor>')))
    .insertText('Change')
    .callback(() => {
      expect(mock).toHaveBeenCalledTimes(6);
      expect(mock.mock.calls[0][0].state.doc).toEqualRemirrorDocument(doc(p('C')));
      expect(mock.mock.calls[1][0].state.doc).toEqualRemirrorDocument(doc(p('Ch')));
      expect(mock.mock.calls[2][0].state.doc).toEqualRemirrorDocument(doc(p('Cha')));
      expect(mock.mock.calls[3][0].state.doc).toEqualRemirrorDocument(doc(p('Chan')));
      expect(mock.mock.calls[4][0].state.doc).toEqualRemirrorDocument(doc(p('Chang')));
      expect(mock.mock.calls[5][0].state.doc).toEqualRemirrorDocument(doc(p('Change')));
    });
});

test('does not call the docChanged handler when the selection is changed', () => {
  const mock: any = jest.fn();
  const {
    manager,
    add,
    nodes: { p, doc },
  } = renderEditor<never>([]);

  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);

  add(doc(p('Something<cursor>')))
    .selectText(0)
    .callback(() => {
      expect(mock).not.toHaveBeenCalled();
    });
});
