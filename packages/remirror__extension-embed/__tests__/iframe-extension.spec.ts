import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from 'remirror';
import { createCoreManager } from 'remirror/extensions';

import { IframeAttributes, IframeExtension, IframeOptions } from '../';

extensionValidityTest(IframeExtension);

function create(options?: IframeOptions) {
  return renderEditor([new IframeExtension(options)]);
}

describe('schema', () => {
  const { schema } = createCoreManager([new IframeExtension()]);
  const attributes: IframeAttributes = {
    src: 'https://awesome.com',
    width: 234,
    height: 123,
    enableResizing: true,
  };

  const { iframe, p, doc } = pmBuild(schema, {
    iframe: { markType: 'iframe', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(doc(p(iframe())))).toMatchInlineSnapshot(`
      <p>
        <iframe
          width="234"
          height="123"
          class="remirror-iframe remirror-iframe-custom"
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
    const node = htmlToProsemirrorNode({
      schema,
      content: `<iframe src="https://awesome.com" data-embed-type="custom" frameborder="0" height="123" width="234"></iframe>`,
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

  it('`addIframe` - creates an iframe', () => {
    add(doc(p('add an iframe here <cursor>')))
      .callback(({ commands }) => {
        commands.addIframe({ src: 'https://custom.url/awesome' });
      })
      .callback(({ state }) => {
        const expectedIframe = iframe({ src: 'https://custom.url/awesome' })();
        expect(state.doc).toEqualRemirrorDocument(doc(p('add an iframe here '), expectedIframe));
      });
  });

  it('`addIframe.enabled()` - returns true', () => {
    const { commands } = add(doc(p('add an iframe here <cursor>')));
    expect(commands.addIframe.enabled({ src: '' })).toBe(true);
  });

  it('`addYouTubeVideo` - creates an iframe', () => {
    add(doc(p('add an iframe here <cursor>')))
      .callback(({ commands }) => {
        commands.addYouTubeVideo({
          video: 'asdf',
          enhancedPrivacy: true,
          showControls: true,
          startAt: 30,
        });
      })
      .callback(({ state }) => {
        const expectedIframe = iframe({
          src: 'https://www.youtube-nocookie.com/embed/asdf?amp%3Bstart=30',
          type: 'youtube',
          allowFullScreen: 'true',
        })();
        expect(state.doc).toEqualRemirrorDocument(doc(p('add an iframe here '), expectedIframe));
      });
  });

  it('`addYouTubeVideo.enabled()` - returns true', () => {
    const { commands } = add(doc(p('add an iframe here <cursor>')));
    expect(commands.addYouTubeVideo.enabled({ video: '' })).toBe(true);
  });
});
