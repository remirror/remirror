---
'@remirror/extension-markdown': minor
---

Add new `insertMarkdown` command.

```ts
commands.insertMarkdown('# Heading\nAnd content');
// => <h1 id="heading">Heading</h1><p>And content</p>
```

The content will be inlined by default if not a block node.

```ts
commands.insertMarkdown('**is bold.**');
// => <strong>is bold.</strong>
```

To always wrap the content in a block you can pass the following option.

```ts
commands.insertMarkdown('**is bold.**', { alwaysWrapInBlock: true });
// => <p><strong>is bold.</strong></p>
```
