---
'@remirror/cli': patch
'@remirror/extension-code-block': major
'@remirror/extension-react-language-select': patch
'@remirror/preset-wysiwyg': patch
'@remirror/react-components': patch
'@remirror/react-editor': patch
'remirror': patch
---

## Updates

Update dependency prettier to v3.2.5.

## Breaking change

The `formatter` prop for extension `@remirror/extension-code-block` now expects an asynchronous function.

```ts
new CodeBlockExtension({
  formatter: async ({ source, language, cursorOffset }) => {
    /* format source */
  },
});
```

This change was made to support prettier v3 which no longer provides a synchronous `formatWithCursor()` function. The formatter available from `@remirror/extension-code-block/formatter` has been updated to use prettier v3 and satisfies the updated `formatter` signature.
