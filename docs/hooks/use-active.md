---
hide_title: true
title: 'useActive'
---

# `useActive`

```tsx
const active = useActive();
```

## Parameters

`autoUpdate` (Optional)

> A boolean indicating whether this hook should trigger a component render when the editor state changes.
>
> Default true.

## Return value

An object containing all the nodes and marks in your editor, which when called as functions returns `true` if the node/mark is present within the current user selection.

## Description

This hooks helps you determine whether nodes or marks from your chosen extensions are present within the current user selection.

#### Empty selections (cursors)

If the user's cursor (denoted by "⏐") was present within

> Some blockquote with **bold⏐ text** and _italic text_.

`active.bold()` would return **true** - similarly `active.blockquote()` would also return **true**.

Conversely `active.italic()` would return **false** as it is not present in the current user's selection.

#### Range selections

With <mark>range selections</mark>

> Some blockquote <mark>with **bold text** and _italic text_.</mark>

`active.bold()`, `active.italic()` and `active.blockquote()` would all return **true**, as they are present within the range selection.

#### Filtering by attributes

Some extensions provide nodes/marks with attributes, for instance the [HeadingExtension](/docs/extensions/heading-extension) provides a `level` attribute indicating which heading level (`<h1>`-`<h6>`) to use.

`useActive` provides a means of filtering results by attribute values. So you could determine the difference between different heading levels.

Given some editor content like, and a cursor ("⏐") position

> ## Heading 2⏐
>
> Some text
>
> ### Heading 3
>
> More text

`active.heading()` would return **true**

`active.heading({ level: 2 })` would return **true**

`active.heading({ level: 3 })` would return **false**

Multiple attribute values can be provided to the filter (where all values must match). Any attributes not provided will be ignored.

Mark attribute filtering is also supported.

## Usage

This hook is most commonly used to modify the toggle state of toolbar buttons, or set the selected item in a dropdown.

Here we use `active.code()` to toggle a class name, and the state of `aria-pressed`.

```tsx
const CodeButton = () => {
  const { toggleCode } = useCommands();
  const active = useActive();

  const handleClick = useCallback(() => {
    if (toggleCode.enabled()) {
      toggleCode();
    }
  }, [toggleCode]);

  return (
    <button
      disabled={!toggleCode.enabled()}
      onClick={handleClick}
      className={cx({ isActive: active.code() })}
      aria-pressed={active.code()}
    >
      Code
    </button>
  );
};
```
