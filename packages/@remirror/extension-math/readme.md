# @remirror/extension-math

> **Add math support to your remirror editor with mathjax**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-math/next
[npm]: https://npmjs.com/package/@remirror/extension-math/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-math
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-math
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-math/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-math @remirror/pm

# pnpm
pnpm add @remirror/extension-math @remirror/pm

# npm
npm install @remirror/extension-math @remirror/pm
```

## Usage

The following code creates an instance of this extension.

```ts
import { MathExtension } from '@remirror/extension-math';

const extension = new MathExtension();
```
