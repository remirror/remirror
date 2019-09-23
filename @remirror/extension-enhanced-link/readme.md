# @remirror/extension-enhanced-link

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-enhanced-link.svg?)](https://bundlephobia.com/result?p=@remirror/extension-enhanced-link) [![npm](https://img.shields.io/npm/dm/@remirror/extension-enhanced-link.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/extension-enhanced-link)

Add support for automated links in the editor as a replacement for the `Link` extension provided in the [`@remirror/core-extensions`](../core-extensions) library.

The regex matcher has been pulled from the [social-text](https://github.com/social/social-text/blob/752b9476d5ed00c2ec60d0a6bb3b34bd5b19bcf9/js/src/regexp/extractUrl.js) library.

## Installation

```bash
yarn add @remirror/extension-enhanced-link
```

## Usage

```ts
import { EnhancedLinkExtension } from '@remirror/extension-enhanced-link';

new EnhancedLinkExtension({ onUrlsChange: (urls) => log('Changed urls', urls) }),
```
