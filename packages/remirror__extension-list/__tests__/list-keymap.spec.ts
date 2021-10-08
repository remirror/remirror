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
});

describe('Tab and Shift-Tab', () => {
  const { doc, p, ol, ul, li, taskList: tl, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('sink a list item', () => {
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
  });

  it('lift a list item', () => {
    from = doc(
      ul(
        li(
          p('hello'),
          ul(
            li(p('worl<cursor>d')), //
          ),
        ),
      ),
    );
    to = doc(
      ul(
        li(p('hello')),
        li(p('world')), //
      ),
    );
    editor.add(from).press('Shift-Tab');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it('sink and lift the correct list item in a nested and mixed list', () => {
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
});

describe('Backspace', () => {
  const { doc, p, ol, ul, li, taskList, unchecked, checked, editor } = setupListEditor();

  let from: TaggedProsemirrorNode, to: TaggedProsemirrorNode;

  it('presses backspace at the begin of a list', () => {
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
        li(p('B')),
        li(p('C')),
        li(p('D')),
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it.skip('presses backspace between taskList and ul', () => {
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
        checked(p('B')),
        unchecked(p('C')),
        unchecked(p('D')),
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  it.skip('presses backspace between ol and taskList', () => {
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
        li(p('B')),
        li(p('C')),
        li(p('D')),
      ),
    );
    editor.add(from).press('Backspace');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});
