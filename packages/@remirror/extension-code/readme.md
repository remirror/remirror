# @remirror/extension-code

> Adds the inline code `mark` to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-code
[npm]: https://npmjs.com/package/@remirror/extension-code
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-code
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-code
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-code/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-code@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-code@next @remirror/pm@next

# npm
npm install @remirror/extension-code@next @remirror/pm@next
```

## Usage

The following code creates an instance of this extension.

```ts
import { CodeExtension } from '@remirror/extension-code';

const extension = new CodeExtension();
```
