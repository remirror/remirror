# @remirror/extension-history

> Add undo and redo history to your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-history
[npm]: https://npmjs.com/package/@remirror/extension-history
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-history
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-history
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-history/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-history

# pnpm
pnpm add @remirror/extension-history

# npm
npm install @remirror/extension-history
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { HistoryExtension } from 'remirror/extensions';

const extension = new HistoryExtension();
```

The `CorePreset` includes this extension so may never need to interact with it directly.
