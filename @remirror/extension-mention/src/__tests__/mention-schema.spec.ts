import { ExtensionManager, fromHTML, toHTML } from '@remirror/core';
import { extensions } from '@test-fixtures/schema-helpers';

import { Mention } from '../';

const manager = ExtensionManager.create([
  ...extensions,
  { extension: new Mention({ name: 'mentionAt' }), priority: 1 },
]);

const schema = manager.createSchema();

const { paragraph, mentionAt, doc } = schema.nodes;

test('can create the required dom node', () => {
  const node = mentionAt.create({ id: 'test', label: '@label' });
  expect(toHTML({ node, schema })).toBe('<a class="mention mention-at" data-mention-at-id="test">@label</a>');
});

test('can parse the dom structure and find itself', () => {
  const node = fromHTML({
    schema,
    content: '<a class="mention mention-at" data-mention-at-id="awesome">@awesome</a>',
  });
  const expected = doc.create(
    {},
    paragraph.create({}, mentionAt.create({ id: 'awesome', label: '@awesome' })),
  );
  expect(node).toEqualRemirrorDocument(expected as any);
});

test('does not support nested paragraph tags', () => {
  const node = mentionAt.create(
    { id: 'test', label: '@label' },
    paragraph.create({}, schema.text('Content here')),
  );
  expect(toHTML({ node, schema })).toBe('<a class="mention mention-at" data-mention-at-id="test">@label</a>');
});
