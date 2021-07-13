import { createEditor, doc, p, prosemirrorSerializer, schema } from '../';

test('serializer', () => {
  const { test: t } = prosemirrorSerializer;
  const node = doc(p('<start>simple<end>'));
  const { state } = createEditor(node);

  expect(t(node)).toBeTrue();
  expect(t(schema)).toBeTrue();
  expect(t(state)).toBeTrue();

  expect.addSnapshotSerializer(prosemirrorSerializer);
  expect(node).toMatchSnapshot();
  expect(schema).toMatchSnapshot();
  expect(state).toMatchSnapshot();
});
