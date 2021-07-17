# @remirror/preset-core

> The core preset providing the functionality you need and want.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-core
[npm]: https://npmjs.com/package/@remirror/preset-core
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-core
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-core
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-core/red?icon=npm

<br />

## Installation

```bash
yarn add @remirror/preset-core # yarn
pnpm add @remirror/preset-core # pnpm
npm install @remirror/preset-core # npm
```

This package is available via `remirror/presets` when you install `remirror`.

<br />

## Usage

When added to your editor it will provide the required nodes, marks to your editor.

```ts
import { corePreset, RemirrorManager } from 'remirror';

// Create the Editor Manager with the required preset.
const manager = RemirrorManager.create([...corePreset({ rootContent: 'block*' })]);
```
