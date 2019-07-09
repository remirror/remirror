# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project will adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) when it reaches `v1.0.0`.

## [Unreleased]

### Added

- 🚀 `@remirror/extension-collaboration`: Collaboration library added based on the brilliant example available in [tiptap](https://github.com/scrumpy/tiptap).
- 🚀 `@remirror/extension-mention`: Mentions can now be picked up from pasting data.
- `@remirror/core`: Add `CommandNodeTypeParams`, `CommandMarkTypeParams`, `CommandTypeParams` which is now passed to the `commands` method for extensions.
- `@remirror/core`: Add `getActions` to the params of all extension manager methods. This will throw an error if called before and during initialization.
- `jest-prosemirror`: Enable editorViewOptions for the `createEditor` method. For example, now it is possible to intercept transactions with the `dispatchTransaction` hook.
- 🚀 `@remirror/cli`: A command line interface for remirror which currently only supports bundling an editor for use in the react-native WebView.
- 🚀 `@remirror/native`: New package with experimental support for react-native.
- 🚀 `@remirror/native-bridge`: New package for bridging the DOM libraries with the native webview.

### Changed

- 💥 **BREAKING `@remirror/core`:** Rename `getEditorState` to `getState`.
- 💥 **BREAKING `@remirror/core`:** Change method `getPortalContainer` to property `portalContainer` on the extension manager.
- 💥 **BREAKING `@remirror/extension-mention`:** Complete rewrite of internals and public API with better tests and more robust editing.
- 💥 **BREAKING `@remirror/extension-mention`:** Change `MentionExtension` from `NodeType` to `MarkType`. Text is now editable after a mention is created.
- 💥 **BREAKING `@remirror/react`:** Rename `setChildAsRoot` to `childAsRoot` on `RemirrorContextProviderProps` and all it consumers. This affects the `RemirrorContextProvider`, `RemirrorProvider` and `ManagedRemirrorProvider` exports. The prop now can take a boolean or the object with props to inject into the root.
- 💥 **BREAKING `@remirror/react`:** All RemirrorProviders now require a `children` prop. This prevents a bug when rendering in non-dom environments.
- 💥 **BREAKING `@remirror/react`:** `dispatchTransaction` has been renamed to `onDispatchTransaction`. It now must return a `transaction` and can be used to edit the transaction that will be used to create a new state.

- 🐛 `@remirror/core`: Fix bug with extension manager failing to provide attributes from the extensions.
- 🐛 `@remirror/core`: Fix TypeScript type of SSRComponent. Change from `Component` to `ComponentType`.
- 🐛 `@remirror/editor-twitter`: Fix bug where text area didn't expand to full height of editor container.
- 🐛 `@remirror/react`: Fix a bug with the positioner when used at the end of the document.

## [0.3.0] - 2019-07-06

### Added

- `@remirror/react`: Add `withoutEmotion` which, when set to `true`, removes emotion (css-in-js) from the `Remirror` component. This is for those who don't like css-in-js and would like to work directly with the raw editor without random styles injected. Consuming the `@remirror/react-components` or any of the `@remirror/editor-*` packages will require the use of emotion.
- `@remirror/react-utils`: Add `oneChildOnly` export which throws readable errors for invalid children props.

### Changed

- 💥 **BREAKING `@remirror/react-utils`:** Rename `childIsFunction` to `propIsFunction` and make it a _pseudo_ predicate function (returns true when it doesn't throw an error).
- 💥 **BREAKING `@remirror/editor-twitter`:** Rename `uiTwitterTheme` to `TwitterEditorTheme`.
- 💥 **BREAKING `@remirror/core`:** Rename `HasExtensions` to `ExtensionListParams`.
- 💥 **BREAKING `@remirror/core`:** Rename `markActive` to `isMarkActive` use a destructured parameters object instead of positional arguments.
- 💥 **BREAKING `@remirror/core`:** It is now up to extensions to decide whether commands should be active when the editor is editable. `isEditable` method is now passed into the `commands` method as a means of checking.
- 💥 **BREAKING `@remirror/react`:** All RemirrorProviders now require a `children` prop. This prevents a bug when rendering in non-dom environments.

- `@remirror/react`: `view.updateState` is now called before `Remirror.setState`.
- Add support for [Git Large File Storage (LFS)](https://git-lfs.github.com/)
- `@remirror/editor-twitter`, `@remirror/editor-wysiwyg` : Use image-snapshot testing to ensure SSR and DOM rendered editors are identical.
- Update husky command from ~~`yarn stop:hooks`~~ and ~~`yarn start:hooks`~~ to `yarn husky:stop` and `yarn husky:start`.

### Remove

- 💥 **BREAKING `@remirror/react-utils` `@remirror/react` `@remirror/editor-markdown` `@remirror/editor-wysiwyg`:** Remove customRootProp from `RemirrorProps`.
- 💥 **BREAKING `@remirror/core`:** Remove `isEditable` guard from command functions. It is now up to the command or the caller to decide if it should run when the editor is not editable. To help with this command params with the method `isEditable` are passed to the `commands` method of the extension.
- 💥 **BREAKING `@remirror/core`:** Remove exports `GetItemParamsMethod`
  `createFlexibleFunctionMap` `hasExtensionProperty` `extensionPropertyMapper` `transformExtensionMap` `ignoreFunctions`.

## [0.2.0] - 2019-06-18

### Added

- Support for server side rendering (SSR) with passing integration tests for NextJS.
- Support for plain extension with styles impacting SSR (PlaceholderExtension can be rendered in SSR).
- **`@remirror/core`:** `ssrTransformer` added to extension methods as a way of wrapping and transforming the JSX element produced on the server.
- **`@remirror/core`:** `SSRComponent: React.ComponentType<any>` option added to `MarkExtensionOptions` and `NodeExtensionOptions` as a way of overriding the component rendered in an SSR environment.
- **`@remirror/core`:** `SSRHelpersExtension` added as a shorthand way of defining SSR transformations via ssrTransformer.
- **`@remirror/core`:** `injectBrIntoEmptyParagraphs` added for better SSR rendering.
- **`@remirror/react-utils`:** `isReactFragment` added to test if an element is a fragment.
- Create better unit tests for SSR.
- Add a changelog with changes starting from `v0.1.0`

### Changed

- 💥 **BREAKING:** Rename `@remirror/ui-*` packages to `@remirror/editor-*` for example @remirror/ui-twitter is .now called `@remirror/editor-twitter`.
- 💥 **BREAKING `@remirror/editor-twitter`:** Rename `UITwitter` and `TwitterUI` to `TwitterEditor`.
- 💥 **BREAKING `@remirror/editor-markdown`:** Rename `UIMarkdown` and `MarkdownUI` to `MarkdownEditor`.
- 💥 **BREAKING `@remirror/editor-wysiwyg`:** Rename `UIWysiwyg` and `WysiwygUI` to `WysiwygEditor`.
- Speed up tslint by enforcing linting on individual modules (new `tsconfig.lint.json` files).
- Remove `cx` import from `emotion` library in from `@remirror/core` to reduce the bundle size.
- Set `@emotion/core` and `@emotion/styled` as peer dependencies.

### Remove

- 💥 **BREAKING:** `@remirror/ui-*` packages.

## [0.1.0] - 2019-06-10

### Added

- Enable remirror as a controlled component #79 #78.
- @remirror/ui-markdown - Still in progress.
- @remirror/extension-multicursor - this is currently just a stub (almost no code).
- @remirror/api-documenter - will be used to generate the api documentation.

### Changed

- **BREAKING:** Rename all extensions to include an Extension postfix. e.g. Emoji is now EmojiExtension. This will hopefully reduce name collisions in the future.
- Improves the puppeteer testing by separating it out from unit tests in the package.
- Upgrade docz to v1 #65.
- General improvements to docs.
- Fixes missing TypeScript definitions #77.
- Fixes crash when rendering a ReactNodeView in NextJS #75.

[unreleased]: https://github.com/ifiokjr/remirror/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/ifiokjr/remirror/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ifiokjr/remirror/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ifiokjr/remirror/releases/tag/v0.1.0
