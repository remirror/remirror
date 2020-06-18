import { BoldExtension } from '@remirror/test-fixtures';

import { createEditorManager, createRemirrorDOM } from '../dom';

test('can be added to the dom', () => {
  const element = document.createElement('div');
  document.body.append(element);
  const manager = createEditorManager([new BoldExtension()]);
  const editor = createRemirrorDOM({ manager, element });
  const mock = jest.fn();

  editor.addHandler('change', mock);
  editor.commands.insertText('Hello test');

  // Make selected text bold.
  editor.commands.toggleBold({ from: 1, to: 6 });

  expect(mock).toHaveBeenCalledTimes(2);
  expect(editor.view.dom).toMatchInlineSnapshot(`
    <div
      aria-label=""
      aria-multiline="true"
      autofocus="false"
      class="ProseMirror remirror-editor"
      contenteditable="true"
      role="textbox"
    >
      <p>
        <strong>
          Hello
        </strong>
         test
      </p>
    </div>
  `);
});
