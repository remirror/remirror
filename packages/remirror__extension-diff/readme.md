# @remirror/extension-diff

> Track user changes in your remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-diff
[npm]: https://npmjs.com/package/@remirror/extension-diff
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-diff
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-diff
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-diff/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-diff

# pnpm
pnpm add @remirror/extension-diff

# npm
npm install @remirror/extension-diff
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { DiffExtension } from 'remirror/extensions';

const extension = new DiffExtension();
```
