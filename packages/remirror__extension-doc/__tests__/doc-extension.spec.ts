import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest } from 'jest-remirror';
import { createCoreManager } from 'remirror/extensions';

import { DocExtension } from '../';

extensionValidityTest(DocExtension);

test('supports docAttributes with only keys', () => {
  const { schema } = createCoreManager([new DocExtension({ docAttributes: ['foo', 'bar'] })]);
  const { doc, p } = pmBuild(schema, {});

  expect(doc(p('Hello!')).toJSON()).toEqual({
    type: 'doc',
    attrs: {
      foo: null,
      bar: null,
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello!' }],
      },
    ],
  });
});

test('supports docAttributes with default values', () => {
  const { schema } = createCoreManager([
    new DocExtension({ docAttributes: { foo: 'bar', custom: 'value' } }),
  ]);
  const { doc, p } = pmBuild(schema, {});

  expect(doc(p('Hello!')).toJSON()).toEqual({
    type: 'doc',
    attrs: {
      foo: 'bar',
      custom: 'value',
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello!' }],
      },
    ],
  });
});
