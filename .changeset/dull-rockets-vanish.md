---
'@remirror/pm': patch
---

Update the `selection`, `storedMarks` and `doc` from the `chainableEditorState` whenever the `state.tr` property is accessed. This better mimics the behavior expected within commands where the `Transaction` is created once at the start and the state is used as a reference point.
