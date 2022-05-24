---
'@remirror/core': patch
---

Add a built in extension allowing external code to subscribe to document changes.

```ts
manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
```
