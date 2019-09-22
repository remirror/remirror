# @remirror/ui-a11y-status

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/ui-a11y-status.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/ui-a11y-status) [![npm](https://img.shields.io/npm/dm/@remirror/ui-a11y-status.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/ui-a11y-status) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fui-a11y-status&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/ui-a11y-status/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/ui-a11y-status.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/ui-a11y-status.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fui-a11y-status) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/ui-a11y-status.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fui-a11y-status)

## Problem

You'd like to update your screen reader users on changes in the status of your
ui but don't want to create multiple dom elements to notifiy them.

### Solution

Inject a visually hidden singleton element in the dom which is responsible for notifying screen
reader users of updates to the accessibility status of the UI.

## Installation

```bash
yarn add @remirror/ui-a11y-status
```

Note that the `11` is two digit ones. It is a widely used shorthand for typing `accessibility`.

## Usage

Import the `setStatus` function from this library and then use the function to
set the desired status in your code.

```ts
import { setStatus } from '@remirror/ui-a11y-status';

const button = document.getElementById('insert-selection');
const select = document.getElementById('selection');

button.addEventListener('click', event => {
  const itemName = select.value;

  // Notify the screen reader.
  setStatus(`Selected item: ${itemName}`);
});
```

## Acknowledgements

This code was taken from [downshift](https://github.com/downshift-js/downshift/blob/master/src/set-a11y-status.js)
