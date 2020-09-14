# @remirror/extension-placeholder

> TEMPLATE_DESCRIPTION

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-placeholder/next
[npm]: https://npmjs.com/package/@remirror/extension-placeholder/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-placeholder@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-placeholder
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-placeholder/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-placeholder@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-placeholder@next @remirror/pm@next

# npm
npm install @remirror/extension-placeholder@next @remirror/pm@next
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extension/placeholder`.

## Usage

The following code creates an instance of this extension.

```ts
import { PlaceholderExtension } from 'remirror/extension/placeholder';

const extension = new PlaceholderExtension();
```
