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
npm add remirror @remirror/react @remirror/pm
```

Installing `remirror` gives you access to all the extensions and core packages that are actively developed in the [`remirror`](https://github.com/remirror/remirror) repository.

`@remirror/pm` is a peer dependency of `remirror` and all the Remirror packages.

:::note

The `@remirror/pm` dependency provides access to all the core `prosemirror-*` libraries and is used by all the Remirror packages to ensure that each package is using the exact same version of the `prosemirror-*` package. It ensures consistent library versions across the ecosystem and can also simplify your codebase.

If you plan on developing your own extension or framework package then please use `@remirror/pm/state` rather than the `prosemirror-state` packages. Both point to the exact same files but the scoped package means that the versions installed by end users will always be consistent.

:::note
