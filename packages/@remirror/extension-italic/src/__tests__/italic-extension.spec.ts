import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { BoldExtension } from '@remirror/testing';

import { ItalicExtension } from '../..';

extensionValidityTest(ItalicExtension);

describe('inputRules', () => {
  it('supports nested input rule matches', () => {
    const {
      add,
      nodes: { doc, p },
      marks: { bold, italic },
    } = renderEditor([new BoldExtension(), new ItalicExtension()]);

    add(doc(p('_**bold italic<cursor>')))
      .insertText('**')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('_', bold('bold italic'), '<cursor>')));
      })
      .insertText('_')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(
          doc(p(italic(bold('bold italic')), '<cursor>')),
        );
      })
      .insertText(' more')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p(italic(bold('bold italic')), ' more')));
      });
  });
});
