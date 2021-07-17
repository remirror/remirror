---
'@remirror/extension-link': minor
---

Add `supportedTargets` option to `LinkExtension`.

```ts
new LinkExtension({ supportedTargets: ['_blank'] });

// Insert a link with a target attribute.
commands.insertHtml('<a target="_blank" href="//example.com">Awesome</a>');
```
