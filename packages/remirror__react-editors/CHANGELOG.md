# @remirror/react-editors

## 0.1.68

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

- Updated dependencies []:
  - @remirror/pm@1.0.16
  - remirror@1.0.73

## 0.1.67

> 2022-04-04

### Patch Changes

- deleted an incorrect preselectClass style on react-table-extension

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.31
  - @remirror/react@1.0.31

## 0.1.66

> 2022-04-01

### Patch Changes

- Borders will be applied for table headers on hover of column controller

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.30
  - @remirror/react@1.0.30

## 0.1.65

> 2022-03-31

### Patch Changes

- Add support for Unicode Regexp in suggestion matching.

  The change was required to support matching non-latin characters in `MentionAtomExtension` and `MentionExtension` i.e. by using `supportedCharacters: /\p{Letter}+/u` in `matchers` definition.

  There is no need to update the code: changes are backwards compatible with no behavior change at all.

- Updated dependencies []:
  - @remirror/pm@1.0.15

## 0.1.64

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

* Add a new `CountExtension`, adding the ability to count words or characters in your editor, and set a soft max length

* Updated dependencies []:
  - remirror@1.0.72
  - @remirror/extension-react-tables@1.0.29
  - @remirror/react@1.0.29

## 0.1.63

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - remirror@1.0.71
  - @remirror/extension-react-tables@1.0.28
  - @remirror/react@1.0.28

## 0.1.62

> 2022-03-08

### Patch Changes

- When using `prosemirror-suggest`, if `appendTransaction` is `true`, make sure the match state will be updated after every transaction.

- Updated dependencies []:
  - @remirror/pm@1.0.14

## 0.1.61

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - remirror@1.0.70
  - @remirror/extension-react-tables@1.0.27
  - @remirror/react@1.0.27

## 0.1.60

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - remirror@1.0.69
  - @remirror/extension-react-tables@1.0.26
  - @remirror/react@1.0.26

## 0.1.59

> 2022-03-02

### Patch Changes

- Fix an error when clicking the list spine.

- Updated dependencies []:
  - remirror@1.0.68

## 0.1.58

> 2022-03-01

### Patch Changes

- Fix an issue that causes the selected text being deleted when pasting.

- Updated dependencies []:
  - @remirror/pm@1.0.13

## 0.1.57

> 2022-02-25

### Patch Changes

- Fixes an issue that causes invalid duplicate marks when using `pasteRules` plugin.

* Fixes an issue that causes some text nodes to be deleted when using `replaceSelection`.

* Updated dependencies []:
  - @remirror/pm@1.0.12

## 0.1.56

> 2022-02-22

### Patch Changes

- Updated marked to v4 to resolve vunerable dependency alert

* Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

* Updated dependencies []:
  - remirror@1.0.67
  - @remirror/extension-react-tables@1.0.25
  - @remirror/react@1.0.25

## 0.1.55

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/styles@1.1.3
  - remirror@1.0.66
  - @remirror/extension-react-tables@1.0.24
  - @remirror/react@1.0.24

## 0.1.54

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

* Allow disabling the yjs undo functionality in the yjs extension

* Updated dependencies []:
  - @remirror/react@1.0.23
  - remirror@1.0.65
  - @remirror/extension-react-tables@1.0.23

## 0.1.53

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

* Replace wrong assertion

* Updated dependencies []:
  - remirror@1.0.64
  - @remirror/extension-react-tables@1.0.22
  - @remirror/react@1.0.22

## 0.1.52

> 2022-02-02

### Patch Changes

- Avoid race conditions in processing annotations

- Updated dependencies []:
  - remirror@1.0.63

## 0.1.51

> 2022-01-31

### Patch Changes

- fix: don't extend annotation when the user types at the beginning

- Updated dependencies []:
  - remirror@1.0.62

## 0.1.50

> 2022-01-21

### Patch Changes

- fix: make HorizontalRule compatible with Shortcuts

- Updated dependencies []:
  - remirror@1.0.61

## 0.1.49

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.11
  - remirror@1.0.60

## 0.1.48

> 2022-01-16

### Patch Changes

- Fix a runtime error when getting font size before the editor view is initialized.

* Increase the clickable area of the task list checkbox by using `<label>` to wrap the checkbox.

* Updated dependencies []:
  - remirror@1.0.59

## 0.1.47

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
  - @remirror/extension-react-tables@1.0.21
  - remirror@1.0.58
  - @remirror/react@1.0.21

## 0.1.46

> 2022-01-06

### Patch Changes

- Fix a bug that causes the cursor to jump to the end of the first node when pressing backspace at the beginning of a list and this list is the second child of the document.

- Updated dependencies []:
  - remirror@1.0.57

## 0.1.45

> 2022-01-05

### Patch Changes

- Update yjs packages to latest version.

* Avoid leaking Yjs UndoManager instances

* Updated dependencies []:
  - remirror@1.0.56

## 0.1.44

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - remirror@1.0.55
  - @remirror/core-helpers@1.0.5
  - @remirror/pm@1.0.10
  - @remirror/extension-react-tables@1.0.20
  - @remirror/react@1.0.20

## 0.1.43

> 2021-12-30

### Patch Changes

- Correct a document error about `CodeBlockExtension`'s option `toggleName`. Its default value should be `'paragraph'` instead of `undefined`.

* Fix a potential issue that might cause invalid text selection when pressing `Backspace` instead a code block node.

* Updated dependencies []:
  - remirror@1.0.54

## 0.1.42

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - remirror@1.0.53
  - @remirror/extension-react-tables@1.0.19
  - @remirror/react@1.0.19

## 0.1.41

> 2021-12-15

### Patch Changes

- fix: prevent text loss when drag and dropping text containing links

- Updated dependencies []:
  - remirror@1.0.52

## 0.1.40

> 2021-12-10

### Patch Changes

- Align left/right arrow style with other arrows

- Updated dependencies []:
  - remirror@1.0.51

## 0.1.39

> 2021-12-10

### Patch Changes

- feat: support shortcut for left/right arrows

- Updated dependencies []:
  - remirror@1.0.50

## 0.1.38

> 2021-12-09

### Patch Changes

- Fix an issue that causes the content below a list item is being deleted when deleting this list item by pressing Enter.

- Updated dependencies []:
  - remirror@1.0.49

## 0.1.37

> 2021-12-06

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.9

## 0.1.36

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.18
  - @remirror/react@1.0.18

## 0.1.35

> 2021-11-23

### Patch Changes

- Restore image dimensions correctly from the markup.

- Updated dependencies []:
  - remirror@1.0.48

## 0.1.34

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - remirror@1.0.47
  - @remirror/pm@1.0.8
  - @remirror/extension-react-tables@1.0.17
  - @remirror/react@1.0.17

## 0.1.33

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

* Update ProseMirror dependencies.

* Updated dependencies []:
  - remirror@1.0.46
  - @remirror/extension-react-tables@1.0.16
  - @remirror/react@1.0.16
  - @remirror/pm@1.0.7

## 0.1.32

> 2021-11-18

### Patch Changes

- fix: remove rules depending on capture groups

- Updated dependencies []:
  - remirror@1.0.45

## 0.1.31

> 2021-11-17

### Patch Changes

- fix: removeFontSize should respect user text selection

- Updated dependencies []:
  - remirror@1.0.44

## 0.1.30

> 2021-11-16

### Patch Changes

- Make extension-shortcuts package public

- Updated dependencies []:
  - remirror@1.0.43

## 0.1.29

> 2021-11-16

### Patch Changes

- Add support for keyboard shortcuts

* Add keyboard shortcuts

* Updated dependencies []:
  - remirror@1.0.42

## 0.1.28

> 2021-11-16

### Patch Changes

- Fix an error when indenting the list.

- Updated dependencies []:
  - remirror@1.0.41

## 0.1.27

> 2021-11-11

### Patch Changes

- Add a new option `extractHref` to `ExtensionLink`. Users can use this option to customize the `href` attribute, for example `file://` and `tel:`.

- Updated dependencies []:
  - remirror@1.0.40

## 0.1.26

> 2021-11-10

### Patch Changes

- Implement the `stopEvent` method in `ReactNodeView`.

* Add new method `hasHandlers` to extensions.

* Updated dependencies []:
  - @remirror/extension-react-tables@1.0.15
  - @remirror/react@1.0.15
  - remirror@1.0.39

## 0.1.25

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - remirror@1.0.38
  - @remirror/extension-react-tables@1.0.14
  - @remirror/pm@1.0.6
  - @remirror/react@1.0.14

## 0.1.24

> 2021-11-04

### Patch Changes

- Fix an issue where the resizable view is too tall on a small viewpoint.

- Updated dependencies []:
  - remirror@1.0.37

## 0.1.23

> 2021-10-29

### Patch Changes

- Update prosemirror packages.

- Updated dependencies []:
  - @remirror/pm@1.0.5

## 0.1.22

> 2021-10-24

### Patch Changes

- Fix a bug that causes initial size CSS in resizable view not be set.

- Updated dependencies []:
  - remirror@1.0.36

## 0.1.21

> 2021-10-24

### Patch Changes

- Make sure that the `width` and `height` attribute of `<img>` and `<iframe>` HTML elements is an integer without a unit.

* Update the type of `ImageExtensionAttributes.height` and `ImageExtensionAttributes.width` to `string | number`.

* Updated dependencies []:
  - remirror@1.0.35

## 0.1.20

> 2021-10-23

### Patch Changes

- Fixed an issue that causes resizable image's height can't be updated during resizing.

* Update dependency `marked` to v3.

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - remirror@1.0.34
  - @remirror/core-helpers@1.0.3
  - @remirror/extension-react-tables@1.0.13
  - @remirror/react@1.0.13
  - @remirror/pm@1.0.4

## 0.1.19

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
  - remirror@1.0.33
  - @remirror/extension-react-tables@1.0.12
  - @remirror/react@1.0.12

## 0.1.18

> 2021-10-14

### Patch Changes

- Disable spellcheck in code and codeBlock.

- Updated dependencies []:
  - remirror@1.0.32

## 0.1.17

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
  - remirror@1.0.31

## 0.1.16

> 2021-10-08

### Patch Changes

- Fix a bug that causes incorrect indent when changing list type.

- Updated dependencies []:
  - remirror@1.0.30

## 0.1.15

> 2021-10-06

### Patch Changes

- Automagically join two lists with the same node type when there are siblings.

* Allow input rules to convert task list to bullet list or ordered list.

- Merge a patch from the upstream prosemirror-schema-list: https://github.com/ProseMirror/prosemirror-schema-list/commit/38867345f6d97d6793655ed77c16f1a7b18f6846

  Make sure liftListItem doesn't crash when multiple items can't be merged.

  Fix a crash in `liftListItem` that happens when list items that can't be merged are lifted together.

- Updated dependencies []:
  - remirror@1.0.29

## 0.1.14

> 2021-10-04

### Patch Changes

- Don't let the browser handle the Tab key in a list.

- Updated dependencies []:
  - remirror@1.0.28

## 0.1.13

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - remirror@1.0.27
  - @remirror/extension-react-tables@1.0.11
  - @remirror/react@1.0.11
  - @remirror/core-helpers@1.0.2
  - @remirror/pm@1.0.3

## 0.1.12

> 2021-09-29

### Patch Changes

- Add a flag to filter out edge matches from `getAnnotationAt` helper

- Updated dependencies []:
  - remirror@1.0.26

## 0.1.11

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

* Improve the performance of large task lists and collapsible bullet lists.

* Updated dependencies []:
  - remirror@1.0.25
  - @remirror/extension-react-tables@1.0.10
  - @remirror/react@1.0.10

## 0.1.10

> 2021-09-15

### Patch Changes

- Fix a RangeError when calling list commands.

- Updated dependencies []:
  - remirror@1.0.24

## 0.1.9

> 2021-09-13

### Patch Changes

- feat: detect emails as links

* Add a white border to the handle to make it more recognizable.

* Updated dependencies []:
  - remirror@1.0.23

## 0.1.8

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

* Remove react dependency from wysiwyg-preset: An earlier commit upgraded the tables from simple to fancy tables. As a side effect, this had introduced a dependency from wysiwyg to the react-part of remirror. This change removes this dependency again.

* Updated dependencies []:
  - remirror@1.0.22
  - @remirror/extension-react-tables@1.0.9
  - @remirror/react@1.0.9

## 0.1.7

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

- Updated dependencies []:
  - remirror@1.0.21

## 0.1.6

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - remirror@1.0.20
  - @remirror/react@1.0.8

## 0.1.5

> 2021-09-01

### Patch Changes

- Fix an issue that causes clicking a nested checkbox won't toggle its checked state.

- Updated dependencies []:
  - remirror@1.0.19

## 0.1.4

> 2021-09-01

### Patch Changes

- fix: task list wasn't available in wysiwyg editors

* Don't create a node selection within the `toggleCheckboxChecked` command.

* Updated dependencies []:
  - remirror@1.0.18

## 0.1.3

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/styles@1.1.2
  - remirror@1.0.17
  - @remirror/react@1.0.7

## 0.1.2

> 2021-08-30

### Patch Changes

- Don't require a `NodeSelection` to fire `toggleCheckboxChecked` anymore.

- Updated dependencies []:
  - remirror@1.0.16

## 0.1.1

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Improve commands `toggleBulletList`, `toggleOrderedList` and `toggleTaskList`. Now you can toggle list between bullet list, ordered list and task list.

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/styles@1.1.1
  - remirror@1.0.15
  - @remirror/react@1.0.6

## 0.1.0

> 2021-08-26

### Minor Changes

- Add pre-packaged editors

  Remirror makes building editors simple. Yet, some developers just want to have a out-of-the-box editor that can be plugged into their application. For this, we provide the pre-packaged editors.

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - remirror@1.0.14
  - @remirror/react@1.0.5

## 0.0.14

> 2021-08-25

### Patch Changes

- Fixes a bug that causes the editor to insert an empty task list when deleting all content in the editor. Closes #1163.

- Updated dependencies []:
  - remirror@1.0.13

## 0.0.13

> 2021-08-22

### Patch Changes

- Exports `remirror/styles`.

- Updated dependencies []:
  - remirror@1.0.12

## 0.0.12

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

* Exports `remirror/styles`.

* Updated dependencies []:
  - remirror@1.0.11
  - @remirror/react@1.0.4

## 0.0.11

> 2021-08-20

### Patch Changes

- Fix eager parsing of style attribute, and limit valid `line-height` values in `NodeFormattingExtension`

- Updated dependencies []:
  - remirror@1.0.10

## 0.0.10

> 2021-08-18

### Patch Changes

- Remove the playground API from `remirror`.

* Update dependency `prosemirror-gapcursor` to `^1.1.5`.

- Remove the playground API from `@remirror/react`.

- Updated dependencies []:
  - remirror@1.0.9
  - @remirror/pm@1.0.2
  - @remirror/react@1.0.3

## 0.0.9

> 2021-08-18

### Patch Changes

- Publish a version of `@remirror/extension-node-formatting` without code modification.

- Updated dependencies []:
  - remirror@1.0.8

## 0.0.8

> 2021-08-18

### Patch Changes

- Updated dependencies [[`937c3332d`](https://github.com/remirror/remirror/commit/937c3332d11ff28f5c218e3ed77a85b4a817b067)]:
  - remirror@1.0.7

## 0.0.7

> 2021-08-13

### Patch Changes

- Updated dependencies [[`662edfdaa`](https://github.com/remirror/remirror/commit/662edfdaa6ab7954edd4946b6f06da6d36288042)]:
  - remirror@1.0.6

## 0.0.6

> 2021-08-08

### Patch Changes

- Updated dependencies [[`1d83e4fde`](https://github.com/remirror/remirror/commit/1d83e4fde5a92b68b68d4b1a8e2260b4a985b3cd)]:
  - remirror@1.0.5

## 0.0.5

> 2021-08-04

### Patch Changes

- Updated dependencies [[`ec998d82b`](https://github.com/remirror/remirror/commit/ec998d82b5f2926b4d1eb36eb62d0557aab8fe4b)]:
  - remirror@1.0.4

## 0.0.4

> 2021-07-26

### Patch Changes

- Updated dependencies [[`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2)]:
  - remirror@1.0.3

## 0.0.3

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

- Updated dependencies [[`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/react@1.0.2
  - create-context-state@1.0.1
  - @remirror/styles@1.0.1
  - remirror@1.0.2

## 0.0.2

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - remirror@1.0.1
  - @remirror/core-helpers@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/react@1.0.1

## 0.0.1

> 2021-07-17

### Patch Changes

- Updated dependencies [[`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc), [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`28b81a858`](https://github.com/remirror/remirror/commit/28b81a8580670c4ebc06ad04db088a4b684237bf), [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0)]:
  - remirror@1.0.0
  - @remirror/react@1.0.0
  - create-context-state@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/styles@1.0.0
