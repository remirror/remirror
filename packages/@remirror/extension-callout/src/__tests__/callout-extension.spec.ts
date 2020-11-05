import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { CalloutExtension } from '..';

extensionValidityTest(CalloutExtension);

describe('schema', () => {
  const { schema } = createCoreManager([new CalloutExtension()]);

  const { callout, doc, p } = pmBuild(schema, {});

  it('creates the correct dom node', () => {
    expect(toHtml({ node: callout(p('Hello friend!')), schema })).toMatchInlineSnapshot(`
      <div data-callout-type="info">
        <p>
          Hello friend!
        </p>
      </div>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHtml({ schema, content: '<div data-callout-type="info">Hello friend!</div>' });
    const expected = doc(callout(p('Hello friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const { schema } = createCoreManager([
    new CalloutExtension({ extraAttributes: { 'data-custom': 'hello-world' } }),
  ]);
  const { callout, p } = pmBuild(schema, {});

  expect(toHtml({ node: callout(p('friend!')), schema })).toMatchInlineSnapshot(`
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
          <p>
            Make this a callout
          </p>
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
          <p>
            Make this a callout
          </p>
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
          <p>
            Make this a callout
          </p>
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
          <p>
            This is a callout
          </p>
        </div>
      `);
      expect(view.state.doc).toEqualRemirrorDocument(
        doc(callout({ type: 'error' })(p('This is a callout'))),
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
