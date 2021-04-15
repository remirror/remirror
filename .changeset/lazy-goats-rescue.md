---
'@remirror/core': major
---

Make chainable commands lazy. Previously, chainable commands would immediately update the transaction. Now the transaction is only updated when `run` is called.

In this way the chainable command, now has no side effects until the `run` or `tr` methods are called.

Add `tr` method and `enabled` method to chainable commands.

- `enabled` checks to see whether the current chain can be run. Returns true if it is possible.
- `tr` runs all the transactions added without dispatching the command into the editor. Produces the side effects.
