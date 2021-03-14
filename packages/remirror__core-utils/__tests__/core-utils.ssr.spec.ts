/**
 * @jest-environment node
 */

import { doc, p, schema as testSchema } from 'jest-prosemirror';
import { JSDOM } from 'jsdom';

import { htmlToProsemirrorNode } from '../';

describe('htmlToProsemirrorNode', () => {
  const content = `<p>Hello</p>`;

  it('transform html into a prosemirror node', () => {
    expect(htmlToProsemirrorNode({ content: content, schema: testSchema })).toEqualProsemirrorNode(
      doc(p('Hello')),
    );
  });

  it('allows for a custom document to be passed in', () => {
    expect(
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: new JSDOM().window.document,
      }),
    ).toEqualProsemirrorNode(doc(p('Hello')));
  });
});
