---
hide_title: true
title: Installation
---

# Installation

Rather than installing multiple scoped packages, the `remirror` package is a gateway to using all the goodness that remirror provides while minimising your bundle size.

Use the installation instruction outlined below, depending on the package manager used in your project.

```bash
yarn add remirror
```

```bash
pnpm add remirror
```

```bash
npm install remirror
```

::: note

The additional requirement to install the dependency `@remirror/pm` has been removed and it will automatically be installed for you when consuming `remirror`. You can still install it if you wish since it is a peer dependency for all scoped `@remirror` packages which interact with `prosemirror-*` APIs. It ensures consistent library versions across the ecosystem and can simplify your codebase.

:::

## Required styles

Remirror requires styles for the editor to function correctly across different browsers. These styles can be added in the following ways:

With plain css:

```ts
import 'remirror/styles/all.css';
```

The following options assume you have the peer dependencies already installed.

Or with `@emotion/styled`:

```tsx
import React from 'react';

import { AllStyledComponent } from '@remirror/styles/emotion';

import { Editor } from './editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <AllStyledComponent>
      <Editor />
    </AllStyledComponent>
  );
};
```

Or with `styled-components`:

```tsx
import React from 'react';

import { AllStyledComponent } from '@remirror/styles/styled-components';

import { Editor } from './editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <AllStyledComponent>
      <Editor />
    </AllStyledComponent>
  );
};
```

Or with `emotion` and the DOM.

```ts
// Or with `emotion` using the DOM
import { addStylesToElement, allStyles } from '@remirror/styles/dom';

const wrapperElement = document.createElement('div');
addStylesToElement(wrapperElement, allStyles);
```

In order to use the `styled-components` or `emotion` variants you will need to also install `@remirror/styles`.

## Browser support

Remirror aims to be compatible with all browsers released since **2017**.

If you are using remirror with a project like [`next.js`](https://nextjs.org/) or [`gatsby`](https://www.gatsbyjs.org/) you will also need to add the following browserlist configuration.

To use this configuration in your own project you can add the following to your `package.json` file. Tools like `babel` and `postcss` are aware of this configuration.

```json
{
  "browserslist": ["since 2017"]
}
```

You can also use a `.browserlistrc` file.

```markup
since 2017
```

The main reason for this configuration is to support class syntax properly. Projects like `next.js` automatically compile your code down to `es5` which causes problems when extending classes. If you don't plan on creating your own extensions or presets, you can ignore this requirement.
