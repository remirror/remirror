import { p, doc, prosemirrorSerializer, schema } from '../';
import { createEditor } from '../jest-prosemirror-editor';

test('serializer', () => {
  const { test } = prosemirrorSerializer;
  const node = doc(p('<start>simple<end>'));
  const { state } = createEditor(node);

  expect(test(node)).toBe(true);
  expect(test(schema)).toBe(true);
  expect(test(state)).toBe(true);

  expect.addSnapshotSerializer(prosemirrorSerializer);
  expect(node).toMatchSnapshot();
  expect(schema).toMatchSnapshot();
  expect(state).toMatchSnapshot();
});
