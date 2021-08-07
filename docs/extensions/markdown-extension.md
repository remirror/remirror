---
hide_title: true
title: MarkdownExtension
---

import { Example } from '@components';

# `MarkdownExtension`

## Summary

This extension transforms the **ProseMirror** content of your editor to markdown syntax. It also transforms markdown syntax into a **ProseMirror** document.

## Features

### Reduced Storage

Markdown can be used to reduce the storage needed for your documents. It takes less space than a JSON object describing the same editor content.

The following example shows a hook which can be used to automatically persist content as markdown.

<Example name="markdown-basic" />

```ts
import delay from 'delay';
import { useCallback, useState } from 'react';
import { useHelpers, useKeymap } from '@remirror/react';

async function saveContent(content: string) {
  // Fake API call
  await delay(1000);
}

interface UseSaveHook {
  saving: boolean;
  error: Error | undefined;
}

// Create a hook which saves the content as markdown whenever `Ctrl-s` on Mac `Cmd-s` is pressed.
function useSaveHook() {
  const helpers = useHelpers();
  const [state, setState] = useState<UseSaveHook>({ saving: false, error: undefined });

  useKeymap(
    'Mod-s',
    useCallback(() => {
      // Convert the editor content to markdown.
      const markdown = helpers.getMarkdown();

      setState({ saving: true, error: undefined });

      saveContent(markdown)
        .then(() => {
          setState({ saving: false, error: undefined });
        })
        .catch((error) => {
          setState({ saving: true, error });
        });

      return true;
    }, [helpers]),
  );

  return state;
}
```

### Transform existing Markdown

If you already have a lot of markdown content this can be used to transform the markdown content into a ProseMirror `doc` node for your editor.

- The entire document can be set with a markdown string.
- Insert any markdown content into the document at any insertion point.

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { MarkdownExtension, MarkdownOptions } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-markdown` package. There are two ways of pulling it into your project.

### Examples

#### A pure markdown editor

#### A dual editor with markdown

## API

### Options

### Commands

### Helpers
