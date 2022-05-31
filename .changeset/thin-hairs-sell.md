---
'prosemirror-paste-rules': patch
'prosemirror-resizable-view': patch
'prosemirror-suggest': patch
'prosemirror-trailing-node': patch
'@remirror/pm': patch
---

Lock ProseMirror pacakges to lower versions.

The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624
