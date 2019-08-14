# @remirror/extension-code-block

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-code-block.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/extension-code-block) [![npm](https://img.shields.io/npm/dm/@remirror/extension-code-block.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/extension-code-block) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fextension-code-block&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/extension-code-block/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/extension-code-block.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/extension-code-block.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fextension-code-block) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/extension-code-block.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fextension-code-block)

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
