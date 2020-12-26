---
'@remirror/preset-core': major
'@remirror/preset-wysiwyg': major
'@remirror/react': major
'@remirror/react-social': major
'@remirror/core-types': minor
---

**Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends `Remirror.ManagerSettings`.

**Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`. **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions` now extends `Remirror.ManagerSettings`.

**Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a `settings` property for manager settings.

`@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from extension. Apply it to the packages mentioned above.
