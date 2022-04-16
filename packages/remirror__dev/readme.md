# @remirror/dev

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/dev.svg?)](https://bundlephobia.com/result?p=@remirror/dev) [![npm](https://img.shields.io/npm/dm/@remirror/dev.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/dev)

Development tools to make life easier when building your editor.

## Installation

```bash
yarn add @remirror/dev# yarn
pnpm add @remirror/dev# pnpm
npm install @remirror/dev# npm
```

## Usage

For in depth usage with proper code example see the [docs](https://remirror.io)

### Prosemirror Dev Tools

The following will render the development view in your editor. For more information on what's possible see the [docs][prosemirror-dev-toolkit].

```tsx
import React from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, useRemirror } from '@remirror/react';

const Editor = () => {
  const manager = useRemirror({
    extensions: () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()],
  });

  return (
    <Remirror manager={manager} autoRender={true}>
      <ProsemirrorDevTools />
    </Remirror>
  );
};
```

[prosemirror-dev-toolkit]: https://github.com/TeemuKoivisto/prosemirror-dev-toolkit
