# @remirror/react-editors

## 1.0.24

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1
  - remirror@2.0.23
  - @remirror/pm@2.0.3
  - @remirror/styles@2.0.3
  - @remirror/extension-react-tables@2.2.11
  - @remirror/react@2.0.24

## 1.0.23

> 2022-12-26

### Patch Changes

- remirror@2.0.22
- @remirror/extension-react-tables@2.2.10
- @remirror/react@2.0.23

## 1.0.22

> 2022-12-14

### Patch Changes

- remirror@2.0.21
- @remirror/extension-react-tables@2.2.9
- @remirror/react@2.0.22

## 1.0.21

> 2022-12-12

### Patch Changes

- remirror@2.0.20
- @remirror/extension-react-tables@2.2.8
- @remirror/react@2.0.21

## 1.0.20

> 2022-12-10

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
  - @remirror/pm@2.0.2
  - remirror@2.0.19
  - @remirror/react@2.0.20
  - @remirror/extension-react-tables@2.2.7

## 1.0.19

> 2022-11-25

### Patch Changes

- remirror@2.0.18
- @remirror/extension-react-tables@2.2.6
- @remirror/react@2.0.19

## 1.0.18

> 2022-11-21

### Patch Changes

- Updated dependencies [d395a8a11]
  - @remirror/styles@2.0.2
  - remirror@2.0.17
  - @remirror/extension-react-tables@2.2.5
  - @remirror/react@2.0.18

## 1.0.17

> 2022-11-15

### Patch Changes

- remirror@2.0.16
- @remirror/extension-react-tables@2.2.4
- @remirror/react@2.0.17

## 1.0.16

> 2022-11-02

### Patch Changes

- remirror@2.0.15
- @remirror/extension-react-tables@2.2.3
- @remirror/react@2.0.16

## 1.0.15

> 2022-10-28

### Patch Changes

- remirror@2.0.14
- @remirror/extension-react-tables@2.2.2
- @remirror/react@2.0.15

## 1.0.14

> 2022-10-27

### Patch Changes

- remirror@2.0.13
- @remirror/extension-react-tables@2.2.1
- @remirror/react@2.0.14

## 1.0.13

> 2022-10-27

### Patch Changes

- Updated dependencies [3fa267878]
- Updated dependencies [3fa267878]
- Updated dependencies [b637f9f3e]
- Updated dependencies [3fa267878]
  - @remirror/extension-react-tables@2.2.0
  - @remirror/pm@2.0.1
  - remirror@2.0.12
  - @remirror/react@2.0.13

## 1.0.12

> 2022-10-14

### Patch Changes

- The ImageExtension **now prefers text content, over images when pasting mixed text and image content**.

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

- Prevent table plugins (such as column resizing) from loading, if the view is not editable
- Updated dependencies
- Updated dependencies
  - remirror@2.0.11
  - @remirror/extension-react-tables@2.1.0
  - @remirror/react@2.0.12

## 1.0.11

> 2022-10-13

### Patch Changes

- Prevent controller cell content with `filterTransaction`
- Updated dependencies
  - @remirror/extension-react-tables@2.0.11
  - @remirror/react@2.0.11

## 1.0.10

> 2022-10-11

### Patch Changes

- Expose the ability to split and merge cells in the default React tables menu
- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Catch when `posFromDom` returns -1, which causes a thrown error when attempting to resolve the pos
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-react-tables@2.0.10
  - @remirror/styles@2.0.1
  - @remirror/react@2.0.10
  - remirror@2.0.10

## 1.0.9

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - @remirror/extension-react-tables@2.0.9
  - @remirror/react@2.0.9
  - remirror@2.0.9

## 1.0.8

> 2022-09-28

### Patch Changes

- Workarounds the import error for `@remirror/extension-emoji` when using `react-scripts start` by not using `.cjs` file extension.
- Updated dependencies
  - remirror@2.0.8
  - @remirror/extension-react-tables@2.0.8
  - @remirror/react@2.0.8

## 1.0.7

> 2022-09-28

### Patch Changes

- Fixes the import error for `@remirror/extension-emoji` when using `vite dev`.
- Updated dependencies
  - remirror@2.0.7
  - @remirror/extension-react-tables@2.0.7
  - @remirror/react@2.0.7

## 1.0.6

> 2022-09-27

### Patch Changes

- Fixes the CJS build of `@remirror/extension-emoji`.
- Updated dependencies
  - remirror@2.0.6
  - @remirror/extension-react-tables@2.0.6
  - @remirror/react@2.0.6

## 1.0.5

> 2022-09-23

### Patch Changes

- Allow for simplified argument for `setTextCase` command
- Update dependencies.
- Enable display of `sup` and `sub` icon decorations on `CommandButton` via MUI badge

  Add button components for toggling columns, and increase/decreasing font size

- Fix the default import for `turndown`.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.5
  - @remirror/extension-react-tables@2.0.5
  - @remirror/react@2.0.5

## 1.0.4

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - remirror@2.0.4
  - @remirror/extension-react-tables@2.0.4
  - @remirror/react@2.0.4

## 1.0.3

> 2022-09-21

### Patch Changes

- Fix active helpers for text alignment in `NodeFormattingExtension`
- Make `SubExtension` and `SupExtension` overridable
- Decorate the `insertHorizontalRule` command
- Fix the display of whitespace character when made visible
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Add toolbar buttons for text alignment, subscript and superscript, display whitespace, and insert horizontal rule
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.3
  - @remirror/extension-react-tables@2.0.3
  - @remirror/react@2.0.3

## 1.0.2

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - remirror@2.0.2
  - @remirror/extension-react-tables@2.0.2
  - @remirror/react@2.0.2

## 1.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- fix emoji popup can't be closed via esc key
- Updated dependencies
- Updated dependencies
  - remirror@2.0.1
  - @remirror/extension-react-tables@2.0.1
  - @remirror/react@2.0.1

## 1.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Improve the calculation of changed ranges by utilising mapping
- Update ProseMirror dependencies.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Update ProseMirror packages.
- Rewrite React components using MUI.
- Add an optional onclickmark handler to handle clicks on entity reference
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
- Update prosemirror packages.
- Update pnpm-lock.yaml
- Support both ESM and CJS.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- add helper to get shortest entity reference
- Try to require JSDOM implicitly in node environment.
- Correct a bad import.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes `domino` from the codebase.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Update jsx-dom to v7.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- option for supported characters in emoji suggester.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0
  - @remirror/extension-react-tables@2.0.0
  - @remirror/react@2.0.0
  - @remirror/core-helpers@2.0.0
  - @remirror/pm@2.0.0
  - @remirror/styles@2.0.0
  - create-context-state@2.0.0

## 1.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Update ProseMirror packages.
- option for supported characters in emoji suggester.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Rewrite React components using MUI.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- When href equals text content, treat the link as an auto link (if enabled)
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Update prosemirror packages.
- SSR features are removed.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- Update pnpm-lock.yaml
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Add an optional onclickmark handler to handle clicks on entity reference
- Correct a bad import.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror dependencies.
- Expose the return type of the throttle and debounce helpers
- Update jsx-dom to v7.
- Improve the calculation of changed ranges by utilising mapping
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.19
  - @remirror/extension-react-tables@2.0.0-beta.19
  - @remirror/react@2.0.0-beta.19
  - create-context-state@2.0.0-beta.18
  - @remirror/core-helpers@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19
  - @remirror/styles@2.0.0-beta.19

## 1.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- SSR features are removed.
- option for supported characters in emoji suggester.
- Rewrite React components using MUI.
- Support both ESM and CJS.
- Correct a bad import.
- Update ProseMirror packages.
- Expose the return type of the throttle and debounce helpers
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Update jsx-dom to v7.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Update ProseMirror packages to latest versions.
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes `domino` from the codebase.
- When href equals text content, treat the link as an auto link (if enabled)
- Add an optional onclickmark handler to handle clicks on entity reference
- Try to require JSDOM implicitly in node environment.
- Update prosemirror packages.
- Transform a hard break into `\n` in `Node.textContent`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror dependencies.
- add helper to get shortest entity reference
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Update pnpm-lock.yaml
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/styles@2.0.0-beta.18
  - remirror@2.0.0-beta.18
  - @remirror/extension-react-tables@2.0.0-beta.18
  - @remirror/react@2.0.0-beta.18
  - create-context-state@2.0.0-beta.17
  - @remirror/core-helpers@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 1.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages.
- option for supported characters in emoji suggester.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Transform a hard break into `\n` in `Node.textContent`.
- When href equals text content, treat the link as an auto link (if enabled)
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Rewrite React components using MUI.
- SSR features are removed.
- Update prosemirror packages.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror dependencies.
- Add an optional onclickmark handler to handle clicks on entity reference
- Improve the calculation of changed ranges by utilising mapping
- add helper to get shortest entity reference
- Update ProseMirror packages to latest versions.
- Update jsx-dom to v7.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Update pnpm-lock.yaml
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - remirror@2.0.0-beta.17
  - @remirror/extension-react-tables@2.0.0-beta.17
  - @remirror/react@2.0.0-beta.17
  - @remirror/core-helpers@2.0.0-beta.17
  - @remirror/styles@2.0.0-beta.17
  - create-context-state@2.0.0-beta.16

## 1.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror dependencies.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Removes `domino` from the codebase.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Update ProseMirror packages to latest versions.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- Update pnpm-lock.yaml
- add helper to get shortest entity reference
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Add an optional onclickmark handler to handle clicks on entity reference
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Support both ESM and CJS.
- SSR features are removed.
- Update ProseMirror packages.
- Update jsx-dom to v7.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Expose the return type of the throttle and debounce helpers
- Auto link adjacent character detection.

  Remove auto link if the link becomes invalid.

  **Before:**

  "window.confirm" results in "[window.co](//window.co)nfirm"

  **After:**

  "window.confirm" results in "window.confirm"

  New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

  URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

  Library examples to find URLs in text.

  - [linkify-it](https://www.npmjs.com/package/linkify-it)
  - [linkifyjs](https://www.npmjs.com/package/linkifyjs)

  It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

  Regex suggestion from @whawker

  `/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

  **Examples**

  - [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
  - "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
  - ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses

- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - remirror@2.0.0-beta.16
  - @remirror/extension-react-tables@2.0.0-beta.16
  - @remirror/react@2.0.0-beta.16
  - @remirror/styles@2.0.0-beta.16
  - create-context-state@2.0.0-beta.15
  - @remirror/core-helpers@2.0.0-beta.16

## 1.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages.
- Update prosemirror packages.
- add helper to get shortest entity reference
- When href equals text content, treat the link as an auto link (if enabled)
- Removes `domino` from the codebase.
- Add an optional onclickmark handler to handle clicks on entity reference
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Update pnpm-lock.yaml
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror dependencies.
- Update jsx-dom to v7.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror packages to latest versions.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.15
  - @remirror/extension-react-tables@2.0.0-beta.15
  - @remirror/react@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - @remirror/core-helpers@2.0.0-beta.15
  - @remirror/styles@2.0.0-beta.15
  - create-context-state@2.0.0-beta.14

## 1.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- SSR features are removed.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Try to require JSDOM implicitly in node environment.
- add helper to get shortest entity reference
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages to latest versions.
- Update ProseMirror packages.
- When href equals text content, treat the link as an auto link (if enabled)
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror dependencies.
- Transform a hard break into `\n` in `Node.textContent`.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Update pnpm-lock.yaml
- Update jsx-dom to v7.
- Update prosemirror packages.
- Add an optional onclickmark handler to handle clicks on entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/styles@2.0.0-beta.14
  - remirror@2.0.0-beta.14
  - @remirror/extension-react-tables@2.0.0-beta.14
  - @remirror/react@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14
  - @remirror/core-helpers@2.0.0-beta.14
  - create-context-state@2.0.0-beta.13

## 1.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update prosemirror packages.
- Update pnpm-lock.yaml
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- When href equals text content, treat the link as an auto link (if enabled)
- Transform a hard break into `\n` in `Node.textContent`.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Update ProseMirror packages.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Don't re-create `initialEditorState` when re-mounting the `<Remirror/>` component.

  Before this patch, for an uncontrolled editor, the `<Remirror/>` component would re-create the `initialEditorState` when it re-mounts. This will call `EditorState.create()` and call the [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method for every ProseMirror plugins with `initialEditorState`. This is problematic because the editor state passed to plugins is not the same as the current state.

  This patch fixes the issue by only creating `initialEditorState` when the editor is mounted for the first time.

- Add an optional onclickmark handler to handle clicks on entity reference
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Update ProseMirror dependencies.
- Update jsx-dom to v7.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Update ProseMirror packages to latest versions.
- add helper to get shortest entity reference
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.13
  - remirror@2.0.0-beta.13
  - @remirror/extension-react-tables@2.0.0-beta.13
  - @remirror/react@2.0.0-beta.13
  - @remirror/styles@2.0.0-beta.13
  - @remirror/core-helpers@2.0.0-beta.13
  - create-context-state@2.0.0-beta.12

## 1.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update jsx-dom to v7.
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update ProseMirror dependencies.
- Add an optional onclickmark handler to handle clicks on entity reference
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- SSR features are removed.
- Update pnpm-lock.yaml
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Transform a hard break into `\n` in `Node.textContent`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- When href equals text content, treat the link as an auto link (if enabled)
- Update ProseMirror packages.
- add helper to get shortest entity reference
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Update prosemirror packages.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-react-tables@2.0.0-beta.12
  - @remirror/react@2.0.0-beta.12
  - create-context-state@2.0.0-beta.11
  - remirror@2.0.0-beta.12
  - @remirror/core-helpers@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/styles@2.0.0-beta.12

## 1.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update pnpm-lock.yaml
- Update jsx-dom to v7.
- Add an optional onclickmark handler to handle clicks on entity reference
- Update ProseMirror packages.
- When href equals text content, treat the link as an auto link (if enabled)
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Transform a hard break into `\n` in `Node.textContent`.
- add helper to get shortest entity reference
- Click event receives all entity reference marks, their ranges and their respective text on the clicked position
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-react-tables@2.0.0-beta.11
  - @remirror/styles@2.0.0-beta.11
  - remirror@2.0.0-beta.11
  - @remirror/react@2.0.0-beta.11
  - @remirror/core-helpers@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11
  - create-context-state@2.0.0-beta.10

## 1.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update prosemirror packages.
- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Add an optional onclickmark handler to handle clicks on entity reference
- Update jsx-dom to v7.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- add helper to get shortest entity reference
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- When href equals text content, treat the link as an auto link (if enabled)
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- SSR features are removed.
- Update ProseMirror packages.
- Update ProseMirror packages to latest versions.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - @remirror/core-helpers@2.0.0-beta.10
  - remirror@2.0.0-beta.10
  - @remirror/extension-react-tables@2.0.0-beta.10
  - @remirror/react@2.0.0-beta.10
  - @remirror/styles@2.0.0-beta.10
  - create-context-state@2.0.0-beta.9

## 1.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update jsx-dom to v7.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror packages to latest versions.
- Update prosemirror packages.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- add helper to get shortest entity reference
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages.
- When href equals text content, treat the link as an auto link (if enabled)
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- SSR features are removed.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.9
  - @remirror/extension-react-tables@2.0.0-beta.9
  - @remirror/react@2.0.0-beta.9
  - @remirror/core-helpers@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/styles@2.0.0-beta.9
  - create-context-state@2.0.0-beta.8

## 1.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- Update ProseMirror packages to latest versions.
- Transform a hard break into `\n` in `Node.textContent`.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- Update jsx-dom to v7.
- When href equals text content, treat the link as an auto link (if enabled)
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages.
- add helper to get shortest entity reference
- Expose the return type of the throttle and debounce helpers
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/styles@2.0.0-beta.8
  - remirror@2.0.0-beta.8
  - @remirror/extension-react-tables@2.0.0-beta.8
  - @remirror/react@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - @remirror/core-helpers@2.0.0-beta.8
  - create-context-state@2.0.0-beta.7

## 1.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- SSR features are removed.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- When href equals text content, treat the link as an auto link (if enabled)
- Update ProseMirror packages to latest versions.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Update prosemirror packages.
- Update ProseMirror packages.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Update jsx-dom to v7.
- Try to require JSDOM implicitly in node environment.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Transform a hard break into `\n` in `Node.textContent`.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.7
  - @remirror/extension-react-tables@2.0.0-beta.7
  - @remirror/react@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - @remirror/styles@2.0.0-beta.7
  - create-context-state@2.0.0-beta.6
  - @remirror/core-helpers@2.0.0-beta.7

## 1.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Update jsx-dom to v7.
- Fix the issue that PlaceholderExtension passed with the extension list doesn't work.
- SSR features are removed.
- `OnChangeHTML` and `OnChangeJSON` won't listen to the first update.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Try to require JSDOM implicitly in node environment.
- When href equals text content, treat the link as an auto link (if enabled)
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update prosemirror packages.
- Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/styles@2.0.0-beta.6
  - remirror@2.0.0-beta.6
  - @remirror/extension-react-tables@2.0.0-beta.6
  - @remirror/react@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - @remirror/core-helpers@2.0.0-beta.6
  - create-context-state@2.0.0-beta.5

## 1.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Update prosemirror packages.
- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.5
  - @remirror/extension-react-tables@2.0.0-beta.5
  - @remirror/react@2.0.0-beta.5
  - @remirror/core-helpers@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5
  - @remirror/styles@2.0.0-beta.5
  - create-context-state@2.0.0-beta.4

## 1.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update prosemirror packages.
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Transform a hard break into `\n` in `Node.textContent`.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.4
  - @remirror/pm@2.0.0-beta.4
  - @remirror/extension-react-tables@2.0.0-beta.4
  - @remirror/react@2.0.0-beta.4
  - @remirror/core-helpers@2.0.0-beta.4
  - @remirror/styles@2.0.0-beta.4
  - create-context-state@2.0.0-beta.3

## 1.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update prosemirror packages.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Transform a hard break into `\n` in `Node.textContent`.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - @remirror/core-helpers@2.0.0-beta.3
  - @remirror/extension-react-tables@2.0.0-beta.3
  - remirror@2.0.0-beta.3
  - @remirror/react@2.0.0-beta.3
  - @remirror/styles@2.0.0-beta.3
  - create-context-state@2.0.0-beta.2

## 1.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Transform a hard break into `\n` in `Node.textContent`.
- SSR features are removed.
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Update prosemirror packages.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/extension-react-tables@2.0.0-beta.2
  - @remirror/react@2.0.0-beta.2
  - create-context-state@2.0.0-beta.1
  - remirror@2.0.0-beta.2
  - @remirror/core-helpers@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2
  - @remirror/styles@2.0.0-beta.2

## 1.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Fix `onSendableReceived` handler so it is actually debounced as intended.

  Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality

- Transform a hard break into `\n` in `Node.textContent`.
- Update ProseMirror packages to latest versions.
- Rename `useEvent` to `useEditorEvent` to avoid confusion with the React hook of the same name

  Remove the deprecated `useEvents` hook

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - remirror@2.0.0-beta.1
  - @remirror/extension-react-tables@2.0.0-beta.1
  - @remirror/react@2.0.0-beta.1
  - @remirror/core-helpers@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1
  - @remirror/styles@2.0.0-beta.1
  - create-context-state@2.0.0-beta.0

## 1.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.0
  - @remirror/extension-react-tables@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - remirror@2.0.0-beta.0
  - @remirror/react@2.0.0-beta.0
  - @remirror/styles@2.0.0-beta.0

## 0.1.83

> 2022-05-31

### Patch Changes

- Lock ProseMirror pacakges to lower versions.

  The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

  See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624

* Fix rendering and parsing of tasklists in markdown

* Updated dependencies []:
  - @remirror/pm@1.0.20
  - remirror@1.0.85

## 0.1.82

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

- Prevent checkbox toggle when view is not editable

- Updated dependencies []:
  - remirror@1.0.84
  - @remirror/extension-react-tables@1.0.39
  - @remirror/react@1.0.39

## 0.1.81

> 2022-05-27

### Patch Changes

- Return `false` when list indent and dedent commands won't work.

* Make sure NodeFormattingExtension works well with list extensions for `Tab` and `Shift-Tab` shortcuts.

* Updated dependencies []:
  - remirror@1.0.83

## 0.1.80

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

* Add a hook, and 2 React components to simplify subscribing to document changes.

  Adds a `useDocChanged` hook, which when given a handler function, calls it with the transactions and state when document is changed.

  ```js
  import { useCallback } from 'react';
  import { useDocChanged } from '@remirror/react';

  useDocChanged(
    useCallback(({ tr, transactions, state }) => {
      console.log('Transaction', tr);
      console.log('Transactions', transactions);
      console.log('EditorState', state);
    }, []),
  );
  ```

  Also adds two React components, `OnChangeJSON` and `OnChangeHTML` which accept a handler function, which is called with the JSON or HTML serialisation of doc state, whenever the document is changed.

  ```jsx
  import { useCallback } from 'react';
  import { OnChangeJSON, OnChangeHTML } from '@remirror/react';

  const handleChangeJSON = useCallback((json) => {
    console.log('JSON serialised state', json);
  }, []);

  const handleChangeHTML = useCallback((html) => {
    console.log('HTML serialised state', html);
  }, []);

  return (
    <Remirror manager={manager} autoRender>
      <OnChangeJSON onChange={handleChangeJSON} />
      <OnChangeHTML onChange={handleChangeHTML} />
    </Remirror>
  );
  ```

- Allow react-editors to provide values for `initialContent`, `editable`, `autoFocus`, `hooks` and `stringHandler`.

- Updated dependencies []:
  - remirror@1.0.82
  - @remirror/extension-react-tables@1.0.38
  - @remirror/react@1.0.38

## 0.1.79

> 2022-05-18

### Patch Changes

- Support font sizes using `min`, `max` or `clamp`. Avoid error if value cannot be parsed.

* Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

- Fix paste of tables in React Tables extension

- Updated dependencies []:
  - remirror@1.0.81
  - @remirror/extension-react-tables@1.0.37
  - @remirror/react@1.0.37

## 0.1.78

> 2022-05-16

### Patch Changes

- Fix open depths in node paste rules.

  When excuting a node paste rule, only reset open depths ([openStart](https://prosemirror.net/docs/ref/#model.Slice.openStart) and [openEnd](https://prosemirror.net/docs/ref/#model.Slice.openEnd)) when the node paste rule is actually applied and it's for a block node.

  This patch will fix the extra paragraph after pasting text.

- Updated dependencies []:
  - @remirror/pm@1.0.19

## 0.1.77

> 2022-05-11

### Patch Changes

- Remove annotation support from yjs-extension

- Updated dependencies []:
  - remirror@1.0.80

## 0.1.76

> 2022-05-05

### Patch Changes

- Update ProseMirror packages.

* Add support for `autoLinkAllowedTLDs` which enables the restriction of auto links to a set of Top Level Domains (TLDs). Defaults to the top 50 TLDs (as of May 2022).

  For a more complete list, you could replace this with the `tlds` or `global-list-tlds` packages.

  Or to extend the default list you could

  ```ts
  import { LinkExtension, TOP_50_TLDS } from 'remirror/extensions';
  const extensions = () => [
    new LinkExtension({ autoLinkAllowedTLDs: [...TOP_50_TLDS, 'london', 'tech'] }),
  ];
  ```

  Tweak auto link regex to prevent match of single digit domains (i.e. 1.com) and remove support for hostnames ending with "." i.e. "remirror.io."

- Allow `transformMatch` to invalidate a paste rule by explicitly returning `false`

- Updated dependencies []:
  - @remirror/pm@1.0.18
  - remirror@1.0.79

## 0.1.75

> 2022-05-03

### Patch Changes

- Insert emoticons when hitting the Enter key (rather than requiring a space)

* Simplify the paste rule regex.

- Paste multiple block nodes correctly.

- Updated dependencies []:
  - remirror@1.0.78
  - @remirror/extension-react-tables@1.0.36
  - @remirror/react@1.0.36
  - @remirror/pm@1.0.17

## 0.1.74

> 2022-04-26

### Patch Changes

- Add a new hook `useExtensionEvent`. You can use it to add event handlers to your extension. It's simpler and easier to use than the existed `useExtension` hook.

  It accepts an extension class, an event name and a memoized handler. It's important to make sure that the handler is memoized to avoid needless updates.

  Here is an example of using `useExtensionEvent`:

  ```ts
  import { useCallback } from 'react';
  import { HistoryExtension } from 'remirror/extensions';
  import { useExtensionEvent } from '@remirror/react';

  const RedoLogger = () => {
    useExtensionEvent(
      HistoryExtension,
      'onRedo',
      useCallback(() => log('a redo just happened'), []),
    );

    return null;
  };
  ```

* Update dependencies.

- Fix a crash with React v18 in development mode.

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.35
  - @remirror/react@1.0.35

## 0.1.73

> 2022-04-25

### Patch Changes

- Fixes iframe dimensions not being preserved on content restored - https://github.com/remirror/remirror/issues/1615

- Updated dependencies []:
  - remirror@1.0.77

## 0.1.72

> 2022-04-25

### Patch Changes

- Fix a potential out of range error.

- Updated dependencies []:
  - @remirror/extension-react-tables@1.0.34
  - @remirror/react@1.0.34

## 0.1.71

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - remirror@1.0.76
  - @remirror/extension-react-tables@1.0.33
  - @remirror/react@1.0.33

## 0.1.70

> 2022-04-20

### Patch Changes

- Prevent italic input rule activation in middle of words

* Reorder the external plugins of the tables extensions, to avoid highlighting cells while resizing.

  Proposed by Pierre\_ on Discord

- Prevent marks in MentionAtom, to prevent input rules being triggered within the node

* Fix an error with auto link preventing input rules at the end of a document

- Create a "stepping stone" for future standardisation of useEvent types

  Add a second parameter to handlers for `hover` and `contextmenu` types, so we can eventually standarise the hook to pass event as the first argument.

  ```tsx
  const handleHover = useCallback(({ event: MouseEvent }, props: HoverEventHandlerState) => {
    const { getNode, hovering, ...rest } = props;
    console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

    return false;
  }, []);

  useEvent('hover', handleHover);
  ```

* Prevent onUpdateLink from being called in nodes that disallow marks

* Updated dependencies []:
  - remirror@1.0.75
  - @remirror/extension-react-tables@1.0.32
  - @remirror/react@1.0.32

## 0.1.69

> 2022-04-06

### Patch Changes

- Fix a RangeError when the document is updated during the resizing.

- Updated dependencies []:
  - remirror@1.0.74

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
