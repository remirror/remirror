# @remirror/ui

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/ui.svg?)](https://bundlephobia.com/result?p=@remirror/ui) [![npm](https://img.shields.io/npm/dm/@remirror/ui.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/ui)

This library is the base for all the UI (user interface) components and styles within Remirror. It uses `@emotion/core` and `@styled-system/css`, but was inspired by `theme-ui`.

## Installation

```bash
yarn add @remirror/ui @remirror/core @remirror/react
```

## Usage

Firstly, create the theme or use a custom theme preset.

### `sx`

The `sx` utility comes from the [`@styled-system/css`][styled-system/css] package and is intended for use with the Emotion `css` prop.
It will attempt to use values from the `theme` object for many common CSS properties, and will fall back to raw values when there is no corresponding theme value.

To see a list of supported CSS properties, see the [Styled System CSS docs](https://styled-system.com/css/#theme-keys).

```js
sx(styleObject)(theme);
```

**Usage:**

```jsx
<div css={sx(styles)} />
```

| Argument      | Type   | Description                                                                                          |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `styleObject` | Object | a theme-aware style object with support for responsive array values and Styled System prop shortcuts |
| `theme`       | Object | the Emotion theming context object                                                                   |
