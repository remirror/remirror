/**
 * @jest-environment node
 */

import { JSDOM } from 'jsdom';
import { CodeBlockExtension, createCoreManager } from 'remirror/src/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';

describe('schema', () => {
  const extensions = [new CodeBlockExtension()];
  const manager = createCoreManager(extensions);

  it('throws an error when parsing HTML in Node.js environment without browser API', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');

    const parse = () =>
      htmlToProsemirrorNode({
        schema: manager.schema,
        content: '<pre><code>echo hello world</code></pre>',
      });
    expect(parse).toThrow(/Unable to retrieve the document from the global scope/);
  });

  it('parses HTML in Node.js environment', () => {
    const node = htmlToProsemirrorNode({
      document: new JSDOM().window.document,
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
