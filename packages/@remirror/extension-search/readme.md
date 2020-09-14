# @remirror/extension-search

> Find all of your favourite things in the remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-search/next
[npm]: https://npmjs.com/package/@remirror/extension-search/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-search@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-search
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-search/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-search@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-search@next @remirror/pm@next

# npm
npm install @remirror/extension-search@next @remirror/pm@next
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extension/search`.

## Usage

The following code creates an instance of this extension.

```ts
import { SearchExtension } from 'remirror/extension/search';

const extension = new SearchExtension();
```
