# @remirror/preset-wysiwyg

> The preset for your wysiwyg editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/preset-wysiwyg
[npm]: https://npmjs.com/package/@remirror/preset-wysiwyg
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-wysiwyg
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-wysiwyg
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-wysiwyg/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-wysiwyg@next @remirror/pm@next

# pnpm
pnpm add @remirror/preset-wysiwyg@next @remirror/pm@next

# npm
npm install @remirror/preset-wysiwyg@next @remirror/pm@next
```

<br />

## Usage

This preset is designed to be used with the `@remirror/preset-core`.

The following creates an instance of the preset.

```ts
import { WysiwygPreset } from '@remirror/preset-wysiwyg';

// Create the preset
const preset = new WysiwygPreset();
```
