# @remirror/extension-file

> Add files to your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-file
[npm]: https://npmjs.com/package/@remirror/extension-file
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-file
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-file
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-file/red?icon=npm

## Beta

Note this extension is in beta, so its API may change without a bump to the major semver version.

## Installation

```bash
yarn add @remirror/extension-file # yarn
pnpm add @remirror/extension-file # pnpm
npm install @remirror/extension-file # npm
```

This is **NOT** included by default when you install the recommended `remirror` package.

```ts
import { FileExtension } from '@remirror/extension-file';
```

The extension is provided by the `@remirror/extension-file` package.

## Usage

The following code creates an instance of this extension.

```ts
import { DropCursorExtension } from 'remirror/extensions';
import { FileExtension } from '@remirror/extension-file';

const extension = new FileExtension();
```
