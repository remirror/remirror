# @remirror/preset-template

> **TEMPLATE_DESCRIPTION**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-template
[npm]: https://npmjs.com/package/@remirror/preset-template
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-template
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-template
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-template/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-template

# pnpm
pnpm add @remirror/preset-template

# npm
npm install @remirror/preset-template
```

<br />

## Usage

The following creates an instance of the preset.

```ts
import { templatePreset } from 'remirror/extensions';

// Create the preset which returns an array of extensions.
const extensions = templatePreset();
```
