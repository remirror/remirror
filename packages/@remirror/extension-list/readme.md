# @remirror/extension-list

> The list preset and accompanying extensions.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-list/next
[npm]: https://npmjs.com/package/@remirror/extension-list/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-list
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-list
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-list/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/extension-list @remirror/pm

# pnpm
pnpm add @remirror/extension-list @remirror/pm

# npm
npm install @remirror/extension-list @remirror/pm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror`.

<br />

## Usage

The following creates an editor which supports both ordered and bullet lists.

```ts
import { BulletListExtension, OrderedListExtension } from 'remirror/extensions';
import { createCoreManager } from 'remirror/extensions';

const manager = createCoreManager(() => [new BulletListExtension(), new OrderedListExtension()]);
```
