import { EnhancedLinkExtension } from '../enhanced-link-extension';
import { renderSSREditor } from 'jest-remirror';

test('ssr', () => {
  // const manager = createBaseTestManager([new EnhancedLinkExtension({})]);
  // ReactSerializer.fromExtensionManager(manager);
  const initialContent = {
    type: 'doc',
    content: [
      // { type: 'paragraph', content: [{ type: 'text', text: 'Woah' }] },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'enhancedLink', attrs: { href: 'http://Random.com' } }],
            text: 'Random.com',
          },
        ],
      },
    ],
  };
  const string = renderSSREditor([new EnhancedLinkExtension({})], {
    initialContent,
    forceEnvironment: 'ssr',
  });
  expect(string).toInclude('http://Random.com');
  expect(string).toMatchInlineSnapshot(`
    <div class="css-1m7iz3s">
      <div role="textbox"
           aria-multiline="true"
           aria-label
           class="Prosemirror remirror-editor"
           contenteditable="true"
      >
        <p>
          <a href="http://Random.com"
             role="presentation"
          >
            Random.com
          </a>
        </p>
      </div>
    </div>
  `);
});
