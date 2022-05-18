---
hide_title: true
title: 'useChainedCommands'
---

# `useChainedCommands`

```tsx
const chain = useChainedCommands();
```

## Parameters

`tr` (optional)

> A transaction to append chained steps to.
>
> Defaults to a new transaction

## Return value

An object containing all the chainable commands available in the editor, an introspection method `enabled()`, as well as two chain terminating methods - `run()` and `tr()`.

## Description

This hook exposes all the _chainable_ commands from your chosen extensions (and those built in by default).

[Commands](/docs/getting-started/commands-and-helpers#commands) allow you to modify editor state.

When a command obtained from `useChainedCommands` is called, it returns an object containing other chainable commands. This allows you to form chains of multiple commands.

:::info

We are using the terminology "chainable commands" as not all commands are chainable, for instance `undo` or `redo` cannot be chained. The reasons why are explored in [this blog post](/blog/chainable-commands/#caveats).

:::info

Commands from `useChainedCommands` differ from their [`useCommands`](/docs/hooks/use-commands) cousins in _when_ they are dispatched. Commands from `useCommands` are dispatched _immediately_ - whereas chained commands **are not dispatched until you call `.run()` on the chain**.

## Usage

This hook is most commonly used in _controlled_ editor scenarios - where chained commands are the only way to dispatch multiple commands at the same time. This hook can however be used for _both_ controlled and uncontrolled editor scenarios.

By convention, when using this hook, you do **not** deconstruct the commands returned from the hook. Instead, we keep a reference to the entire chain.

```tsx
const chain = useChainedCommands();
```

By convention, we also dispatch the commands with `run()` in the same React render phase as when the commands were created. That is to say we `run()` the commands in the same callback as we create them.

```tsx
const handleToggleHeading = useCallback(() => {
  chain.toggleHeading({ level: 1 }).focus().run();
}, [toggleHeading]);
```

A command chain does not have to be one continuous statement - the chain will cache any previous commands, meaning you can break your chain up with conditional statements.

```jsx
const chain = useChainedCommands();

const handleUpdateHref = useCallback(
  (href) => {
    chain.focus();

    if (href === '') {
      chain.removeLink();
    } else {
      chain.updateLink({ href });
    }

    chain.run();
  },
  [chain],
);
```

### Greedy application of commands

Command chains are greedy - when `run()` they will try to apply as many commands as they can, **even if some commands fail**.

:::info

For the code samples below, assume we are **_not_** within a callout node, and therefore `updateCallout` cannot not be applied.

:::info

Consider the following chain:

```tsx
const chain = useChainedCommands();

const handleClick = useCallback(() => {
  chain.toggleBold().updateCallout({ type: 'info' }).toggleItalic().run();
}, [chain]);
```

When this chain is `run()` the `toggleBold` and `toggleItalic` _are_ dispatched, but the second command `updateCallout` is **not** (as we're not within a callout, there is nothing to update).

By default, `run()` will try and greedily dispatch as many commands as it can.

To opt out of this greedy behaviour, you can;

1. Check if an entire command chain is valid by interrogating it's `enabled()` property.

   ```tsx
   const chain = useChainedCommands();

   const handleClick = useCallback(() => {
     chain.toggleBold().updateCallout({ type: 'info' }).toggleItalic();

     // No commands would be dispatched in this scenario (as run is never called), so the chain is preserved.
     if (chain.enabled()) {
       chain.run();
     }
   }, [chain]);
   ```

2. Choose to exit the chain when a command fails with `exitEarly`. This also destroys the chain.

   ```tsx
   const chain = useChainedCommands();

   const handleClick = useCallback(() => {
     chain.toggleBold().updateCallout({ type: 'info' }).toggleItalic();

     // No commands would be dispatched in this scenario, and chain is destroyed.
     chain.run({ exitEarly: true });
   }, [chain]);
   ```
