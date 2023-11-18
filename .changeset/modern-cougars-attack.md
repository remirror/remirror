---
'@remirror/extension-codemirror5': major
'@remirror/extension-codemirror6': major
'@remirror/extension-code-block': major
'@remirror/core': major
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
