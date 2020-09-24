---
'@remirror/core-utils': major
---

**BREAKING:** 💥 Remove exports for `flatten` and `emptyCommandFunction` which are unused in the codebase and not very practical.

Update API for `findChildrenByAttribute` to only support an object of attributeNames and literal value or predicate value.

```ts
const mergedCells = findChildrenByAttribute({
  node: table,
  attrs: { colspan: 2, id: (_, exists) => exists },
});
```
