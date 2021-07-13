# prosemirror-paste-rules

> Better handling of pasted content in the editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/prosemirror-paste-rules
[npm]: https://npmjs.com/package/prosemirror-paste-rules
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=prosemirror-paste-rules
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/prosemirror-paste-rules
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/prosemirror-paste-rules/red?icon=npm

<br />

## The problem

You want to automatically transform pasted content within your editor into nodes marks, or different text.

## This solution

`prosemirror-paste-rules` allows the transformation of plain text pasted content into marks and nodes.

<br />

## Installation

```bash
# yarn
yarn add prosemirror-paste-rules prosemirror-view prosemirror-state prosemirror-keymap

# pnpm
pnpm add prosemirror-paste-rules prosemirror-view prosemirror-state prosemirror-keymap

# npm
npm install prosemirror-paste-rules prosemirror-view prosemirror-state prosemirror-keymap
```

The installation requires the installation of the peer dependencies `prosemirror-view`, `prosemirror-state` and `prosemirror-model` to avoid version clashes.

<br />

## Getting Started

```ts
import { paste } from 'prosemirror-paste-rules';
import { schema } from 'prosemirror-schema-basic';

// Include the plugin in the created editor state.
const state = EditorState.create({
  schema,
  plugins: [paste([])],
});
```
