import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { IframeExtension, IframeOptions } from '../iframe-extension';

extensionValidityTest(IframeExtension);

function create(options?: IframeOptions) {
  return renderEditor([new IframeExtension(options)]);
}

describe('schema', () => {
  const { schema } = createCoreManager([new IframeExtension()]);
  const attributes = { src: 'https://awesome.com' };

  const { iframe, p, doc } = pmBuild(schema, {
    iframe: { markType: 'iframe', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(toHtml({ node: doc(p(iframe())), schema })).toMatchInlineSnapshot(`
      <p>
        <iframe class="remirror-iframe remirror-iframe-custom"
                src="https://awesome.com"
                data-embed-type="custom"
                allowfullscreen="true"
                frameborder="0"
        >
        </iframe>
      </p>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHtml({
      schema,
      content: `<iframe src="https://awesome.com" data-embed-type="custom" frameborder="0"></iframe>`,
    });
    const expected = doc(iframe());

    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('commands', () => {
  const {
    add,
    nodes: { doc, p },
    attributeNodes: { iframe },
  } = create();

  it('can create an iframe', () => {
    add(doc(p('add and iframe here <cursor>')))
      .callback(({ commands }) => {
        commands.addIframe({ src: 'https://custom.url/awesome' });
      })
      .callback(({ state }) => {
        const expectedIframe = iframe({ src: 'https://custom.url/awesome' })();
        expect(state.doc).toEqualRemirrorDocument(doc(p('add and iframe here '), expectedIframe));
      });
  });
});
