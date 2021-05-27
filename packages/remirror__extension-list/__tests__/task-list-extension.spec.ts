import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
  TaskListItemExtension,
} from 'remirror/extensions';
import { ExtensionPriority, htmlToProsemirrorNode } from '@remirror/core';

describe('schema', () => {
  it('parses the dom structure and finds itself', () => {
    const editor = renderEditor([
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension({ priority: ExtensionPriority.High }),
    ]);

    const {
      nodes: { doc, p, bulletList, orderedList, listItem, taskList, taskListItem },
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
        content: `<ul data-task-list><li>one</li><li>two</li></ul>`,
        schema,
      }),
    ).toEqualProsemirrorNode(
      doc(
        taskList(
          taskListItem(p('one')), //
          taskListItem(p('two')),
        ),
      ),
    );
  });
});
