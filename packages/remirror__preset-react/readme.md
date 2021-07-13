# @remirror/preset-react

> The preset which provides all required `React` extensions for your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-react
[npm]: https://npmjs.com/package/@remirror/preset-react
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-react
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-react
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-react/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-react

# pnpm
pnpm add @remirror/preset-react

# npm
npm install @remirror/preset-react
```

This package is available via `remirror/presets` when you install `remirror`.

<br />

## Usage

This preset adds

- Server side support for nodes and marks.
- Transformations for server side components.
- Placeholder support for the editor.

```ts
import { RemirrorManager } from 'remirror';
import { reactPreset } from 'remirror/extensions';

// Create the Editor Manager with the required preset.
const manager = RemirrorManager.create(() => [...reactPreset()]);
```

The `useRemirror` hook automatically adds both the `CorePreset` and `ReactPreset` to the editor so you may never need to reference this package directly.
