/**
 * @jest-environment node
 */

import { CodeBlockExtension, createCoreManager } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';

describe('schema', () => {
  const extensions = [new CodeBlockExtension()];
  const manager = createCoreManager(extensions);

  it('parses HTML in Node.js environment with JSDOM installed', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');

    const node = htmlToProsemirrorNode({
      schema: manager.schema,
      content: '<pre><code>echo hello world</code></pre>',
    });
    expect(node.toJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: {
            language: 'markup',
            wrap: false,
          },
          content: [
            {
              text: 'echo hello world',
              type: 'text',
            },
          ],
        },
      ],
    });
  });

  it('parses HTML in Node.js environment with a custom DOM document', async () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');

    const jsdom = await import('jsdom');
    const node = htmlToProsemirrorNode({
      document: new jsdom.JSDOM().window.document,
      schema: manager.schema,
      content: '<pre><code>echo hello world</code></pre>',
    });
    expect(node.toJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: {
            language: 'markup',
            wrap: false,
          },
          content: [
            {
              text: 'echo hello world',
              type: 'text',
            },
          ],
        },
      ],
    });
  });
});
