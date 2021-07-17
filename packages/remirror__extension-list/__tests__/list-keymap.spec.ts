import { renderEditor, TaggedProsemirrorNode } from 'jest-remirror';
import { BulletListExtension, OrderedListExtension, TaskListExtension } from 'remirror/extensions';

describe('Enter', () => {
  const editor = renderEditor([
    new TaskListExtension({}),
    new BulletListExtension({}),
    new OrderedListExtension(),
    new TaskListExtension(),
  ]);
  const {
    nodes: { doc, paragraph: p, orderedList: ol, bulletList: ul, listItem: li, taskList: tl },
    attributeNodes: { taskListItem },
  } = editor;
  const unchecked = taskListItem({ checked: false });
  const checked = taskListItem({ checked: true });

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
});

describe('Tab and Shift-Tab', () => {
  const editor = renderEditor([
    new TaskListExtension({}),
    new BulletListExtension({}),
    new OrderedListExtension(),
    new TaskListExtension(),
  ]);
  const {
    nodes: { doc, paragraph: p, orderedList: ol, bulletList: ul, listItem: li, taskList: tl },
    attributeNodes: { taskListItem },
  } = editor;
  const unchecked = taskListItem({ checked: false });
  const checked = taskListItem({ checked: true });

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
