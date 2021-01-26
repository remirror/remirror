# @remirror/react

> Hooks and components for consuming `remirror` with your fave framework `React`.

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react.svg?)](https://bundlephobia.com/result?p=@remirror/react) [![npm](https://img.shields.io/npm/dm/@remirror/react.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react)

## Installation

```bash
yarn add @remirror/react # yarn
pnpm add @remirror/react # pnpm
npm install @remirror/react # npm
```

## Usage

For in depth usage with proper code example see the [docs](https://remirror.io).

### Controlled Editor

```tsx
import React, { useCallback } from 'react';
import { fromHtml, RemirrorEventListener } from 'remirror';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { createReactManager, ReactExtensions, Remirror, useRemirror } from '@remirror/react';

type Extension = ReactExtensions<ListPreset | BoldExtension>;
const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const MyEditor = () => {
  const { manager, state, onChange } = useRemirror<Extension>({
    extensions,
    content: '<p>This is the initial value</p>',
    stringHandler: 'html',
  });

  const [value, setValue] = useState(initialValue);

  return <Remirror manager={manager} state={state} onChange={onChange} />;
};
```
