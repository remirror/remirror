# @remirror/extension-italic

> Adds italic formatting to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-italic
[npm]: https://npmjs.com/package/@remirror/extension-italic
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-italic
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-italic
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-italic/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-italic

# pnpm
pnpm add @remirror/extension-italic

# npm
npm install @remirror/extension-italic
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { ItalicExtension } from '@remirror/extension-italic';

const extension = new ItalicExtension();
```
