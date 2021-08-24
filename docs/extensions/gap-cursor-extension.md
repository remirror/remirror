---
hide_title: true
title: 'GapCursorExtension'
---

# `GapCursorExtension`

## Summary

This will capture clicks near and arrow-key-motion past places that don't have a normally selectable position nearby, and create a gap cursor selection for them. The cursor is drawn as an element with class `ProseMirror-gapcursor`.

Make sure to import the styles:

```ts
import '@remirror/styles/extension-gap-cursor.css';
```

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { GapCursorExtension } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-gap-cursor` package. There are two ways of pulling it into your project.

## API

### Options

### Commands

### Helpers
