import { setupListEditor } from './list-setup';

describe('create a list', () => {
  const { taskList, li, doc, p, ul, ol, orderedList, unchecked, checked, editor } =
    setupListEditor();

  it('creates a bulletList', () => {
    editor.add(doc(p(''))).insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(doc(ul(li(p('')))));

    editor.add(doc(p(''))).insertText('+ ');
    expect(editor.doc).toEqualProsemirrorNode(doc(ul(li(p('')))));

    editor.add(doc(p(''))).insertText('* ');
    expect(editor.doc).toEqualProsemirrorNode(doc(ul(li(p('')))));
  });

  it('creates an orderedList', () => {
    editor.add(doc(p(''))).insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 1 })(li(p('')))));

    editor.add(doc(p(''))).insertText('999. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 999 })(li(p('')))));
  });

  it('creates a taskList', () => {
    editor.add(doc(p(''))).insertText('[] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(unchecked(p('')))));

    editor.add(doc(p(''))).insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(unchecked(p('')))));

    editor.add(doc(p(''))).insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(checked(p('')))));

    editor.add(doc(p(''))).insertText('[X] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(checked(p('')))));
  });

  it('creates a task list in a bullet list', () => {
    editor.add(
      doc(
        ul(
          li(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          unchecked(p('')), //
        ),
      ),
    );
  });

  it('creates a task list in an ordered list', () => {
    editor.add(
      doc(
        orderedList({ order: 1 })(
          li(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          checked(p('')), //
        ),
      ),
    );
  });

  it('creates a bullet list in an ordered list', () => {
    editor.add(
      doc(
        orderedList({ order: 1 })(
          li(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(p('')), //
        ),
      ),
    );
  });

  it('creates a bullet list in a task list', () => {
    editor.add(
      doc(
        taskList(
          checked(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(p('')), //
        ),
      ),
    );
  });

  it('creates an ordered list in a bullet list', () => {
    editor.add(
      doc(
        ul(
          li(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        orderedList()(
          li(p('')), //
        ),
      ),
    );
  });

  it('creates an ordered list in a task list', () => {
    editor.add(
      doc(
        taskList(
          unchecked(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        orderedList()(
          li(p('')), //
        ),
      ),
    );
  });

  it('creates a taskList in a multi-items list', () => {
    editor.add(
      doc(
        ul(
          li(p('123')),
          li(p('456')),
          li(p('<cursor>')), //
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(p('123')), //
          li(p('456')), //
        ),
        taskList(
          checked(p('')), //
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(p('123')),
          li(p('<cursor>')), //
          li(p('789')),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(p('123')), //
        ),
        taskList(
          checked(p('')), //
        ),
        ul(
          li(p('789')), //
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(p('<cursor>')), //
          li(p('456')),
          li(p('789')),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        taskList(
          checked(p('')), //
        ),
        ul(
          li(p('456')), //
          li(p('789')), //
        ),
      ),
    );
  });

  it('creates a taskList in a nested list', () => {
    editor.add(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(
            p('123'),
            taskList(
              checked(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('abc')), //
              li(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('abc')), //
            ),
            taskList(
              checked(p('<cursor>')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('<cursor>')), //
              li(p('def')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(
            p('123'),
            taskList(
              checked(p('<cursor>')), //
            ),
            ul(
              li(p('def')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('abc')), //
              li(p('<cursor>')), //
              li(p('def')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[ ] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(
            p('123'),
            ul(
              li(p('abc')), //
            ),
            taskList(
              unchecked(p('<cursor>')), //
            ),
            ul(
              li(p('def')), //
            ),
          ),
        ),
      ),
    );
  });

  it('does not create a list if already inside a such list', () => {
    editor.add(doc(ul(li(p('<cursor>')))));
    editor.insertText('- ');
    expect(editor.doc).toEqualProsemirrorNode(doc(ul(li(p('- ')))));

    editor.add(doc(orderedList({ order: 1 })(li(p('<cursor>')))));
    editor.insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(doc(orderedList({ order: 1 })(li(p('1. ')))));

    editor.add(doc(taskList(unchecked(p('<cursor>')))));
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(doc(taskList(unchecked(p('[x] ')))));
  });

  it('handle sub-list correctly', () => {
    editor.add(
      doc(
        ul(
          li(
            p('<cursor>root item'), //
            ul(
              li(p('sub item')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('1. ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        orderedList()(
          li(
            p('<cursor>root item'), //
            ul(
              li(p('sub item')), //
            ),
          ),
        ),
      ),
    );

    editor.add(
      doc(
        ul(
          li(
            p('root item'), //
            ol(
              li(p('<cursor>sub item')), //
            ),
          ),
        ),
      ),
    );
    editor.insertText('[x] ');
    expect(editor.doc).toEqualProsemirrorNode(
      doc(
        ul(
          li(
            p('<cursor>root item'), //
            taskList(
              checked(p('sub item')), //
            ),
          ),
        ),
      ),
    );
  });
});

describe('joins lists', () => {
  const {
    editor,
    doc,
    taskList,
    ul: bulletList,
    checked,
    unchecked,
    p,
    orderedList,
    li: listItem,
  } = setupListEditor();

  describe('input rules', () => {
    it('bullet list => task list (join backward and forward)', () => {
      editor.add(
        doc(
          taskList(
            checked(p('A')), //
          ),
          bulletList(
            listItem(p('<cursor>B')), //
          ),
          taskList(
            checked(p('C')), //
          ),
        ),
      );
      editor.insertText('[x] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            checked(p('A')), //
            checked(p('B')), //
            checked(p('C')), //
          ),
        ),
      );
    });

    it('bullet list => task list (join backward)', () => {
      editor.add(
        doc(
          taskList(
            checked(p('A')), //
          ),
          bulletList(
            listItem(p('<cursor>B')), //
          ),
        ),
      );
      editor.insertText('[x] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            checked(p('A')), //
            checked(p('B')), //
          ),
        ),
      );
    });

    it('bullet list => task list (join forward)', () => {
      editor.add(
        doc(
          bulletList(
            listItem(p('<cursor>B')), //
          ),
          taskList(
            checked(p('C')), //
          ),
        ),
      );
      editor.insertText('[x] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            checked(p('B')), //
            checked(p('C')), //
          ),
        ),
      );
    });

    it('ordered list => task list (join backward and forward)', () => {
      editor.add(
        doc(
          taskList(
            unchecked(p('A')), //
          ),
          orderedList()(
            listItem(p('<cursor>B')), //
          ),
          taskList(
            unchecked(p('C')), //
          ),
        ),
      );
      editor.insertText('[ ] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            unchecked(p('A')), //
            unchecked(p('B')), //
            unchecked(p('C')), //
          ),
        ),
      );
    });

    it('ordered list => task list (join backward)', () => {
      editor.add(
        doc(
          taskList(
            unchecked(p('A')), //
          ),
          orderedList()(
            listItem(p('<cursor>B')), //
          ),
        ),
      );
      editor.insertText('[ ] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            unchecked(p('A')), //
            unchecked(p('B')), //
          ),
        ),
      );
    });

    it('ordered list => task list (join forward)', () => {
      editor.add(
        doc(
          orderedList()(
            listItem(p('<cursor>B')), //
          ),
          taskList(
            unchecked(p('C')), //
          ),
        ),
      );
      editor.insertText('[ ] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            unchecked(p('B')), //
            unchecked(p('C')), //
          ),
        ),
      );
    });

    it('paragraph => task list (join backward and forward)', () => {
      editor.add(
        doc(
          taskList(
            checked(p('A')), //
          ),
          p('<cursor>B'), //
          taskList(
            checked(p('C')), //
          ),
        ),
      );
      editor.insertText('[x] ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          taskList(
            checked(p('A')), //
            checked(p('B')), //
            checked(p('C')), //
          ),
        ),
      );
    });

    it('paragraph => bullet list (join backward)', () => {
      editor.add(
        doc(
          bulletList(
            listItem(p('A')), //
          ),
          p('<cursor>B'), //
          taskList(
            checked(p('C')), //
          ),
        ),
      );
      editor.insertText('- ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          bulletList(
            listItem(p('A')), //
            listItem(p('B')), //
          ),
          taskList(
            checked(p('C')), //
          ),
        ),
      );
    });

    it('paragraph => ordered list (join forward)', () => {
      editor.add(
        doc(
          bulletList(
            listItem(p('A')), //
          ),
          p('<cursor>B'), //
          orderedList()(
            listItem(p('C')), //
          ),
        ),
      );
      editor.insertText('1. ');
      expect(editor.doc).toEqualProsemirrorNode(
        doc(
          bulletList(
            listItem(p('A')), //
          ),
          orderedList()(
            listItem(p('B')), //
            listItem(p('C')), //
          ),
        ),
      );
    });

    //
  });
});
