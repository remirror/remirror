# @remirror/extension-search

> Find all of your favourite things in the remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-search
[npm]: https://npmjs.com/package/@remirror/extension-search
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-search
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-search
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-search/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-search

# pnpm
pnpm add @remirror/extension-search

# npm
npm install @remirror/extension-search
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { SearchExtension } from 'remirror/extensions';

const extension = new SearchExtension();
```
