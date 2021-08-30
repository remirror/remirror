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

describe('toggleCheckboxChecked', () => {
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

  it('toggles checkbox checked when the cursor is at the end of a task list item', () => {
    const from = doc(
      taskList(
        unchecked(p('hello<cursor>')), //
      ),
    );
    const to = doc(
      taskList(
        checked(p('hello')), //
      ),
    );
    editor.add(from).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles checkbox checked when the cursor is at the begining of a task list item', () => {
    const from = doc(
      taskList(
        unchecked(p('<cursor>hello')), //
      ),
    );
    const to = doc(
      taskList(
        checked(p('hello')), //
      ),
    );
    editor.add(from).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles checkbox checked when the cursor is at the middle of a task list item', () => {
    const from = doc(
      taskList(
        checked(p('h<start>ell<end>o')), //
      ),
    );
    const to = doc(
      taskList(
        unchecked(p('hello')), //
      ),
    );
    editor.add(from).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('does not toggle checkbox checked when the cursor is outside of a task list item', () => {
    const from = doc(
      taskList(
        checked(p('hello')), //
      ),
      p('<cursor>world'),
    );
    const to = doc(
      taskList(
        checked(p('hello')), //
      ),
      p('world'),
    );
    editor.add(from).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('only toggles the first item', () => {
    const from = doc(
      taskList(
        checked(p('111111')),
        checked(p('2222<start>22')),
        unchecked(p('333333')),
        unchecked(p('4444<end>44')),
        unchecked(p('555555')), //
      ),
    );
    const to = doc(
      taskList(
        checked(p('111111')),
        unchecked(p('222222')),
        unchecked(p('333333')),
        unchecked(p('444444')),
        unchecked(p('555555')), //
      ),
    );
    editor.add(from).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('accepts an optional boolean parameter', () => {
    const checkedDoc = doc(taskList(checked(p('hello<cursor>'))));
    const uncheckedDoc = doc(taskList(unchecked(p('hello<cursor>'))));

    editor.add(checkedDoc).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(uncheckedDoc);

    editor.add(checkedDoc).commands.toggleCheckboxChecked(true);
    expect(editor.view.state.doc).toEqualProsemirrorNode(checkedDoc);

    editor.add(checkedDoc).commands.toggleCheckboxChecked(false);
    expect(editor.view.state.doc).toEqualProsemirrorNode(uncheckedDoc);

    editor.add(uncheckedDoc).commands.toggleCheckboxChecked();
    expect(editor.view.state.doc).toEqualProsemirrorNode(checkedDoc);

    editor.add(uncheckedDoc).commands.toggleCheckboxChecked(true);
    expect(editor.view.state.doc).toEqualProsemirrorNode(checkedDoc);

    editor.add(uncheckedDoc).commands.toggleCheckboxChecked(false);
    expect(editor.view.state.doc).toEqualProsemirrorNode(uncheckedDoc);
  });
});
