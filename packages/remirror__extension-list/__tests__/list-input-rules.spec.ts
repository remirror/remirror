import { createEditor, doc, li, ol, p, schema, ul } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
  toggleList,
} from 'remirror/extensions';

describe('create a list', () => {
  const editor = renderEditor([
    new BulletListExtension({}),
    new ListItemExtension({}),
    new OrderedListExtension(),
    new TaskListExtension(),
  ]);

  const {
    nodes: { bulletList, taskList, listItem, doc, p },
    attributeNodes: { taskListItem, orderedList },
  } = editor;

  const uncheckedItem = taskListItem({ checked: false });
  const checkedItem = taskListItem({ checked: true });

  it('creates a bulletList', () => {
    editor.add(doc(p(''))).insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(doc(bulletList(listItem(p('')))));

    editor.add(doc(p(''))).insertText('+ ');
    expect(editor.doc).toEqualProsemirrorNode(doc(bulletList(listItem(p('')))));

    editor.add(doc(p(''))).insertText('* ');
    expect(editor.doc).toEqualProsemirrorNode(doc(bulletList(listItem(p('')))));
  });

  it('creates an orderedList', () => {
    editor.add(doc(p(''))).insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 1 })(listItem(p('')))));

    editor.add(doc(p(''))).insertText('999. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 999 })(listItem(p('')))));
  });

  it('creates a taskList', () => {
    editor.add(doc(p(''))).insertText('[] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(uncheckedItem(p('')))));

    editor.add(doc(p(''))).insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(uncheckedItem(p('')))));

    editor.add(doc(p(''))).insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(checkedItem(p('')))));

    editor.add(doc(p(''))).insertText('[X] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(checkedItem(p('')))));
  });

  it('creates a taskList in a bulletListItem', () => {
    editor.add(
      doc(
        bulletList(
          listItem(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          uncheckedItem(p('')), //
        ),
      ),
    );
  });

  it('creates a taskList in an ordered ListItem', () => {
    editor.add(
      doc(
        orderedList({ order: 1 })(
          listItem(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          checkedItem(p('')), //
        ),
      ),
    );
  });
});
