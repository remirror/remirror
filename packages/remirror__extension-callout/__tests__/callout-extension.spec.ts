import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, ProsemirrorNode, prosemirrorNodeToHtml } from 'remirror';
import { createCoreManager } from 'remirror/extensions';

import { CalloutExtension } from '../';

extensionValidityTest(CalloutExtension);

describe('schema', () => {
  const { schema } = createCoreManager([new CalloutExtension()]);

  const { callout, doc, p } = pmBuild(schema, {});

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(callout(p('Hello friend!')))).toMatchInlineSnapshot(`
      <div data-callout-type="info">
        <p>
          Hello friend!
        </p>
      </div>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = htmlToProsemirrorNode({
      schema,
      content: '<div data-callout-type="info">Hello friend!</div>',
    });
    const expected = doc(callout(p('Hello friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const { schema } = createCoreManager([
    new CalloutExtension({ extraAttributes: { 'data-custom': 'hello-world' } }),
  ]);
  const { callout, p } = pmBuild(schema, {});

  expect(prosemirrorNodeToHtml(callout(p('friend!')))).toMatchInlineSnapshot(`
    <div data-custom="hello-world"
         data-callout-type="info"
    >
      <p>
        friend!
      </p>
    </div>
  `);
});

function create() {
  const calloutExtension = new CalloutExtension();
  return renderEditor([calloutExtension]);
}

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    attributeNodes: { callout },

    commands,
  } = create();

  describe('toggleCallout', () => {
    it('toggles the callout', () => {
      add(doc(p(`Make this a callout<cursor>`)));

      commands.toggleCallout({ type: 'error' });
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <div data-callout-type="error">
          <div>
            <p>
              Make this a callout
            </p>
          </div>
        </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'error' })(p('Make this a callout'))),
      );

      commands.toggleCallout({ type: 'error' });
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <p>
          Make this a callout
        </p>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('Make this a callout')));
    });

    it('toggles the default callout when no type is provided', () => {
      add(doc(p(`Make this a callout<cursor>`)));

      commands.toggleCallout();
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <div data-callout-type="info">
          <div>
            <p>
              Make this a callout
            </p>
          </div>
        </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'info' })(p('Make this a callout'))),
      );

      commands.toggleCallout();
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <p>
          Make this a callout
        </p>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('Make this a callout')));
    });

    it('toggles the using the configured defaultType callout', () => {
      const calloutExtension = new CalloutExtension({ defaultType: 'success' });
      const {
        add,
        view,
        nodes: { p, doc },
        attributeNodes: { callout },

        commands,
      } = renderEditor([calloutExtension]);

      add(doc(p(`Make this a callout<cursor>`)));

      commands.toggleCallout();
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <div data-callout-type="success">
          <div>
            <p>
              Make this a callout
            </p>
          </div>
        </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'success' })(p('Make this a callout'))),
      );
    });
  });

  describe('updateCallout', () => {
    it('updates the type', () => {
      add(doc(callout({ type: 'warning' })(p(`This is a callout<cursor>`))));

      commands.updateCallout({ type: 'error' });
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
        <div data-callout-type="error">
          <div>
            <p>
              This is a callout
            </p>
          </div>
        </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'error' })(p('This is a callout'))),
      );
    });

    it('updates the emoji', () => {
      add(doc(callout({ type: 'warning', emoji: '😄' })(p(`This is a callout<cursor>`))));

      commands.updateCallout({ emoji: '😭' });
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <div data-callout-type="warning"
           data-callout-emoji="😭"
      >
        <div class="remirror-callout-emoji-wrapper">
          <span>
            😭
          </span>
        </div>
        <div>
          <p>
            This is a callout
          </p>
        </div>
      </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'warning', emoji: '😭' })(p('This is a callout'))),
      );
    });

    it('updates the type and emoji', () => {
      add(doc(callout({ type: 'warning', emoji: '😄' })(p(`This is a callout<cursor>`))));

      commands.updateCallout({ type: 'info', emoji: '😭' });
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <div data-callout-type="info"
           data-callout-emoji="😭"
      >
        <div class="remirror-callout-emoji-wrapper">
          <span>
            😭
          </span>
        </div>
        <div>
          <p>
            This is a callout
          </p>
        </div>
      </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'info', emoji: '😭' })(p('This is a callout'))),
      );
    });

    it('errors when updating with an invalid type attributes', () => {
      add(doc(callout({ type: 'warning' })(p(`This is a callout<cursor>`))));

      expect(() => {
        // @ts-expect-error
        commands.updateCallout({ type: false });
      }).toThrow('Invalid attrs passed to the updateAttributes method');
    });
  });
});

describe('plugin', () => {
  const {
    add,
    nodes: { p, doc },
    attributeNodes: { callout },
  } = create();

  describe('Backspace', () => {
    it('should avoid merging callouts when they become immediate siblings', () => {
      const { state } = add(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          p('<cursor>'),
          callout({ type: 'success' })(p('success callout')),
        ),
      ).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          callout({ type: 'success' })(p('success callout')),
        ),
      );
    });

    it('should append the previous callout with the content after the cursor', () => {
      const { state } = add(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          p('<cursor>To append'),
          callout({ type: 'success' })(p('Success callout')),
        ),
      ).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(
        doc(
          callout({ type: 'error' })(p('Error calloutTo append')),
          callout({ type: 'success' })(p('Success callout')),
        ),
      );
    });

    it('should merge immediate sibling callouts', () => {
      const { state } = add(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          callout({ type: 'success' })(p('<cursor>Success callout')),
        ),
      ).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'error' })(p('Error callout'), p('Success callout'))),
      );
    });

    it('should ignore range selections', () => {
      const { state } = add(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          p('<start>Some content<end>'),
          callout({ type: 'success' })(p('Success callout')),
        ),
      ).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(
        doc(
          callout({ type: 'error' })(p('Error callout')),
          p(''),
          callout({ type: 'success' })(p('Success callout')),
        ),
      );
    });

    it('should ignore when there is nothing to merge with', () => {
      const { state } = add(
        doc(p('<cursor>'), callout({ type: 'success' })(p('Success callout'))),
      ).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(
        doc(p(''), callout({ type: 'success' })(p('Success callout'))),
      );
    });
  });
});

describe('inputRules', () => {
  const {
    add,
    nodes: { p, doc },
    attributeNodes: { callout },
  } = create();

  describe('valid content', () => {
    it('followed by a space', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::info ');

      expect(state.doc).toBeValidNode();
    });

    it('followed by enter', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::info')
        .press('Enter');

      expect(state.doc).toBeValidNode();
    });
  });

  describe(':::info', () => {
    it('followed by space creates an info callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::info ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'info' })(p(''))));
    });

    it('followed by enter creates an info callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::info')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'info' })(p(''))));
    });
  });

  describe(':::warning', () => {
    it('followed by space creates a warning callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::warning ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'warning' })(p(''))));
    });

    it('followed by enter creates a warning callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::warning')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'warning' })(p(''))));
    });
  });

  describe(':::error', () => {
    it('followed by space creates an error callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::error ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'error' })(p(''))));
    });

    it('followed by enter creates an error callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::error')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'error' })(p(''))));
    });
  });

  describe(':::success', () => {
    it('followed by space creates a success callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::success ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'success' })(p(''))));
    });

    it('followed by enter creates a success callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::success')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'success' })(p(''))));
    });
  });

  describe(':::blank', () => {
    it('followed by space creates a blank callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::blank ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'blank' })(p(''))));
    });

    it('followed by enter creates a blank callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::blank')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'blank' })(p(''))));
    });
  });

  describe('unknown type', () => {
    it('followed by space creates the default type callout', () => {
      const { state } = add(doc(p('<cursor>'))).insertText(':::unknown ');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'info' })(p(''))));
    });

    it('followed by enter creates the default type callout', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText(':::invalid')
        .press('Enter');

      expect(state.doc).toEqualRemirrorDocument(doc(callout({ type: 'info' })(p(''))));
    });
  });
});

const renderEmoji = (node: ProsemirrorNode) => {
  const emoji = document.createElement('span');
  emoji.textContent = node.attrs.emoji;
  return emoji;
};

function createWithNoEmoji() {
  const calloutExtension = new CalloutExtension({ renderEmoji });
  return renderEditor([calloutExtension]);
}

function createAndSetEmoji() {
  const calloutExtension = new CalloutExtension({ defaultEmoji: '💓' });
  return renderEditor([calloutExtension]);
}

describe('emoji', () => {
  describe('without defaultEmoji setup', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      attributeNodes: { callout },
    } = createWithNoEmoji();

    it('will not render emoji', () => {
      add(doc(callout({ type: 'info' })(p(`This is a callout<cursor>`))));
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <div data-callout-type="info">
            <div>
              <p>
                This is a callout
              </p>
            </div>
          </div>
        `);
    });

    it('passes an emoji attribute, will render the emoji', () => {
      add(doc(callout({ type: 'info', emoji: '🦦' })(p(`This is a callout<cursor>`))));

      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <div data-callout-type="info"
               data-callout-emoji="🦦"
          >
            <div class="remirror-callout-emoji-wrapper">
              <span>
                🦦
              </span>
            </div>
            <div>
              <p>
                This is a callout
              </p>
            </div>
          </div>
        `);
    });
  });

  describe('with defaultEmoji setup', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      attributeNodes: { callout },
    } = createAndSetEmoji();

    it('render emoji', () => {
      add(doc(callout({ type: 'info' })(p(`This is a callout<cursor>`))));
      expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <div data-callout-type="info"
               data-callout-emoji="💓"
          >
            <div class="remirror-callout-emoji-wrapper">
              <span>
                💓
              </span>
            </div>
            <div>
              <p>
                This is a callout
              </p>
            </div>
          </div>
        `);
    });
  });
});
