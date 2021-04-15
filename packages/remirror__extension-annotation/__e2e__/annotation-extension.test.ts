import { getDocument, queries } from 'playwright-testing-library';
import { ElementHandle } from 'playwright-testing-library/dist/typedefs';
import { goto, typist } from 'testing/playwright';

const { getByRole, getByTitle } = queries;

describe('`AnnotationExtension`', () => {
  let $document: ElementHandle;
  let $editor: ElementHandle;

  describe('Annotations Extensions: Basic', () => {
    const path = 'annotation-extension--basic';

    beforeEach(async () => {
      await goto(path);
      $document = await getDocument(page);
      $editor = await getByRole($document, 'textbox');
    });

    it('should show the bubble menu', async () => {
      await $editor.focus();
      const $floatingMenu = await getByTitle($editor, 'Floating annotation');
      await expect($floatingMenu.textContent()).resolves.toMatchInlineSnapshot(
        `"This is a sample text"`,
      );

      await typist('{home} this should be at the end{enter}{enter}I am your fried!');
    });
  });
});
