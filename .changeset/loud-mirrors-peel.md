---
'@remirror/extension-embed': minor
---

Set custom value for "type" of iframe embeds

The "type" attribute for the iframe-extension indicates the kind of embed. Before, the attribute would allow only for values "youtube" and "custom" (youtube being supported natively by the iframe-extension).This commit allows to set the "type" to any string. With this, one can distinglish between different kinds of custom embeds like "google-drive" vs. "vimeo".
