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
  const tif = taskListItem({ checked: false });
  const tit = taskListItem({ checked: true });

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
    from = doc(tl(tif(p('hello <cursor>world'))));
    to = doc(tl(tif(p('hello ')), tif(p('world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(tif(p('<cursor>hello world'))));
    to = doc(tl(tif(p('')), tif(p('hello world'))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);

    from = doc(tl(tif(p('hello world<cursor>'))));
    to = doc(tl(tif(p('hello world')), tif(p(''))));
    editor.add(from).press('Enter');
    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });

  // it('cleans the `checked` attribute when splitting a task list item', () => {
  //   from = doc(tl(tit(p('hello <cursor>world'))));
  //   to = doc(tl(tit(p('hello ')), tif(p('world'))));
  //   editor.add(from).press('Enter');
  //   expect(editor.view.state.doc).toEqualProsemirrorNode(to);

  //   from = doc(tl(tit(p('<cursor>hello world'))));
  //   to = doc(tl(tit(p('')), tif(p('hello world'))));
  //   editor.add(from).press('Enter');
  //   expect(editor.view.state.doc).toEqualProsemirrorNode(to);

  //   from = doc(tl(tit(p('hello world<cursor>'))));
  //   to = doc(tl(tit(p('hello world')), tif(p(''))));
  //   editor.add(from).press('Enter');
  //   expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  // });
});
