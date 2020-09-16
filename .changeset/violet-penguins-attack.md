---
'@remirror/react': major
---

Remove `childAsRoot` prop from `RemirrorProvider`.

- Accept child-less rendering for `RemirrorProvider`.
- Add `autoRender` prop to the `RemirrorProvider` which automatically adds an editable `div` to contain the ProseMirror editor. it can take values `start` and `end` to determine whether the div is insert before (`start`) all other children, or after (`end`).
