---
'@remirror/extension-annotation': minor
---

Support to forcefully redraw annotations

Annotations can be styled with a custom getStyle function. Yet, changes to outcome of the function (e.g. color schema is dynamically adjusted) won't be automatically reflected in the editor. To handle such cases, one can now force to redraw the annotations by calling the `redrawAnnotations` command.
