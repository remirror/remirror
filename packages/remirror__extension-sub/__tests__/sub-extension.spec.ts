import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { SubExtension } from '../';

extensionValidityTest(SubExtension);

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    marks: { sub },
    commands,
  } = renderEditor([new SubExtension()]);

  it('#toggleSub', () => {
    add(doc(p('Hello <start>sub<end>, lets dance.')));
    commands.toggleSubscript();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <sub>
          <span class="selection">
            sub
          </span>
        </sub>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello ', sub('sub'), ', lets dance.')));

    commands.toggleSubscript();
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <span class="selection">
          sub
        </span>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello sub, lets dance.')));
  });
});
