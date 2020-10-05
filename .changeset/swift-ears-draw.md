---
'@remirror/extension-annotation': minor
---

Configure blockseparator to concat multi-block content

getAnnotations() return all currently set annotations and enriches them with the text of the annotation. This can be used e.g. to show a list of all annotations outside the editor context. Before, text from multiple blocks (in a multi-block annotation) was concatenated without any separated. Now, one can define via the "blockseparator" option which string to use as separator. For example, one could use a newline character to separate text from different blocks.
