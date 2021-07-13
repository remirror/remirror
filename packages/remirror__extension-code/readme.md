# @remirror/extension-code

> Adds the inline code `mark` to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

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
yarn add @remirror/extension-code

# pnpm
pnpm add @remirror/extension-code

# npm
npm install @remirror/extension-code
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { CodeExtension } from 'remirror/extensions';

const extension = new CodeExtension();
```
