import { pmBuild } from 'jest-prosemirror';

import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@remirror/test-fixtures';

import { CodeExtension } from '../code-extension';

describe('schema', () => {
  const codeTester = () => {
    const { schema } = createBaseTestManager([{ extension: new CodeExtension(), priority: 1 }]);
    const { code, doc, p } = pmBuild(schema, {
      code: { markType: 'code' },
    });

    return { schema, code, doc, p };
  };

  it('returns the correct html', () => {
    const expected = 'Brilliant';
    const { p, code, schema } = codeTester();

    expect(toHTML({ node: p(code(expected)), schema })).toBe(`<p><code>${expected}</code></p>`);
  });

  it('it can parse content', () => {
    const { p, code, schema, doc } = codeTester();
    const parsedString = 'Test';
    const node = fromHTML({
      content: `<p><code>${parsedString}</code></p>`,
      schema,
    });
    const expected = doc(p(code(parsedString)));

    expect(node).toEqualProsemirrorNode(expected);
  });
});
