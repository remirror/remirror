---
'prosemirror-suggest': major
---

- 💥 Remove the `keyBindings` option and the keyboard handler.
- 💥 Remove `createCommand` handler, since it's up to the developer to interpret the information that's been provided to them.
- 💥 Remove the `onCharacterPress` keyboard handler.
- 💥 Merge `onExit` functionality into the `onChange` method and split `reason` property into `exitReason` and `changeReason` only one of which can be defined.
- 💥Remove a lot of type exports.
- 💥Rename `FromToEndParameter` to `RangeWithCursor` and change the property name of `to` => `cursor` and `end` => `to`.
- 💥Rename `queryText` => `query` and `matchText` => `text` in the `onChange` handler parameter.
- 🎉 Allow the activation character to be `RegExp`.
- 🎉 Add raw regex `match` to the `onChange` handler parameter.
- 🎉 Add a `priority` property which allows `suggesters` to specify importance. Higher priority means being checked for a match first.
- 🎉 Support invalid nodes and marks by name.
- 🎉 Support valid nodes and marks by name.
- 🎉 Allow whitespace in `supportedCharacters`.
- 🎉 Support an `isValidPosition` handler which is a predicate that is run with the active resolved positioner on each suggester. It allows more advanced criteria for rejecting a `suggester` in the dom.

See #548 for more details.
