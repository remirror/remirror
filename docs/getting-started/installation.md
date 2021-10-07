---
hide_title: true
title: Installation
---

:::note

This tutorial walks you through creating your own editor from scratch. If you would like an out-of-the-box solution - check our [5 min tutorial](/docs/5-min-tutorial).

:::note

# Installation

Use the installation instruction outlined below, depending on the package manager used in your project.

```bash type=installation
yarn add remirror @remirror/react @remirror/pm
```

```bash
pnpm add remirror @remirror/react @remirror/pm
```

```bash
npm add remirror @remirror/react @remirror/pm
```

Installing `remirror` gives you access to all the extensions and core packages that are actively developed in the [`remirror`](https://github.com/remirror/remirror) repository.

`@remirror/pm` is a peer dependency of `remirror` and all the Remirror packages.

:::note

The `@remirror/pm` dependency provides access to all the core `prosemirror-*` libraries and is used by all the Remirror packages to ensure that each package is using the exact same version of the `prosemirror-*` package. It ensures consistent library versions across the ecosystem and can also simplify your codebase.

If you plan on developing your own extension or framework package then please use `@remirror/pm/state` rather than the `prosemirror-state` packages. Both point to the exact same files but the scoped package means that the versions installed by end users will always be consistent.

:::note

## Browser support

Remirror aims to be compatible with all browsers released since **2017**.

If you are using remirror with a project like [`next.js`](https://nextjs.org/) or [`gatsby`](https://www.gatsbyjs.org/) you will also need to add the following browserlist configuration.

To use this configuration in your own project you can add the following to your `package.json` file. Tools like `babel` and `postcss` are aware of this configuration.

```json
{
  "browserslist": ["since 2017"]
}
```

You can also use a `.browserlistrc` file.

```markup
since 2017
```

The main reason for this configuration is to support class syntax properly. Projects like `next.js` automatically compile your code down to `es5` which causes problems when extending classes. If you don't plan on creating your own extensions or framework, you can ignore this requirement.

Great, lets get started creating your first Remirror editor.
