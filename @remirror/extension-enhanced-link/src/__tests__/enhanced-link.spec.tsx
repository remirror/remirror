import { renderEditorString } from 'jest-remirror';

import { EnhancedLinkExtension } from '../enhanced-link-extension';

test('ssr', () => {
  // const manager = createBaseTestManager([new EnhancedLinkExtension({})]);
  // ReactSerializer.fromManager(manager);
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
  const string = renderEditorString([new EnhancedLinkExtension({})], {
    initialContent,
    forceEnvironment: 'ssr',
  });

  expect(string).toInclude('http://Random.com');
  expect(string).toMatchInlineSnapshot(`
    <div class="css-1u8qly9">
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
