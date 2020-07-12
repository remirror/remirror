---
'@remirror/react': patch
---

Prevent multiple editors being attached with a single Provider. This error flags you when you are attaching `getRootProps` to the dom in multiple placeswithin a single editor instance. This can help prevent unwanted behaviour.
