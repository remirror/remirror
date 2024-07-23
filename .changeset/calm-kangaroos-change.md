---
'@remirror/cli': patch
'@remirror/extension-code-block': patch
'@remirror/extension-react-language-select': patch
'@remirror/preset-wysiwyg': patch
'@remirror/react-components': patch
'@remirror/react-editor': patch
'remirror': patch
---

## Updates

Update dependency prettier to v3.2.5.

## 💥 BREAKING CHANGES! 💥

The `formatter` prop for extension `@remirror/extension-code-block` now expects an asynchronous function.

```ts
new CodeBlockExtension({
  formatter: async ({ source, language, cursorOffset }) => {
    /* format source */
  },
});
```

This change was made to support prettier v3 which no longer provides a synchronous `formatWithCursor()` function. The formatter available from `@remirror/extension-code-block/formatter` has been updated to use prettier v3 and satisfies the updated `formatter` signature.

As a consequence, the command `formatCodeBlock` must also be asynchronous, and hence **is no longer chainable**.
