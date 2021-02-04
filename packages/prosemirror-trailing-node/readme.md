# prosemirror-trailing-node

> "A trailing node plugin for the prosemirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/prosemirror-trailing-node
[npm]: https://npmjs.com/package/prosemirror-trailing-node
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=prosemirror-trailing-node
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/prosemirror-trailing-node
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/prosemirror-trailing-node/red?icon=npm

<br />

## The problem

You want your editor to always have allow exiting the current non-empty node.

## This solution

`prosemirror-trailing-node` allows you to set a default node that will be appended to the end of the document.

<br />

## Installation

```bash
# yarn
yarn add prosemirror-trailing-node prosemirror-view prosemirror-state prosemirror-keymap

# pnpm
pnpm add prosemirror-trailing-node prosemirror-view prosemirror-state prosemirror-keymap

# npm
npm install prosemirror-trailing-node prosemirror-view prosemirror-state prosemirror-keymap
```

The installation requires the installation of the peer dependencies `prosemirror-view`, `prosemirror-state` and `prosemirror-model` to avoid version clashes.

<br />

## Getting Started

```ts
import { schema } from 'prosemirror-schema-basic';
import { trailingNode } from 'prosemirror-trailing-node';

// Include the plugin in the created editor state.
const state = EditorState.create({
  schema,
  plugins: [trailingNode({ ignoredNodes: [], nodeName: 'paragraph' })],
});
```
