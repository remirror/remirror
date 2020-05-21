import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/test-fixtures';

import { BoldExtension } from '../..';

test('is bold extension valid', () => {
  expect(isExtensionValid(BoldExtension, {}));
});

test('schema', () => {});

test('inputRules', () => {
  const boldExtension = new BoldExtension();
  const {
    add,
    nodes: { p, doc },
    marks: { bold },
  } = renderEditor({ extensions: [boldExtension], presets: [] });

  add(doc(p('Start<cursor>')))
    .insertText(' **bold me** for input rule match')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(
        doc(p('Start ', bold('bold me'), ' for input rule match')),
      );
    });
});

describe('commands', () => {
  it('#toggleBold', () => {
    const boldExtension = new BoldExtension();
    const {
      add,
      view,
      nodes: { p, doc },
      marks: { bold },
    } = renderEditor({ extensions: [boldExtension], presets: [] });

    add(doc(p('Hello <start>friend<end>, lets dance.'))).commandsCallback((commands) => {
      commands.toggleBold();

      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello
            <strong>
              friend
            </strong>
            , lets dance.
          </p>
        `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(p('Hello ', bold('friend'), ', lets dance.')),
      );

      commands.toggleBold();

      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello friend, lets dance.
          </p>
        `);
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello friend, lets dance.')));
    });
  });

  it('#setBold', () => {
    const boldExtension = new BoldExtension();
    const {
      add,
      view,
      nodes: { p, doc },
      marks: { bold },
    } = renderEditor({ extensions: [boldExtension], presets: [] });

    add(doc(p('Hello <start>friend<end>, lets dance.'))).commandsCallback((commands) => {
      commands.setBold({ from: 1, to: 6 });

      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <p>
          <strong>
            Hello
          </strong>
          friend, lets dance.
        </p>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(doc(p(bold('Hello'), ' friend, lets dance.')));
    });
  });

  it('#removeBold', () => {
    const boldExtension = new BoldExtension();
    const {
      add,
      view,
      nodes: { p, doc },
      marks: { bold },
    } = renderEditor({ extensions: [boldExtension], presets: [] });

    add(doc(p(bold('Hello'), ' friend, lets dance.'))).commandsCallback((commands) => {
      commands.removeBold({ from: 1, to: 6 });

      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello friend, lets dance.
          </p>
        `);
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello friend, lets dance.')));
    });
  });
});
