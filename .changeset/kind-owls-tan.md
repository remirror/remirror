---
'prosemirror-suggest': major
---

**Rename `Suggestion` to `Suggester`**

The name `Suggestion` implies something offered to a user. For example typing `@a` offers a suggestion to tag a certain username. Using `Suggestion` as the name for the configuration object is confusing. Going forward `Suggester` will be used as the name of the configuration object.

The `Suggester` configures the editor to behave in a desired way so that it can provide suggestions to end users.

**Make `prosemirror-state` and `prosemirror-keymap` peerDependencies.**

Make all `@type/*` peer dependencies optional.

Remove `@remirror/core-utils` from dependencies to avoid bloating the size.
