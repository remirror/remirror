import { getDocument, queries } from 'playwright-testing-library';
import { ElementHandle } from 'playwright-testing-library/dist/typedefs';
import { goto, typist } from 'testing/playwright';

describe('Positioner Extension', () => {
  const { getByRole, getByTestId, getByText } = queries;
  let $document: ElementHandle;
  let $editor: ElementHandle;

  describe('cursorPositioner', () => {
    const path = 'positioner-extension--cursor-positioner';

    beforeEach(async () => {
      await goto(path);
      $document = await getDocument(page);
      $editor = await getByRole($document, 'textbox');
    });

    it('should show the bubble menu', async () => {
      await $editor.focus();
      await typist('This is text');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
      const $bubbleMenu = await getByTestId($document, 'bubble-menu');
      await expect($bubbleMenu.getAttribute('style')).resolves.toBe(
        'bottom:999999px;left:-999999px;position:absolute',
      );

      await typist('{selectall}');
      const $visibleBubbleMenu = await getByTestId($document, 'bubble-menu');
      const newStyles = await $visibleBubbleMenu.getAttribute('style');
      expect(newStyles).toInclude('bottom');
      expect(newStyles).not.toInclude('999999px');
      expect(newStyles).toInclude('left');

      const $boldButton = await getByText($document, 'Bold');
      await $boldButton.click();

      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
    });
  });
});
