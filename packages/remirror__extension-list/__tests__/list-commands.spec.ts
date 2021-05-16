import { createEditor, doc, li, ol, p, schema, ul } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import {
  BulletListExtension,
  ListItemExtension,
  OrderedListExtension,
  TaskListExtension,
  toggleList,
} from 'remirror/extensions';

describe('toggleList', () => {
  it('toggles paragraph to bullet list', () => {
    const from = doc(p('make <cursor>list'));
    const to = doc(ul(li(p('make list'))));

    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).toTransform({
      from,
      to,
    });
  });

  it('toggles bullet list to paragraph', () => {
    const from = doc(ul(li(p('make <cursor>list'))));
    const to = doc(p('make list'));

    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).toTransform({
      from,
      to,
    });
  });

  it('toggles ordered list to bullet list', () => {
    const from = doc(ol(li(p('make <cursor>list'))));
    const to = doc(ul(li(p('make list'))));

    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).toTransform({
      from,
      to,
    });
  });

  it('toggles nested ordered list to bullet list', () => {
    const fromNested = ol(li('1.1'), li(p('1.2<cursor>')), li(p('1.3')));
    const from = doc(ol(li(p('1'), fromNested), li(p('2'))));
    const toNested = ul(li('1.1'), li(p('1.2')), li(p('1.3')));
    const to = doc(ol(li(p('1'), toNested), li(p('2'))));

    expect(toggleList(schema.nodes.bulletList, schema.nodes.listItem)).toTransform({
      from,
      to,
    });
  });

  it('leaves document unchanged without dispatch', () => {
    const unchanged = doc(ol(li(p('make <cursor>list'))));
    const { state, view } = createEditor(unchanged);
    const tr = state.tr;

    toggleList(schema.nodes.bulletList, schema.nodes.listItem)({ state, tr });
    view.dispatch(tr);

    expect(view.state.doc).toEqualProsemirrorNode(unchanged);
  });

  it('toggles paragraph to task list', () => {
    const editor = renderEditor([
      new ListItemExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
    ]);
    const {
      nodes: { doc, paragraph: p, taskList },
      attributeNodes: { taskListItem },
    } = editor;

    const from = doc(p('make <cursor>list'));
    const to = doc(taskList(taskListItem({ checked: false })(p('make list'))));

    editor.add(from);

    editor.commands.toggleTaskList();

    expect(editor.view.state.doc).toEqualProsemirrorNode(to);
  });
});
