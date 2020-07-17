---
'@remirror/extension-react-component': patch
---

Enable `NodeExtension`'s with a `ReactComponent` to render correctly when toggling the block type.\n\nThere was an issue with the intial `contentDOM` which is created without a parent until the react ref is attached. This fix attaches the content dom to the wrapper dom node until the ref is attached.
