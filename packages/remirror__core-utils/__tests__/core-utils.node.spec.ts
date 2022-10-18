/**
 * @jest-environment node
 */

import { doc, p, schema as testSchema } from 'jest-prosemirror';

import { htmlToProsemirrorNode, prosemirrorNodeToDom } from '../';

describe('toDOM', () => {
  const node = doc(p('hello'));

  it('allows for custom document to be passed in', async () => {
    const { JSDOM } = await import('jsdom');
    const customDocument = new JSDOM().window.document;
    expect(prosemirrorNodeToDom(node, customDocument)).toBeObject();

    const wrongWindow = {} as Window;
    const wrongDocument = { defaultView: wrongWindow } as Document;
    expect(() => prosemirrorNodeToDom(node, customDocument)).not.toThrow();
    expect(() => prosemirrorNodeToDom(node, wrongDocument)).toThrow();
  });
});

describe('htmlToProsemirrorNode', () => {
  const content = `<p>Hello</p>`;

  it('allows for custom document to be passed in', async () => {
    const { JSDOM } = await import('jsdom');
    const customDocument = new JSDOM().window.document;
    expect(
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: customDocument,
      }),
    ).toEqualProsemirrorNode(doc(p('Hello')));

    const wrongWindow = {} as Window;
    const wrongDocument = { defaultView: wrongWindow } as Document;
    expect(() =>
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: customDocument,
      }),
    ).not.toThrow();
    expect(() =>
      htmlToProsemirrorNode({
        content: content,
        schema: testSchema,
        document: wrongDocument,
      }),
    ).toThrow();
  });
});
