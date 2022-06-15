/**
 * @jest-environment node
 */

import { doc, p, schema as testSchema } from 'jest-prosemirror';
import { JSDOM } from 'jsdom';

import { htmlToProsemirrorNode } from '../';

describe('htmlToProsemirrorNode', () => {
  const content = `<p>Hello</p>`;

  it('throws error is unable to find document', () => {
    expect(() =>
      htmlToProsemirrorNode({ content: content, schema: testSchema }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unable to retrieve the document from the global scope. Maybe you are running Remirror in a non-browser environment? If you are using Node.js, you can install JSDOM or similar to create a fake document and pass that document to Remirror."`,
    );
  });

  it('allows for a custom document to be passed in', () => {
    const document = new JSDOM().window.document;
    expect(!!document).toBeTrue();
    expect(
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: document,
      }),
    ).toEqualProsemirrorNode(doc(p('Hello')));
  });
});
