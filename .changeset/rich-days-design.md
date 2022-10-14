---
'@remirror/extension-image': minor
---

The ImageExtension **now prefers text content, over images when pasting mixed text and image content**.

The behaviour when pasting _only_ an image, or _only_ text **remains unchanged**.

This situation usually occurs when pasting content from Microsoft Office products, the content available via clipboard data is either:

1. One large image:
   - Effectively a _screenshot_ of the original content (an image with text in it).
2. HTML content:
   - Containing text that can be parsed by your chosen extensions.
   - However, the images have `file:///` protocol URLs, which cannot be resolved due to browser security restrictions.

Remirror's ImageExtension will now prefer HTML content, when the paste contains mixed content.

**This will potentially introduce a breaking change for some**. However, we believe the current behaviour to be incorrect so we are viewing this more as a fix, than a breaking change.

This update adds a new option to the ImageExtension `preferPastedTextContent` which you can set to `false` to restore the previous behaviour.

`preferPastedTextContent`

- If `true`, this will **use the text** from the clipboard data, and **drop the images** (default).
- If `false`, the "screenshot" image will be used, and the **text will be dropped**.
