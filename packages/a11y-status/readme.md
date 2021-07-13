# a11y-status

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/a11y-status.svg?)](https://bundlephobia.com/result?p=a11y-status) [![npm](https://img.shields.io/npm/dm/a11y-status.svg?&logo=npm)](https://www.npmjs.com/package/a11y-status)

## Problem

You'd like to update your screen reader users on changes in the status of your ui but don't want to create multiple dom elements to notifiy them.

### Solution

Inject a visually hidden singleton element in the dom which is responsible for notifying screen reader users of updates to the accessibility status of the UI.

## Installation

```bash
yarn add a11y-status # yarn
pnpm add a11y-status # pnpm
npm install a11y-status # npm
```

Note that the `11` is the number eleven. `A-Eleven-Y` is a widely used shorthand for `accessibility`.

## Usage

Import the `setStatus` function from this library and then use the function to set the desired status in your code.

```ts
import { setStatus } from 'a11y-status';

const button = document.querySelector('#insert-selection');
const select = document.querySelector('#selection');

button.addEventListener('click', (event) => {
  const itemName = select.value;

  // Notify the screen reader.
  setStatus(`Selected item: ${itemName}`);
});
```

## Acknowledgements

This code was taken from [downshift](https://github.com/downshift-js/downshift/blob/master/src/set-a11y-status.js)
