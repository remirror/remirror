---
'@remirror/core-utils': major
'@remirror/core': major
---

💥 Remove property `updateSelection` from the `nodeInputRule`, `markInputRule` and `plainInputRule` functions. You should use the new `beforeDispatch` method instead.

Add new `beforeDispatch` method to the `nodeInputRule`, `markInputRule` and `plainInputRule` parameter. This method allows users to add extra steps to the transaction after a matching input rule has been run and just before it is dispatched.

```ts
import { nodeInputRule } from 'remirror/core';

nodeInputRule({
  type,
  regexp: /abc/,
  beforeDispatch: ({ tr }) => tr.insertText('hello'),
});
```
