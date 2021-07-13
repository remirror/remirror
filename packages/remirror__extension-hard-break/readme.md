# @remirror/extension-hard-break

> Add `br` tags to your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-hard-break
[npm]: https://npmjs.com/package/@remirror/extension-hard-break
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-hard-break
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-hard-break
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-hard-break/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-hard-break

# pnpm
pnpm add @remirror/extension-hard-break

# npm
npm install @remirror/extension-hard-break
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { HardBreakExtension } from 'remirror/extensions';

const extension = new HardBreakExtension();
```
