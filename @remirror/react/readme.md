# @remirror/react

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react.svg?)](https://bundlephobia.com/result?p=@remirror/react)
[![npm](https://img.shields.io/npm/dm/@remirror/react.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react)

The react components for the remirror editor

## Installation

```bash
yarn add @remirror/react # yarn
pnpm add @remirror/react # pnpm
npm install @remirror/react # npm
```

## Usage

For in depth usage with proper code example see the [docs](https://docs.remirror.org).

### Controlled Editor

The following example converts all the content to text and appends a list item to the end of every
editor after every edit.

Don't do this, as it would actually be a terrible user experience. But it shows what can be done. A
more meaningful example will be created soon.

```ts
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { ListPreset } from 'remirror/preset/list';
import { fromHtml, RemirrorEventListener } from 'remirror/core';
import {
  RemirrorProvider,
  createReactManager,
  ReactCombinedUnion,
  useManager,
  useCreateExtension,
  useCreatePreset,
} from 'remirror/react';

type Combined = ReactCombinedUnion<ListPreset | BoldExtension>;

const EditorWrapper = () => {
  const boldExtension = useCreateExtension(BoldExtension);
  const listPreset = useCreatePreset(ListPreset);
  const manager = useManager<Combined>([boldExtension, listPreset]);

  const initialValue = manager.createState({
    content: '<p>This is the initial value</p>',
    stringHandler: fromHtml,
  });

  const [value, setValue] = useState(initialValue);

  const onChange: RemirrorEventListener<Combined> = useCallback(
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
