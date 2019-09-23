# @remirror/dev

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/dev.svg?)](https://bundlephobia.com/result?p=@remirror/dev) [![npm](https://img.shields.io/npm/dm/@remirror/dev.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/dev)

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
