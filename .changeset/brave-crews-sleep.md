---
'@remirror/extension-react-tables': minor
'@remirror/extension-tables': patch
---

Fix to make React tables compatible with Yjs extension

The controller injection is now done is a single create transaction, rather than an additional transaction. The previous implementation with multiple rapid transactions triggered conflict resolution behaviour in Yjs, leading to unpredictable behaviour.

Exposes a `createTable` command from the React Tables extension directly
