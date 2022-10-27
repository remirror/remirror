---
'@remirror/extension-positioner': minor
'@remirror/react-hooks': patch
---

`usePositioner` and `useMultiPositioner` now return a `data` property, that enables you to pass metadata (such as document positions) from your positioner to your React component.

These hooks are now generic functions that accept a type definition, that describes the type of `data`.

For instance `const { data } = usePositioner<FromToProps>(myPositioner, [])` would indicate that `data` is `{ from: number, to: number }`.
