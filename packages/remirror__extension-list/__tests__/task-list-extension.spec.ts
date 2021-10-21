import { htmlToProsemirrorNode } from '@remirror/core';

import { setupListEditor } from './list-setup';

describe('schema', () => {
  it('parses the dom structure and finds itself', () => {
    const { doc, p, ul, ol, li, taskList, taskListItem, editor } = setupListEditor();
    const { schema } = editor;

    expect(
      htmlToProsemirrorNode({
        content: `<ul><li>one</li><li>two</li></ul>`,
        schema,
      }),
    ).toEqualProsemirrorNode(
      doc(
        ul(
          li(p('one')), //
          li(p('two')),
        ),
      ),
    );

    expect(
      htmlToProsemirrorNode({
        content: `<ol><li>one</li><li>two</li></ol>`,
        schema,
      }),
    ).toEqualProsemirrorNode(
      doc(
        ol(
          li(p('one')), //
          li(p('two')),
        ),
      ),
    );

    expect(
      htmlToProsemirrorNode({
        content: `<ul data-task-list><li data-task-list-item>one</li><li data-task-list-item>two</li></ul>`,
        schema,
      }),
    ).toEqualProsemirrorNode(
      doc(
        taskList(
          taskListItem({ checked: false })(p('one')),
          taskListItem({ checked: false })(p('two')),
        ),
      ),
    );
  });
});
