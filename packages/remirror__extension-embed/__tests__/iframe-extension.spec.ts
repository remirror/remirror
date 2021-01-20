import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from 'remirror';
import { createCoreManager } from 'remirror/extensions';

import { IframeExtension, IframeOptions } from '../';

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
    expect(prosemirrorNodeToHtml(doc(p(iframe())))).toMatchInlineSnapshot(`
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
    const node = htmlToProsemirrorNode({
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

  it('`addIframe.isEnabled()` - returns true', () => {
    const { commands } = add(doc(p('add an iframe here <cursor>')));
    expect(commands.addIframe.isEnabled({ src: '' })).toBe(true);
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

  it('`addYouTubeVideo.isEnabled()` - returns true', () => {
    const { commands } = add(doc(p('add an iframe here <cursor>')));
    expect(commands.addYouTubeVideo.isEnabled({ video: '' })).toBe(true);
  });
});
