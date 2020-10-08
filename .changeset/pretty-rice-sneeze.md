---
'@remirror/extension-yjs': major
---

Add new options to the `YjsExtension` to support full configuration of the `y-prosemirror` plugins.

**BREAKING:** 💥 Remove `WebrtcProvider`. It was always required via TypeScript but now the default implementation throws an error if you don't install and provide the [provider](https://github.com/yjs/yjs#providers) you want to use. The `readme` has been updated to reflect this change.

**BREAKING:** 💥 `yjs` is now a `peerDependency` and you will need to install it in your codebase in order to consume the `YjsExtension`. This change follows from the above breaking change. For example, to configure any provider will need to provide your desired `Doc` from the `yjs` package.
