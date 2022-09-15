---
hide_title: true
title: Migration to v2
---

# Migration to Remirror v2

This guide lays out the required steps to migrate from Remirror v1 to Remirror v2.

Consult the [announcement post](/blog/announcement-v2) to learn more about the v2 release.

## Installing

If you are using TypeScript in your project, please remove all `@types/prosemirror-*` dependencies from your `package.json` file, for example, `@types/prosemirror-model` or `@types/prosemirror-view`.

After that, you can update all Remirror packages to the latest version. We recommend using the [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates) package to do this.

```bash
$ npx npm-check-updates --filter '/remirror|prosemirror/' --deep --upgrade --target greatest
```

The command above will update all Remirror packages to the latest version in your `package.json` file. Then you can install them with `npm install`, `yarn install`, or `pnpm install`.

## Deduplicate dependencies

Remirror is a monorepo with multiple packages, with which some package managers struggle nowadays. You could therefore end up with duplicate versions of the same package in your project. We recommend you to check your lockfile (usually `package-lock.json`, `yarn.lock` or `pnpm-lock.yaml`) if you have installed multiple versions of the same package. Look out especially for the following packages:

- `prosemirror-state`
- `prosemirror-model`
- `@remirror/core`
- `@remirror/pm`

If you find any duplicate versions, the easiest way is to remove the lockfile and the `node_modules` directory, then install your dependencies again. However, this will update **all** packages in your project, and you might not want to do that.

If you don't want to update all packages, you can only deduplicate the packages you need. Based on your package manager, you can choose different ways to do that. Here are the best practices for the most common package managers:

- `npm`: run [`npm dedupe`](https://docs.npmjs.com/cli/v8/commands/npm-dedupe)
- `yarn` v1: install and use a third-party tool [`yarn-deduplicate`](https://www.npmjs.com/package/yarn-deduplicate)
- `yarn` v2 or later: run [`yarn dedupe`](https://yarnpkg.com/cli/dedupe) in your project root
- `pnpm`: install and use a third-party tool[`pnpm-deduplicate`](https://www.npmjs.com/package/pnpm-deduplicate)

After deduplicating, please verify in your lockfile again that there aren't any duplicated packages left.

## Updates TypeScript definitions

There are some differences between the typings in the `@types/prosemirror-*` packages and the official typings in the `prosemirror-*` package.

The most significant difference is that the official typings don't include `Schema` in the generic type.

```diff
- Transaction<Schema>
+ Transaction
```

And there are also some minor differences, for example, some parameters now have `readonly` added to them.

You can find more details about the typings differences here: [ProseMirror is now a TypeScript project](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624/).

## Pre-packaged components

V2 replaces the React components exposed by the @remirror/react module. The new components are based on the more popular [MUI](https://mui.com/) instead of the former [Reakit](https://reakit.io) (previously known as Ariakit).

The new components are rendered as proper React components with single responsibility, rather than a single component that expects a complex array as a configuration prop. The v1 toolbar was a single component, which controlled its buttons via an array. However in practice we have found this to be rather inflexible. Whilst you could change the buttons, it was difficult to change the icons, labels and tooltips that were displayed on those buttons.

V2 provides a dedicated React button component for each of the commands you'll likely require for a toolbar. These components accept icon, label or tooltip props to override the defaults. If you find your command doesn't have a dedicated button component, you can render the base button component directly (and perhaps open a PR to add a use case we missed).

A button per command might sound verbose, so V2 also exposes button group components for standard button collections (i.e. bold, italic, underline). The base group component is exposed to create your own groups.

This is very much a work in progress. V2 provides all the groundwork, on which we plan to add further components like the frequently suggested "slash commands" feature (a la Notion). Stay tuned!

As with all Remirror features, we'd very much appreciate any feedback and contributions to make ProseMirror fun to use for React developers.
