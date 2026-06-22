import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
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

describe('resizing', () => {
  const IMAGE_WIDTH = 200;
  const IMAGE_HEIGHT = 100;

  const renderResizableEditor = (options: { minWidth?: number; maxWidth?: number } = {}) =>
    renderEditor(() => [new ImageExtension({ enableResizing: true, ...options })]);

  const insertImageAndGetWrapper = (
    editor: ReturnType<typeof renderResizableEditor>,
  ): HTMLElement => {
    const { doc, p } = editor.nodes;
    editor.add(doc(p('<cursor>')));
    editor.commands.insertImage({
      src: 'https://test.com',
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
    });
    const wrapper = editor.dom.querySelector<HTMLElement>('.remirror-resizable-view');

    if (!wrapper) {
      throw new Error('Expected `.remirror-resizable-view` wrapper to be rendered.');
    }

    return wrapper;
  };

  it('renders a wrapper with default min/max width when no bounds are provided', () => {
    const editor = renderResizableEditor();
    const wrapper = insertImageAndGetWrapper(editor);

    expect(wrapper.style.minWidth).toBe('50px');
    expect(wrapper.style.maxWidth).toBe('100%');
  });

  it('applies a custom `minWidth` to the wrapper', () => {
    const editor = renderResizableEditor({ minWidth: 120 });
    const wrapper = insertImageAndGetWrapper(editor);

    expect(wrapper.style.minWidth).toBe('120px');
  });

  it('applies a custom `maxWidth` to the wrapper, capped by the container width', () => {
    const editor = renderResizableEditor({ maxWidth: 480 });
    const wrapper = insertImageAndGetWrapper(editor);

    expect(wrapper.style.maxWidth).toBe('min(100%, 480px)');
  });

  describe('drag clamping', () => {
    // `jsdom` doesn't compute `pageX`/`pageY` (which is `clientX`/`clientY` +
    // `scrollX`/`scrollY`)
    beforeAll(() => {
      Object.defineProperty(MouseEvent.prototype, 'pageX', {
        configurable: true,
        get() {
          return this.clientX;
        },
      });
      Object.defineProperty(MouseEvent.prototype, 'pageY', {
        configurable: true,
        get() {
          return this.clientY;
        },
      });
    });

    afterAll(() => {
      delete (MouseEvent.prototype as { pageX?: number }).pageX;
      delete (MouseEvent.prototype as { pageY?: number }).pageY;
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const performRightHandleDrag = (wrapper: HTMLElement, { pageX }: { pageX: number }): void => {
      const innerImage = wrapper.querySelector<HTMLElement>('img');
      const handles = wrapper.querySelectorAll<HTMLElement>('div[style*="cursor: col-resize"]');
      // Counter-intuitively, the right handle is first.
      const rightHandle = handles[0];

      if (!innerImage || !rightHandle) {
        throw new Error('Expected resizable wrapper to render inner image and handles.');
      }

      // `jsdom` doesn't implement `getBoundingClientRect`
      jest.spyOn(innerImage, 'getBoundingClientRect').mockReturnValue({
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        top: 0,
        left: 0,
        right: IMAGE_WIDTH,
        bottom: IMAGE_HEIGHT,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      fireEvent.mouseDown(rightHandle, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: pageX, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: pageX, clientY: 0 });
    };

    it('clamps an oversized drag at `maxWidth`', () => {
      const editor = renderResizableEditor({ minWidth: 100, maxWidth: 400 });
      const wrapper = insertImageAndGetWrapper(editor);

      // Drag the right handle far past `maxWidth`
      performRightHandleDrag(wrapper, { pageX: 9999 });

      const imageNode = editor.doc.firstChild?.firstChild;
      expect(imageNode?.attrs.width).toBe(400);
      expect(imageNode?.attrs.height).toBe(200);
    });

    it('clamps an undersized drag at `minWidth`', () => {
      const editor = renderResizableEditor({ minWidth: 100, maxWidth: 400 });
      const wrapper = insertImageAndGetWrapper(editor);

      // Drag the right handle far below `minWidth`
      performRightHandleDrag(wrapper, { pageX: -9999 });

      const imageNode = editor.doc.firstChild?.firstChild;
      expect(imageNode?.attrs.width).toBe(100);
      expect(imageNode?.attrs.height).toBe(50);
    });
  });
});
