---
'@remirror/core-utils': minor
'prosemirror-suggest': minor
'@remirror/extension-auto-link': patch
'@remirror/extension-mention': patch
'@remirror/preset-social': patch
'@remirror/react-social': patch
---

- Add `keepSelection` property to the `replaceText` command function.
- Prevent mentions from trapping the cursor when arrowing left and right through the mention.
- Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with mentions.
- Update extension order in the `SocialPreset`
- `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit was due to a selection change or a character entry.
