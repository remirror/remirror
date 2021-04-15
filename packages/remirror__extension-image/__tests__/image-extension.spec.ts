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

    it('can upload images', async () => {
      const promise: Promise<ImageAttributes> = delay(100).then(() => ({
        src: 'https://test.com',
      }));
      const editor = renderEditor(() => [new ImageExtension()]);
      const { doc, p } = editor.nodes;
      const { image } = editor.attributeNodes;

      editor.add(doc(p('content <cursor>')));
      const delayedImage: DelayedPromiseCreator<ImageAttributes> = () => promise;

      editor.commands.uploadImage(delayedImage);

      expect(editor.dom).toMatchSnapshot();

      jest.runAllTimers();
      await promise;

      expect(editor.doc).toEqualProsemirrorNode(
        doc(p('content ', image({ src: 'https://test.com' })())),
      );
    });
  });
});
