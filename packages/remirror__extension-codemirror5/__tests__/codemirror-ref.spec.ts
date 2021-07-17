import ref, { loadCodeMirror } from '../src/codemirror-ref';

test('loadCodeMirror', async () => {
  expect(ref.CodeMirror).toBeNil();
  await loadCodeMirror();
  expect(ref.CodeMirror).not.toBeNil();
});
