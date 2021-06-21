import { renderEditor } from 'jest-remirror';
import { BulletListExtension, OrderedListExtension, TaskListExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';

describe('schema', () => {
  it('parses the dom structure and finds itself', () => {
    const editor = renderEditor([
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
    ]);

    const {
      nodes: { doc, p, bulletList, orderedList, listItem, taskList },
      attributeNodes: { taskListItem },
      schema,
    } = editor;

    expect(
      htmlToProsemirrorNode({
        content: `<ul><li>one</li><li>two</li></ul>`,
        schema,
      }),
    ).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(p('one')), //
          listItem(p('two')),
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
        orderedList(
          listItem(p('one')), //
          listItem(p('two')),
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
