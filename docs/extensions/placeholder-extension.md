---
hide_title: true
title: 'PlaceholderExtension'
---

import { Example } from '@components';

# `PlaceholderExtension`

## Summary

This extension shows a placeholder when the **ProseMirror** content of your editor is empty.

## Features

### Custom styling

The placeholder can be styled with a custom CSS class.

<Example name="ExtensionPlaceholderCustomStyling" />

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { placeholderExtension } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-placeholder` package. There are two ways of pulling it into your project.

### Examples

<Example name="ExtensionPlaceholderBasic" />

## API

### Options

### Commands

### Helpers
