# @remirror/extension-code-block

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-code-block.svg?)](https://bundlephobia.com/result?p=@remirror/extension-code-block) [![npm](https://img.shields.io/npm/dm/@remirror/extension-code-block.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/extension-code-block)

Add code highlighting to your codeBlocks.

## Installation

```bash
yarn add refractor @remirror/extension-code-block
```

Refractor is a peer dependency and is needed when adding extra language support.

```ts
import jsx from 'refractor/lang/jsx';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension } from '@remirror/extension-code-block';

new CodeBlockExtension({ supportedLanguages: [typescript, jsx] });
```
