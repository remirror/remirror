---
'jest-remirror': minor
---

Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

```ts
test('jest test', () => {
  // Only checks that the document is the same
  expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

  // Checks both document and selection
  expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
  expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
});
```
