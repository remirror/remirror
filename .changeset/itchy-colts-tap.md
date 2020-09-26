---
'@remirror/extension-annotation': patch
---

Support multi-line annotations in positioner

The annotation positioner placed the bottom on the bottom of the first line. This meant that a popup placed on the bottom would overlay the rest of a multi-line annotation. Now, the positioner returns the bottom of the last line, allowing to place the popup below all content.
