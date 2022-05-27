import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { BlockquoteExtension, BulletListExtension } from 'remirror/extensions';

import { NodeFormattingExtension } from '../';

extensionValidityTest(NodeFormattingExtension);

describe('keybindings', () => {
  const extensions = [new NodeFormattingExtension()];
  const editor = renderEditor(extensions);
  const {
    nodes: { doc },
    attributeNodes: { paragraph: p },
  } = editor;

  it('can increase and decrease indent', () => {
    editor.add(doc(p()('hello')));

    editor.press('Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(doc(p({ nodeIndent: 1 })('hello')));
    editor.press('Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(doc(p({ nodeIndent: 2 })('hello')));

    editor.press('Shift-Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(doc(p({ nodeIndent: 1 })('hello')));
    editor.press('Shift-Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(doc(p({ nodeIndent: 0 })('hello')));
  });
});

describe('keybindings with list extensions', () => {
  const extensions = [new NodeFormattingExtension(), new BulletListExtension()];
  const editor = renderEditor(extensions);
  const {
    nodes: { doc, listItem: li, bulletList: ul },
    attributeNodes: { paragraph: p },
  } = editor;

  const flatList = doc(
    ul(
      //
      li(p()('A')),
      li(p()('B')),
      li(p({ nodeIndent: 0 })('C<cursor>')),
      li(p()('D')),
    ),
  );

  const nestedListItem = doc(
    ul(
      //
      li(p()('A')),
      li(
        //
        p()('B'),
        ul(
          //
          li(p({ nodeIndent: 0 })('C<cursor>')),
        ),
      ),
      li(p()('D')),
    ),
  );

  const nestedListItemIndentedParagraph = doc(
    ul(
      //
      li(p()('A')),
      li(
        //
        p()('B'),
        ul(
          //
          li(p({ nodeIndent: 1 })('C<cursor>')),
        ),
      ),
      li(p()('D')),
    ),
  );

  it('prioritises wrapping the list item, if possible', () => {
    editor.add(flatList);
    editor.press('Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(nestedListItem);
  });

  it('indents the paragraph, if a list item wrap is not possible', () => {
    editor.add(nestedListItem);
    editor.press('Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(nestedListItemIndentedParagraph);
  });

  it('prioritises de-denting the paragraph, over the lifting of a list item', () => {
    editor.add(nestedListItemIndentedParagraph);
    editor.press('Shift-Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(nestedListItem);
  });

  it('lifts the list item, if the paragraph cannot be de-dented', () => {
    editor.add(nestedListItem);
    editor.press('Shift-Tab');
    expect(editor.state.doc).toEqualRemirrorDocument(flatList);
  });
});

describe('keybindings with formatting node blocks', () => {
  const extensions = [new NodeFormattingExtension(), new BlockquoteExtension()];
  const editor = renderEditor(extensions);
  const {
    nodes: { doc },
    attributeNodes: { blockquote, paragraph: p },
  } = editor;

  it('if partial selection of wrapping formatting node, indent only the child selected', () => {
    editor.add(
      doc(
        //
        blockquote({ nodeIndent: 0 })(
          //
          p({ nodeIndent: 0 })('Some<cursor>'),
          p({ nodeIndent: 0 })('Text'),
        ),
      ),
    );

    editor.press('Tab');

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(
        //
        blockquote({ nodeIndent: 0 })(
          //
          p({ nodeIndent: 1 })('Some<cursor>'),
          p({ nodeIndent: 0 })('Text'),
        ),
      ),
    );
  });

  it('if all selection of wrapping content node, indent the wrapping node', () => {
    editor.add(
      doc(
        //
        blockquote({ nodeIndent: 0 })(p({ nodeIndent: 0 })('Some'), p({ nodeIndent: 0 })('Text')),
      ),
    );

    editor.selectText({ from: 2, to: 11 });
    editor.press('Tab');

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(
        //
        blockquote({ nodeIndent: 1 })(
          //
          p({ nodeIndent: 0 })('Some'),
          p({ nodeIndent: 0 })('Text'),
        ),
      ),
    );
  });

  it('if wrapping content node within range, indent the wrapping node', () => {
    editor.add(
      doc(
        //
        p({ nodeIndent: 0 })('Before'),
        blockquote({ nodeIndent: 0 })(p({ nodeIndent: 0 })('Some'), p({ nodeIndent: 0 })('Text')),
        p({ nodeIndent: 0 })('After'),
        p({ nodeIndent: 0 })('Last'),
      ),
    );

    editor.selectText({ from: 2, to: 24 });
    editor.press('Tab');

    expect(editor.state.doc).toEqualRemirrorDocument(
      doc(
        //
        p({ nodeIndent: 1 })('Before'),
        blockquote({ nodeIndent: 1 })(p({ nodeIndent: 0 })('Some'), p({ nodeIndent: 0 })('Text')),
        p({ nodeIndent: 1 })('After'),
        p({ nodeIndent: 0 })('Last'),
      ),
    );
  });
});
