import { extensionValidityTest, renderEditor } from 'jest-remirror';
import {
  BoldExtension,
  BulletListExtension,
  HeadingExtension,
  ItalicExtension,
  OrderedListExtension,
  TaskListExtension,
} from 'remirror/extensions';

import { MarkdownExtension } from '../';

extensionValidityTest(MarkdownExtension);

describe('commands.insertMarkdown', () => {
  it('can insert blocks', () => {
    const editor = renderEditor([
      new HeadingExtension(),
      new BoldExtension(),
      new ItalicExtension(),
      new MarkdownExtension(),
    ]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;
    const { heading } = editor.attributeNodes;
    const h1 = heading({ level: 1 });

    editor.add(doc(p('Content<cursor>')));

    editor.chain.insertMarkdown('# This is a heading').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('Content'), h1('This is a heading')));

    editor.commands.insertMarkdown('A paragraph _with_ **formatting**');
    expect(editor.state.doc).toEqualProsemirrorNode(
      doc(
        p('Content'),
        h1('This is a heading'),
        p('A paragraph ', italic('with'), ' ', bold('formatting')),
      ),
    );
  });

  it('can replace blocks', () => {
    const editor = renderEditor([new HeadingExtension(), new MarkdownExtension()]);
    const { doc, p } = editor.nodes;
    const { heading } = editor.attributeNodes;
    const h1 = heading({ level: 1 });

    editor.add(doc(p('<cursor>')));

    editor.chain.insertMarkdown('# This is a heading').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(h1('This is a heading')));
  });

  it('can insert multiple blocks', () => {
    const editor = renderEditor([new HeadingExtension(), new MarkdownExtension()]);
    const { doc, p } = editor.nodes;
    const { heading } = editor.attributeNodes;
    const h1 = heading({ level: 1 });

    editor.add(doc(p('<cursor>')));

    editor.chain.insertMarkdown('# Heading\nAnd content').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(h1('Heading'), p('And content')));
  });

  it('can insert marks', () => {
    const editor = renderEditor([new BoldExtension(), new MarkdownExtension()]);
    const { doc, p } = editor.nodes;
    const { bold } = editor.marks;

    editor.add(doc(p('Content <cursor>')));

    editor.chain.insertMarkdown('**is bold.**').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('Content ', bold('is bold.'))));
    expect(editor.dom).toMatchSnapshot();
  });

  it('can insert lists', () => {
    const editor = renderEditor([
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      new MarkdownExtension(),
    ]);
    const { doc, p, bulletList: ul, orderedList: ol, taskList, listItem: li } = editor.nodes;
    const { taskListItem } = editor.attributeNodes;

    editor.add(doc(p('<cursor>')));

    // Intentionally the same as the output from getMarkdown helper
    const tabSpace = `    `;
    const markdown = `Bullet list

*   Item 1
${tabSpace}
*   Item 2
${tabSpace}

Ordered list

1.  Item 1
${tabSpace}
2.  Item 2
${tabSpace}

Task list

- [x] Item 1

- [ ] Item 2`;

    editor.chain.insertMarkdown(markdown).selectText('end').run();
    const expected = doc(
      //
      p('Bullet list'),
      ul(
        //
        li(p('Item 1')),
        li(p('Item 2')),
      ),
      p('Ordered list'),
      ol(
        //
        li(p('Item 1')),
        li(p('Item 2')),
      ),
      p('Task list'),
      taskList(
        //
        taskListItem({ checked: true })(p('Item 1')),
        taskListItem({ checked: false })(p('Item 2')),
      ),
    );

    expect(editor.state.doc).toEqualProsemirrorNode(expected);
    expect(editor.dom).toMatchSnapshot();
  });

  it('does not replace marks', () => {
    const editor = renderEditor([new BoldExtension(), new MarkdownExtension()]);
    const { doc, p } = editor.nodes;
    const { bold } = editor.marks;

    editor.add(doc(p('<cursor>')));

    editor.chain.insertMarkdown('**is bold.**').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p(bold('is bold.'))));
    expect(editor.dom).toMatchSnapshot();
  });

  it('can insert marks as blocks', () => {
    const editor = renderEditor([new BoldExtension(), new MarkdownExtension()]);
    const { doc, p } = editor.nodes;
    const { bold } = editor.marks;

    editor.add(doc(p('Content <cursor>')));

    editor.chain
      .insertMarkdown('**is bold.**', { alwaysWrapInBlock: true })
      .selectText('end')
      .run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('Content '), p(bold('is bold.'))));
    expect(editor.dom).toMatchSnapshot();
  });
});

describe('helpers.getMarkdown', () => {
  it('returns the expected markdown content for lists', () => {
    const editor = renderEditor([
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      new MarkdownExtension(),
    ]);
    const { doc, p, bulletList: ul, orderedList: ol, taskList, listItem: li } = editor.nodes;
    const { taskListItem } = editor.attributeNodes;

    editor.add(
      doc(
        //
        p('Bullet list'),
        ul(
          //
          li(p('Item 1')),
          li(p('Item 2')),
        ),
        p('Ordered list'),
        ol(
          //
          li(p('Item 1')),
          li(p('Item 2')),
        ),
        p('Task list'),
        taskList(
          //
          taskListItem({ checked: true })(p('Item 1')),
          taskListItem({ checked: false })(p('Item 2')),
        ),
      ),
    );

    const tabSpace = `    `;
    const expectedMarkdown = `Bullet list

*   Item 1
${tabSpace}
*   Item 2
${tabSpace}

Ordered list

1.  Item 1
${tabSpace}
2.  Item 2
${tabSpace}

Task list

- [x] Item 1

- [ ] Item 2`;

    expect(editor.helpers.getMarkdown()).toEqual(expectedMarkdown);
  });
});
