import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { DelayedPromiseCreator } from 'remirror';
import { delay } from 'testing';

import { ImageAttributes, ImageExtension } from '../';

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

  describe('uploadImage', () => {
    jest.useFakeTimers();

    afterAll(() => {
      jest.useRealTimers();
    });

    it.only('can upload images', () => {
      const promise = delay(100);
      const editor = renderEditor(() => [new ImageExtension()]);
      const { doc, p } = editor.nodes;
      const { image } = editor.attributeNodes;

      editor.add(doc(p('content <cursor>')));
      const delayedImage: DelayedPromiseCreator<ImageAttributes> = async () => {
        await promise;
        return { src: 'https://test.com' };
      };

      editor.commands.uploadImage(delayedImage);
      editor.debug();

      expect(editor.dom).toMatchInlineSnapshot();

      expect(editor.doc).toEqualProsemirrorNode(
        doc(p('content ', image({ src: 'https://test.com' })())),
      );
    });
  });
});
