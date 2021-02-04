# @remirror/preset-wysiwyg

> The preset for your wysiwyg editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

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
yarn add @remirror/preset-wysiwyg

# pnpm
pnpm add @remirror/preset-wysiwyg

# npm
npm install @remirror/preset-wysiwyg
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/presets`.

<br />

## Usage

This preset is designed to be used with the `CorePreset` from `remirror/presets`.

The following creates an instance of the preset.

```ts
import { createCoreManager, wysiwygPreset } from 'remirror/extensions';

// Create a manager which contains the wysiwyg preset.
const manager = createCoreManager(() => wysiwygPreset());
```
