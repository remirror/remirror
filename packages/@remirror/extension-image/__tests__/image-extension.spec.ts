import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { ImageExtension } from '../..';

extensionValidityTest(ImageExtension);

describe('commands', () => {
  describe('insertImage', () => {
    it('can insert images', () => {
      const editor = renderEditor(() => [new ImageExtension()]);
      const { doc, p } = editor.nodes;
      const { image } = editor.attributeNodes;

      editor.add(doc(p('content <cursor>')));
      editor.commands.insertImage({ src: 'https://test.com' });

      expect(editor.doc).toEqualProsemirrorNode(
        doc(p('content ', image({ src: 'https://test.com' })())),
      );
    });
  });
});
