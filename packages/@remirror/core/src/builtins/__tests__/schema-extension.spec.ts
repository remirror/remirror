import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { BlockquoteExtension } from 'remirror/extension/blockquote';
import { BoldExtension } from 'remirror/extension/bold';
import { HeadingExtension } from 'remirror/extension/heading';

import { SchemaExtension } from '..';

extensionValidityTest(SchemaExtension);

describe('dynamic schema attributes', () => {
  it('should dynamically add attributes when configured', () => {
    let paragraphId = 0;
    let markId = 0;

    const mark = {
      paragraph: jest.fn(() => `${++paragraphId}`),
      marks: jest.fn(() => `${++markId}`),
    };

    const editor = renderEditor(
      [new HeadingExtension(), new BlockquoteExtension(), new BoldExtension()],
      {
        extraAttributes: [
          { identifiers: ['paragraph'], attributes: { id: { default: mark.paragraph } } },
          { identifiers: 'marks', attributes: { id: mark.marks } },
        ],
      },
    );

    const { doc, heading: h } = editor.nodes;

    editor.add(doc(h('This is a heading<cursor>')));
    expect(mark.paragraph).not.toHaveBeenCalled();
    expect(mark.marks).not.toHaveBeenCalled();

    editor.insertText('\nWelcome to the **bold** experiment\n\n\n');
    expect(mark.marks).toHaveBeenCalledTimes(1);
    expect(mark.paragraph).toHaveBeenCalledTimes(4);

    const outerHtml = editor.dom.outerHTML;
    expect(editor.dom.outerHTML).toMatchSnapshot();

    editor.selectText(1);

    // Nothing should have changed.
    expect(mark.marks).toHaveBeenCalledTimes(1);
    expect(mark.paragraph).toHaveBeenCalledTimes(4);
    expect(outerHtml).toMatchDiffSnapshot(editor.dom.outerHTML);
  });
});
