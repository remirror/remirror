import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { BoldExtension, HeadingExtension, ItalicExtension } from 'remirror/extensions';

import { HelpersExtension } from '../';

extensionValidityTest(HelpersExtension);

describe('active', () => {
  it('should recognize active nodes by attrs', () => {
    const {
      add,
      nodes: { p, doc },
      attributeNodes: { heading: h },
      active,
    } = renderEditor([new HeadingExtension()]);

    add(doc((p('one'), h({ level: 2 })('tw<cursor>o'))));

    expect(active.heading({ level: 2 })).toBeTrue();
    expect(active.heading({ level: 1 })).toBeFalse();
  });
});

describe('helpers', () => {
  it('`isSelectionEmpty`', () => {
    const { add, nodes, helpers } = renderEditor([]);
    const { p, doc } = nodes;

    add(doc(p('on<cursor>e')));
    expect(helpers.isSelectionEmpty()).toBeTrue();
  });
});

describe('commands.insertHtml', () => {
  it('can insert html', () => {
    const editor = renderEditor([
      new HeadingExtension(),
      new BoldExtension(),
      new ItalicExtension(),
    ]);
    const { doc, p } = editor.nodes;
    const { bold, italic } = editor.marks;
    const { heading } = editor.attributeNodes;
    const h1 = heading({ level: 1 });

    editor.add(doc(p('Content<cursor>')));

    editor.chain.insertHtml('<h1>This is a heading</h1>').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('Content'), h1('This is a heading')));

    editor.commands.insertHtml('<p>A paragraph <em>with</em> <strong>formatting</strong></p>');
    expect(editor.state.doc).toEqualProsemirrorNode(
      doc(
        p('Content'),
        h1('This is a heading'),
        p('A paragraph ', italic('with'), ' ', bold('formatting')),
      ),
    );
  });

  it('can insert marks', () => {
    const editor = renderEditor([new BoldExtension()]);
    const { doc, p } = editor.nodes;
    const { bold } = editor.marks;

    editor.add(doc(p('Content <cursor>')));

    editor.chain.insertHtml('<strong>is bold.</strong>').selectText('end').run();
    expect(editor.state.doc).toEqualProsemirrorNode(doc(p('Content ', bold('is bold.'))));
    expect(editor.dom).toMatchSnapshot();
  });
});
