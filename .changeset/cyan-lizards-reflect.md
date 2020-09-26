---
'@remirror/extension-annotation': patch
---

Remove annotations when their content is deleted

Users can create annotations on pieces of content. The annotations are automatically updated as the content is moved around, e.g. if a new word is inserted before the annotation. Yet, the extension missed the case that all annotated content is deleted. Before, this would lead to an empty annotation (to and from parameter are equal). With this commit, annotations are automatically removed when the content is completed deleted.
