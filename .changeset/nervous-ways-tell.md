---
'prosemirror-suggest': major
---

💥`checkNextValidSelection` method is now run in the `appendTransaction` plugin hook and should only update the provided transaction. It receives the `Transaction` now instead of `EditorState` and another parameter for `matches` provides the name of the changed suggester and the exited suggester. Both can be undefined.

**`Suggester` Options**

- Add `caseInsensitive` option for case insensitive matches.
- Add `multiline` options for matches that can span multiple lines`.
- Add `appendTransaction` option which when true will run the `onChange` handler in the `appendTransaction` plugin hook and expect the transaction to be synchronously updated.
- Add `transaction` parameter to the `onChange` handler for when `appendTransaction` is true.

**`SuggestState`**

- Add new method `findNextTextSelection` which can be used to find the next text selection.
- Add new method `findMatchAtPosition` which finds the match for the provided suggester name at the given `ResolvedPos`. If no suggester name is provided then it looks through all `Suggester`s.

**Other**

- Now supports matches with only the matching regex active.
- Fixes a bug where changes were determined by the query and not the full text match.
