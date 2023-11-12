---
'@remirror/extension-codemirror5': patch
'@remirror/extension-codemirror6': patch
'@remirror/extension-code-block': patch
'@remirror/core': patch
---

Remove deprecated command dry run function `isEnabled`, use `enabled` instead.

```tsx
const { toggleBold } = useCommands();

const handleClick = useCallback(() => {
  if (toggleBold.isEnabled()) {
    toggleBold();
  }
}, [toggleBold]);
```

```diff
const { toggleBold } = useCommands();

const handleClick = useCallback(() => {
-  if (toggleBold.isEnabled()) {
+  if (toggleBold.enabled()) {
    toggleBold();
  }
}, [toggleBold]);
```
