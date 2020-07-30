---
'@remirror/core': minor
'remirror': minor
---

Add support for `Handler` options with custom return values and early returns.

Previously handlers would ignore any return values. Now a handler will honour the return value. The earlyReturn value can be specified in the static options using the `extensionDecorator`. Currently it only supports primitives. Support for a function to check the return value will be added later.
