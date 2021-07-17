# @remirror/extension-link

> Add links to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-link
[npm]: https://npmjs.com/package/@remirror/extension-link
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-link
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-link
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-link/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-link

# pnpm
pnpm add @remirror/extension-link

# npm
npm install @remirror/extension-link
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { LinkExtension } from 'remirror/extensions';

const extension = new LinkExtension();
```
