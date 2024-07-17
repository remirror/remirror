---
'@remirror/pm': patch
'@remirror/extension-entity-reference': patch
'@remirror/extension-text-highlight': patch
'@remirror/extension-font-family': patch
'@remirror/extension-text-color': patch
'@remirror/extension-font-size': patch
'@remirror/extension-text-case': patch
'@remirror/extension-mention': patch
'prosemirror-resizable-view': patch
'prosemirror-trailing-node': patch
'prosemirror-paste-rules': patch
'@remirror/extension-yjs': patch
'prosemirror-suggest': patch
'jest-prosemirror': patch
---

Bump ProseMirror to latest versions to address potentially XSS vulnerability found in ProseMirror's DOMSerializer

See: https://discuss.prosemirror.net/t/heads-up-xss-risk-in-domserializer/6572
