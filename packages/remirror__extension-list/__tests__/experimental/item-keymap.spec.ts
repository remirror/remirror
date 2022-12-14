import { renderEditor } from 'jest-remirror';
import { BlockquoteExtension } from 'remirror/extensions';

import { ExperimentalItemExtension } from '../../src';

const setup = () => {
  const extensions = [new ExperimentalItemExtension(), new BlockquoteExtension()];
  const editor = renderEditor(extensions, {});
  const {
    view,
    add,
    nodes: { doc, p, item, hardBreak, blockquote },
    manager,
    schema,
  } = editor;

  return {
    manager,
    view,
    schema,
    add,
    doc,
    p,
    item,
    hardBreak,
    blockquote,
  };
};

describe('Enter', () => {
  const { add, doc, p, item, blockquote } = setup();

  let editor: ReturnType<typeof add>;

  it('can split non-empty item', () => {
    editor = add(
      doc(
        //
        item(p('123')),
        item(p('456<cursor>')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        item(p('456')),
        item(p('<cursor>')),
      ),
    );

    editor = add(
      doc(
        //
        item(p('123')),
        item(p('45<cursor>6')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        item(p('45')),
        item(p('<cursor>6')),
      ),
    );

    editor = add(
      doc(
        //
        item(p('1<cursor>23')),
        item(p('456')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('1')),
        item(p('<cursor>23')),
        item(p('456')),
      ),
    );
  });

  it('can split non-empty sub item', () => {
    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(p('456')),
          item(p('<cursor>')),
        ),
      ),
    );
  });

  it('can delete empty item', () => {
    editor = add(
      doc(
        //
        item(p('123')),
        item(p('<cursor>')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        p('<cursor>'),
      ),
    );

    editor = add(
      doc(
        //
        item(p('123')),
        item(p('<cursor>')),
        item(p('456')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        p('<cursor>'),
        item(p('456')),
      ),
    );

    editor = add(
      doc(
        //
        item(p('<cursor>')),
        item(p('123')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        p('<cursor>'),
        item(p('123')),
      ),
    );
  });

  it('can dedent empty sub item', () => {
    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('<cursor>')),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('<cursor>'),
        ),
      ),
    );
  });

  it('can delete selected text', () => {
    editor = add(
      doc(
        //
        item(p('<start>123<end>')),
        item(p('456')),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('')),
        item(p('<cursor>')),
        item(p('456')),
      ),
    );
  });

  it('escapes the item when the cursor is in the first paragraph of the item', () => {
    editor = add(
      doc(
        item(
          //
          p('123<cursor>'),
          p('456'),
          p('789'),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
        ),
        item(
          //
          p('<cursor>'),
          p('456'),
          p('789'),
        ),
      ),
    );

    // Nested list item
    editor = add(
      doc(
        item(
          p('0'),
          item(
            //
            p('123<cursor>'),
            p('456'),
            p('789'),
          ),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          p('0'),
          item(
            //
            p('123'),
          ),
          item(
            //
            p('<cursor>'),
            p('456'),
            p('789'),
          ),
        ),
      ),
    );
  });

  it('does not escapes the item when the cursor is not in the first paragraph of the item', () => {
    // Cursor in the last paragraph of the item
    editor = add(
      doc(
        item(
          //
          p('123'),
          p('456<cursor>'),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('456'),
          p('<cursor>'),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('456'),
          p(''),
          p('<cursor>'),
        ),
      ),
    );

    // Cursor in the middle paragraph of the item
    editor = add(
      doc(
        item(
          //
          p('123'),
          p('456<cursor>'),
          p('789'),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('456'),
          p('<cursor>'),
          p('789'),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('456'),
          p(''),
          p('<cursor>'),
          p('789'),
        ),
      ),
    );

    // Cursor in the last paragraph of the item (nested list item)
    editor = add(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456<cursor>'),
          ),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456'),
            p('<cursor>'),
          ),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456'),
            p(''),
            p('<cursor>'),
          ),
        ),
      ),
    );

    // Cursor in the middle paragraph of the item (nested list item)
    editor = add(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456<cursor>'),
            p('789'),
          ),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456'),
            p('<cursor>'),
            p('789'),
          ),
        ),
      ),
    );
    editor.press('Enter');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          p(),
          item(
            //
            p('123'),
            p('456'),
            p(''),
            p('<cursor>'),
            p('789'),
          ),
        ),
      ),
    );
  });

  describe('extra cases', () => {
    it("won't effect non-list document", () => {
      editor = add(
        doc(
          //
          p('1<cursor>23'),
        ),
      );
      editor.press('Enter');
      expect(editor.state).toEqualRemirrorState(
        doc(
          //
          p('1'),
          p('23'),
        ),
      );

      editor = add(
        doc(
          blockquote(
            p('123'),
            blockquote(
              //
              p('4<cursor>56'),
            ),
          ),
        ),
      );
      editor.press('Enter');
      expect(editor.state).toEqualRemirrorState(
        doc(
          blockquote(
            p('123'),
            blockquote(
              //
              p('4'),
              p('<cursor>56'),
            ),
          ),
        ),
      );
    });
  });
});

describe('Shift-Tab', () => {
  const { add, doc, p, item } = setup();

  let editor: ReturnType<typeof add>;

  it('can decreate the indentation of a nested item', () => {
    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        item(p('456<cursor>')),
      ),
    );
  });

  it('can decreate the indentation of multiple nested items', () => {
    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('45<start>6')),
          item(p('7<end>89')),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123')),
        item(p('45<start>6')),
        item(p('7<end>89')),
      ),
    );

    editor = add(
      doc(
        item(
          //
          p('123'),
          item(
            //
            p('45<start>6'),
            item(
              //
              p('7<end>89'),
            ),
          ),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
        ),
        item(
          //
          p('45<start>6'),
          item(
            //
            p('7<end>89'),
          ),
        ),
      ),
    );
  });

  it('can keep the indentation of siblings around the dedented item', () => {
    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
          item(p('789')),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(p('123')),
        item(
          //
          p('456<cursor>'),
          item(p('789')),
        ),
      ),
    );

    editor = add(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
          p('789'),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(p('123')),
        item(
          //
          p('456<cursor>'),
          p('789'),
        ),
      ),
    );

    editor = add(
      doc(
        item(
          //
          p('123'),
          p('123'),
          item(p('456<cursor>')),
        ),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('123'),
        ),
        item(
          //
          p('456<cursor>'),
        ),
      ),
    );
  });

  it('can decreate the indentation of a multiple level nested item', () => {
    editor = add(
      doc(
        //
        item(item(item(p('123<cursor>')))),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(item(p('123<cursor>'))),
      ),
    );
    editor.press('Shift-Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        //
        item(p('123<cursor>')),
      ),
    );
  });
});

describe('Tab', () => {
  const { add, doc, p, item } = setup();

  let editor: ReturnType<typeof add>;

  it('can increate the indentation of a nested item', () => {
    editor = add(
      doc(
        //
        item(p('123')),
        item(p('456<cursor>')),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
        ),
      ),
    );
  });

  it('can increate the indentation of multiple nested items', () => {
    editor = add(
      doc(
        //
        item(p('123')),
        item(p('45<start>6')),
        item(p('7<end>89')),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(p('45<start>6')),
          item(p('7<end>89')),
        ),
      ),
    );

    editor = add(
      doc(
        item(
          //
          p('123'),
        ),
        item(
          //
          p('45<start>6'),
          item(
            //
            p('7<end>89'),
          ),
        ),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(
            //
            p('45<start>6'),
            item(
              //
              p('7<end>89'),
            ),
          ),
        ),
      ),
    );
  });

  it('can keep the indentation of siblings around the indented item', () => {
    editor = add(
      doc(
        item(p('123')),
        item(
          //
          p('456<cursor>'),
          item(p('789')),
        ),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
          item(p('789')),
        ),
      ),
    );

    editor = add(
      doc(
        item(p('123')),
        item(
          //
          p('456<cursor>'),
          p('789'),
        ),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          item(p('456<cursor>')),
          p('789'),
        ),
      ),
    );

    editor = add(
      doc(
        item(
          //
          p('123'),
          p('123'),
        ),
        item(
          //
          p('456<cursor>'),
        ),
      ),
    );
    editor.press('Tab');
    expect(editor.state).toEqualRemirrorState(
      doc(
        item(
          //
          p('123'),
          p('123'),
          item(p('456<cursor>')),
        ),
      ),
    );
  });
});
