# @remirror/preset-wysiwyg

## 1.1.45

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

- Updated dependencies []:
  - @remirror/pm@1.0.16
  - @remirror/extension-embed@1.1.24
  - @remirror/extension-image@1.0.30

## 1.1.44

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

* Add a new `CountExtension`, adding the ability to count words or characters in your editor, and set a soft max length

* Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-bidi@1.0.18
  - @remirror/extension-blockquote@1.0.21
  - @remirror/extension-bold@1.0.18
  - @remirror/extension-code@1.0.19
  - @remirror/extension-code-block@1.0.24
  - @remirror/extension-drop-cursor@1.0.18
  - @remirror/extension-embed@1.1.23
  - @remirror/extension-gap-cursor@1.0.18
  - @remirror/extension-hard-break@1.0.18
  - @remirror/extension-heading@1.0.18
  - @remirror/extension-horizontal-rule@1.0.19
  - @remirror/extension-image@1.0.29
  - @remirror/extension-italic@1.0.18
  - @remirror/extension-link@1.1.17
  - @remirror/extension-list@1.2.20
  - @remirror/extension-search@1.0.18
  - @remirror/extension-shortcuts@1.1.7
  - @remirror/extension-strike@1.0.18
  - @remirror/extension-trailing-node@1.0.18
  - @remirror/extension-underline@1.0.18
  - @remirror/preset-core@1.0.24

## 1.1.43

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/extension-bidi@1.0.17
  - @remirror/extension-blockquote@1.0.20
  - @remirror/extension-bold@1.0.17
  - @remirror/extension-code@1.0.18
  - @remirror/extension-code-block@1.0.23
  - @remirror/extension-drop-cursor@1.0.17
  - @remirror/extension-embed@1.1.22
  - @remirror/extension-gap-cursor@1.0.17
  - @remirror/extension-hard-break@1.0.17
  - @remirror/extension-heading@1.0.17
  - @remirror/extension-horizontal-rule@1.0.18
  - @remirror/extension-image@1.0.28
  - @remirror/extension-italic@1.0.17
  - @remirror/extension-link@1.1.16
  - @remirror/extension-list@1.2.19
  - @remirror/extension-search@1.0.17
  - @remirror/extension-shortcuts@1.1.6
  - @remirror/extension-strike@1.0.17
  - @remirror/extension-trailing-node@1.0.17
  - @remirror/extension-underline@1.0.17
  - @remirror/preset-core@1.0.23

## 1.1.42

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/preset-core@1.0.22

## 1.1.41

> 2022-03-02

### Patch Changes

- Fix an error when clicking the list spine.

- Updated dependencies []:
  - @remirror/extension-list@1.2.18

## 1.1.40

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/extension-link@1.1.15
  - @remirror/core@1.3.6
  - @remirror/extension-bidi@1.0.16
  - @remirror/extension-blockquote@1.0.19
  - @remirror/extension-bold@1.0.16
  - @remirror/extension-code@1.0.17
  - @remirror/extension-code-block@1.0.22
  - @remirror/extension-drop-cursor@1.0.16
  - @remirror/extension-embed@1.1.21
  - @remirror/extension-gap-cursor@1.0.16
  - @remirror/extension-hard-break@1.0.16
  - @remirror/extension-heading@1.0.16
  - @remirror/extension-horizontal-rule@1.0.17
  - @remirror/extension-image@1.0.27
  - @remirror/extension-italic@1.0.16
  - @remirror/extension-list@1.2.17
  - @remirror/extension-search@1.0.16
  - @remirror/extension-shortcuts@1.1.5
  - @remirror/extension-strike@1.0.16
  - @remirror/extension-trailing-node@1.0.16
  - @remirror/extension-underline@1.0.16
  - @remirror/preset-core@1.0.21

## 1.1.39

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/extension-blockquote@1.0.18
  - @remirror/extension-code-block@1.0.21
  - @remirror/extension-image@1.0.26
  - @remirror/extension-list@1.2.16
  - @remirror/preset-core@1.0.20

## 1.1.38

> 2022-02-08

### Patch Changes

- Add support for attribute filtering for `useActive` and `useAttrs` hooks when used with marks.

  This provides consistent behaviour for the hook, aligning with functionality provided for node types.

  ```tsx
  const active = useActive();

  // Previously this ignored passed attributes and only checked the mark's type
  //
  // Now this will only return true if mark type is active AND its color attribute is red
  const isActive = active.textColor({ color: 'red' });
  ```

- Updated dependencies []:
  - @remirror/core@1.3.5
  - @remirror/extension-bidi@1.0.15
  - @remirror/extension-blockquote@1.0.17
  - @remirror/extension-bold@1.0.15
  - @remirror/extension-code@1.0.16
  - @remirror/extension-code-block@1.0.20
  - @remirror/extension-drop-cursor@1.0.15
  - @remirror/extension-embed@1.1.20
  - @remirror/extension-gap-cursor@1.0.15
  - @remirror/extension-hard-break@1.0.15
  - @remirror/extension-heading@1.0.15
  - @remirror/extension-horizontal-rule@1.0.16
  - @remirror/extension-image@1.0.25
  - @remirror/extension-italic@1.0.15
  - @remirror/extension-link@1.1.14
  - @remirror/extension-list@1.2.15
  - @remirror/extension-search@1.0.15
  - @remirror/extension-shortcuts@1.1.4
  - @remirror/extension-strike@1.0.15
  - @remirror/extension-trailing-node@1.0.15
  - @remirror/extension-underline@1.0.15
  - @remirror/preset-core@1.0.19

## 1.1.37

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/extension-link@1.1.13
  - @remirror/core@1.3.4
  - @remirror/extension-bidi@1.0.14
  - @remirror/extension-blockquote@1.0.16
  - @remirror/extension-bold@1.0.14
  - @remirror/extension-code@1.0.15
  - @remirror/extension-code-block@1.0.19
  - @remirror/extension-drop-cursor@1.0.14
  - @remirror/extension-embed@1.1.19
  - @remirror/extension-gap-cursor@1.0.14
  - @remirror/extension-hard-break@1.0.14
  - @remirror/extension-heading@1.0.14
  - @remirror/extension-horizontal-rule@1.0.15
  - @remirror/extension-image@1.0.24
  - @remirror/extension-italic@1.0.14
  - @remirror/extension-list@1.2.14
  - @remirror/extension-search@1.0.14
  - @remirror/extension-shortcuts@1.1.3
  - @remirror/extension-strike@1.0.14
  - @remirror/extension-trailing-node@1.0.14
  - @remirror/extension-underline@1.0.14
  - @remirror/preset-core@1.0.18

## 1.1.36

> 2022-01-21

### Patch Changes

- fix: make HorizontalRule compatible with Shortcuts

- Updated dependencies []:
  - @remirror/extension-horizontal-rule@1.0.14

## 1.1.35

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.11
  - @remirror/extension-embed@1.1.18
  - @remirror/extension-image@1.0.23

## 1.1.34

> 2022-01-16

### Patch Changes

- Increase the clickable area of the task list checkbox by using `<label>` to wrap the checkbox.

- Updated dependencies []:
  - @remirror/extension-list@1.2.13

## 1.1.33

> 2022-01-11

### Patch Changes

- Deprecate `getTheme` and `getThemeProps` in favour of new methods `getThemeVar` and `getThemeVarName`.

  This removes a code path that used an ES6 Proxy, which cannot be polyfilled.

  ```
  getTheme((t) => t.color.primary.text) => `var(--rmr-color-primary-text)`

  getThemeProps((t) => t.color.primary.text) => `--rmr-color-primary-text`
  ```

  ```
  getThemeVar('color', 'primary', 'text') => `var(--rmr-color-primary-text)`

  getThemeVarName('color', 'primary', 'text') => `--rmr-color-primary-text`
  ```

- Updated dependencies []:
  - @remirror/extension-blockquote@1.0.15
  - @remirror/extension-code-block@1.0.18
  - @remirror/extension-image@1.0.22
  - @remirror/extension-list@1.2.12
  - @remirror/preset-core@1.0.17

## 1.1.32

> 2022-01-06

### Patch Changes

- Fix a bug that causes the cursor to jump to the end of the first node when pressing backspace at the beginning of a list and this list is the second child of the document.

- Updated dependencies []:
  - @remirror/extension-list@1.2.11

## 1.1.31

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/extension-bidi@1.0.13
  - @remirror/extension-blockquote@1.0.14
  - @remirror/extension-bold@1.0.13
  - @remirror/extension-code@1.0.14
  - @remirror/extension-code-block@1.0.17
  - @remirror/extension-drop-cursor@1.0.13
  - @remirror/extension-embed@1.1.17
  - @remirror/pm@1.0.10
  - @remirror/extension-image@1.0.21
  - @remirror/extension-gap-cursor@1.0.13
  - @remirror/extension-hard-break@1.0.13
  - @remirror/extension-heading@1.0.13
  - @remirror/extension-horizontal-rule@1.0.13
  - @remirror/extension-italic@1.0.13
  - @remirror/extension-link@1.1.12
  - @remirror/extension-list@1.2.10
  - @remirror/extension-search@1.0.13
  - @remirror/extension-shortcuts@1.1.2
  - @remirror/extension-strike@1.0.13
  - @remirror/extension-trailing-node@1.0.13
  - @remirror/extension-underline@1.0.13
  - @remirror/preset-core@1.0.16

## 1.1.30

> 2021-12-30

### Patch Changes

- Correct a document error about `CodeBlockExtension`'s option `toggleName`. Its default value should be `'paragraph'` instead of `undefined`.

* Fix a potential issue that might cause invalid text selection when pressing `Backspace` instead a code block node.

* Updated dependencies []:
  - @remirror/extension-code-block@1.0.16

## 1.1.29

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/extension-link@1.1.11
  - @remirror/extension-list@1.2.9
  - @remirror/preset-core@1.0.15

## 1.1.28

> 2021-12-15

### Patch Changes

- fix: prevent text loss when drag and dropping text containing links

- Updated dependencies []:
  - @remirror/extension-link@1.1.10

## 1.1.27

> 2021-12-10

### Patch Changes

- Align left/right arrow style with other arrows

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.1.1

## 1.1.26

> 2021-12-10

### Patch Changes

- feat: support shortcut for left/right arrows

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.1.0

## 1.1.25

> 2021-12-09

### Patch Changes

- Fix an issue that causes the content below a list item is being deleted when deleting this list item by pressing Enter.

- Updated dependencies []:
  - @remirror/extension-list@1.2.8

## 1.1.24

> 2021-11-23

### Patch Changes

- Restore image dimensions correctly from the markup.

- Updated dependencies []:
  - @remirror/extension-image@1.0.20

## 1.1.23

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/extension-code-block@1.0.15
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2
  - @remirror/extension-bidi@1.0.12
  - @remirror/extension-blockquote@1.0.13
  - @remirror/extension-bold@1.0.12
  - @remirror/extension-code@1.0.13
  - @remirror/extension-drop-cursor@1.0.12
  - @remirror/extension-embed@1.1.16
  - @remirror/extension-gap-cursor@1.0.12
  - @remirror/extension-hard-break@1.0.12
  - @remirror/extension-heading@1.0.12
  - @remirror/extension-horizontal-rule@1.0.12
  - @remirror/extension-image@1.0.19
  - @remirror/extension-italic@1.0.12
  - @remirror/extension-link@1.1.9
  - @remirror/extension-list@1.2.7
  - @remirror/extension-search@1.0.12
  - @remirror/extension-shortcuts@1.0.6
  - @remirror/extension-strike@1.0.12
  - @remirror/extension-trailing-node@1.0.12
  - @remirror/extension-underline@1.0.12
  - @remirror/preset-core@1.0.14

## 1.1.22

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-bidi@1.0.11
  - @remirror/extension-blockquote@1.0.12
  - @remirror/extension-bold@1.0.11
  - @remirror/extension-code@1.0.12
  - @remirror/extension-code-block@1.0.14
  - @remirror/extension-drop-cursor@1.0.11
  - @remirror/extension-embed@1.1.15
  - @remirror/extension-gap-cursor@1.0.11
  - @remirror/extension-hard-break@1.0.11
  - @remirror/extension-heading@1.0.11
  - @remirror/extension-horizontal-rule@1.0.11
  - @remirror/extension-image@1.0.18
  - @remirror/extension-italic@1.0.11
  - @remirror/extension-link@1.1.8
  - @remirror/extension-list@1.2.6
  - @remirror/extension-search@1.0.11
  - @remirror/extension-shortcuts@1.0.5
  - @remirror/extension-strike@1.0.11
  - @remirror/extension-trailing-node@1.0.11
  - @remirror/extension-underline@1.0.11
  - @remirror/preset-core@1.0.13
  - @remirror/pm@1.0.7

## 1.1.21

> 2021-11-18

### Patch Changes

- fix: remove rules depending on capture groups

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.4

## 1.1.20

> 2021-11-16

### Patch Changes

- Make extension-shortcuts package public

- Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.3

## 1.1.19

> 2021-11-16

### Patch Changes

- Add support for keyboard shortcuts

* Add keyboard shortcuts

* Updated dependencies []:
  - @remirror/extension-shortcuts@1.0.2

## 1.1.18

> 2021-11-16

### Patch Changes

- Fix an error when indenting the list.

- Updated dependencies []:
  - @remirror/extension-list@1.2.5

## 1.1.17

> 2021-11-11

### Patch Changes

- Add a new option `extractHref` to `ExtensionLink`. Users can use this option to customize the `href` attribute, for example `file://` and `tel:`.

- Updated dependencies []:
  - @remirror/extension-link@1.1.7

## 1.1.16

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0
  - @remirror/extension-bidi@1.0.10
  - @remirror/extension-blockquote@1.0.11
  - @remirror/extension-bold@1.0.10
  - @remirror/extension-code@1.0.11
  - @remirror/extension-code-block@1.0.13
  - @remirror/extension-drop-cursor@1.0.10
  - @remirror/extension-embed@1.1.14
  - @remirror/extension-gap-cursor@1.0.10
  - @remirror/extension-hard-break@1.0.10
  - @remirror/extension-heading@1.0.10
  - @remirror/extension-horizontal-rule@1.0.10
  - @remirror/extension-image@1.0.17
  - @remirror/extension-italic@1.0.10
  - @remirror/extension-link@1.1.6
  - @remirror/extension-list@1.2.4
  - @remirror/extension-search@1.0.10
  - @remirror/extension-strike@1.0.10
  - @remirror/extension-trailing-node@1.0.10
  - @remirror/extension-underline@1.0.10
  - @remirror/preset-core@1.0.12

## 1.1.15

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/extension-bidi@1.0.9
  - @remirror/extension-blockquote@1.0.10
  - @remirror/extension-bold@1.0.9
  - @remirror/extension-code@1.0.10
  - @remirror/extension-code-block@1.0.12
  - @remirror/extension-drop-cursor@1.0.9
  - @remirror/extension-embed@1.1.13
  - @remirror/extension-gap-cursor@1.0.9
  - @remirror/extension-hard-break@1.0.9
  - @remirror/extension-heading@1.0.9
  - @remirror/extension-horizontal-rule@1.0.9
  - @remirror/extension-image@1.0.16
  - @remirror/extension-italic@1.0.9
  - @remirror/extension-link@1.1.5
  - @remirror/extension-list@1.2.3
  - @remirror/extension-search@1.0.9
  - @remirror/extension-strike@1.0.9
  - @remirror/extension-trailing-node@1.0.9
  - @remirror/extension-underline@1.0.9
  - @remirror/pm@1.0.6
  - @remirror/preset-core@1.0.11

## 1.1.14

> 2021-11-04

### Patch Changes

- Fix an issue where the resizable view is too tall on a small viewpoint.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.12
  - @remirror/extension-image@1.0.15

## 1.1.13

> 2021-10-24

### Patch Changes

- Fix a bug that causes initial size CSS in resizable view not be set.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.11
  - @remirror/extension-image@1.0.14

## 1.1.12

> 2021-10-24

### Patch Changes

- Make sure that the `width` and `height` attribute of `<img>` and `<iframe>` HTML elements is an integer without a unit.

* Update the type of `ImageExtensionAttributes.height` and `ImageExtensionAttributes.width` to `string | number`.

* Updated dependencies []:
  - @remirror/extension-embed@1.1.10
  - @remirror/extension-image@1.0.13

## 1.1.11

> 2021-10-23

### Patch Changes

- Fixed an issue that causes resizable image's height can't be updated during resizing.

* ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

* Updated dependencies []:
  - @remirror/extension-embed@1.1.9
  - @remirror/extension-image@1.0.12
  - @remirror/core@1.2.1
  - @remirror/extension-bidi@1.0.8
  - @remirror/extension-blockquote@1.0.9
  - @remirror/extension-bold@1.0.8
  - @remirror/extension-code@1.0.9
  - @remirror/extension-code-block@1.0.11
  - @remirror/extension-drop-cursor@1.0.8
  - @remirror/extension-gap-cursor@1.0.8
  - @remirror/extension-hard-break@1.0.8
  - @remirror/extension-heading@1.0.8
  - @remirror/extension-horizontal-rule@1.0.8
  - @remirror/extension-italic@1.0.8
  - @remirror/extension-link@1.1.4
  - @remirror/extension-list@1.2.2
  - @remirror/extension-search@1.0.8
  - @remirror/extension-strike@1.0.8
  - @remirror/extension-trailing-node@1.0.8
  - @remirror/extension-underline@1.0.8
  - @remirror/preset-core@1.0.10
  - @remirror/pm@1.0.4

## 1.1.10

> 2021-10-20

### Patch Changes

- Exposes a function `hasUploadingFile` to determine if file uploads are currently taking place.

  When a user drops a file, a file node is created without a href attribute - this attribute is set once the file has uploaded.

  However if a user saves content, before uploads are complete we can be left with "broken" file nodes. This exposed function allows us to check if file uploads are still in progress.

  Addtionally file nodes now render valid DOM attributes. Rather than `href` and `error`, they now render `data-url` and `data-error`.

* **BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured to enable persistent selection. You can set it as `'selection'` to match the default styles provided by `@remirror/styles`.

  If you are using `@remirror/react`, you can enable it like this:

  ```tsx
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

  function Editor(): JSX.Element {
    const { manager } = useRemirror({ builtin: { persistentSelectionClass: 'selection' } });
    return (
      <ThemeProvider>
        <Remirror manager={manager} />
      </ThemeProvider>
    );
  }
  ```

  In the interest of performance, the persistent selection will only be displayed if the editor loses focus.

* Updated dependencies []:
  - @remirror/core@1.2.0
  - @remirror/extension-bidi@1.0.7
  - @remirror/extension-blockquote@1.0.8
  - @remirror/extension-bold@1.0.7
  - @remirror/extension-code@1.0.8
  - @remirror/extension-code-block@1.0.10
  - @remirror/extension-drop-cursor@1.0.7
  - @remirror/extension-embed@1.1.8
  - @remirror/extension-gap-cursor@1.0.7
  - @remirror/extension-hard-break@1.0.7
  - @remirror/extension-heading@1.0.7
  - @remirror/extension-horizontal-rule@1.0.7
  - @remirror/extension-image@1.0.11
  - @remirror/extension-italic@1.0.7
  - @remirror/extension-link@1.1.3
  - @remirror/extension-list@1.2.1
  - @remirror/extension-search@1.0.7
  - @remirror/extension-strike@1.0.7
  - @remirror/extension-trailing-node@1.0.7
  - @remirror/extension-underline@1.0.7
  - @remirror/preset-core@1.0.9

## 1.1.9

> 2021-10-14

### Patch Changes

- Disable spellcheck in code and codeBlock.

- Updated dependencies []:
  - @remirror/extension-code@1.0.7
  - @remirror/extension-code-block@1.0.9

## 1.1.8

> 2021-10-11

### Patch Changes

- Improved the behavior of increasing indentation in a list. Now unselected sub lists won't increase indentation when the user indent the parent list item.

  Exported a new helper function `indentList`.

  Deprecated `sharedSinkListItem`.

* Improved the behavior of decreasing indentation in a list. A list item won't be able to lift out of list anymore when the user dedent it. Indenting across different types of lists is more consistent.

  Exported a new helper function `dedentList`.

  Deprecated `sharedLiftListItem`.

- Improve backspace behavior between two lists.

- Updated dependencies []:
  - @remirror/extension-list@1.2.0

## 1.1.7

> 2021-10-08

### Patch Changes

- Fix a bug that causes incorrect indent when changing list type.

- Updated dependencies []:
  - @remirror/extension-list@1.1.1

## 1.1.6

> 2021-10-06

### Patch Changes

- Automagically join two lists with the same node type when there are siblings.

* Allow input rules to convert task list to bullet list or ordered list.

- Merge a patch from the upstream prosemirror-schema-list: https://github.com/ProseMirror/prosemirror-schema-list/commit/38867345f6d97d6793655ed77c16f1a7b18f6846

  Make sure liftListItem doesn't crash when multiple items can't be merged.

  Fix a crash in `liftListItem` that happens when list items that can't be merged are lifted together.

- Updated dependencies []:
  - @remirror/extension-list@1.1.0

## 1.1.5

> 2021-10-04

### Patch Changes

- Don't let the browser handle the Tab key in a list.

- Updated dependencies []:
  - @remirror/extension-list@1.0.15

## 1.1.4

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/extension-bidi@1.0.6
  - @remirror/extension-blockquote@1.0.7
  - @remirror/extension-bold@1.0.6
  - @remirror/extension-code@1.0.6
  - @remirror/extension-code-block@1.0.8
  - @remirror/extension-drop-cursor@1.0.6
  - @remirror/extension-embed@1.1.7
  - @remirror/extension-gap-cursor@1.0.6
  - @remirror/extension-hard-break@1.0.6
  - @remirror/extension-heading@1.0.6
  - @remirror/extension-horizontal-rule@1.0.6
  - @remirror/extension-image@1.0.10
  - @remirror/extension-italic@1.0.6
  - @remirror/extension-link@1.1.2
  - @remirror/extension-list@1.0.14
  - @remirror/extension-search@1.0.6
  - @remirror/extension-strike@1.0.6
  - @remirror/extension-trailing-node@1.0.6
  - @remirror/extension-underline@1.0.6
  - @remirror/preset-core@1.0.8
  - @remirror/pm@1.0.3

## 1.1.3

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

* Improve the performance of large task lists and collapsible bullet lists.

* Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-bidi@1.0.5
  - @remirror/extension-blockquote@1.0.6
  - @remirror/extension-bold@1.0.5
  - @remirror/extension-code@1.0.5
  - @remirror/extension-code-block@1.0.7
  - @remirror/extension-drop-cursor@1.0.5
  - @remirror/extension-embed@1.1.6
  - @remirror/extension-gap-cursor@1.0.5
  - @remirror/extension-hard-break@1.0.5
  - @remirror/extension-heading@1.0.5
  - @remirror/extension-horizontal-rule@1.0.5
  - @remirror/extension-image@1.0.9
  - @remirror/extension-italic@1.0.5
  - @remirror/extension-link@1.1.1
  - @remirror/extension-list@1.0.13
  - @remirror/extension-search@1.0.5
  - @remirror/extension-strike@1.0.5
  - @remirror/extension-trailing-node@1.0.5
  - @remirror/extension-underline@1.0.5
  - @remirror/preset-core@1.0.7

## 1.1.2

> 2021-09-15

### Patch Changes

- Fix a RangeError when calling list commands.

- Updated dependencies []:
  - @remirror/extension-list@1.0.12

## 1.1.1

> 2021-09-13

### Patch Changes

- feat: detect emails as links

* Add a white border to the handle to make it more recognizable.

* Updated dependencies []:
  - @remirror/extension-link@1.1.0
  - @remirror/extension-embed@1.1.5
  - @remirror/extension-image@1.0.8

## 1.1.0

> 2021-09-07

### Minor Changes

- Remove react dependency from wysiwyg-preset: An earlier commit upgraded the tables from simple to fancy tables. As a side effect, this had introduced a dependency from wysiwyg to the react-part of remirror. This change removes this dependency again.

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-bidi@1.0.4
  - @remirror/extension-blockquote@1.0.5
  - @remirror/extension-bold@1.0.4
  - @remirror/extension-code@1.0.4
  - @remirror/extension-code-block@1.0.6
  - @remirror/extension-drop-cursor@1.0.4
  - @remirror/extension-embed@1.1.4
  - @remirror/extension-gap-cursor@1.0.4
  - @remirror/extension-hard-break@1.0.4
  - @remirror/extension-heading@1.0.4
  - @remirror/extension-horizontal-rule@1.0.4
  - @remirror/extension-image@1.0.7
  - @remirror/extension-italic@1.0.4
  - @remirror/extension-link@1.0.4
  - @remirror/extension-list@1.0.11
  - @remirror/extension-search@1.0.4
  - @remirror/extension-strike@1.0.4
  - @remirror/extension-trailing-node@1.0.4
  - @remirror/extension-underline@1.0.4
  - @remirror/preset-core@1.0.6

## 1.0.13

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

- Updated dependencies []:
  - @remirror/extension-embed@1.1.3
  - @remirror/extension-image@1.0.6

## 1.0.12

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.8

## 1.0.11

> 2021-09-01

### Patch Changes

- Fix an issue that causes clicking a nested checkbox won't toggle its checked state.

- Updated dependencies []:
  - @remirror/extension-list@1.0.10

## 1.0.10

> 2021-09-01

### Patch Changes

- fix: task list wasn't available in wysiwyg editors

* Don't create a node selection within the `toggleCheckboxChecked` command.

* Updated dependencies []:
  - @remirror/extension-list@1.0.9

## 1.0.9

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/extension-blockquote@1.0.4
  - @remirror/extension-code-block@1.0.5
  - @remirror/extension-image@1.0.5
  - @remirror/extension-list@1.0.8
  - @remirror/extension-tables@1.0.4
  - @remirror/preset-core@1.0.5

## 1.0.8

> 2021-08-30

### Patch Changes

- Don't require a `NodeSelection` to fire `toggleCheckboxChecked` anymore.

- Updated dependencies []:
  - @remirror/extension-list@1.0.7

## 1.0.7

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Improve commands `toggleBulletList`, `toggleOrderedList` and `toggleTaskList`. Now you can toggle list between bullet list, ordered list and task list.

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/extension-blockquote@1.0.3
  - @remirror/extension-code-block@1.0.4
  - @remirror/extension-image@1.0.4
  - @remirror/extension-list@1.0.6
  - @remirror/extension-tables@1.0.3
  - @remirror/preset-core@1.0.4
  - @remirror/core@1.1.0
  - @remirror/extension-bidi@1.0.3
  - @remirror/extension-bold@1.0.3
  - @remirror/extension-code@1.0.3
  - @remirror/extension-drop-cursor@1.0.3
  - @remirror/extension-embed@1.1.2
  - @remirror/extension-gap-cursor@1.0.3
  - @remirror/extension-hard-break@1.0.3
  - @remirror/extension-heading@1.0.3
  - @remirror/extension-horizontal-rule@1.0.3
  - @remirror/extension-italic@1.0.3
  - @remirror/extension-link@1.0.3
  - @remirror/extension-search@1.0.3
  - @remirror/extension-strike@1.0.3
  - @remirror/extension-trailing-node@1.0.3
  - @remirror/extension-underline@1.0.3

## 1.0.6

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/preset-core@1.0.3

## 1.0.5

> 2021-08-25

### Patch Changes

- Fixes a bug that causes the editor to insert an empty task list when deleting all content in the editor. Closes #1163.

- Updated dependencies []:
  - @remirror/extension-list@1.0.5

## 1.0.4

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/extension-bidi@1.0.2
  - @remirror/extension-blockquote@1.0.2
  - @remirror/extension-bold@1.0.2
  - @remirror/extension-code@1.0.2
  - @remirror/extension-code-block@1.0.3
  - @remirror/extension-drop-cursor@1.0.2
  - @remirror/extension-embed@1.1.1
  - @remirror/extension-gap-cursor@1.0.2
  - @remirror/extension-hard-break@1.0.2
  - @remirror/extension-heading@1.0.2
  - @remirror/extension-horizontal-rule@1.0.2
  - @remirror/extension-image@1.0.3
  - @remirror/extension-italic@1.0.2
  - @remirror/extension-link@1.0.2
  - @remirror/extension-list@1.0.4
  - @remirror/extension-search@1.0.2
  - @remirror/extension-strike@1.0.2
  - @remirror/extension-tables@1.0.2
  - @remirror/extension-trailing-node@1.0.2
  - @remirror/extension-underline@1.0.2
  - @remirror/preset-core@1.0.2

## 1.0.3

> 2021-08-13

### Patch Changes

- [#1057](https://github.com/remirror/remirror/pull/1057) [`662edfdaa`](https://github.com/remirror/remirror/commit/662edfdaa6ab7954edd4946b6f06da6d36288042) Thanks [@ocavue](https://github.com/ocavue)! - Update dependency `@remirror/extension-code-block`.

- Updated dependencies [[`b288d665f`](https://github.com/remirror/remirror/commit/b288d665fe1f3b8f0a9a635ca3f29e49e22ac4b3)]:
  - @remirror/extension-code-block@1.0.2

## 1.0.2

> 2021-07-26

### Patch Changes

- [#1029](https://github.com/remirror/remirror/pull/1029) [`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2) Thanks [@ocavue](https://github.com/ocavue)! - Update remirror dependencies.

- Updated dependencies [[`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2)]:
  - @remirror/core@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/extension-bidi@1.0.1
  - @remirror/extension-blockquote@1.0.1
  - @remirror/extension-bold@1.0.1
  - @remirror/extension-code@1.0.1
  - @remirror/extension-code-block@1.0.1
  - @remirror/extension-drop-cursor@1.0.1
  - @remirror/extension-embed@1.0.1
  - @remirror/extension-gap-cursor@1.0.1
  - @remirror/extension-hard-break@1.0.1
  - @remirror/extension-heading@1.0.1
  - @remirror/extension-horizontal-rule@1.0.1
  - @remirror/extension-image@1.0.1
  - @remirror/extension-italic@1.0.1
  - @remirror/extension-link@1.0.1
  - @remirror/extension-list@1.0.1
  - @remirror/extension-search@1.0.1
  - @remirror/extension-strike@1.0.1
  - @remirror/extension-tables@1.0.1
  - @remirror/extension-trailing-node@1.0.1
  - @remirror/extension-underline@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/preset-core@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`979c4cb6b`](https://github.com/remirror/remirror/commit/979c4cb6bd1fa301a1716915514b27542f972c9f), [`e0f1bec4a`](https://github.com/remirror/remirror/commit/e0f1bec4a1e8073ce8f5500d62193e52321155b9), [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`123a20ae8`](https://github.com/remirror/remirror/commit/123a20ae8067d97d46373d079728f942e1daed0c), [`221316411`](https://github.com/remirror/remirror/commit/2213164114480feaa22638bd6dae1a8acafacb8f), [`6de1e675c`](https://github.com/remirror/remirror/commit/6de1e675c9f502197a31a1e0e21ba0bd91919fe2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`862a0c8ec`](https://github.com/remirror/remirror/commit/862a0c8ec4e90c2108abe8c2f50cdcb562ffa713), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`e7a1d7c1d`](https://github.com/remirror/remirror/commit/e7a1d7c1db1b42ce5cffc4a821669b734c73eae2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`f9780e645`](https://github.com/remirror/remirror/commit/f9780e645f4b6ddd80d07d11ed70741a54e7af31), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`28b81a858`](https://github.com/remirror/remirror/commit/28b81a8580670c4ebc06ad04db088a4b684237bf), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a)]:
  - @remirror/core@1.0.0
  - @remirror/extension-link@1.0.0
  - @remirror/extension-image@1.0.0
  - @remirror/extension-tables@1.0.0
  - @remirror/extension-list@1.0.0
  - @remirror/extension-bidi@1.0.0
  - @remirror/extension-blockquote@1.0.0
  - @remirror/extension-bold@1.0.0
  - @remirror/extension-code@1.0.0
  - @remirror/extension-code-block@1.0.0
  - @remirror/extension-drop-cursor@1.0.0
  - @remirror/extension-embed@1.0.0
  - @remirror/extension-gap-cursor@1.0.0
  - @remirror/extension-hard-break@1.0.0
  - @remirror/extension-heading@1.0.0
  - @remirror/extension-horizontal-rule@1.0.0
  - @remirror/extension-italic@1.0.0
  - @remirror/extension-search@1.0.0
  - @remirror/extension-strike@1.0.0
  - @remirror/extension-trailing-node@1.0.0
  - @remirror/extension-underline@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`302bdf7e`](https://github.com/remirror/remirror/commit/302bdf7e92c5df562d0402b83da9d7b7240aa2f6)]:
  - @remirror/extension-image@1.0.0-next.60
  - @remirror/core@1.0.0-next.60
  - @remirror/extension-bidi@1.0.0-next.60
  - @remirror/extension-blockquote@1.0.0-next.60
  - @remirror/extension-bold@1.0.0-next.60
  - @remirror/extension-code@1.0.0-next.60
  - @remirror/extension-code-block@1.0.0-next.60
  - @remirror/extension-drop-cursor@1.0.0-next.60
  - @remirror/extension-epic-mode@1.0.0-next.60
  - @remirror/extension-gap-cursor@1.0.0-next.60
  - @remirror/extension-hard-break@1.0.0-next.60
  - @remirror/extension-heading@1.0.0-next.60
  - @remirror/extension-horizontal-rule@1.0.0-next.60
  - @remirror/extension-italic@1.0.0-next.60
  - @remirror/extension-link@1.0.0-next.60
  - @remirror/extension-search@1.0.0-next.60
  - @remirror/extension-strike@1.0.0-next.60
  - @remirror/extension-trailing-node@1.0.0-next.60
  - @remirror/extension-underline@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/preset-core@1.0.0-next.60
  - @remirror/preset-embed@1.0.0-next.60
  - @remirror/preset-list@1.0.0-next.60
  - @remirror/preset-table@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.59
  - @remirror/extension-bidi@1.0.0-next.59
  - @remirror/extension-blockquote@1.0.0-next.59
  - @remirror/extension-bold@1.0.0-next.59
  - @remirror/extension-code@1.0.0-next.59
  - @remirror/extension-code-block@1.0.0-next.59
  - @remirror/extension-drop-cursor@1.0.0-next.59
  - @remirror/extension-epic-mode@1.0.0-next.59
  - @remirror/extension-gap-cursor@1.0.0-next.59
  - @remirror/extension-hard-break@1.0.0-next.59
  - @remirror/extension-heading@1.0.0-next.59
  - @remirror/extension-horizontal-rule@1.0.0-next.59
  - @remirror/extension-image@1.0.0-next.59
  - @remirror/extension-italic@1.0.0-next.59
  - @remirror/extension-link@1.0.0-next.59
  - @remirror/extension-search@1.0.0-next.59
  - @remirror/extension-strike@1.0.0-next.59
  - @remirror/extension-trailing-node@1.0.0-next.59
  - @remirror/extension-underline@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/preset-core@1.0.0-next.59
  - @remirror/preset-embed@1.0.0-next.59
  - @remirror/preset-list@1.0.0-next.59
  - @remirror/preset-table@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/extension-bidi@1.0.0-next.58
  - @remirror/extension-blockquote@1.0.0-next.58
  - @remirror/extension-bold@1.0.0-next.58
  - @remirror/extension-code@1.0.0-next.58
  - @remirror/extension-code-block@1.0.0-next.58
  - @remirror/extension-drop-cursor@1.0.0-next.58
  - @remirror/extension-epic-mode@1.0.0-next.58
  - @remirror/extension-gap-cursor@1.0.0-next.58
  - @remirror/extension-hard-break@1.0.0-next.58
  - @remirror/extension-heading@1.0.0-next.58
  - @remirror/extension-horizontal-rule@1.0.0-next.58
  - @remirror/extension-image@1.0.0-next.58
  - @remirror/extension-italic@1.0.0-next.58
  - @remirror/extension-link@1.0.0-next.58
  - @remirror/extension-search@1.0.0-next.58
  - @remirror/extension-strike@1.0.0-next.58
  - @remirror/extension-trailing-node@1.0.0-next.58
  - @remirror/extension-underline@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/preset-core@1.0.0-next.58
  - @remirror/preset-embed@1.0.0-next.58
  - @remirror/preset-list@1.0.0-next.58
  - @remirror/preset-table@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4ae3c9b2`](https://github.com/remirror/remirror/commit/4ae3c9b2a1f2073aa243d093a2da4b110e7d246e)]:
  - @remirror/extension-link@1.0.0-next.57
  - @remirror/core@1.0.0-next.57
  - @remirror/extension-bidi@1.0.0-next.57
  - @remirror/extension-blockquote@1.0.0-next.57
  - @remirror/extension-bold@1.0.0-next.57
  - @remirror/extension-code@1.0.0-next.57
  - @remirror/extension-code-block@1.0.0-next.57
  - @remirror/extension-drop-cursor@1.0.0-next.57
  - @remirror/extension-epic-mode@1.0.0-next.57
  - @remirror/extension-gap-cursor@1.0.0-next.57
  - @remirror/extension-hard-break@1.0.0-next.57
  - @remirror/extension-heading@1.0.0-next.57
  - @remirror/extension-horizontal-rule@1.0.0-next.57
  - @remirror/extension-image@1.0.0-next.57
  - @remirror/extension-italic@1.0.0-next.57
  - @remirror/extension-search@1.0.0-next.57
  - @remirror/extension-strike@1.0.0-next.57
  - @remirror/extension-trailing-node@1.0.0-next.57
  - @remirror/extension-underline@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/preset-core@1.0.0-next.57
  - @remirror/preset-embed@1.0.0-next.57
  - @remirror/preset-list@1.0.0-next.57
  - @remirror/preset-table@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.56
  - @remirror/extension-bidi@1.0.0-next.56
  - @remirror/extension-blockquote@1.0.0-next.56
  - @remirror/extension-bold@1.0.0-next.56
  - @remirror/extension-code@1.0.0-next.56
  - @remirror/extension-code-block@1.0.0-next.56
  - @remirror/extension-drop-cursor@1.0.0-next.56
  - @remirror/extension-epic-mode@1.0.0-next.56
  - @remirror/extension-gap-cursor@1.0.0-next.56
  - @remirror/extension-hard-break@1.0.0-next.56
  - @remirror/extension-heading@1.0.0-next.56
  - @remirror/extension-horizontal-rule@1.0.0-next.56
  - @remirror/extension-image@1.0.0-next.56
  - @remirror/extension-italic@1.0.0-next.56
  - @remirror/extension-link@1.0.0-next.56
  - @remirror/extension-search@1.0.0-next.56
  - @remirror/extension-strike@1.0.0-next.56
  - @remirror/extension-trailing-node@1.0.0-next.56
  - @remirror/extension-underline@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/preset-core@1.0.0-next.56
  - @remirror/preset-embed@1.0.0-next.56
  - @remirror/preset-list@1.0.0-next.56
  - @remirror/preset-table@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b65ea785`](https://github.com/remirror/remirror/commit/b65ea785c96b52cc54be205be66918de104d28bc), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/extension-link@1.0.0-next.55
  - @remirror/core@1.0.0-next.55
  - @remirror/extension-bidi@1.0.0-next.55
  - @remirror/extension-blockquote@1.0.0-next.55
  - @remirror/extension-bold@1.0.0-next.55
  - @remirror/extension-code@1.0.0-next.55
  - @remirror/extension-code-block@1.0.0-next.55
  - @remirror/extension-drop-cursor@1.0.0-next.55
  - @remirror/extension-epic-mode@1.0.0-next.55
  - @remirror/extension-gap-cursor@1.0.0-next.55
  - @remirror/extension-hard-break@1.0.0-next.55
  - @remirror/extension-heading@1.0.0-next.55
  - @remirror/extension-horizontal-rule@1.0.0-next.55
  - @remirror/extension-image@1.0.0-next.55
  - @remirror/extension-italic@1.0.0-next.55
  - @remirror/extension-search@1.0.0-next.55
  - @remirror/extension-strike@1.0.0-next.55
  - @remirror/extension-trailing-node@1.0.0-next.55
  - @remirror/extension-underline@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/preset-core@1.0.0-next.55
  - @remirror/preset-embed@1.0.0-next.55
  - @remirror/preset-list@1.0.0-next.55
  - @remirror/preset-table@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764), [`8a6d5c34`](https://github.com/remirror/remirror/commit/8a6d5c34778a5ac877876bd24d1a252851fb4882)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/extension-bidi@1.0.0-next.54
  - @remirror/extension-blockquote@1.0.0-next.54
  - @remirror/extension-bold@1.0.0-next.54
  - @remirror/extension-code@1.0.0-next.54
  - @remirror/extension-code-block@1.0.0-next.54
  - @remirror/extension-drop-cursor@1.0.0-next.54
  - @remirror/extension-epic-mode@1.0.0-next.54
  - @remirror/extension-gap-cursor@1.0.0-next.54
  - @remirror/extension-hard-break@1.0.0-next.54
  - @remirror/extension-heading@1.0.0-next.54
  - @remirror/extension-horizontal-rule@1.0.0-next.54
  - @remirror/extension-image@1.0.0-next.54
  - @remirror/extension-italic@1.0.0-next.54
  - @remirror/extension-search@1.0.0-next.54
  - @remirror/extension-strike@1.0.0-next.54
  - @remirror/extension-trailing-node@1.0.0-next.54
  - @remirror/extension-underline@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/preset-core@1.0.0-next.54
  - @remirror/preset-embed@1.0.0-next.54
  - @remirror/preset-list@1.0.0-next.54
  - @remirror/preset-table@1.0.0-next.54
  - @remirror/extension-link@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/extension-image@1.0.0-next.53
  - @remirror/extension-link@1.0.0-next.53
  - @remirror/preset-embed@1.0.0-next.53
  - @remirror/extension-bidi@1.0.0-next.53
  - @remirror/extension-blockquote@1.0.0-next.53
  - @remirror/extension-bold@1.0.0-next.53
  - @remirror/extension-code@1.0.0-next.53
  - @remirror/extension-code-block@1.0.0-next.53
  - @remirror/extension-drop-cursor@1.0.0-next.53
  - @remirror/extension-epic-mode@1.0.0-next.53
  - @remirror/extension-gap-cursor@1.0.0-next.53
  - @remirror/extension-hard-break@1.0.0-next.53
  - @remirror/extension-heading@1.0.0-next.53
  - @remirror/extension-horizontal-rule@1.0.0-next.53
  - @remirror/extension-italic@1.0.0-next.53
  - @remirror/extension-search@1.0.0-next.53
  - @remirror/extension-strike@1.0.0-next.53
  - @remirror/extension-trailing-node@1.0.0-next.53
  - @remirror/extension-underline@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/preset-core@1.0.0-next.53
  - @remirror/preset-list@1.0.0-next.53
  - @remirror/preset-table@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3da2b5fd`](https://github.com/remirror/remirror/commit/3da2b5fd41e088c1d24969b53853a2b6f003455c), [`caf2588d`](https://github.com/remirror/remirror/commit/caf2588d52e939cf939773837938d54f54f999a6)]:
  - @remirror/preset-embed@1.0.0-next.52
  - @remirror/extension-link@1.0.0-next.52
  - @remirror/core@1.0.0-next.52
  - @remirror/extension-bidi@1.0.0-next.52
  - @remirror/extension-blockquote@1.0.0-next.52
  - @remirror/extension-bold@1.0.0-next.52
  - @remirror/extension-code@1.0.0-next.52
  - @remirror/extension-code-block@1.0.0-next.52
  - @remirror/extension-drop-cursor@1.0.0-next.52
  - @remirror/extension-epic-mode@1.0.0-next.52
  - @remirror/extension-gap-cursor@1.0.0-next.52
  - @remirror/extension-hard-break@1.0.0-next.52
  - @remirror/extension-heading@1.0.0-next.52
  - @remirror/extension-horizontal-rule@1.0.0-next.52
  - @remirror/extension-image@1.0.0-next.52
  - @remirror/extension-italic@1.0.0-next.52
  - @remirror/extension-search@1.0.0-next.52
  - @remirror/extension-strike@1.0.0-next.52
  - @remirror/extension-trailing-node@1.0.0-next.52
  - @remirror/extension-underline@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/preset-core@1.0.0-next.52
  - @remirror/preset-list@1.0.0-next.52
  - @remirror/preset-table@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b79e4142`](https://github.com/remirror/remirror/commit/b79e414219ffc4f8435b7b934bf503c2c3b128f5), [`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/extension-link@1.0.0-next.51
  - @remirror/core@1.0.0-next.51
  - @remirror/extension-bidi@1.0.0-next.51
  - @remirror/extension-blockquote@1.0.0-next.51
  - @remirror/extension-bold@1.0.0-next.51
  - @remirror/extension-code@1.0.0-next.51
  - @remirror/extension-code-block@1.0.0-next.51
  - @remirror/extension-drop-cursor@1.0.0-next.51
  - @remirror/extension-epic-mode@1.0.0-next.51
  - @remirror/extension-gap-cursor@1.0.0-next.51
  - @remirror/extension-hard-break@1.0.0-next.51
  - @remirror/extension-heading@1.0.0-next.51
  - @remirror/extension-horizontal-rule@1.0.0-next.51
  - @remirror/extension-image@1.0.0-next.51
  - @remirror/extension-italic@1.0.0-next.51
  - @remirror/extension-search@1.0.0-next.51
  - @remirror/extension-strike@1.0.0-next.51
  - @remirror/extension-trailing-node@1.0.0-next.51
  - @remirror/extension-underline@1.0.0-next.51
  - @remirror/preset-core@1.0.0-next.51
  - @remirror/preset-embed@1.0.0-next.51
  - @remirror/preset-list@1.0.0-next.51
  - @remirror/preset-table@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Minor Changes

- [`359486f6`](https://github.com/remirror/remirror/commit/359486f6a7383588de16e6bd34c94545d3350f90) [#754](https://github.com/remirror/remirror/pull/754) Thanks [@whawker](https://github.com/whawker)! - Add an `onUpdatedLink` event handler to the link extension for determining when a link has been added to the document.

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`359486f6`](https://github.com/remirror/remirror/commit/359486f6a7383588de16e6bd34c94545d3350f90), [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/extension-link@1.0.0-next.50
  - @remirror/core@1.0.0-next.50
  - @remirror/extension-bidi@1.0.0-next.50
  - @remirror/extension-blockquote@1.0.0-next.50
  - @remirror/extension-bold@1.0.0-next.50
  - @remirror/extension-code@1.0.0-next.50
  - @remirror/extension-code-block@1.0.0-next.50
  - @remirror/extension-drop-cursor@1.0.0-next.50
  - @remirror/extension-epic-mode@1.0.0-next.50
  - @remirror/extension-gap-cursor@1.0.0-next.50
  - @remirror/extension-hard-break@1.0.0-next.50
  - @remirror/extension-heading@1.0.0-next.50
  - @remirror/extension-horizontal-rule@1.0.0-next.50
  - @remirror/extension-image@1.0.0-next.50
  - @remirror/extension-italic@1.0.0-next.50
  - @remirror/extension-search@1.0.0-next.50
  - @remirror/extension-strike@1.0.0-next.50
  - @remirror/extension-trailing-node@1.0.0-next.50
  - @remirror/extension-underline@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/preset-core@1.0.0-next.50
  - @remirror/preset-embed@1.0.0-next.50
  - @remirror/preset-list@1.0.0-next.50
  - @remirror/preset-table@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.49
  - @remirror/extension-bidi@1.0.0-next.49
  - @remirror/extension-blockquote@1.0.0-next.49
  - @remirror/extension-bold@1.0.0-next.49
  - @remirror/extension-code@1.0.0-next.49
  - @remirror/extension-code-block@1.0.0-next.49
  - @remirror/extension-drop-cursor@1.0.0-next.49
  - @remirror/extension-epic-mode@1.0.0-next.49
  - @remirror/extension-gap-cursor@1.0.0-next.49
  - @remirror/extension-hard-break@1.0.0-next.49
  - @remirror/extension-heading@1.0.0-next.49
  - @remirror/extension-horizontal-rule@1.0.0-next.49
  - @remirror/extension-image@1.0.0-next.49
  - @remirror/extension-italic@1.0.0-next.49
  - @remirror/extension-link@1.0.0-next.49
  - @remirror/extension-search@1.0.0-next.49
  - @remirror/extension-strike@1.0.0-next.49
  - @remirror/extension-trailing-node@1.0.0-next.49
  - @remirror/extension-underline@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/preset-core@1.0.0-next.49
  - @remirror/preset-embed@1.0.0-next.49
  - @remirror/preset-list@1.0.0-next.49
  - @remirror/preset-table@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/extension-bidi@1.0.0-next.48
  - @remirror/extension-blockquote@1.0.0-next.48
  - @remirror/extension-bold@1.0.0-next.48
  - @remirror/extension-code@1.0.0-next.48
  - @remirror/extension-code-block@1.0.0-next.48
  - @remirror/extension-drop-cursor@1.0.0-next.48
  - @remirror/extension-epic-mode@1.0.0-next.48
  - @remirror/extension-gap-cursor@1.0.0-next.48
  - @remirror/extension-hard-break@1.0.0-next.48
  - @remirror/extension-heading@1.0.0-next.48
  - @remirror/extension-horizontal-rule@1.0.0-next.48
  - @remirror/extension-image@1.0.0-next.48
  - @remirror/extension-italic@1.0.0-next.48
  - @remirror/extension-link@1.0.0-next.48
  - @remirror/extension-search@1.0.0-next.48
  - @remirror/extension-strike@1.0.0-next.48
  - @remirror/extension-trailing-node@1.0.0-next.48
  - @remirror/extension-underline@1.0.0-next.48
  - @remirror/preset-core@1.0.0-next.48
  - @remirror/preset-embed@1.0.0-next.48
  - @remirror/preset-list@1.0.0-next.48
  - @remirror/preset-table@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/extension-code-block@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - @remirror/extension-bidi@1.0.0-next.47
  - @remirror/extension-blockquote@1.0.0-next.47
  - @remirror/extension-bold@1.0.0-next.47
  - @remirror/extension-code@1.0.0-next.47
  - @remirror/extension-drop-cursor@1.0.0-next.47
  - @remirror/extension-epic-mode@1.0.0-next.47
  - @remirror/extension-gap-cursor@1.0.0-next.47
  - @remirror/extension-hard-break@1.0.0-next.47
  - @remirror/extension-heading@1.0.0-next.47
  - @remirror/extension-horizontal-rule@1.0.0-next.47
  - @remirror/extension-image@1.0.0-next.47
  - @remirror/extension-italic@1.0.0-next.47
  - @remirror/extension-link@1.0.0-next.47
  - @remirror/extension-search@1.0.0-next.47
  - @remirror/extension-strike@1.0.0-next.47
  - @remirror/extension-trailing-node@1.0.0-next.47
  - @remirror/extension-underline@1.0.0-next.47
  - @remirror/preset-core@1.0.0-next.47
  - @remirror/preset-embed@1.0.0-next.47
  - @remirror/preset-list@1.0.0-next.47
  - @remirror/preset-table@1.0.0-next.47

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/extension-bidi@1.0.0-next.45
  - @remirror/extension-blockquote@1.0.0-next.45
  - @remirror/extension-bold@1.0.0-next.45
  - @remirror/extension-code@1.0.0-next.45
  - @remirror/extension-code-block@1.0.0-next.45
  - @remirror/extension-drop-cursor@1.0.0-next.45
  - @remirror/extension-epic-mode@1.0.0-next.45
  - @remirror/extension-gap-cursor@1.0.0-next.45
  - @remirror/extension-hard-break@1.0.0-next.45
  - @remirror/extension-heading@1.0.0-next.45
  - @remirror/extension-horizontal-rule@1.0.0-next.45
  - @remirror/extension-image@1.0.0-next.45
  - @remirror/extension-italic@1.0.0-next.45
  - @remirror/extension-link@1.0.0-next.45
  - @remirror/extension-search@1.0.0-next.45
  - @remirror/extension-strike@1.0.0-next.45
  - @remirror/extension-trailing-node@1.0.0-next.45
  - @remirror/extension-underline@1.0.0-next.45
  - @remirror/preset-core@1.0.0-next.45
  - @remirror/preset-embed@1.0.0-next.45
  - @remirror/preset-list@1.0.0-next.45
  - @remirror/preset-table@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/preset-core@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/extension-bidi@1.0.0-next.44
  - @remirror/extension-blockquote@1.0.0-next.44
  - @remirror/extension-bold@1.0.0-next.44
  - @remirror/extension-code@1.0.0-next.44
  - @remirror/extension-code-block@1.0.0-next.44
  - @remirror/extension-drop-cursor@1.0.0-next.44
  - @remirror/extension-epic-mode@1.0.0-next.44
  - @remirror/extension-gap-cursor@1.0.0-next.44
  - @remirror/extension-hard-break@1.0.0-next.44
  - @remirror/extension-heading@1.0.0-next.44
  - @remirror/extension-horizontal-rule@1.0.0-next.44
  - @remirror/extension-image@1.0.0-next.44
  - @remirror/extension-italic@1.0.0-next.44
  - @remirror/extension-link@1.0.0-next.44
  - @remirror/extension-search@1.0.0-next.44
  - @remirror/extension-strike@1.0.0-next.44
  - @remirror/extension-trailing-node@1.0.0-next.44
  - @remirror/extension-underline@1.0.0-next.44
  - @remirror/preset-embed@1.0.0-next.44
  - @remirror/preset-list@1.0.0-next.44
  - @remirror/preset-table@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies [[`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1)]:
  - @remirror/extension-image@1.0.0-next.43
  - @remirror/extension-code-block@1.0.0-next.43
  - @remirror/core@1.0.0-next.43
  - @remirror/extension-bidi@1.0.0-next.43
  - @remirror/extension-blockquote@1.0.0-next.43
  - @remirror/extension-bold@1.0.0-next.43
  - @remirror/extension-code@1.0.0-next.43
  - @remirror/extension-drop-cursor@1.0.0-next.43
  - @remirror/extension-epic-mode@1.0.0-next.43
  - @remirror/extension-gap-cursor@1.0.0-next.43
  - @remirror/extension-hard-break@1.0.0-next.43
  - @remirror/extension-heading@1.0.0-next.43
  - @remirror/extension-horizontal-rule@1.0.0-next.43
  - @remirror/extension-italic@1.0.0-next.43
  - @remirror/extension-link@1.0.0-next.43
  - @remirror/extension-search@1.0.0-next.43
  - @remirror/extension-strike@1.0.0-next.43
  - @remirror/extension-trailing-node@1.0.0-next.43
  - @remirror/extension-underline@1.0.0-next.43
  - @remirror/preset-core@1.0.0-next.43
  - @remirror/preset-embed@1.0.0-next.43
  - @remirror/preset-list@1.0.0-next.43
  - @remirror/preset-table@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies [[`6f2ababd`](https://github.com/remirror/remirror/commit/6f2ababd44dbfdf4b1f7248457d8d481c33a5d13), [`d33f43bf`](https://github.com/remirror/remirror/commit/d33f43bfcb8d7f578f05434b42c938b4132b544a)]:
  - @remirror/extension-code-block@1.0.0-next.42
  - @remirror/extension-heading@1.0.0-next.42
  - @remirror/extension-search@1.0.0-next.42
  - @remirror/extension-strike@1.0.0-next.42
  - @remirror/preset-embed@1.0.0-next.42
  - @remirror/preset-list@1.0.0-next.42
  - @remirror/core@1.0.0-next.42
  - @remirror/extension-bidi@1.0.0-next.42
  - @remirror/extension-blockquote@1.0.0-next.42
  - @remirror/extension-bold@1.0.0-next.42
  - @remirror/extension-code@1.0.0-next.42
  - @remirror/extension-drop-cursor@1.0.0-next.42
  - @remirror/extension-epic-mode@1.0.0-next.42
  - @remirror/extension-gap-cursor@1.0.0-next.42
  - @remirror/extension-hard-break@1.0.0-next.42
  - @remirror/extension-horizontal-rule@1.0.0-next.42
  - @remirror/extension-image@1.0.0-next.42
  - @remirror/extension-italic@1.0.0-next.42
  - @remirror/extension-link@1.0.0-next.42
  - @remirror/extension-trailing-node@1.0.0-next.42
  - @remirror/extension-underline@1.0.0-next.42
  - @remirror/preset-core@1.0.0-next.42
  - @remirror/preset-table@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/extension-bidi@1.0.0-next.41
  - @remirror/extension-blockquote@1.0.0-next.41
  - @remirror/extension-bold@1.0.0-next.41
  - @remirror/extension-code@1.0.0-next.41
  - @remirror/extension-code-block@1.0.0-next.41
  - @remirror/extension-drop-cursor@1.0.0-next.41
  - @remirror/extension-epic-mode@1.0.0-next.41
  - @remirror/extension-gap-cursor@1.0.0-next.41
  - @remirror/extension-hard-break@1.0.0-next.41
  - @remirror/extension-heading@1.0.0-next.41
  - @remirror/extension-horizontal-rule@1.0.0-next.41
  - @remirror/extension-image@1.0.0-next.41
  - @remirror/extension-italic@1.0.0-next.41
  - @remirror/extension-link@1.0.0-next.41
  - @remirror/extension-search@1.0.0-next.41
  - @remirror/extension-strike@1.0.0-next.41
  - @remirror/extension-trailing-node@1.0.0-next.41
  - @remirror/extension-underline@1.0.0-next.41
  - @remirror/preset-core@1.0.0-next.41
  - @remirror/preset-embed@1.0.0-next.41
  - @remirror/preset-list@1.0.0-next.41
  - @remirror/preset-table@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/extension-bidi@1.0.0-next.40
  - @remirror/extension-blockquote@1.0.0-next.40
  - @remirror/extension-bold@1.0.0-next.40
  - @remirror/extension-code@1.0.0-next.40
  - @remirror/extension-code-block@1.0.0-next.40
  - @remirror/extension-drop-cursor@1.0.0-next.40
  - @remirror/extension-epic-mode@1.0.0-next.40
  - @remirror/extension-gap-cursor@1.0.0-next.40
  - @remirror/extension-hard-break@1.0.0-next.40
  - @remirror/extension-heading@1.0.0-next.40
  - @remirror/extension-horizontal-rule@1.0.0-next.40
  - @remirror/extension-image@1.0.0-next.40
  - @remirror/extension-italic@1.0.0-next.40
  - @remirror/extension-link@1.0.0-next.40
  - @remirror/extension-search@1.0.0-next.40
  - @remirror/extension-strike@1.0.0-next.40
  - @remirror/extension-trailing-node@1.0.0-next.40
  - @remirror/extension-underline@1.0.0-next.40
  - @remirror/preset-core@1.0.0-next.40
  - @remirror/preset-embed@1.0.0-next.40
  - @remirror/preset-list@1.0.0-next.40
  - @remirror/preset-table@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/extension-bidi@1.0.0-next.39
  - @remirror/extension-blockquote@1.0.0-next.39
  - @remirror/extension-bold@1.0.0-next.39
  - @remirror/extension-code@1.0.0-next.39
  - @remirror/extension-code-block@1.0.0-next.39
  - @remirror/extension-drop-cursor@1.0.0-next.39
  - @remirror/extension-epic-mode@1.0.0-next.39
  - @remirror/extension-gap-cursor@1.0.0-next.39
  - @remirror/extension-hard-break@1.0.0-next.39
  - @remirror/extension-heading@1.0.0-next.39
  - @remirror/extension-horizontal-rule@1.0.0-next.39
  - @remirror/extension-image@1.0.0-next.39
  - @remirror/extension-italic@1.0.0-next.39
  - @remirror/extension-link@1.0.0-next.39
  - @remirror/extension-search@1.0.0-next.39
  - @remirror/extension-strike@1.0.0-next.39
  - @remirror/extension-trailing-node@1.0.0-next.39
  - @remirror/extension-underline@1.0.0-next.39
  - @remirror/preset-core@1.0.0-next.39
  - @remirror/extension-embed@1.0.0-next.39
  - @remirror/extension-list@1.0.0-next.39
  - @remirror/preset-table@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/extension-bidi@1.0.0-next.38
  - @remirror/extension-blockquote@1.0.0-next.38
  - @remirror/extension-bold@1.0.0-next.38
  - @remirror/extension-code@1.0.0-next.38
  - @remirror/extension-code-block@1.0.0-next.38
  - @remirror/extension-drop-cursor@1.0.0-next.38
  - @remirror/extension-epic-mode@1.0.0-next.38
  - @remirror/extension-gap-cursor@1.0.0-next.38
  - @remirror/extension-hard-break@1.0.0-next.38
  - @remirror/extension-heading@1.0.0-next.38
  - @remirror/extension-horizontal-rule@1.0.0-next.38
  - @remirror/extension-image@1.0.0-next.38
  - @remirror/extension-italic@1.0.0-next.38
  - @remirror/extension-link@1.0.0-next.38
  - @remirror/extension-search@1.0.0-next.38
  - @remirror/extension-strike@1.0.0-next.38
  - @remirror/extension-trailing-node@1.0.0-next.38
  - @remirror/extension-underline@1.0.0-next.38
  - @remirror/preset-core@1.0.0-next.38
  - @remirror/extension-embed@1.0.0-next.38
  - @remirror/extension-list@1.0.0-next.38
  - @remirror/preset-table@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`9b48d110`](https://github.com/remirror/remirror/commit/9b48d1101655ef89e960267b582d560f11a89e4a), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/extension-bidi@1.0.0-next.37
  - @remirror/extension-blockquote@1.0.0-next.37
  - @remirror/extension-bold@1.0.0-next.37
  - @remirror/extension-code@1.0.0-next.37
  - @remirror/extension-code-block@1.0.0-next.37
  - @remirror/extension-drop-cursor@1.0.0-next.37
  - @remirror/extension-epic-mode@1.0.0-next.37
  - @remirror/extension-gap-cursor@1.0.0-next.37
  - @remirror/extension-hard-break@1.0.0-next.37
  - @remirror/extension-heading@1.0.0-next.37
  - @remirror/extension-horizontal-rule@1.0.0-next.37
  - @remirror/extension-image@1.0.0-next.37
  - @remirror/extension-italic@1.0.0-next.37
  - @remirror/extension-link@1.0.0-next.37
  - @remirror/extension-search@1.0.0-next.37
  - @remirror/extension-strike@1.0.0-next.37
  - @remirror/extension-trailing-node@1.0.0-next.37
  - @remirror/extension-underline@1.0.0-next.37
  - @remirror/extension-embed@1.0.0-next.37
  - @remirror/extension-list@1.0.0-next.37
  - @remirror/preset-table@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - @remirror/preset-core@1.0.0-next.37

## 1.0.0-next.36

> 2020-09-13

### Patch Changes

- Updated dependencies [[`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7)]:
  - @remirror/preset-table@1.0.0-next.36

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`273db89f`](https://github.com/remirror/remirror/commit/273db89f923000e42b010a4c00f2a15a0d1d9685), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`ffa36163`](https://github.com/remirror/remirror/commit/ffa36163f7bd41409a32dd1fbec90f85da74bb5b), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3), [`b155ff47`](https://github.com/remirror/remirror/commit/b155ff47c14f24618a5a503d38b495aef5bc0b69)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/preset-table@1.0.0-next.35
  - @remirror/extension-bidi@1.0.0-next.35
  - @remirror/extension-blockquote@1.0.0-next.35
  - @remirror/extension-bold@1.0.0-next.35
  - @remirror/extension-code@1.0.0-next.35
  - @remirror/extension-code-block@1.0.0-next.35
  - @remirror/extension-drop-cursor@1.0.0-next.35
  - @remirror/extension-epic-mode@1.0.0-next.35
  - @remirror/extension-gap-cursor@1.0.0-next.35
  - @remirror/extension-hard-break@1.0.0-next.35
  - @remirror/extension-heading@1.0.0-next.35
  - @remirror/extension-horizontal-rule@1.0.0-next.35
  - @remirror/extension-image@1.0.0-next.35
  - @remirror/extension-italic@1.0.0-next.35
  - @remirror/extension-link@1.0.0-next.35
  - @remirror/extension-search@1.0.0-next.35
  - @remirror/extension-strike@1.0.0-next.35
  - @remirror/extension-trailing-node@1.0.0-next.35
  - @remirror/extension-underline@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/preset-core@1.0.0-next.35
  - @remirror/extension-embed@1.0.0-next.35
  - @remirror/extension-list@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/preset-core@1.0.0-next.34
  - @remirror/extension-code@1.0.0-next.34
  - @remirror/extension-bidi@1.0.0-next.34
  - @remirror/extension-blockquote@1.0.0-next.34
  - @remirror/extension-bold@1.0.0-next.34
  - @remirror/extension-code-block@1.0.0-next.34
  - @remirror/extension-drop-cursor@1.0.0-next.34
  - @remirror/extension-epic-mode@1.0.0-next.34
  - @remirror/extension-gap-cursor@1.0.0-next.34
  - @remirror/extension-hard-break@1.0.0-next.34
  - @remirror/extension-heading@1.0.0-next.34
  - @remirror/extension-horizontal-rule@1.0.0-next.34
  - @remirror/extension-image@1.0.0-next.34
  - @remirror/extension-italic@1.0.0-next.34
  - @remirror/extension-link@1.0.0-next.34
  - @remirror/extension-search@1.0.0-next.34
  - @remirror/extension-strike@1.0.0-next.34
  - @remirror/extension-trailing-node@1.0.0-next.34
  - @remirror/extension-underline@1.0.0-next.34
  - @remirror/extension-embed@1.0.0-next.34
  - @remirror/extension-list@1.0.0-next.34
  - @remirror/preset-table@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [04378b54]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [d47bd78f]
  - @remirror/core@1.0.0-next.33
  - @remirror/preset-table@1.0.0-next.33
  - @remirror/extension-italic@1.0.0-next.33
  - @remirror/extension-bidi@1.0.0-next.33
  - @remirror/extension-blockquote@1.0.0-next.33
  - @remirror/extension-bold@1.0.0-next.33
  - @remirror/extension-code@1.0.0-next.33
  - @remirror/extension-code-block@1.0.0-next.33
  - @remirror/extension-drop-cursor@1.0.0-next.33
  - @remirror/extension-epic-mode@1.0.0-next.33
  - @remirror/extension-gap-cursor@1.0.0-next.33
  - @remirror/extension-hard-break@1.0.0-next.33
  - @remirror/extension-heading@1.0.0-next.33
  - @remirror/extension-horizontal-rule@1.0.0-next.33
  - @remirror/extension-image@1.0.0-next.33
  - @remirror/extension-link@1.0.0-next.33
  - @remirror/extension-search@1.0.0-next.33
  - @remirror/extension-strike@1.0.0-next.33
  - @remirror/extension-trailing-node@1.0.0-next.33
  - @remirror/extension-underline@1.0.0-next.33
  - @remirror/preset-core@1.0.0-next.33
  - @remirror/extension-embed@1.0.0-next.33
  - @remirror/extension-list@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies [[`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`3bf621c5`](https://github.com/remirror/remirror/commit/3bf621c57086f8de8084e9f2edba6b2a5c2dc0db), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d)]:
  - @remirror/core@1.0.0-next.32
  - @remirror/extension-horizontal-rule@1.0.0-next.32
  - @remirror/extension-code-block@1.0.0-next.32
  - @remirror/extension-bidi@1.0.0-next.32
  - @remirror/extension-blockquote@1.0.0-next.32
  - @remirror/extension-bold@1.0.0-next.32
  - @remirror/extension-code@1.0.0-next.32
  - @remirror/extension-drop-cursor@1.0.0-next.32
  - @remirror/extension-epic-mode@1.0.0-next.32
  - @remirror/extension-gap-cursor@1.0.0-next.32
  - @remirror/extension-hard-break@1.0.0-next.32
  - @remirror/extension-heading@1.0.0-next.32
  - @remirror/extension-image@1.0.0-next.32
  - @remirror/extension-italic@1.0.0-next.32
  - @remirror/extension-link@1.0.0-next.32
  - @remirror/extension-search@1.0.0-next.32
  - @remirror/extension-strike@1.0.0-next.32
  - @remirror/extension-trailing-node@1.0.0-next.32
  - @remirror/extension-underline@1.0.0-next.32
  - @remirror/preset-core@1.0.0-next.32
  - @remirror/extension-embed@1.0.0-next.32
  - @remirror/extension-list@1.0.0-next.32
  - @remirror/preset-table@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/core@1.0.0-next.31
  - @remirror/extension-bidi@1.0.0-next.31
  - @remirror/extension-blockquote@1.0.0-next.31
  - @remirror/extension-bold@1.0.0-next.31
  - @remirror/extension-code@1.0.0-next.31
  - @remirror/extension-code-block@1.0.0-next.31
  - @remirror/extension-drop-cursor@1.0.0-next.31
  - @remirror/extension-epic-mode@1.0.0-next.31
  - @remirror/extension-gap-cursor@1.0.0-next.31
  - @remirror/extension-hard-break@1.0.0-next.31
  - @remirror/extension-heading@1.0.0-next.31
  - @remirror/extension-horizontal-rule@1.0.0-next.31
  - @remirror/extension-image@1.0.0-next.31
  - @remirror/extension-italic@1.0.0-next.31
  - @remirror/extension-link@1.0.0-next.31
  - @remirror/extension-search@1.0.0-next.31
  - @remirror/extension-strike@1.0.0-next.31
  - @remirror/extension-trailing-node@1.0.0-next.31
  - @remirror/extension-underline@1.0.0-next.31
  - @remirror/preset-core@1.0.0-next.31
  - @remirror/extension-embed@1.0.0-next.31
  - @remirror/extension-list@1.0.0-next.31
  - @remirror/preset-table@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/extension-bidi@1.0.0-next.29
  - @remirror/extension-blockquote@1.0.0-next.29
  - @remirror/extension-bold@1.0.0-next.29
  - @remirror/extension-code@1.0.0-next.29
  - @remirror/extension-code-block@1.0.0-next.29
  - @remirror/extension-drop-cursor@1.0.0-next.29
  - @remirror/extension-epic-mode@1.0.0-next.29
  - @remirror/extension-gap-cursor@1.0.0-next.29
  - @remirror/extension-hard-break@1.0.0-next.29
  - @remirror/extension-heading@1.0.0-next.29
  - @remirror/extension-horizontal-rule@1.0.0-next.29
  - @remirror/extension-image@1.0.0-next.29
  - @remirror/extension-italic@1.0.0-next.29
  - @remirror/extension-link@1.0.0-next.29
  - @remirror/extension-search@1.0.0-next.29
  - @remirror/extension-strike@1.0.0-next.29
  - @remirror/extension-trailing-node@1.0.0-next.29
  - @remirror/extension-underline@1.0.0-next.29
  - @remirror/preset-core@1.0.0-next.29
  - @remirror/extension-embed@1.0.0-next.29
  - @remirror/extension-list@1.0.0-next.29
  - @remirror/preset-table@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/extension-blockquote@1.0.0-next.28
  - @remirror/extension-gap-cursor@1.0.0-next.28
  - @remirror/extension-search@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/extension-embed@1.0.0-next.28
  - @remirror/preset-table@1.0.0-next.28
  - @remirror/extension-bidi@1.0.0-next.28
  - @remirror/extension-bold@1.0.0-next.28
  - @remirror/extension-code@1.0.0-next.28
  - @remirror/extension-code-block@1.0.0-next.28
  - @remirror/extension-drop-cursor@1.0.0-next.28
  - @remirror/extension-epic-mode@1.0.0-next.28
  - @remirror/extension-hard-break@1.0.0-next.28
  - @remirror/extension-heading@1.0.0-next.28
  - @remirror/extension-horizontal-rule@1.0.0-next.28
  - @remirror/extension-image@1.0.0-next.28
  - @remirror/extension-italic@1.0.0-next.28
  - @remirror/extension-link@1.0.0-next.28
  - @remirror/extension-strike@1.0.0-next.28
  - @remirror/extension-trailing-node@1.0.0-next.28
  - @remirror/extension-underline@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - @remirror/extension-list@1.0.0-next.28

## 1.0.0-next.27

> 2020-08-25

### Patch Changes

- @remirror/preset-table@1.0.0-next.27

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/extension-blockquote@1.0.0-next.26
  - @remirror/extension-bold@1.0.0-next.26
  - @remirror/extension-code@1.0.0-next.26
  - @remirror/extension-code-block@1.0.0-next.26
  - @remirror/extension-hard-break@1.0.0-next.26
  - @remirror/extension-heading@1.0.0-next.26
  - @remirror/extension-image@1.0.0-next.26
  - @remirror/extension-italic@1.0.0-next.26
  - @remirror/extension-link@1.0.0-next.26
  - @remirror/extension-strike@1.0.0-next.26
  - @remirror/extension-trailing-node@1.0.0-next.26
  - @remirror/extension-underline@1.0.0-next.26
  - @remirror/extension-embed@1.0.0-next.26
  - @remirror/extension-list@1.0.0-next.26
  - @remirror/preset-table@1.0.0-next.26
  - @remirror/extension-bidi@1.0.0-next.26
  - @remirror/extension-drop-cursor@1.0.0-next.26
  - @remirror/extension-epic-mode@1.0.0-next.26
  - @remirror/extension-gap-cursor@1.0.0-next.26
  - @remirror/extension-horizontal-rule@1.0.0-next.26
  - @remirror/extension-search@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/extension-link@1.0.0-next.25
  - @remirror/extension-bidi@1.0.0-next.25
  - @remirror/extension-blockquote@1.0.0-next.25
  - @remirror/extension-bold@1.0.0-next.25
  - @remirror/extension-code@1.0.0-next.25
  - @remirror/extension-code-block@1.0.0-next.25
  - @remirror/extension-drop-cursor@1.0.0-next.25
  - @remirror/extension-epic-mode@1.0.0-next.25
  - @remirror/extension-gap-cursor@1.0.0-next.25
  - @remirror/extension-hard-break@1.0.0-next.25
  - @remirror/extension-heading@1.0.0-next.25
  - @remirror/extension-horizontal-rule@1.0.0-next.25
  - @remirror/extension-image@1.0.0-next.25
  - @remirror/extension-italic@1.0.0-next.25
  - @remirror/extension-search@1.0.0-next.25
  - @remirror/extension-strike@1.0.0-next.25
  - @remirror/extension-trailing-node@1.0.0-next.25
  - @remirror/extension-underline@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - @remirror/extension-embed@1.0.0-next.25
  - @remirror/extension-list@1.0.0-next.25
  - @remirror/preset-table@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-bidi@1.0.0-next.24
  - @remirror/extension-blockquote@1.0.0-next.24
  - @remirror/extension-bold@1.0.0-next.24
  - @remirror/extension-code@1.0.0-next.24
  - @remirror/extension-code-block@1.0.0-next.24
  - @remirror/extension-drop-cursor@1.0.0-next.24
  - @remirror/extension-epic-mode@1.0.0-next.24
  - @remirror/extension-gap-cursor@1.0.0-next.24
  - @remirror/extension-hard-break@1.0.0-next.24
  - @remirror/extension-heading@1.0.0-next.24
  - @remirror/extension-horizontal-rule@1.0.0-next.24
  - @remirror/extension-image@1.0.0-next.24
  - @remirror/extension-italic@1.0.0-next.24
  - @remirror/extension-link@1.0.0-next.24
  - @remirror/extension-search@1.0.0-next.24
  - @remirror/extension-strike@1.0.0-next.24
  - @remirror/extension-trailing-node@1.0.0-next.24
  - @remirror/extension-underline@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24
  - @remirror/extension-embed@1.0.0-next.24
  - @remirror/extension-list@1.0.0-next.24
  - @remirror/preset-table@1.0.0-next.24

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- 21c5807e: Fix issue #298 where selecting all content meant a link couldn't be added afterward.

  💥 Add `selectTextOnClick` and default to `false`. Previously the whole link would be selected when clicking on a link. Now it's configurable.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [8ccbd07b]
- Updated dependencies [45d82746]
- Updated dependencies [21c5807e]
- Updated dependencies [f0377808]
  - @remirror/core@1.0.0-next.22
  - @remirror/extension-hard-break@1.0.0-next.22
  - @remirror/extension-bidi@1.0.0-next.22
  - @remirror/extension-link@1.0.0-next.22
  - @remirror/extension-code-block@1.0.0-next.22
  - @remirror/extension-blockquote@1.0.0-next.22
  - @remirror/extension-bold@1.0.0-next.22
  - @remirror/extension-code@1.0.0-next.22
  - @remirror/extension-drop-cursor@1.0.0-next.22
  - @remirror/extension-epic-mode@1.0.0-next.22
  - @remirror/extension-gap-cursor@1.0.0-next.22
  - @remirror/extension-heading@1.0.0-next.22
  - @remirror/extension-horizontal-rule@1.0.0-next.22
  - @remirror/extension-image@1.0.0-next.22
  - @remirror/extension-italic@1.0.0-next.22
  - @remirror/extension-search@1.0.0-next.22
  - @remirror/extension-strike@1.0.0-next.22
  - @remirror/extension-trailing-node@1.0.0-next.22
  - @remirror/extension-underline@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/extension-embed@1.0.0-next.22
  - @remirror/extension-list@1.0.0-next.22
  - @remirror/preset-table@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [8c34030e]
- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/extension-horizontal-rule@1.0.0-next.21
  - @remirror/core@1.0.0-next.21
  - @remirror/extension-code@1.0.0-next.21
  - @remirror/extension-bold@1.0.0-next.21
  - @remirror/extension-italic@1.0.0-next.21
  - @remirror/extension-strike@1.0.0-next.21
  - @remirror/extension-bidi@1.0.0-next.21
  - @remirror/extension-blockquote@1.0.0-next.21
  - @remirror/extension-code-block@1.0.0-next.21
  - @remirror/extension-drop-cursor@1.0.0-next.21
  - @remirror/extension-epic-mode@1.0.0-next.21
  - @remirror/extension-gap-cursor@1.0.0-next.21
  - @remirror/extension-hard-break@1.0.0-next.21
  - @remirror/extension-heading@1.0.0-next.21
  - @remirror/extension-image@1.0.0-next.21
  - @remirror/extension-link@1.0.0-next.21
  - @remirror/extension-search@1.0.0-next.21
  - @remirror/extension-trailing-node@1.0.0-next.21
  - @remirror/extension-underline@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - @remirror/extension-embed@1.0.0-next.21
  - @remirror/extension-list@1.0.0-next.21
  - @remirror/preset-table@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/extension-code-block@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/extension-bidi@1.0.0-next.20
  - @remirror/extension-blockquote@1.0.0-next.20
  - @remirror/extension-bold@1.0.0-next.20
  - @remirror/extension-code@1.0.0-next.20
  - @remirror/extension-drop-cursor@1.0.0-next.20
  - @remirror/extension-epic-mode@1.0.0-next.20
  - @remirror/extension-gap-cursor@1.0.0-next.20
  - @remirror/extension-hard-break@1.0.0-next.20
  - @remirror/extension-heading@1.0.0-next.20
  - @remirror/extension-horizontal-rule@1.0.0-next.20
  - @remirror/extension-image@1.0.0-next.20
  - @remirror/extension-italic@1.0.0-next.20
  - @remirror/extension-link@1.0.0-next.20
  - @remirror/extension-search@1.0.0-next.20
  - @remirror/extension-strike@1.0.0-next.20
  - @remirror/extension-trailing-node@1.0.0-next.20
  - @remirror/extension-underline@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20
  - @remirror/extension-embed@1.0.0-next.20
  - @remirror/extension-list@1.0.0-next.20
  - @remirror/preset-table@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- Updated dependencies [898c62e0]
  - @remirror/core@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/extension-bidi@1.0.0-next.17
  - @remirror/extension-blockquote@1.0.0-next.17
  - @remirror/extension-bold@1.0.0-next.17
  - @remirror/extension-code@1.0.0-next.17
  - @remirror/extension-code-block@1.0.0-next.17
  - @remirror/extension-drop-cursor@1.0.0-next.17
  - @remirror/extension-epic-mode@1.0.0-next.17
  - @remirror/extension-gap-cursor@1.0.0-next.17
  - @remirror/extension-hard-break@1.0.0-next.17
  - @remirror/extension-heading@1.0.0-next.17
  - @remirror/extension-horizontal-rule@1.0.0-next.17
  - @remirror/extension-image@1.0.0-next.17
  - @remirror/extension-italic@1.0.0-next.17
  - @remirror/extension-link@1.0.0-next.17
  - @remirror/extension-search@1.0.0-next.17
  - @remirror/extension-strike@1.0.0-next.17
  - @remirror/extension-trailing-node@1.0.0-next.17
  - @remirror/extension-underline@1.0.0-next.17
  - @remirror/extension-embed@1.0.0-next.17
  - @remirror/extension-list@1.0.0-next.17
  - @remirror/preset-table@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6528323e: **Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`. **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a `settings` property for manager settings.

  `@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from extension. Apply it to the packages mentioned above.

  - `@remirror/react-wysiwyg` - Update imports from `@remirror/preset-wysiwyg`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [1918da2c]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/extension-bidi@1.0.0-next.16
  - @remirror/extension-blockquote@1.0.0-next.16
  - @remirror/extension-bold@1.0.0-next.16
  - @remirror/extension-code@1.0.0-next.16
  - @remirror/extension-code-block@1.0.0-next.16
  - @remirror/extension-drop-cursor@1.0.0-next.16
  - @remirror/extension-epic-mode@1.0.0-next.16
  - @remirror/extension-gap-cursor@1.0.0-next.16
  - @remirror/extension-hard-break@1.0.0-next.16
  - @remirror/extension-heading@1.0.0-next.16
  - @remirror/extension-horizontal-rule@1.0.0-next.16
  - @remirror/extension-image@1.0.0-next.16
  - @remirror/extension-italic@1.0.0-next.16
  - @remirror/extension-link@1.0.0-next.16
  - @remirror/extension-search@1.0.0-next.16
  - @remirror/extension-strike@1.0.0-next.16
  - @remirror/extension-trailing-node@1.0.0-next.16
  - @remirror/extension-underline@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/extension-embed@1.0.0-next.16
  - @remirror/extension-list@1.0.0-next.16
  - @remirror/preset-table@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [0ff4fd5c]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [e3d937f0]
- Updated dependencies [6c3b278b]
- Updated dependencies [08e51078]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-horizontal-rule@1.0.0-next.15
  - @remirror/extension-code@1.0.0-next.15
  - @remirror/extension-code-block@1.0.0-next.15
  - @remirror/extension-heading@1.0.0-next.15
  - @remirror/extension-italic@1.0.0-next.15
  - @remirror/extension-strike@1.0.0-next.15
  - @remirror/extension-underline@1.0.0-next.15
  - @remirror/extension-bold@1.0.0-next.15
  - @remirror/extension-hard-break@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/extension-bidi@1.0.0-next.15
  - @remirror/extension-blockquote@1.0.0-next.15
  - @remirror/extension-drop-cursor@1.0.0-next.15
  - @remirror/extension-epic-mode@1.0.0-next.15
  - @remirror/extension-gap-cursor@1.0.0-next.15
  - @remirror/extension-image@1.0.0-next.15
  - @remirror/extension-link@1.0.0-next.15
  - @remirror/extension-search@1.0.0-next.15
  - @remirror/extension-trailing-node@1.0.0-next.15
  - @remirror/extension-embed@1.0.0-next.15
  - @remirror/extension-list@1.0.0-next.15
  - @remirror/preset-table@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 38941404: Switch from static properties to using the `@extensionDecorator` and `@presetDecorator` instead.
- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [38941404]
- Updated dependencies [3fbb2325]
- Updated dependencies [02704d42]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-blockquote@1.0.0-next.13
  - @remirror/extension-bold@1.0.0-next.13
  - @remirror/extension-code@1.0.0-next.13
  - @remirror/extension-code-block@1.0.0-next.13
  - @remirror/extension-hard-break@1.0.0-next.13
  - @remirror/extension-heading@1.0.0-next.13
  - @remirror/extension-horizontal-rule@1.0.0-next.13
  - @remirror/extension-italic@1.0.0-next.13
  - @remirror/extension-link@1.0.0-next.13
  - @remirror/extension-search@1.0.0-next.13
  - @remirror/extension-strike@1.0.0-next.13
  - @remirror/extension-underline@1.0.0-next.13
  - @remirror/extension-list@1.0.0-next.13
  - @remirror/extension-bidi@1.0.0-next.13
  - @remirror/extension-drop-cursor@1.0.0-next.13
  - @remirror/extension-epic-mode@1.0.0-next.13
  - @remirror/extension-gap-cursor@1.0.0-next.13
  - @remirror/extension-image@1.0.0-next.13
  - @remirror/extension-trailing-node@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/extension-embed@1.0.0-next.13
  - @remirror/preset-table@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [093719d6]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12
  - @remirror/extension-epic-mode@1.0.0-next.12
  - @remirror/extension-bidi@1.0.0-next.12
  - @remirror/extension-blockquote@1.0.0-next.12
  - @remirror/extension-bold@1.0.0-next.12
  - @remirror/extension-code@1.0.0-next.12
  - @remirror/extension-code-block@1.0.0-next.12
  - @remirror/extension-drop-cursor@1.0.0-next.12
  - @remirror/extension-gap-cursor@1.0.0-next.12
  - @remirror/extension-hard-break@1.0.0-next.12
  - @remirror/extension-heading@1.0.0-next.12
  - @remirror/extension-horizontal-rule@1.0.0-next.12
  - @remirror/extension-image@1.0.0-next.12
  - @remirror/extension-italic@1.0.0-next.12
  - @remirror/extension-link@1.0.0-next.12
  - @remirror/extension-search@1.0.0-next.12
  - @remirror/extension-strike@1.0.0-next.12
  - @remirror/extension-trailing-node@1.0.0-next.12
  - @remirror/extension-underline@1.0.0-next.12
  - @remirror/preset-core@1.0.0-next.12
  - @remirror/extension-embed@1.0.0-next.12
  - @remirror/extension-list@1.0.0-next.12
  - @remirror/preset-table@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11
  - @remirror/extension-bidi@1.0.0-next.11
  - @remirror/extension-blockquote@1.0.0-next.11
  - @remirror/extension-bold@1.0.0-next.11
  - @remirror/extension-code@1.0.0-next.11
  - @remirror/extension-code-block@1.0.0-next.11
  - @remirror/extension-drop-cursor@1.0.0-next.11
  - @remirror/extension-epic-mode@1.0.0-next.11
  - @remirror/extension-gap-cursor@1.0.0-next.11
  - @remirror/extension-heading@1.0.0-next.11
  - @remirror/extension-horizontal-rule@1.0.0-next.11
  - @remirror/extension-image@1.0.0-next.11
  - @remirror/extension-italic@1.0.0-next.11
  - @remirror/extension-link@1.0.0-next.11
  - @remirror/extension-search@1.0.0-next.11
  - @remirror/extension-strike@1.0.0-next.11
  - @remirror/extension-trailing-node@1.0.0-next.11
  - @remirror/extension-underline@1.0.0-next.11
  - @remirror/extension-embed@1.0.0-next.11
  - @remirror/extension-list@1.0.0-next.11
  - @remirror/preset-table@1.0.0-next.11
  - @remirror/extension-hard-break@1.0.0-next.11
  - @remirror/preset-core@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Patch Changes

- 5539bc32: Fix ESM build issue when exporting types as values.
- Updated dependencies [6468058a]
- Updated dependencies [3702a83a]
  - @remirror/core@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-bidi@1.0.0-next.10
  - @remirror/extension-blockquote@1.0.0-next.10
  - @remirror/extension-bold@1.0.0-next.10
  - @remirror/extension-code@1.0.0-next.10
  - @remirror/extension-code-block@1.0.0-next.10
  - @remirror/extension-drop-cursor@1.0.0-next.10
  - @remirror/extension-epic-mode@1.0.0-next.10
  - @remirror/extension-gap-cursor@1.0.0-next.10
  - @remirror/extension-hard-break@1.0.0-next.10
  - @remirror/extension-heading@1.0.0-next.10
  - @remirror/extension-horizontal-rule@1.0.0-next.10
  - @remirror/extension-image@1.0.0-next.10
  - @remirror/extension-italic@1.0.0-next.10
  - @remirror/extension-link@1.0.0-next.10
  - @remirror/extension-search@1.0.0-next.10
  - @remirror/extension-strike@1.0.0-next.10
  - @remirror/extension-trailing-node@1.0.0-next.10
  - @remirror/extension-underline@1.0.0-next.10
  - @remirror/extension-embed@1.0.0-next.10
  - @remirror/extension-list@1.0.0-next.10
  - @remirror/preset-table@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9
  - @remirror/extension-bidi@1.0.0-next.9
  - @remirror/extension-blockquote@1.0.0-next.9
  - @remirror/extension-bold@1.0.0-next.9
  - @remirror/extension-code@1.0.0-next.9
  - @remirror/extension-code-block@1.0.0-next.9
  - @remirror/extension-drop-cursor@1.0.0-next.9
  - @remirror/extension-epic-mode@1.0.0-next.9
  - @remirror/extension-gap-cursor@1.0.0-next.9
  - @remirror/extension-hard-break@1.0.0-next.9
  - @remirror/extension-heading@1.0.0-next.9
  - @remirror/extension-horizontal-rule@1.0.0-next.9
  - @remirror/extension-image@1.0.0-next.9
  - @remirror/extension-italic@1.0.0-next.9
  - @remirror/extension-link@1.0.0-next.9
  - @remirror/extension-search@1.0.0-next.9
  - @remirror/extension-strike@1.0.0-next.9
  - @remirror/extension-trailing-node@1.0.0-next.9
  - @remirror/extension-underline@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/extension-embed@1.0.0-next.9
  - @remirror/extension-list@1.0.0-next.9
  - @remirror/preset-table@1.0.0-next.9

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [2d74596b]
- Updated dependencies [5d5970ae]
  - @remirror/core@1.0.0-next.4
  - @remirror/preset-table@1.0.0-next.4
  - @remirror/extension-bidi@1.0.0-next.4
  - @remirror/extension-blockquote@1.0.0-next.4
  - @remirror/extension-bold@1.0.0-next.4
  - @remirror/extension-code@1.0.0-next.4
  - @remirror/extension-code-block@1.0.0-next.4
  - @remirror/extension-drop-cursor@1.0.0-next.4
  - @remirror/extension-epic-mode@1.0.0-next.4
  - @remirror/extension-gap-cursor@1.0.0-next.4
  - @remirror/extension-hard-break@1.0.0-next.4
  - @remirror/extension-heading@1.0.0-next.4
  - @remirror/extension-horizontal-rule@1.0.0-next.4
  - @remirror/extension-image@1.0.0-next.4
  - @remirror/extension-italic@1.0.0-next.4
  - @remirror/extension-link@1.0.0-next.4
  - @remirror/extension-search@1.0.0-next.4
  - @remirror/extension-strike@1.0.0-next.4
  - @remirror/extension-trailing-node@1.0.0-next.4
  - @remirror/extension-underline@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/extension-embed@1.0.0-next.4
  - @remirror/extension-list@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/extension-bidi@1.0.0-next.3
  - @remirror/extension-blockquote@1.0.0-next.3
  - @remirror/extension-bold@1.0.0-next.3
  - @remirror/extension-code@1.0.0-next.3
  - @remirror/extension-code-block@1.0.0-next.3
  - @remirror/extension-drop-cursor@1.0.0-next.3
  - @remirror/extension-epic-mode@1.0.0-next.3
  - @remirror/extension-gap-cursor@1.0.0-next.3
  - @remirror/extension-hard-break@1.0.0-next.3
  - @remirror/extension-heading@1.0.0-next.3
  - @remirror/extension-horizontal-rule@1.0.0-next.3
  - @remirror/extension-image@1.0.0-next.3
  - @remirror/extension-italic@1.0.0-next.3
  - @remirror/extension-link@1.0.0-next.3
  - @remirror/extension-search@1.0.0-next.3
  - @remirror/extension-strike@1.0.0-next.3
  - @remirror/extension-trailing-node@1.0.0-next.3
  - @remirror/extension-underline@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/extension-embed@1.0.0-next.3
  - @remirror/extension-list@1.0.0-next.3
  - @remirror/preset-table@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2
  - @remirror/extension-bidi@1.0.0-next.2
  - @remirror/extension-blockquote@1.0.0-next.2
  - @remirror/extension-bold@1.0.0-next.2
  - @remirror/extension-code@1.0.0-next.2
  - @remirror/extension-code-block@1.0.0-next.2
  - @remirror/extension-drop-cursor@1.0.0-next.2
  - @remirror/extension-epic-mode@1.0.0-next.2
  - @remirror/extension-gap-cursor@1.0.0-next.2
  - @remirror/extension-hard-break@1.0.0-next.2
  - @remirror/extension-heading@1.0.0-next.2
  - @remirror/extension-horizontal-rule@1.0.0-next.2
  - @remirror/extension-image@1.0.0-next.2
  - @remirror/extension-italic@1.0.0-next.2
  - @remirror/extension-link@1.0.0-next.2
  - @remirror/extension-search@1.0.0-next.2
  - @remirror/extension-strike@1.0.0-next.2
  - @remirror/extension-trailing-node@1.0.0-next.2
  - @remirror/extension-underline@1.0.0-next.2
  - @remirror/preset-core@1.0.0-next.2
  - @remirror/extension-embed@1.0.0-next.2
  - @remirror/extension-list@1.0.0-next.2
  - @remirror/preset-table@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-bidi@1.0.0-next.1
  - @remirror/extension-blockquote@1.0.0-next.1
  - @remirror/extension-bold@1.0.0-next.1
  - @remirror/extension-code@1.0.0-next.1
  - @remirror/extension-code-block@1.0.0-next.1
  - @remirror/extension-drop-cursor@1.0.0-next.1
  - @remirror/extension-epic-mode@1.0.0-next.1
  - @remirror/extension-gap-cursor@1.0.0-next.1
  - @remirror/extension-hard-break@1.0.0-next.1
  - @remirror/extension-heading@1.0.0-next.1
  - @remirror/extension-horizontal-rule@1.0.0-next.1
  - @remirror/extension-image@1.0.0-next.1
  - @remirror/extension-italic@1.0.0-next.1
  - @remirror/extension-link@1.0.0-next.1
  - @remirror/extension-search@1.0.0-next.1
  - @remirror/extension-strike@1.0.0-next.1
  - @remirror/extension-trailing-node@1.0.0-next.1
  - @remirror/extension-underline@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/extension-embed@1.0.0-next.1
  - @remirror/extension-list@1.0.0-next.1
  - @remirror/preset-table@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-bidi@1.0.0-next.0
  - @remirror/extension-blockquote@1.0.0-next.0
  - @remirror/extension-bold@1.0.0-next.0
  - @remirror/extension-code@1.0.0-next.0
  - @remirror/extension-code-block@1.0.0-next.0
  - @remirror/extension-drop-cursor@1.0.0-next.0
  - @remirror/extension-epic-mode@1.0.0-next.0
  - @remirror/extension-gap-cursor@1.0.0-next.0
  - @remirror/extension-hard-break@1.0.0-next.0
  - @remirror/extension-heading@1.0.0-next.0
  - @remirror/extension-horizontal-rule@1.0.0-next.0
  - @remirror/extension-image@1.0.0-next.0
  - @remirror/extension-italic@1.0.0-next.0
  - @remirror/extension-link@1.0.0-next.0
  - @remirror/extension-search@1.0.0-next.0
  - @remirror/extension-strike@1.0.0-next.0
  - @remirror/extension-trailing-node@1.0.0-next.0
  - @remirror/extension-underline@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/extension-embed@1.0.0-next.0
  - @remirror/extension-list@1.0.0-next.0
  - @remirror/preset-table@1.0.0-next.0
