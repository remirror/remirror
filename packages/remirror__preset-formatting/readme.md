# @remirror/preset-formatting

> **A preset with all the formatting node and mark extensions included.**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-formatting
[npm]: https://npmjs.com/package/@remirror/preset-formatting
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-formatting
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-formatting
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-formatting/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-formatting

# pnpm
pnpm add @remirror/preset-formatting

# npm
npm install @remirror/preset-formatting
```

<br />

## Usage

The following creates an instance of the preset.

```ts
import { formattingPreset } from 'remirror/extensions';

// Create the preset which returns an array of extensions.
const extensions = formattingPreset();
```
