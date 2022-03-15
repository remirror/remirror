---
'prosemirror-suggest': minor
---

Add support for Unicode Regexp in suggestion matching.

The change was required to support matching non-latin characters in `MentionAtomExtension` and `MentionExtension` i.e. by using `supportedCharacters: /\p{Letter}+/u` in `matchers` definition.

There is no need to update the code: changes are backwards compatible with no behavior change at all.
