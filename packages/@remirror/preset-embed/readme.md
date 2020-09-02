# @remirror/preset-embed

> Add embedded content into your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/preset-embed
[npm]: https://npmjs.com/package/@remirror/preset-embed
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-embed
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-embed
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-embed/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-embed@next @remirror/pm@next

# pnpm
pnpm add @remirror/preset-embed@next @remirror/pm@next

# npm
npm install @remirror/preset-embed@next @remirror/pm@next
```

<br />

## Usage

The following creates an instance of the preset.

```ts
import { EmbedPreset } from '@remirror/preset-embed';

// Create the preset
const preset = new EmbedPreset();
```
