<div align="center">
	<br />
	<div align="center">
		<img width="300" src="https://cdn.jsdelivr.net/gh/ifiokjr/remirror/support/assets/logo-icon.svg" alt="remirror" />
    <h1 align="center">extension-enhanced-link</h1>
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-enhanced-link.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/extension-enhanced-link) [![npm](https://img.shields.io/npm/dm/@remirror/extension-enhanced-link.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/extension-enhanced-link) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fextension-enhanced-link&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/extension-enhanced-link/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/extension-enhanced-link.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/extension-enhanced-link.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fextension-enhanced-link) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/extension-enhanced-link.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fextension-enhanced-link)

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
