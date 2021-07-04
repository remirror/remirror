import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
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

  it('creates a taskList in a multi-items list', () => {
    editor.add(
      doc(
        bulletList(
          listItem(p('123')),
          listItem(p('456')),
          listItem(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(p('123')), //
          listItem(p('456')), //
        ),
        taskList(
          checkedItem(p('')), //
        ),
      ),
    );

    editor.add(
      doc(
        bulletList(
          listItem(p('123')),
          listItem(p('<cursor>')), //
          listItem(p('789')),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(p('123')), //
        ),
        taskList(
          checkedItem(p('')), //
        ),
        bulletList(
          listItem(p('789')), //
        ),
      ),
    );

    editor.add(
      doc(
        bulletList(
          listItem(p('<cursor>')), //
          listItem(p('456')),
          listItem(p('789')),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          checkedItem(p('')), //
        ),
        bulletList(
          listItem(p('456')), //
          listItem(p('789')), //
        ),
      ),
    );
  });

  it('creates a taskList in a nested list', () => {
    editor.add(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(
            p('123'),
            taskList(
              checkedItem(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('abc')), //
              listItem(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('abc')), //
            ),
            taskList(
              checkedItem(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('<cursor>')), //
              listItem(p('def')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(
            p('123'),
            taskList(
              checkedItem(p('<cursor>')), //
            ),
            bulletList(
              listItem(p('def')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('abc')), //
              listItem(p('<cursor>')), //
              listItem(p('def')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        bulletList(
          listItem(
            p('123'),
            bulletList(
              listItem(p('abc')), //
            ),
            taskList(
              uncheckedItem(p('<cursor>')), //
            ),
            bulletList(
              listItem(p('def')), //
            ),
          ),
        ),
      ),
    );
  });

  it('does not create a list if already inside a such list', () => {
    editor.add(doc(bulletList(listItem(p('<cursor>')))));
    editor.insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(doc(bulletList(listItem(p('- ')))));

    editor.add(doc(orderedList({ order: 1 })(listItem(p('<cursor>')))));
    editor.insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 1 })(listItem(p('1. ')))));

    editor.add(doc(taskList(uncheckedItem(p('<cursor>')))));
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(uncheckedItem(p('[x] ')))));
  });
});
