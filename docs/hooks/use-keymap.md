---
hide_title: true
title: 'useKeymap'
---

# `useKeymap`

```tsx
useKeymap(name, handler);
useKeymap(name, handler, priority);
```

## Parameters

`name`

> A string describing a key combination. This can be a single key like `'Enter'`, or multiple keys seperated by a dash, i.e. `'Mod-s'`.
>
> :::tip
>
> In ProseMirror you can use `Mod` as a shorthand for `Cmd` on Mac, and `Ctrl` on other platforms.
>
> :::tip

`handler`

> A callback function that returns a `boolean`.
>
> When a key press matching `name` is activated, this function will be called.

`priority` (Optional)

> Overrides the priority of this key handler. Defaults to `ExtensionPriority.Medium`;

## Return value

`void`

## Description

This hook allows you to create custom keyboard shortcuts that trigger behaviour.

The callback function given as the second parameter, should **return a boolean** indicating whether any _other_ key handlers should be run.

```jsx
const handleKeyPress = useCallback(({ tr, state, dispatch, next }) => {
  console.log('Key combination pressed');

  // Prevent other key handlers being run
  // return true;

  // Not applicable here, run other key handlers
  // return false;

  // Run other key handlers (allows for composition - see below)
  return next();
}, []);
```

`return true` means no other key handlers should be run.

This should be used with caution, especially with common keyboard shortcuts like `Enter`, as returning true could prevent things like creating a new line. Consider `return next()` instead.

`return false` means this key handler is not applicable, and other key handlers should be run.

`return next()` allows for composition (and improved readability), see [Composing key handlers](#composing-key-handlers) below.

```tsx
const onSave = useCallback(
  ({ state }) => {
    console.log('Mod and S key pressed!');

    // Prevents any further key handlers from being run.
    return true;
  },
  [getJSON],
);

useKeymap('Mod-s', onSave);
```

## Usage

When combined with other Remirror hooks, such as `useCommands` or `useHelpers` you can create powerful features for novice and power users alike.

Here we use the `getJSON` helper to extract the editor state as JSON and "save to backend" when the user presses `Cmd + S` on Mac, or `Ctrl + S` on other platforms.

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

:::tip

Commands exposed by `useCommands` have a property `.original()` this will expose the raw command in a form acceptable to `useKeymap`.

```tsx
const { toggleCode } = useCommands();
// Avoid this pattern for common keys like 'Enter' or 'Backspace'
useKeymap('Mod-/', toggleCode.original());
```

**WARNING:** commands return a boolean, which will prevent other key handlers being run when the command returns true.

:::tip

## Composing key handlers

The `useKeymap` callback will receive a property `next`.

Consider using `return next()` instead of `return true/false`.

- Using instead of `return true` will allow you to _compose_ multiple behaviours (still return true if you want to override everything)
- Using instead of `return false` will improve the readability of your code by making the intention clearer.

```tsx
import { ExtensionPriority } from 'remirror';
import { useHelpers, useKeymap } from 'remirror/extensions';

export function useKeyboardAnalytics() {
  const { sendEvent } = useSomeAnalyticsProvider();

  const onSave = useCallback(
    ({ next }) => {
      sendEvent({ type: 'keyboard', shortcut: 'Mod-s' });

      // returning true would prevent other handlers for Mod-s being run
      // which would break our existing saveToBackend functionality (above)

      // Instead, we return next, which will run other key handlers too
      return next();
    },
    [sendEvent],
    ExtensionPriority.Highest,
  );

  useKeymap('Mod-s', onSave);
}
```
