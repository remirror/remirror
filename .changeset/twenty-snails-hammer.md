---
'jest-remirror': patch
'prosemirror-paste-rules': patch
'prosemirror-resizable-view': patch
'prosemirror-suggest': patch
'prosemirror-trailing-node': patch
'remirror': patch
'@remirror/core': patch
'@remirror/core-constants': patch
'@remirror/core-helpers': patch
'@remirror/core-types': patch
'@remirror/core-utils': patch
'@remirror/dev': patch
'@remirror/dom': patch
'@remirror/extension-annotation': patch
'@remirror/extension-bidi': patch
'@remirror/extension-blockquote': patch
'@remirror/extension-bold': patch
'@remirror/extension-callout': patch
'@remirror/extension-code': patch
'@remirror/extension-code-block': patch
'@remirror/extension-codemirror5': patch
'@remirror/extension-codemirror6': patch
'@remirror/extension-collaboration': patch
'@remirror/extension-columns': patch
'@remirror/extension-diff': patch
'@remirror/extension-doc': patch
'@remirror/extension-drop-cursor': patch
'@remirror/extension-embed': patch
'@remirror/extension-emoji': patch
'@remirror/extension-epic-mode': patch
'@remirror/extension-events': patch
'@remirror/extension-file': patch
'@remirror/extension-font-family': patch
'@remirror/extension-font-size': patch
---

Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.
