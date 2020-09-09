---
'@remirror/core': minor
'@remirror/core-constants': minor
---

Add `MarkSupportsExit` tag to `ExtensionTag` constant export.

Add `KeymapExtension` option `exitMarksOnArrowPress` which allows the user to exit marks with the `MarkSupportExit` tag from the beginning or the end of the document.

Store tags as `markTags`, `nodeTags`, `plainTags` and deprecate the helper methods which were previously doing this.

Add `extraTags` option to the extension and `RemirrorManager` now extra can be added as part of the configuration.
