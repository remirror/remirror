import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
  toggleList,
} from 'remirror/extensions';

describe('toggleList', () => {
  const editor = renderEditor([
    new ListItemExtension(),
    new BulletListExtension(),
    new OrderedListExtension(),
    new TaskListExtension(),
  ]);
  const {
    nodes: { doc, paragraph: p, taskList, bulletList: ul, listItem: li, orderedList: ol },
    attributeNodes: { taskListItem },
  } = editor;

  const checked = taskListItem({ checked: true });
  const unchecked = taskListItem({ checked: false });

  it('toggles paragraph to bullet list', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(ul(li(p('make list'))));

    editor.add(from).commands.toggleBulletList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles bullet list to paragraph', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(p('make list'));

    editor.add(from).commands.toggleBulletList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles task list to paragraph', () => {
    const from = doc(taskList(checked(p('make <cursor>list'))));
    const to = doc(p('make list'));

    editor.add(from).commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles paragraph to task list', () => {
    const from = doc(p('make list'));
    const to = doc(taskList(unchecked(p('make <cursor>list'))));

    editor.add(from).commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles ordered list to bullet list', () => {
    const from = doc(ol(li(p('make <cursor>list'))));
    const to = doc(ul(li(p('make list'))));

    editor.add(from).commands.toggleBulletList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles bullet list to ordered list', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(ol(li(p('make list'))));

    editor.add(from).commands.toggleOrderedList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles nested ordered list to bullet list', () => {
    const from = doc(
      ol(
        li(
          p('1'),
          ol(
            li(p('1.1')),
            li(p('1.2<cursor>')), //
            li(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );
    const to = doc(
      ol(
        li(
          p('1'),
          ul(
            li(p('1.1')),
            li(p('1.2<cursor>')), //
            li(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );

    editor.add(from).commands.toggleBulletList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles nested ordered list to task list', () => {
    const from = doc(
      ol(
        li(
          p('1'),
          ol(
            li(p('1.1')),
            li(p('1.2<cursor>')), //
            li(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );
    const to = doc(
      ol(
        li(
          p('1'),
          taskList(
            unchecked(p('1.1')),
            unchecked(p('1.2<cursor>')), //
            unchecked(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );

    editor.add(from).commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles nested task list to bullet list', () => {
    const from = doc(
      ol(
        li(
          p('1'),
          taskList(
            checked(p('1.1')),
            checked(p('1.2<cursor>')), //
            unchecked(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );
    const to = doc(
      ol(
        li(
          p('1'),
          ul(
            li(p('1.1')),
            li(p('1.2<cursor>')), //
            li(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );

    editor.add(from).commands.toggleBulletList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles nested task list to paragraph', () => {
    const from = doc(
      ol(
        li(
          p('1'),
          taskList(
            checked(p('1.1')),
            checked(p('1.2<cursor>')), //
            unchecked(p('1.3')),
          ),
        ),
        li(p('2')),
      ),
    );
    const to = doc(
      ol(
        li(
          p('1'),
          taskList(
            checked(p('1.1')), //
          ),
          p('1.2xx'),
          taskList(
            unchecked(p('1.3')), //
          ),
        ),
        li(p('2')),
      ),
    );

    editor.add(from).commands.toggleTaskList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles nested task list to ordered list', () => {
    const from = doc(
      ol(
        li(
          p('1'),
          taskList(
            checked(p('1.1')),
            checked(p('1.2<cursor>')), //
            unchecked(
              p('1.3'),
              taskList(
                checked(p('1.3.1')),
                checked(p('1.3.2')), //
              ),
            ),
          ),
        ),
        li(p('2')),
      ),
    );
    const to = doc(
      ol(
        li(
          p('1'),
          ol(
            li(p('1.1')),
            li(p('1.2xx')), //
            li(
              p('1.3'),
              taskList(
                checked(p('1.3.1')),
                checked(p('1.3.2')), //
              ),
            ),
          ),
        ),
        li(p('2')),
      ),
    );

    editor.add(from).commands.toggleOrderedList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles the second child to a task list', () => {
    const from = doc(
      taskList(
        checked(p('1')),
        checked(
          p('2'),
          taskList(
            checked(p('2.1')),
            checked(
              p('2.2'),
              p('paragraph<cursor>'), //
            ),
          ),
        ),
      ),
    );
    const to = doc(
      taskList(
        checked(p('1')),
        checked(
          p('2'),
          taskList(
            checked(p('2.1')),
            checked(
              p('2.2'),
              taskList(
                unchecked(p('paragraph<cursor>')), //
              ),
            ),
          ),
        ),
      ),
    );
    editor.add(from).commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    editor.commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('lifts list item', () => {
    const from = doc(
      taskList(
        checked(p('1')),
        checked(
          p('2'),
          taskList(
            checked(p('2.1')),
            checked(
              p('2.2<cursor>'),
              p('paragraph'), //
            ),
          ),
        ),
      ),
    );
    const to = doc(
      taskList(
        checked(p('1')),
        checked(
          p('2'),
          taskList(
            checked(p('2.1')), //
          ),
          p('2.2'),
          p('paragraph'), //
        ),
      ),
    );
    editor.add(from).commands.toggleTaskList();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('leaves document unchanged without dispatch', () => {
    const unchanged = doc(ol(li(p('make <cursor>list'))));
    const { state, view } = editor.add(unchanged);
    const tr = state.tr;

    toggleList(editor.schema.nodes.bulletList, editor.schema.nodes.listItem)({ state, tr });
    view.dispatch(tr);

    expect(view.state.doc).toEqualProsemirrorNode(unchanged);
  });
});
