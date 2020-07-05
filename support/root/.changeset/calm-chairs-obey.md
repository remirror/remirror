---
'@remirror/core': minor
'@remirror/react': minor
'@remirror/react-social': minor
'@remirror/react-utils': minor
---

Add support for `React.StricMode`.

Previously, activating `StrictMode` would cause the components to render twice and break functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been called. This check has been removed since it isn't needed anymore.
