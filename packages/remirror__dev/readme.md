# @remirror/dev

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/dev.svg?)](https://bundlephobia.com/result?p=@remirror/dev) [![npm](https://img.shields.io/npm/dm/@remirror/dev.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/dev)

Development tools to make life easier when building your editor.

## Installation

```bash
yarn add @remirror/dev@next # yarn
pnpm add @remirror/dev@next # pnpm
npm install @remirror/dev@next # npm
```

## Usage

For in depth usage with proper code example see the [docs](https://remirror.io)

### Prosemirror Dev Tools

The following will render the development view in your editor. For more information on what's possible see the [docs][prosemirror-dev-tools].

```tsx
import React from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { CorePreset } from 'remirror/preset/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { RemirrorProvider } from '@remirror/react';
import { RemirrorProvider, useManager } from '@remirror/react';

const Editor = () => {
  const manager = useManager([
    new CorePreset(),
    new BoldExtension(),
    new ItalicExtension(),
    new UnderlineExtension(),
  ]);

  return (
    <RemirrorProvider manager={manager} autoRender={true}>
      <ProsemirrorDevTools />
    </RemirrorProvider>
  );
};
```

[prosemirror-dev-tools]: https://github.com/d4rkr00t/prosemirror-dev-tools
