---
'@remirror/react-social': major
---

Reduce the number of rerenders for the social manager.

BREAKING CHANGE: The package no longer exports a `createSocialManager` and instead provides a `socialManagerArgs` which can be passed into the `useManager` hook.
