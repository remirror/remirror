import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { Link } from '../link';

const href = 'https://test.com';
describe('schema', () => {
  const schema = createBaseTestManager([{ extension: new Link(), priority: 1 }]).createSchema();
  const { a, doc, p } = pmBuild(schema, {
    a: { markType: 'link', href },
  });

  it('uses the href', () => {
    expect(toHTML({ node: p(a('link')), schema })).toBe(
      `<p><a href="${href}" rel="noopener noreferrer nofollow">link</a></p>`,
    );
  });

  it('it can parse content', () => {
    const node = fromHTML({
      content: `<p><a href="${href}">link</a></p>`,
      schema,
    });
    const expected = doc(p(a('link')));
    expect(node).toEqualPMNode(expected);
  });
});
