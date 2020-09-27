---
'@remirror/extension-annotation': patch
---

Fix: Don't extend annotation when typing at end of annotation

Annotations auto-adjust as users enter content, e.g. an annotation grows if the user types in the middle of the annotation. Incorrectly, the annotation also grew when the user added content directly after the annotation. Now, this leads to new, non-annotated content.
