# @remirror/extension-trailing-node

> Make sure there's always space to type in your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-trailing-node
[npm]: https://npmjs.com/package/@remirror/extension-trailing-node
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-trailing-node
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-trailing-node
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-trailing-node/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-trailing-node

# pnpm
pnpm add @remirror/extension-trailing-node

# npm
npm install @remirror/extension-trailing-node
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { TrailingNodeExtension } from 'remirror/extensions';

const extension = new TrailingNodeExtension();
```
