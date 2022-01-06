import { TaggedProsemirrorNode } from 'jest-remirror';

import { setupListEditor } from './list-setup';

describe('Enter', () => {
  const {
    doc,
    p,
    ol,
    ul,
    li,
    taskList: tl,
    unchecked,
    checked,
    editor,
    listItem,
  } = setupListEditor();
  const closed = listItem({ closed: true });

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('splits a bullet list item', () => {
    from = doc(ul(li(p('hello <cursor>world'))));
    to = doc(ul(li(p('hello ')), li(p('world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(ul(li(p('<cursor>hello world'))));
    to = doc(ul(li(p('')), li(p('hello world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(ul(li(p('hello world<cursor>'))));
    to = doc(ul(li(p('hello world')), li(p(''))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('splits an ordered list item', () => {
    from = doc(ol(li(p('hello <cursor>world'))));
    to = doc(ol(li(p('hello ')), li(p('world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(ol(li(p('<cursor>hello world'))));
    to = doc(ol(li(p('')), li(p('hello world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(ol(li(p('hello world<cursor>'))));
    to = doc(ol(li(p('hello world')), li(p(''))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('splits a task list item', () => {
    from = doc(tl(unchecked(p('hello <cursor>world'))));
    to = doc(tl(unchecked(p('hello ')), unchecked(p('world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(unchecked(p('<cursor>hello world'))));
    to = doc(tl(unchecked(p('')), unchecked(p('hello world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(unchecked(p('hello world<cursor>'))));
    to = doc(tl(unchecked(p('hello world')), unchecked(p(''))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('cleans the `checked` attribute when splitting a task list item', () => {
    from = doc(tl(checked(p('hello <cursor>world'))));
    to = doc(tl(checked(p('hello ')), unchecked(p('world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(checked(p('<cursor>hello world'))));
    to = doc(tl(checked(p('')), unchecked(p('hello world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(checked(p('hello world<cursor>'))));
    to = doc(tl(checked(p('hello world')), unchecked(p(''))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('keeps the content in its origin list item when splitting a closed item', () => {
    from = doc(
      ul(
        closed(
          p('hello world<cursor>'),
          ul(
            li(p('nested list item')), //
          ),
        ),
      ),
    );
    to = doc(
      ul(
        closed(
          p('hello world'),
          ul(
            li(p('nested list item')), //
          ),
        ),
        li(p()),
      ),
    );
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(
      ul(
        closed(
          p('hello <start>world<end>'),
          ul(
            li(p('nested list item')), //
          ),
        ),
      ),
    );
    to = doc(
      ul(
        closed(
          p('hello '),
          ul(
            li(p('nested list item')), //
          ),
        ),
        li(p()),
      ),
    );
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    // Don't keep the content in its origin list item when it's not a closed list item.
    from = doc(
      ul(
        li(
          p('hello world<cursor>'),
          ul(
            li(p('nested list item')), //
          ),
        ),
      ),
    );
    to = doc(
      ul(
        li(p('hello world')),
        li(
          p(),
          ul(
            li(p('nested list item')), //
          ),
        ),
      ),
    );
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('keeps the content below when deleting a list item', () => {
    from = doc(
      ul(
        li(
          p('Head'),
          ul(
            li(p('A1')), //
            li(p('A2')), //
            li(p('A3')), //
            li(p('<cursor>')), //
          ),
          p('Tail'),
        ),
      ),
    );
    to = doc(
      ul(
        li(
          p('Head'),
          ul(
            li(p('A1')), //
            li(p('A2')), //
            li(p('A3')), //
          ),
        ),
        li(
          p(''),
          p('Tail'), //
        ),
      ),
    );
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});

describe('Tab and Shift-Tab', () => {
  const { doc, p, ol, ul, li, taskList: tl, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('never lifts a list item out of the list', () => {
    from = doc(
      ul(
        li(p('hello')),
        li(p('world<cursor>')), //
      ),
    );
    editor.add(from).press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('sink and lift (1)', () => {
    from = doc(
      ul(
        li(p('hello')),
        li(p('world<cursor>')), //
      ),
    );
    to = doc(
      ul(
        li(
          p('hello'),
          ul(
            li(p('world')), //
          ),
        ),
      ),
    );
    editor.add(from).press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('sink and lift (2)', () => {
    from = doc(
      ul(
        li(
          p('hello'),
          tl(
            checked(
              p('hello'), //
            ),
            unchecked(
              p('world'), //
              ol(
                li(p('hello')), //
                li(p('world<cursor>')), //
              ),
            ),
          ),
        ),
      ),
    );
    to = doc(
      ul(
        li(
          p('hello'),
          tl(
            checked(
              p('hello'), //
            ),
            unchecked(
              p('world'), //
              ol(
                li(
                  p('hello'),
                  ol(
                    li(p('world')), //
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    editor.add(from).press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('sink and lift (3)', () => {
    from = doc(
      ol(
        li(
          p('hello'),
          ul(
            li(
              p('hello'), //
            ),
            li(
              p('world'), //
              tl(
                unchecked(p('hello')), //
                checked(p('world<cursor>')), //
              ),
            ),
          ),
        ),
      ),
    );
    to = doc(
      ol(
        li(
          p('hello'),
          ul(
            li(
              p('hello'), //
            ),
            li(
              p('world'), //
              tl(
                unchecked(
                  p('hello'),
                  tl(
                    checked(p('world')), //
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    editor.add(from).press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('sink and lift (4)', () => {
    from = doc(
      tl(
        checked(
          p('hello'),
          ol(
            li(
              p('hello'), //
            ),
            li(
              p('world'), //
              ol(
                li(p('hello')), //
                li(p('world<cursor>')), //
              ),
            ),
          ),
        ),
      ),
    );
    to = doc(
      tl(
        checked(
          p('hello'),
          ol(
            li(
              p('hello'), //
            ),
            li(
              p('world'), //
              ol(
                li(
                  p('hello'),
                  ol(
                    li(p('world')), //
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    editor.add(from).press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it('lift mixed list items', () => {
    from = doc(
      tl(
        checked(
          p('A'),
          ol(
            li(
              p('<cursor>B'), //
              ol(
                li(p('C')), //
              ),
            ),
            li(p('D')), //
          ),
        ),
      ),
    );
    to = doc(
      tl(
        checked(p('A')),
        unchecked(
          p('B'),
          ol(
            li(p('C')), //
            li(p('D')), //
          ),
        ),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});

describe('Indent', () => {
  const { doc, p, ol, ul, li, taskList, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('can indent a ul list item', () => {
    from = doc(
      ul(
        li(p('A')),
        li(p('B<start>123<end>')),
        li(p('C')), //
      ),
    );
    to = doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('B123')), //
          ),
        ),
        li(p('C')),
      ),
    );
    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toEqual(
      `<bulletList(listItem(bulletList(listItem(paragraph("123")))))>`,
    );
  });

  it('can indent a task list item', () => {
    from = doc(
      taskList(
        unchecked(p('A')),
        checked(p('B<start>123<end>')),
        checked(p('C')), //
      ),
    );
    to = doc(
      taskList(
        unchecked(
          p('A'),
          taskList(
            checked(p('B123')), //
          ),
        ),
        checked(p('C')),
      ),
    );
    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toEqual(
      `<taskList(taskListItem(taskList(taskListItem(paragraph("123")))))>`,
    );
  });

  it('can indent a list item in a mixed list', () => {
    from = doc(
      taskList(
        unchecked(p('A')), //
      ),
      ul(
        li(p('B<start>123<end>')), //
        li(p('C')), //
      ),
    );
    to = doc(
      taskList(
        unchecked(
          p('A'),
          ul(
            li(p('B123')), //
          ),
        ),
      ),
      ul(
        li(p('C')), //
      ),
    );
    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toEqual(
      `<taskList(taskListItem(bulletList(listItem(paragraph("123")))))>`,
    );
  });

  it('can not indent first list item', () => {
    from = doc(
      ul(
        li(p('A<cursor>')), //
        li(p('C')), //
      ),
    );
    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);

    from = doc(
      ol(
        li(
          p(''),
          ul(
            li(p('A<cursor>')), //
            li(p('C')), //
          ),
        ),
      ),
    );
    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(from);
  });

  it("won't change the indent of unselected sublist (simple)", () => {
    from = doc(
      ul(
        li(p('A')),
        li(
          p('B<cursor>'),
          ul(
            li(p('C')), //
          ),
        ),
      ),
    );
    to = doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('B')),
            li(p('C')), //
          ),
        ),
      ),
    );

    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it("won't change the indent of unselected sublist (complex)", () => {
    from = doc(
      ol(
        li(p('1')),
        li(p('2')), //
      ),
      ul(
        li(
          p('A'),
          p('<start>B'),
          taskList(checked(p('C')), checked(p('D'))),
          ol(li(p('E<end>')), li(p('F'))),
          ul(li(p('G')), li(p('H'))),
          p('I'),
        ),
      ),
    );
    to = doc(
      ol(
        li(p('1')),
        li(
          p('2'),
          ul(
            li(
              p('A'),
              p('B'),
              taskList(checked(p('C')), checked(p('D'))),
              ol(li(p('E<end>')), li(p('F'))), //
            ),
            li(p('G')),
            li(p('H')),
          ),
          p('I'),
        ),
      ),
    );

    editor.add(from);
    editor.press('Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toBe(
      '<orderedList(listItem(bulletList(listItem(paragraph("B"), taskList(taskListItem(paragraph("C")), taskListItem(paragraph("D"))), orderedList(listItem(paragraph("E")))))))>',
    );
  });
});

describe('Dedent', () => {
  const { doc, p, ol, ul, li, taskList, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('can dedent a ul list item', () => {
    from = doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('B<start>123<end>')), //
          ),
        ),
        li(p('C')),
      ),
    );
    to = doc(
      ul(
        li(p('A')),
        li(p('B123')),
        li(p('C')), //
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toBe(
      '<bulletList(listItem(paragraph("123")))>',
    );
  });

  it('can dedent a task list item', () => {
    from = doc(
      taskList(
        unchecked(
          p('A'),
          taskList(
            checked(p('B<start>123<end>')), //
          ),
        ),
        checked(p('C')),
      ),
    );
    to = doc(
      taskList(
        unchecked(p('A')),
        checked(p('B123')),
        checked(p('C')), //
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
    expect(editor.view.state.selection.content().content.toString()).toBe(
      '<taskList(taskListItem(paragraph("123")))>',
    );
  });

  it('can dedent a list item from a mixed list (1)', () => {
    from = doc(
      ol(
        li(
          p('A'),
          ul(
            li(p('B1<cursor>')), //
            li(p('B2')), //
            li(p('B3')), //
          ),
        ),
        li(p('C')),
      ),
    );
    to = doc(
      ol(
        li(p('A')),
        li(
          p('B1'),
          ul(
            li(p('B2')), //
            li(p('B3')), //
          ),
        ),
        li(p('C')),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('can dedent a list item from a mixed list (2)', () => {
    from = doc(
      ul(
        li(
          p('A'),
          taskList(
            checked(p('B1')), //
            checked(p('B2<cursor>')), //
            checked(p('B3')), //
          ),
        ),
        li(p('C')),
      ),
    );
    to = doc(
      ul(
        li(
          p('A'),
          taskList(
            checked(p('B1')), //
          ),
        ),
        li(
          p('B2'),
          taskList(
            checked(p('B3')), //
          ),
        ),
        li(p('C')),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('can dedent a list item from a mixed list (3)', () => {
    from = doc(
      taskList(
        checked(
          p('A'),
          ul(
            li(p('B1')), //
            li(p('B2')), //
            li(p('B3<cursor>')), //
          ),
        ),
        checked(p('C')),
      ),
    );
    to = doc(
      taskList(
        checked(
          p('A'),
          ul(
            li(p('B1')), //
            li(p('B2')), //
          ),
        ),
        unchecked(p('B3')),
        checked(p('C')),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('can dedent a list item with different type of sibling', () => {
    from = doc(
      ul(
        li(
          p('A'),
          ul(li(p('B<cursor>'))), //
          ol(li(p('C'))),
        ),
      ),
    );
    to = doc(
      ul(
        li(p('A')),
        li(
          p('B'),
          ol(li(p('C'))), //
        ),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('can indent siblings of selected items', () => {
    from = doc(
      ol(
        li(
          p('Root'),
          taskList(
            unchecked(p('A')),
            unchecked(p('<start>B')),
            unchecked(p('<end>C')),
            unchecked(p('D')), //
          ),
        ),
      ),
    );
    to = doc(
      ol(
        li(
          p('Root'),
          taskList(
            unchecked(p('A')), //
          ),
        ),
        li(p('B')),
        li(
          p('C'),
          taskList(unchecked(p('D'))), //
        ),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('can indent siblings of selected list', () => {
    from = doc(
      ul(
        li(
          p('Root'),
          ul(
            li(p('A')),
            li(p('<start>B')),
            li(p('<end>C')), //
          ),
          p('Sibling'),
        ),
      ),
    );
    to = doc(
      ul(
        li(
          p('Root'),
          ul(
            li(p('A')), //
          ),
        ),
        li(p('B')),
        li(
          p('C'),
          p('Sibling'), //
        ),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(
      ol(
        li(
          p('Root'),
          taskList(
            unchecked(p('A')),
            unchecked(p('<start>B')),
            unchecked(p('<end>C')), //
          ),
          ul(li(p('Sibling'))),
        ),
      ),
    );
    to = doc(
      ol(
        li(
          p('Root'),
          taskList(
            unchecked(p('A')), //
          ),
        ),
        li(p('B')),
        li(
          p('C'), //
          ul(li(p('Sibling'))),
        ),
      ),
    );
    editor.add(from);
    editor.press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});

describe('Backspace', () => {
  const { doc, p, ol, ul, li, taskList, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('presses backspace to delete selected text', () => {
    from = doc(
      ul(
        li(p('A<start>a<end>')),
        li(p('B')),
        li(p('C')), //
      ),
    );
    to = doc(
      ul(
        li(p('A')),
        li(p('B')),
        li(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace at the begin of a ul list', () => {
    from = doc(
      ul(
        li(p('<cursor>A')),
        li(p('B')),
        li(p('C')), //
      ),
    );
    to = doc(
      p('A'),
      ul(
        li(p('B')),
        li(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace at the begin of a 2-level ul list', () => {
    from = doc(
      ul(
        li(
          p('A'),
          ul(
            li(p('<cursor>a')), //
          ),
        ),
        li(p('B')),
        li(p('C')), //
      ),
    );
    to = doc(
      ul(
        li(p('A'), p('a')),
        li(p('B')),
        li(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace at the begin of a 3-level ul list', () => {
    from = doc(
      ul(
        li(
          p('A'),
          ul(
            li(
              p('<cursor>a'),
              ul(
                li(p('b')), //
              ),
            ), //
          ),
        ),
        li(p('B')),
        li(p('C')), //
      ),
    );
    to = doc(
      ul(
        li(
          p('A'),
          p('a'),
          ul(
            li(p('b')), //
          ),
        ),
        li(p('B')),
        li(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace at the begin of a 3-level mixed list (1)', () => {
    from = doc(
      taskList(
        checked(
          p('A'),
          ul(
            li(
              p('<cursor>a'),
              ul(
                li(p('b')), //
              ),
            ), //
          ),
        ),
        checked(p('B')),
        checked(p('C')), //
      ),
    );
    to = doc(
      taskList(
        checked(
          p('A'),
          p('a'),
          ul(
            li(p('b')), //
          ),
        ),
        checked(p('B')),
        checked(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it.skip('presses backspace at the begin of a 3-level mixed list (2)', () => {
    from = doc(
      taskList(
        checked(
          p('A'),
          ul(
            li(
              p('<cursor>a'),
              ul(
                li(p('b')), //
              ),
            ), //
            li(p('<cursor>c')), //
          ),
        ),
        checked(p('B')),
        checked(p('C')), //
      ),
    );
    to = doc(
      taskList(
        checked(
          p('A'),
          p('a'),
          ul(
            li(p('b')), //
          ),
          ul(
            li(p('c')), //
          ),
        ),
        checked(p('B')),
        checked(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace at the middle of a list', () => {
    from = doc(
      ul(
        li(p('A')),
        li(p('<cursor>B')),
        li(p('C')), //
      ),
    );
    to = doc(
      ul(
        li(p('A'), p('B')),
        li(p('C')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace between ul and ol', () => {
    from = doc(
      ul(
        li(p('A')), //
        li(p('B')),
      ),
      ol(
        li(p('<cursor>C')), //
        li(p('D')),
      ),
    );
    to = doc(
      ul(
        li(p('A')), //
        li(p('B'), p('C')),
      ),
      ol(
        li(p('D')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace between taskList and ul', () => {
    from = doc(
      taskList(
        checked(p('A')), //
        checked(p('B')),
      ),
      ul(
        li(p('<cursor>C')), //
        li(p('D')),
      ),
    );
    to = doc(
      taskList(
        checked(p('A')), //
        checked(p('B'), p('C')),
      ),
      ul(
        li(p('D')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('presses backspace between ol and taskList', () => {
    from = doc(
      ol(
        li(p('A')), //
        li(p('B')),
      ),
      taskList(
        checked(p('<cursor>C')), //
        unchecked(p('D')),
      ),
    );
    to = doc(
      ol(
        li(p('A')), //
        li(p('B'), p('C')),
      ),
      taskList(
        unchecked(p('D')), //
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  // This test case covers the issue from https://github.com/remirror/remirror/pull/1461
  it('presses backspace before a list item when the list is the second child of the doc', () => {
    from = doc(
      p('text'),
      ol(
        li(p('<cursor>')), //
      ),
    );
    editor.add(from).press('Backspace').insertText('!');
    to = doc(
      p('text'),
      p('!'), //
    );
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});
