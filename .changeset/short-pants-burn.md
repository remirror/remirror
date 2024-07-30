---
'@remirror/styles': patch
---

## 💥 BREAKING CHANGES! 💥 (For some users)

Update `@remirror/styles` to use the latest version of `styled-components`.

`styled-components` is an _optional_ peer dependency, so this will only impact users who import from `@remirror/styles/styled-components`.

In these cases, other than updating your peer dependency to `styled-components` `v6.1.12` no other changes are required.
