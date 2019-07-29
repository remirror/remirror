<div align="center">
	<br />
	<div align="center">
		<img width="300" src="https://cdn.jsdelivr.net/gh/ifiokjr/remirror/support/assets/logo-icon.svg" alt="remirror" />
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/dev.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/dev) [![npm](https://img.shields.io/npm/dm/@remirror/dev.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/dev) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fdev&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/dev/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/dev.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/dev.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fdev) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/dev.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fdev)

Development tools to make life easier when building your editor.

## Installation

```bash
yarn add @remirror/dev
```

## Usage

For in depth usage with proper code example see the [docs](https://docs.remirror.org)

### Prosemirror Dev Tools

The following will render the development view in your editor. For more
information on what's possible see the [docs][prosemirror-dev-tools].

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from '@remirror/core-extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { ManagedRemirrorProvider, RemirrorExtension, RemirrorManager } from '@remirror/react';

const MyEditor = () => {
  return (
    <RemirrorManager>
      <RemirrorExtension Constructor={BoldExtension} />
      <RemirrorExtension Constructor={ItalicExtension} />
      <RemirrorExtension Constructor={UnderlineExtension} />
      <ManagedRemirrorProvider
        autoFocus={true}
        attributes={{ 'data-testid': 'editor-instance' }}
        editorStyles={editorStyles}
      >
        <InnerEditor />
        <ProsemirrorDevTools />
      </ManagedRemirrorProvider>
    </RemirrorManager>
  );
};
```

[prosemirror-dev-tools]: https://github.com/d4rkr00t/prosemirror-dev-tools
