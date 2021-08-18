---
hide_title: true
title: 'LinkExtension'
---

# `LinkExtension`

## Summary

This extension adds links to your text editor.

## Features

### Auto detect links

The editor will automatically detect links if `autoLink` attribute is enabled:

```tsx
import { Remirror } from '@remirror/react';

export const AutoLink: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new LinkExtension({ autoLink: true })],
  });

  return <Remirror manager={manager} />;
};
```

### Handle clicks

The extension calls the `onClick` handlers when the user clicks on a link. This can be used to e.g. open the link in another tab:

```tsx
const extension = new LinkExtension();
extension.addHandler('onClick', (_, data) => {
  window.location.href = data.href;
  return true;
});
```

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { LinkExtension } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-link` package. There are two ways of pulling it into your project.

### Examples

See [storybook](https://remirror.vercel.app/?path=/story/extensions-link--basic) for examples.

## API

### Options

### Commands

### Helpers
