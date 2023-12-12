# @remirror/extension-find

> Find all of your favourite things in the remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-find
[npm]: https://npmjs.com/package/@remirror/extension-find
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-find
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-find
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-find/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-find

# pnpm
pnpm add @remirror/extension-find

# npm
npm install @remirror/extension-find
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { FindExtension } from 'remirror/extensions';

const extension = new FindExtension();
```
