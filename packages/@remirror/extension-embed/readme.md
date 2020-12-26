# @remirror/extension-embed

> A collection of extension for adding embedded content into your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-embed/next
[npm]: https://npmjs.com/package/@remirror/extension-embed/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-embed
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-embed
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-embed/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/extension-embed @remirror/pm

# pnpm
pnpm add @remirror/extension-embed @remirror/pm

# npm
npm install @remirror/extension-embed @remirror/pm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

<br />

## Usage

The following adds the support for iFrames in your editor.

```ts
import { IframeExtension } from 'remirror/extensions';
import { createCoreManager } from 'remirror/extensions';

const manager = createCoreManager([new IframeExtension()]);
```
