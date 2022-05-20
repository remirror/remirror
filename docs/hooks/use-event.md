---
hide_title: true
title: 'useEvent'
---

# `useEvent`

```tsx
useEvent(event, handler);
```

## Parameters

`event`

> A case-sensitive string representing the event type to listen to

`handler`

> A callback function that returns a `boolean`.
>
> When an event of a type matching `event` is triggered, this function will be called.

## Return value

`void`

## Description

This hook allows you to trigger behaviour based on events **within the editor**

The callback function given as the second parameter, should **return a boolean** indicating whether any _other_ event handlers should be run.

```jsx
const handleEvent = useCallback((event) => {
  console.log('Event triggered', event);

  // Prevent other event handlers being run
  // return true;

  // Allow other event handlers to run
  return false;
}, []);
```

`return true` means no other event handlers for this type should be run.

This should be used with caution, as returning true could prevent expected standard browser behaviour.

`return false` means allow other event handlers for this type to be run.

```tsx
const handleMouseDown = useCallback((event) => {
  console.log('Mousedown event occured');
  event.preventDefault();

  // Allow other mouse down event handlers to be run.
  return false;
}, []);

useEvent('mousedown', handleMouseDown);
```

:::tip

`useEvent` is syntax sugar, it is a specialised application of the `useExtension` hook.

```tsx
useExtension(
  EventsExtension,
  ({ addHandler }) => {
    return addHandler(event, handler);
  },
  [event, handler],
);
```

You could create custom hooks and adopt this pattern for other handlers. For instance

```tsx
function useMentionAtomClick(handler) {
  useExtension(
    MentionAtomExtension,
    ({ addHandler }) => {
      return addHandler('onClick', handler);
    },
    [handler],
  );
}
```

:::tip

## Usage

Remirror allows you to listen multiple event types within the editor. These can be used to trigger behaviour via an event handler.

Remirror supports the following events

`blur`, `focus`, `mousedown`, `mouseup`, `mouseenter`, `mouseleave`, `textInput`, `keypress`, `keyup`, `keydown`, `click`, `clickMark`, `contextmenu`, `hover`, `scroll`, `copy`, and `paste`.

Unless listed in the exceptions below, the event handlers have the signature.

```
(event) => boolean
```

### Exceptions

`click` and `clickMark` have a second parameter, an object with helper methods to interrogate the source of the event.

```tsx
const handleClick = useCallback((event, props) => {
  const { pos, ...rest } = props;
  console.log('Clicked pos', pos, 'rest', rest);

  return false;
}, []);

useEvent('click', handleClick);
```

`textinput`, has no associated event, and instead provides a `from` and `to` position, and the added `text`.

`({ from, to, text }) => boolean`

:::warning

The following events will be standardized in a future release of Remirror.

:::warning

Two outliers are the `contextmenu` and `hover` events, for historical reasons they return a helper object as **_both_** the first and second parameter. The **first** parameter only has an `event` property to expose the browser event.

Remirror maintainers plan to standardize this behaviour in a future release, to return just the `event` object as the first argument, and the helper object as the second argument.

To ease your future migration path, use the pattern below - where we deconstruct `event` from the first argument, and use the second argument helper.

```tsx
const handleHover = useCallback(({ event }, props) => {
  const { getNode, hovering, ...rest } = props;
  console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

  return false;
}, []);

useEvent('hover', handleHover);
```

This means in the future, all you would need to do is to replace `{ event }` with `event`, to migrate your code.
