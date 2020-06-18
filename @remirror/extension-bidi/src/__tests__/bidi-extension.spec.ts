import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/test-fixtures';

import { BidiExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(BidiExtension, {}));
});

test('captures the direction of each node', () => {
  const {
    add,
    nodes: { p, doc },
    view,
  } = renderEditor([new BidiExtension()]);

  add(doc(p('first paragraph'), p('بسيطة'), p('@')));
  expect(view.dom).toMatchInlineSnapshot(`
    <div
      aria-label=""
      aria-multiline="true"
      autofocus="false"
      class="ProseMirror remirror-editor"
      contenteditable="true"
      role="textbox"
    >
      <p>
        first paragraph
      </p>
      <p
        dir="rtl"
      >
        بسيطة
      </p>
      <p>
        @
      </p>
    </div>
  `);
});
