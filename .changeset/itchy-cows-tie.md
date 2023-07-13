---
'@remirror/core': patch
'@remirror/react-core': patch
---

Add the ability to reset a command chain with `.new()`.

```ts
chain.toggleBold();
chain.new().toggleItalic().run(); // Only toggleItalic would be run
```

This is automatically executed for you when using the `useChainedCommands()` hook.

This ensures that when calling the hook multiple times, each command chain is independent of the other.
