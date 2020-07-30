---
'@remirror/extension-horizontal-rule': major
'remirror': major
'@remirror/styles': major
---

Default to inserting a new paragraph node after the `HorizontalRuleExtension`.

BREAKING: 💥 Rename `horizonalRule` command to `insertHorizontalRule`.

Add a new option `insertionNode` to the `HorizontalRuleExtension` which sets the default node to automatically append after insertion.

Update the css styles for the default `hr` tag.

Closes #417
