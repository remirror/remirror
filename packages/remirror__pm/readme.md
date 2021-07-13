# @remirror/pm

> All the bundled prosemirror dependencies which are required for the remirror core libraries.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/pm
[npm]: https://npmjs.com/package/@remirror/pm
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/pm
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/pm
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/pm/red?icon=npm

## Installation

```bash
yarn add @remirror/pm # yarn
pnpm add @remirror/pm # pnpm
npm install @remirror/pm # npm
```

## Usage

This bundles up the prosemirror libraries into one package to make development and consumption of the remirror codebase simpler. All prosemirror libraries are available as **es-modules** which makes tree shaking with rollup, webpack and other build tools possible.

This library is a required peer dependency when using remirror in your codebase. You might never need to use it directly, but in case you do, here's a snippet of how to do so.

```ts
// Top level provides types and utilities for converting commands.
import type { EditorSchema } from '@remirror/pm';
import { chainableEditorState } from '@remirror/pm';
```

```ts
// Nested imports provides access to the individual prosemirror library exports.
import { EditorState } from '@remirror/pm/state';
import { Suggest } from '@remirror/pm/suggest';
import { View } from '@remirror/pm/view';
```
