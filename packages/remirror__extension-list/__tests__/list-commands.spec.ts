import { toggleList } from 'remirror/extensions';

import { calculateItemRange } from '../src/list-commands';
import { setupListEditor } from './list-setup';

describe('toggleList', () => {
  const { editor, doc, p, ul, ol, li, taskList, checked, unchecked } = setupListEditor();

  it('toggles paragraph to bullet list', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(ul(li(p('make xxlist'))));

    editor.add(from).commands.toggleBulletList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles bullet list to paragraph', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(p('make xxlist'));

    editor.add(from).commands.toggleBulletList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles task list to paragraph', () => {
    const from = doc(taskList(checked(p('make <cursor>list'))));
    const to = doc(p('make xxlist'));

    editor.add(from).commands.toggleTaskList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles paragraph to task list', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(taskList(unchecked(p('make xxlist'))));

    editor.add(from).commands.toggleTaskList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles ordered list to bullet list', () => {
    const from = doc(ol(li(p('make <cursor>list'))));
    const to = doc(ul(li(p('make xxlist'))));

    editor.add(from).commands.toggleBulletList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles bullet list to ordered list', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(ol(li(p('make xxlist'))));

    editor.add(from).commands.toggleOrderedList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles bullet list to task list', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(taskList(unchecked(p('make xxlist'))));

    editor.add(from).commands.toggleTaskList();
    editor.insertText('xx');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('toggles task list to ordered list', () => {
    const from = doc(taskList(unchecked(p('make <cursor>list'))));
    const to = doc(ol(li(p('make xxlist'))));

    editor.add(from).commands.toggleOrderedList();
    editor.insertText('xx');
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
  const { editor, doc, p, taskList, checked, unchecked } = setupListEditor();

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

describe('calculateItemRange', () => {
  const { editor, doc, p, ul, ol, li, taskList, checked, unchecked } = setupListEditor();

  it('returns correct range when the selection is empty', () => {
    editor.add(
      doc(
        ul(
          li(p('A<cursor>')), //
          li(p('B')), //
          li(p('C')), //
        ),
      ),
    );
    const range = calculateItemRange(editor.state.selection)!;
    expect(range.depth).toEqual(1);
    expect(range.parent.type.name).toEqual('bulletList');
    expect(range.startIndex).toEqual(0);
    expect(range.endIndex).toEqual(1);
    expect(editor.doc.resolve(range.start).node().type.name).toEqual('bulletList');
    expect(editor.doc.resolve(range.end).node().type.name).toEqual('bulletList');
  });

  it('returns correct range when the selection is not empty', () => {
    editor.add(
      doc(
        taskList(
          unchecked(p('A')), //
          checked(p('B<start>')), //
          checked(p('C<end>')), //
        ),
      ),
    );
    const range = calculateItemRange(editor.state.selection)!;
    expect(range.depth).toEqual(1);
    expect(range.parent.type.name).toEqual('taskList');
    expect(range.startIndex).toEqual(1);
    expect(range.endIndex).toEqual(3);

    const { start, end } = range;
    expect(editor.doc.resolve(start).node().type.name).toEqual('taskList');
    expect(editor.doc.resolve(end).node().type.name).toEqual('taskList');

    expect(editor.doc.resolve(start).nodeAfter?.type.name).toEqual('taskListItem');
    expect(editor.doc.resolve(end).nodeBefore?.type.name).toEqual('taskListItem');
  });

  it('returns correct range when the selection is in a deep list', () => {
    editor.add(
      doc(
        ul(
          li(p('A')),
          li(
            p('B'),
            ol(
              li(p('a')), //
              li(p('<start>b')),
              li(p('c')),
              li(p('d<end>')),
            ),
          ),
          li(p('C')),
        ),
      ),
    );
    const range = calculateItemRange(editor.state.selection)!;
    expect(range.depth).toEqual(3);
    expect(range.parent.type.name).toEqual('orderedList');
    expect(range.startIndex).toEqual(1);
    expect(range.endIndex).toEqual(4);
    expect(editor.doc.resolve(range.start).node().type.name).toEqual('orderedList');
    expect(editor.doc.resolve(range.end).node().type.name).toEqual('orderedList');

    const slice = editor.doc.slice(range.start, range.end);
    expect(slice.openStart).toEqual(0);
    expect(slice.openEnd).toEqual(0);
    expect(slice.content.childCount).toEqual(3);
  });

  it('returns correct range when the selection across different levels', () => {
    editor.add(
      doc(
        ul(
          li(p('A')),
          li(
            p('B<start>'),
            ol(
              li(p('a')), //
              li(p('b')),
              li(p('c')),
              li(p('d<end>')),
            ),
          ),
          li(p('C')),
        ),
      ),
    );
    const range = calculateItemRange(editor.state.selection)!;
    expect(range.depth).toEqual(1);
    expect(range.parent.type.name).toEqual('bulletList');
    expect(range.startIndex).toEqual(1);
    expect(range.endIndex).toEqual(2);
    expect(editor.doc.resolve(range.start).node().type.name).toEqual('bulletList');
    expect(editor.doc.resolve(range.end).node().type.name).toEqual('bulletList');
  });

  it('returns nothing when the selection is not in a list', () => {
    editor.add(
      doc(
        ul(
          li(p('A')), //
          li(p('B')), //
          li(p('C')), //
        ),
        p('<cursor>'),
      ),
    );
    const range = calculateItemRange(editor.state.selection);
    expect(range).toBeUndefined();
  });
});
