---
'@remirror/core': major
'@remirror/dom': major
'@remirror/react': major
---

**BREAKING**: 💥 Rename `Framework.frameworkHelpers` to `baseOutput` and make it protected.

- Add required `abstract` getter `frameworkOutput`.
- Add third generic property `Output` which extends `FrameworkOutput`.
- Remove `manager` property from `FrameworkOutput`.
