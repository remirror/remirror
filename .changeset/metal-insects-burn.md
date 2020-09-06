---
'@remirror/core': minor
---

Add new properties `chain`, `commands` and `helpers` to simplify usage of commands and helpers within extensions. Also allow using `setExtensionStore` within the `onView` lifecycle handler, which previously was prevented.

Deprecate `getCommands`, `getChain` and `getHelpers` methods on the `Remirror.ExtensionStore` interface. They will be removed in a future release.
