---
'@remirror/core-utils': patch
---

Don't require `jsdom` in the browser environment.

This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.
