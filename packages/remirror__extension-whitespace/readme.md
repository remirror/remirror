# @remirror/extension-whitespace

> **Manage whitespace within your editor.**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-whitespace
[npm]: https://npmjs.com/package/@remirror/extension-whitespace
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-whitespace
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-whitespace
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-whitespace/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-whitespace

# pnpm
pnpm add @remirror/extension-whitespace

# npm
npm install @remirror/extension-whitespace
```

## Usage

The following code creates an instance of this extension.

```ts
import { WhitespaceExtension } from '@remirror/extension-whitespace';

const extension = new WhitespaceExtension();
```

## Acknowledgements

This extension was heavily inspired by [`prosemirror-invisibles`](https://github.com/guardian/prosemirror-invisibles).
