import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { SupExtension } from '../';

extensionValidityTest(SupExtension);

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    marks: { sup },
    commands,
  } = renderEditor([new SupExtension()]);

  it('#toggleSup', () => {
    add(doc(p('Hello <start>sup<end>, lets dance.')));
    commands.toggleSuperscript();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <sup>
          sup
        </sup>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello ', sup('sup'), ', lets dance.')));

    commands.toggleSuperscript();
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello sup, lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello sup, lets dance.')));
  });
});
