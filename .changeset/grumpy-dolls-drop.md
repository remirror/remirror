---
'@remirror/core': minor
'@remirror/core-utils': minor
---

🚀 Now featuring support for `DynamicExtraAttributes` as mentioned in [#387](https://github.com/remirror/remirror/issues/387).

- Also add support for `action` method being passed to `findChildren`, `findTextNodes`, `findInlineNodes`, `findBlockNodes`, `findChildrenByAttribute`, `findChildrenByNode`, `findChildrenByMark` and `containsNodesOfType`.
- Deprecate `flattenNodeDescendants`. `findChildren` is now the preferred method and automatically flattens the returned output.
