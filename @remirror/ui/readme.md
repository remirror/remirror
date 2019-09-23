<div align="center">
	<br />
	<div align="center">
		<img width="300" src="https://cdn.jsdelivr.net/gh/ifiokjr/remirror/support/assets/logo-icon.svg" alt="remirror" />
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/ui.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/ui) [![npm](https://img.shields.io/npm/dm/@remirror/ui.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/ui) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fui&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/ui/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/ui.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/ui.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fui) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/ui.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fui)

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
