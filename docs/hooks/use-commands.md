---
hide_title: true
title: 'useCommands'
---

# `useCommands`

```tsx
const allCommands = useCommands();
```

## Parameters

N/A

## Return value

An object containing all the commands available in the editor.

## Description

This hooks exposes all the commands from your chosen extensions (and those built in by default).

For instance the command `selectText` is provided by a built-in extension and always available. However `toggleBold` would require the `BoldExtension` to be present.

[Commands](/docs/getting-started/commands-and-helpers#commands) allow you to modify editor state.

## Usage

By convention, when using this hook, you deconstruct the commands needed for your use case.

```tsx
const { toggleHeading } = useCommands();
```

Each command can be called as a function, passing the arguments as required.

```tsx
const handleToggleHeading = useCallback(() => {
  toggleHeading({ level: 1 });
}, [toggleHeading]);
```

However, be aware that a command might not make sense in the current selection context. For instance, you cannot add a link within a code block.

Remirror provides the `<commandName>.enabled()` property on each command, so you can disable or hide parts of your UI where the command is not available.

:::tip

It is good practice to pass the same arguments to `.enabled()`, as you do the command itself, to ensure accurate results.

:::tip

```tsx
<button onClick={handleToggleHeading} disabled={!toggleHeading.enabled({ level: 1 })}>
  Toggle heading
</button>
```

## Multiple commands

If you are using an **uncontrolled** editor, you can use multiple commands from `useCommands` one after the other without concern.

```jsx
const { toggleBold, toggleItalic } = useCommands();

const handleToggleBoldItalic = useCallback(() => {
  // N.B. This only works in uncontrolled editors
  toggleBold();
  toggleItalic();
}, [toggleBold, toggleItalic]);
```

When using a **controlled** editor, multiple commands must be performed via _chained_ commands instead (via the `useChainedCommands` hook).

See [potential pitfalls](/docs/react/controlled/#potential-pitfalls) in the controlled editor documentation for a in-depth description of the problem.

## Custom Dispatch (Advanced)

`useCommands` exposes a command `customDispatch` that allows you to dispatch ProseMirror transactions directly to the editor.

This allows you to write ad-hoc [command functions](/docs/getting-started/commands-and-helpers#how-this-works-advanced) that enable the bare-metal power of ProseMirror.

```tsx
const insertCustomText = (text = 'Powered by Remirror!') => {
  return ({ tr, dispatch }) => {
    if (!isTextSelection(tr.selection)) {
      return false;
    }

    dispatch?.(tr.insertText(text));

    return true;
  };
};

const Button = () => {
  const { customDispatch } = useCommands();

  const handleClick = useCallback(() => {
    customDispatch(insertCustomText());
  }, [customDispatch]);

  return <button onClick={handleClick}>Click me!</button>;
};
```

:::tip

Consider whether your custom commands might be better suited as proper commands surfaced by a [custom extension](/docs/getting-started/custom-extension).

:::tip
