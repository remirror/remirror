---
slug: announcement-v3
title: Introducing Remirror v3 🎉
author: Will Hawker
author_title: Remirror Maintainer
author_url: https://github.com/whawker
author_image_url: https://avatars.githubusercontent.com/u/2003804?v=4
tags: [remirror, announcement]
---

_TLDR: Remirror aims to be a better citizen, by not imposing our architectural decisions on to you._

<!-- truncate -->

Introducing Remirror v3 🎉

## 🧐 Why?

This version aims to make it **easier to use Remirror in existing applications**, by not imposing _our_ architectural decisions on to you.

The core of Remirror v2 relied on packages such as `@mui/material` to power our menus and toolbars, and `@lingui/core` to provide internationalisation (i18n) support.

However, after gathering feedback from the Remirror community, we found that most users wanted to integrate Remirror into _existing_ applications, where **design systems were already in place**, and **i18n solutions already present**.

This meant **Remirror's core created unnecessary pain points** - translations needed to be encoded _specifically for Remirror_, in a different way to the rest of the application. For other users the menus we provided didn't fit with their application's existing design system, so Remirror ended up bloating the application unnecessarily with MUI components that weren't even used.

To alleviate these pain points we have **removed these features from the core**, and **moved them into _optional_ packages**.

This enables Remirror to continue to support its main goal:

:::note Remirror goal: "From Newbie to Pro"

Designed to grow with your skill set. Start with the out-of-the-box editor. Customize with components, React hooks, down to bare metal ProseMirror.

:::

Our "out-of-the-box" editors (components exposed via `@remirror/react-editors`) include these new optional packages by default, **so should have no breaking changes**.

However, for more advanced scenarios we can use our Lego principle, allowing Remirror users to choose modules that make sense for their use case and build bespoke experiences for their applications.

## ✨ What's new?

### Internationalisation changes

:::info

"Out-of-the-box" (`@remirror/react-editors`) editors unaffected, these have been updated to keep v2 behaviour.

:::

In Remirror v3, we want to **allow _any_ i18n library to be used with Remirror**, instead of forcing Lingui upon you.

The root `<Remirror />` component now supports an **`i18nFormat` prop**, that allows you to plug in _any_ i18n library, by implementing a definition for this function.

If you want to keep the existing behaviour from v2, you can pass the `i18nFormat` function exposed from the now _optional_ package `@remirror/i18n`

We have [Storybook examples](https://pr2213-remirror-ocavue.vercel.app/?path=/story/i18n-format-js--basic) showing integrations with many populate i18n libraries, and our ["How to migrate"](#-how-to-migrate) section below.

### Menu and Toolbar changes

:::info

"Out-of-the-box" (`@remirror/react-editors`) editors unaffected, these have been updated to keep v2 behaviour.

:::

Remirror v3 decouples the React core of Remirror from MUI, reducing the size of `@remirror/react` considerably, as installing `@remirror/react` will no longer bundle `@mui/material` too

The MUI components (menus and toolbars) previously exposed by `@remirror/react` **have been moved to a new _optional_ package** - `@remirror/react-ui`.

Additionally, these MUI components **should now adhere to the theme of the parent application**, if you're already using MUI.

The components themselves should have no breaking changes, only their import paths have changed.

For a full list of affected components, please see our ["How to migrate"](#-how-to-migrate) section below.

### Built-in decorators updated

:::info

This is an internal change, **there should be no breaking changes to the public API**.

:::

Our decorators (i.e. `@extension`, `@command`, `@keyBinding`, etc), have been updated to use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax, instead of [TypeScript's experimental decorator](https://www.typescriptlang.org/tsconfig#experimentalDecorators) syntax.

### Some extensions are no longer provided as part of the default installation

:::info

"Out-of-the-box" (`@remirror/react-editors`) editors unaffected, they did not utilize these features

:::

Remirror v3 decouples the core of Remirror from CodeMirror 5 and Yjs, reducing the size of `@remirror/core` (and hence the main entry point `remirror`).

If you require CodeMirror (v5) and Yjs (collaborative editing) features in your editor, **you will need to install the extensions directly**.

Additionally, the **_React_** Tables extension is no longer bundled with the `@remirror/react` entry point - **you will need to install the extension directly**.

These extensions are still supported, the only difference is they are no longer bundled by default. Please **consult the [migration guide](/docs/migration-v3)**.

### Updating third party dependencies to latest versions

We have upgraded Prettier and Styled Components to their latest versions to ensure Remirror doesn't hinder your codebase from updating these dependencies in your codebase.

Prettier is used to power the default formatter of the CodeBlock extension, however as Prettier's **v3** API is _asynchronous_, the `formatCodeBlock` command can no longer be chained with other commands.

In addition, if you provide your own `formatter` to `CodeBlockExtension` it is now expected that the formatter is asynchronous. I.e. it _resolves_ formatted code via a Promise.

### Mention atoms as plain text

We've made a small change to ensure mention atoms are included in plain text by returning their `label` attribute value.

This can be modified using the `nodeOverrides` API and overriding the `leafText` function.

### Removal of deprecated features

Remirror v3 also removes deprecated features, but in the vast majority of changes alternatives exist. We have highlighted a few of the key removals below, but the rest with be covered in the **[migration guide](/docs/migration-v3)**

#### `SearchExtension` removed, please use `FindExtension` instead

The `FindExtension` moves out of beta and into the core, as it offers more features and is more performant than the removed `SearchExtension`.

Furthermore, to make the find functionality easy to use, we have added a new `<FindButton />` component to the _optional_ `@remirror/react-ui` package.

This button can be used within a `Toolbar` (also exposed via `@remirror/react-ui`) to present a find and replace popup in the top right of your editor.

![A screenshot of the find and replace popup from the FindButton](https://github.com/remirror/remirror/assets/2003804/eaada9b5-fc85-4705-876a-e994d82c5fa8)

#### Command "dry run" function `isEnabled` removed, use `enabled` instead

When using commands or chained commands, you can "dry run" the command to see if it can be executed against the current editor state.

For instance, you can check if `toggleBold` is enabled by running `toggleBold.enabled()` which returns a boolean indicating whether it is possible, without actually changing the editor's state.

`.isEnabled()` was an alias of `.enabled()`, but this alias has now been removed. Please use `.enabled()` instead.

## ⬆️ How to migrate?

Please **consult the [migration guide](/docs/migration-v3)** and reach out on [Discord](https://remirror.io/chat) if you run into any issues.

## 👂 Feedback

As always **we'd really love your feedback**. Please raise any [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).

As always, reach out to use via our [Discord server](https://remirror.io/chat) if you have any suggestions on how we could improve Remirror in general.

## 🙏 Thanks

Massive thanks to [ocavue](https://github.com/ocavue) and [mdmower](https://github.com/mdmower) for all their help and contributions, bringing v3 to reality.
