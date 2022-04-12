---
hide_title: true
title: 'useHelpers'
---

# `useHelpers`

```tsx
const allHelpers = useHelpers();
```

## Parameters

N/A

## Return value

An object containing all the commands available in the editor.

## Description

This hooks exposes all the helpers from your chosen extensions (and those built in by default).

For instance `getJSON` is provided by a built-in extension and always available. However `getMarkdown` would require the `MarkdownExtension` to be present.

[Helpers](/docs/getting-started/commands-and-helpers#helpers) allow you to read editor state.

## Usage

By convention, when using this hook, you deconstruct the helpers needed for your use case.

```tsx
const { getJSON } = useHelpers();
```

Each helper can be called as a function, passing the arguments as required.

```tsx
const { getJSON } = useHelpers();

const onSave = useCallback(
  ({ state }) => {
    saveToBackend(getJSON(state));

    // Prevents any further key handlers from being run.
    return true;
  },
  [getJSON],
);

useKeymap('Mod-s', onSave);
```
