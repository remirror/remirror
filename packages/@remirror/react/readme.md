# @remirror/react

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react.svg?)](https://bundlephobia.com/result?p=@remirror/react) [![npm](https://img.shields.io/npm/dm/@remirror/react.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react)

The react components for the remirror editor

## Installation

```bash
yarn add @remirror/react @remirror/pm # yarn
pnpm add @remirror/react @remirror/pm # pnpm
npm install @remirror/react @remirror/pm # npm
```

## Usage

For in depth usage with proper code example see the [docs](https://remirror.io).

### Controlled Editor

The following example converts all the content to text and appends a list item to the end of every editor after every edit.

Don't do this, as it would actually be a terrible user experience. But it shows what can be done. A more meaningful example will be created soon.

```tsx
import React, { useCallback } from 'react';
import { fromHtml, RemirrorEventListener } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { ListPreset } from 'remirror/extensions';
import {
  createReactManager,
  ReactExtensionUnion,
  RemirrorProvider,
  useManager,
} from 'remirror/react';

type ExtensionUnion = ReactExtensionUnion<ListPreset | BoldExtension>;

const EditorWrapper = () => {
  const boldExtension = new BoldExtension();
  const listPreset = new ListPreset();
  const manager = useManager<ExtensionUnion>([boldExtension, listPreset]);

  const initialValue = manager.createState({
    content: '<p>This is the initial value</p>',
    stringHandler: fromHtml,
  });

  const [value, setValue] = useState(initialValue);

  const onChange: RemirrorEventListener<ExtensionUnion> = useCallback(
    ({ getText, createStateFromContent }) => {
      const newValue = createStateFromContent(`${getText()}<ul><li>Surprise!!!</li></ul>`);
      setValue(newValue);
    },
    [],
  );

  return (
    <RemirrorProvider manager={manager} stringHandler={fromHtml} value={value} onChange={onChange}>
      <div />
    </RemirrorProvider>
  );
};
```
