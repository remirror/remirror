import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@remirror/test-fixtures';
import { pmBuild } from 'jest-prosemirror';
import { ParagraphExtension } from '../paragraph-extension';

describe('schema', () => {
  let { schema } = createBaseTestManager([{ extension: new ParagraphExtension(), priority: 1 }]);
  let { doc, p } = pmBuild(schema, {});

  it('it can parse content', () => {
    ({ schema } = createBaseTestManager([{ extension: new ParagraphExtension(), priority: 1 }]));
    ({ doc, p } = pmBuild(schema, {
      p: { nodeType: 'paragraph', indent: 1, align: 'right', lineSpacing: '100%', id: 'never' },
    }));
    const node = fromHTML({
      content: `<p data-indent="1" style="text-align: right; line-height: 100%;" id="never">hello</p>`,
      schema,
    });
    const expected = doc(p('hello'));
    expect(node).toEqualProsemirrorNode(expected);
  });

  it('it produces valid html', () => {
    ({ schema } = createBaseTestManager([{ extension: new ParagraphExtension(), priority: 1 }]));
    ({ doc, p } = pmBuild(schema, {
      p: { nodeType: 'paragraph', indent: 1, align: 'right', lineSpacing: '100%', id: 'never' },
    }));
    const html = toHTML({
      node: p('hello'),
      schema,
    });
    expect(html).toBe(`<p style="text-align: right;line-height: 100%;" data-indent="1" id="never">hello</p>`);
  });
});
