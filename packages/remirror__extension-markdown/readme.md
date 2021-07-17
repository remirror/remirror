# @remirror/extension-markdown

> Output markdown from your editor

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-markdown
[npm]: https://npmjs.com/package/@remirror/extension-markdown
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-markdown
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-markdown
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-markdown/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-markdown

# pnpm
pnpm add @remirror/extension-markdown

# npm
npm install @remirror/extension-markdown
```

## Why

This extension adds support for converting your Prosemirror content to markdown.

This works by transforming the markdown content you provided into html and then using the built in DOMParser to transform the html to a ProseMirror node.

## Usage

The following code creates an instance of this extension.

```ts
import { MarkdownExtension } from 'remirror/extension';

const extension = new MarkdownExtension();
```

##
