import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { object } from '@remirror/core';

import { FontSizeExtension } from '../';
import { FontSizeOptions } from '../src/font-size-types';

extensionValidityTest(FontSizeExtension);

function create(options: FontSizeOptions = object()) {
  const extension = new FontSizeExtension(options);
  return renderEditor([extension]);
}

describe('commands', () => {
  it('removeFontSize removes only font size from selected text', () => {
    const {
      nodes: { p, doc },
      add,
      view,
      commands,
      chain,
    } = create();

    add(doc(p('<start>Big small<end>')));
    commands.setFontSize('6pt');
    console.log(view.dom.innerHTML);
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span style=" font-size:6pt">
          Big small
        </span>
      </p>
    `);

    chain.selectText({ from: 0, to: 4 }).run();
    commands.removeFontSize();
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
    <p>
      Big
      <span style=" font-size:6pt">
        small
      </span>
    </p>
  `);
  });
});
