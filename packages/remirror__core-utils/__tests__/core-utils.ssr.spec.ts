/**
 * @jest-environment node
 */

import { doc, p, schema as testSchema } from 'jest-prosemirror';
import { JSDOM } from 'jsdom';

import { htmlToProsemirrorNode } from '../';

describe('htmlToProsemirrorNode', () => {
  const content = `<p>Hello</p>`;

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
