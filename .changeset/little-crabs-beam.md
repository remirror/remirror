---
'@remirror/extension-annotation': patch
---

Gracefully handle annotations with positions outside the content

Annotations are loaded separately from the content into the editor (helpers.setAnnotations vs setContent). This can lead to situations where annotations are pointing to positions that are outside the content. For example, the editor shows content with annotations. Then, the user requests to change the content to an empty document. At this point, until helpers.setAnnotations() is called, the editor will have an empty document but still a list of annotations.

At that point, helpers.getAnnotations() would throw the following error because it couldn't find the matching text for the from/to positions: TypeError: Cannot read property 'nodeSize' of undefined
