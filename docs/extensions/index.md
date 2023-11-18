---
hide_title: true
title: Overview
---

# All extensions

## Standard extensions

The following extensions are bundled together with Remirror:

**[AnnotationExtension](./annotation-extension.mdx)**<br /> Allows the annotation (or highlighting) of the content in your editor

**[BlockquoteExtension](./blockquote-extension.mdx)**<br /> Makes regions of text appear as an indented quote to ensure it stands out

**[BoldExtension](./bold-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range **bold**

**[CalloutExtension](./callout-extension.mdx)**<br /> Makes regions of text stand out on a colour background with optional emoji prefix

**[CodeBlockExtension](./code-block-extension.mdx)**<br /> Adds code blocks to the editor. This differs to the `CodeExtension`, which provides code marks on inline text.

**[CodeExtension](./code-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range `code`

**[CollaborationExtension](./collaboration-extension.mdx)**<br /> Adds collaborative functionality powered by `prosemirror-collab`

**[ColumnsExtension](./columns-extension.mdx)**<br /> Add column support to the nodes

**[DocExtension](./doc-extension.mdx)**<br /> The root node in your editor. Allows you to customise attributes and valid `content`.

**[DropCursorExtension](./drop-cursor-extension.mdx)**<br /> Shows a line indicator for where the drop target will be

**[EmbedExtension](./embed-extension.mdx)**<br /> Adds iframe-based embeds to your text editor.

**[EmojiExtension](./emoji-extension.mdx)**<br /> Adds emoji support

**[EntityReferenceExtension](./entity-reference-extension.mdx)**<br /> Allows you to reference external entities in the content of your editor.

**[EpicModeExtension](./epic-mode-extension.mdx)**<br /> Shows the editor in epic mode.

**[EventsExtension](./events-extension.mdx)**<br /> Listens to events which occur within the editor

**[FindExtension](./find-extension.mdx)** <br /> Add find and replace functionality to your editor.

**[FontFamilyExtension](./font-family-extension.mdx)**<br /> Add a font family to the selected text

**[FontSizeExtension](./font-size-extension.mdx)**<br /> Add a font size to the selected text

**[GapCursorExtension](./gap-cursor-extension.mdx)**<br /> This will capture clicks near and arrow-key-motion past places that don't have a normally selectable position nearby, and create a gap cursor selection for them.

**[HardBreakExtension](./hard-break-extension.mdx)**<br /> Inserts a `hardBreak` `<br />` tag into the editor

**[HeadingExtension](./heading-extension.mdx)**<br /> Adds headings to the editor

**[HistoryExtension](./history-extension.mdx)**<br /> Provides undo and redo commands

**[HorizontalRuleExtension](./horizontal-rule-extension.mdx)**<br /> Adds a horizontal line `<hr />` tag to the editor

**[ImageExtension](./image-extension.mdx)**<br /> Places images into the editor

**[ItalicExtension](./italic-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range _italic_

**[LinkExtension](./link-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range link to another resource

**[ListExtension](./list-extension.mdx)**<br /> Adds ordered lists, unordered lists, and checklists to the editor

**[MarkdownExtension](./markdown-extension.mdx)**<br /> Transforms the **ProseMirror** content of your editor to markdown syntax

**[MentionAtomExtension](./mention-atom-extension.mdx)**<br /> Provides mentions as atom nodes which don't support editing once being inserted into the document

**[MentionExtension](./mention-extension.mdx)**<br /> Provides mentions as nodes which support editing once being inserted into the document

**[NodeFormattingExtension](./node-formatting-extension.mdx)**<br /> Enables you to align, index and set the line-height of content in your editor

**[PlaceholderExtension](./placeholder-extension.mdx)**<br /> Shows a configurable placeholder when the **ProseMirror** content of your editor is empty

**[StrikeExtension](./strike-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range ~~strike~~

**[SubExtension](./sub-extension.mdx)**<br /> Adds a `sub` mark to the editor. This is used to mark inline text as a <sub>subscript</sub> snippet

**[SupExtension](./sup-extension.mdx)**<br /> Adds a `sup` mark to the editor. This is used to mark inline text as a <sup>superscript</sup> snippet

**[TablesExtension](./tables-extension.mdx)**<br /> Adds simple tables to the editor

**[TextCaseExtension](./text-case-extension.mdx)**<br /> Formatting for text casing in the editor

**[TextColorExtension](./text-color-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range have the specified color

**[TextHighlightExtension](./text-highlight-extension.mdx)**<br /> Add a highlight color to the selected text

**[TrailingNodeExtension](./trailing-node-extension.mdx)**<br /> Ensure that there's always a trailing paragraph at the end of the document

**[UnderlineExtension](./underline-extension.mdx)**<br /> Makes the text under the cursor / or at the provided position range <u>underline</u>

**[WhitespaceExtension](./whitespace-extension.mdx)**<br /> Manage whitespace characters within the editor

**[YjsExtension](./yjs-extension.mdx)**<br /> The recommended extension for creating a collaborative editor, powered by `Yjs`.

## Additional extensions

The following extensions are _not_ bundled with the `remirror` package, and must be installed manually.

**[CountExtension](./count-extension.mdx)** <br /> Adds ability to count characters or words in your editor, and optionally highlight to a user when they have exceeded a specified limit.

**[FileExtension](./file-extension.mdx)** <br /> Adds the ability to upload arbitrary files to the editor.

## Community extensions

The following extensions are maintained by the community:

**[EntityExtension](https://github.com/Collaborne/remirror-entity-extension)**<br /> Stores all the data of an entity within the document itself

:::info

Did you create an extension and want to list it here as well? Please create a PR - or reach out on [Discord](https://remirror.io/chat).

:::
