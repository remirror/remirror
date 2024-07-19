---
'@remirror/extension-entity-reference': patch
'@remirror/extension-node-formatting': patch
'@remirror/extension-text-highlight': patch
'@remirror/extension-mention-atom': patch
'@remirror/extension-react-tables': patch
'@remirror/extension-codemirror5': patch
'@remirror/extension-codemirror6': patch
'@remirror/extension-font-family': patch
'@remirror/extension-code-block': patch
'@remirror/extension-text-color': patch
'@remirror/extension-font-size': patch
'@remirror/extension-text-case': patch
'@remirror/extension-callout': patch
'@remirror/extension-columns': patch
'@remirror/extension-heading': patch
'@remirror/extension-mention': patch
'@remirror/extension-tables': patch
'@remirror/extension-embed': patch
'@remirror/extension-emoji': patch
'@remirror/extension-image': patch
'@remirror/extension-bidi': patch
'@remirror/extension-file': patch
'@remirror/extension-link': patch
'@remirror/extension-list': patch
'@remirror/extension-doc': patch
---

Drop the explicit `validate` property, added to attributes in 2.0.39

Some users have reported issues with legacy JSON data in JavaScript repos where attribute types have not been strictly checked (i.e. calling a command with a string attribute value instead of a number).

The XSS issue in ProseMirror has been largely resolved since the changes added in prosemirror-model 1.22.1, which actively guards against corrupted-attribute XSS attacks in DOMSerializer. This makes the additional protection of an explicit `validate` attribute largely redundant.
