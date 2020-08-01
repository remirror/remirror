---
'@remirror/core': major
'@remirror/core-constants': major
'@remirror/core-helpers': major
'@remirror/core-types': major
'@remirror/core-utils': major
'jest-remirror': major
'multishift': major
'prosemirror-suggest': major
---

**Breaking Changes** 💥

Rename `contains` to `containsNodesOfType`.

Make `isValidPresetConstructor` internal only.

Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.
