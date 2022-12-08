---
'jest-prosemirror': minor
'jest-remirror': minor
---

Improve `ProsemirrorTestChain.paste`. It's behavior is closer to ProseMirror's paste behavior. It now accepts an object with the `html` and `text` properties. The `text` property is used to set the `text/plain` clipboard data. The `html` property is used to set the `text/html` clipboard data. It also accepts an option `plainText` property which is used to simulate a plain text paste (e.g. press `Ctrl-Shift-V` or `Command-Shift-V`).
