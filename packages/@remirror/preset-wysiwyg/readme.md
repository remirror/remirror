# @remirror/preset-wysiwyg

> The preset for your wysiwyg editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-wysiwyg/next
[npm]: https://npmjs.com/package/@remirror/preset-wysiwyg/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-wysiwyg@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-wysiwyg@next
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

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/preset/wysiwyg`.

<br />

## Usage

This preset is designed to be used with the `CorePreset` from `remirror/preset/core`.

The following creates an instance of the preset.

```ts
import { WysiwygPreset } from 'remirror/preset/wysiwyg';

// Create the preset
const preset = new WysiwygPreset();
```
