import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { BoldExtension } from 'remirror/extensions';

import { ItalicExtension } from '../';

extensionValidityTest(ItalicExtension);

describe('inputRules', () => {
  it('makes text italic with `_`', () => {
    const {
      add,
      nodes: { doc, p },
      marks: { italic },
    } = renderEditor<ItalicExtension>([new ItalicExtension()]);

    add(doc(p('<cursor>')))
      .insertText('Text _italic_')
      .callback((content) => {
        expect(content.doc.toJSON()).toEqual(doc(p('Text ', italic('italic'))).toJSON());
      })
      .insertText(' more')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('Text ', italic('italic'), ' more')));
      });
  });

  it('makes text italic with `*`', () => {
    const {
      add,
      nodes: { doc, p },
      marks: { italic },
    } = renderEditor<ItalicExtension>([new ItalicExtension()]);

    add(doc(p('<cursor>')))
      .insertText('Text *italic*')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('Text ', italic('italic'))));
      })
      .insertText(' more')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('Text ', italic('italic'), ' more')));
      });
  });

  it('should not match only whitespace', () => {
    const {
      add,
      nodes: { doc, p },
    } = renderEditor<ItalicExtension>([new ItalicExtension()]);

    add(doc(p('<cursor>')))
      .insertText('_    _')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('_    _')));
      })
      .insertText('\n_ * *')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('_    _\n'), p('_ * *')));
      });
  });

  it('should not make text italic with mixed `*_` characters', () => {
    const {
      add,
      nodes: { doc, p },
    } = renderEditor<ItalicExtension>([new ItalicExtension()]);

    add(doc(p('<cursor>')))
      .insertText('Text *oops_')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('Text *oops_')));
      })
      .insertText('\n _oh*')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('Text *oops_\n'), p(' _oh*')));
      });
  });

  it('should not make text italic within a word', () => {
    const {
      add,
      nodes: { doc, p },
    } = renderEditor<ItalicExtension>([new ItalicExtension()]);

    add(doc(p('<cursor>')))
      .insertText('BBC_News')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('BBC_News')));
      })
      .insertText('_Labs')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p('BBC_News_Labs')));
      });
  });

  it('supports nested input rule matches', () => {
    const {
      add,
      nodes: { doc, p },
      marks: { bold, italic },
    } = renderEditor<BoldExtension | ItalicExtension>([new BoldExtension(), new ItalicExtension()]);

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

  it('supports nested input rule matches (reversed)', () => {
    const {
      add,
      nodes: { doc, p },
      marks: { bold, italic },
    } = renderEditor<BoldExtension | ItalicExtension>([new BoldExtension(), new ItalicExtension()]);

    add(doc(p('**_italic bold<cursor>')))
      .insertText('_')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(
          doc(p('**', italic('italic bold'), '<cursor>')),
        );
      })
      .insertText('**')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(
          doc(p(bold(italic('italic bold')), '<cursor>')),
        );
      })
      .insertText(' more')
      .callback((content) => {
        expect(content.doc).toEqualRemirrorDocument(doc(p(bold(italic('italic bold')), ' more')));
      });
  });
});
