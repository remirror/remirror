# @remirror/extension-annotation

> This extension allows to annotate the content in your editor

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-annotation/next
[npm]: https://npmjs.com/package/@remirror/extension-annotation/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-annotation
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-annotation
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-annotation/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-annotation @remirror/extension-positioner @remirror/pm

# pnpm
pnpm add @remirror/extension-annotation @remirror/extension-positioner @remirror/pm

# npm
npm install @remirror/extension-annotation @remirror/extension-positioner @remirror/pm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { AnnotationExtension } from 'remirror/extensions';

const extension = new AnnotationExtension();
```
