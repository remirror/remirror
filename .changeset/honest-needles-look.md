---
'@remirror/core': minor
'@remirror/core-utils': minor
'@remirror/extension-auto-link': minor
'@remirror/extension-callout': minor
'@remirror/extension-image': minor
'@remirror/extension-link': minor
'@remirror/extension-mention-atom': minor
'@remirror/preset-embed': minor
---

Fixes extensions that were erroneously adding extra attributes to the DOM twice.

Attributes were correctly added using their toDOM handler, but also incorrectly in their raw form.

Example

```ts
const linkExtension = new LinkExtension({
  extraAttributes: {
    custom: {
      default: 'my default',
      parseDOM: (dom) => dom.getAttribute('data-custom'),
      toDOM: (attrs) => ['data-custom', attrs.custom],
    },
  },
});
```

Resulted in

```html
<a data-custom="my default" custom="my default" <!-- extra attribute rendered in raw form -->
  href="https://remirror.io" rel="noopener noreferrer nofollow"></a
>
```
