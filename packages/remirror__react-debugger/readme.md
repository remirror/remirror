# @remirror/react-debugger

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react-debugger.svg?)](https://bundlephobia.com/result?p=@remirror/react-debugger) [![npm](https://img.shields.io/npm/dm/@remirror/react-debugger.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react-debugger)

Debug your `remirror` editor via this debugging tool.

## Installation

```bash
yarn add @remirror/react-debugger # yarn
pnpm add @remirror/react-debugger # pnpm
npm install @remirror/react-debugger # npm
```

## Usage

For in depth usage with proper code example see the [docs](https://remirror.io)

### Prosemirror Dev Tools

The following will render the development view in your editor. For more information on what's possible see the [docs][prosemirror-dev-tools].

```tsx
import React from 'react';
import {
  BoldExtension,
  corePreset,
  ItalicExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import { Remirror, useRemirror } from 'remirror/react';
import { ProsemirrorDevTools } from '@remirror/react-debugger';

const extensions = () => [
  ...corePreset(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
];

const Editor = () => {
  const { manager } = useRemirror({ extensions });

  return (
    <Remirror manager={manager} autoRender={true}>
      <ProsemirrorDevTools />
    </Remirror>
  );
};
```

[prosemirror-dev-tools]: https://github.com/d4rkr00t/prosemirror-dev-tools
