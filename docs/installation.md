---
hide_title: true
title: Installation
---

# Installation

Use the installation instruction outlined below, depending on the package manager used in your project.

```bash
yarn add remirror @remirror/pm
```

```bash
pnpm add remirror @remirror/pm
```

```bash
npm install remirror @remirror/pm
```

Installing `remirror` gives you access to all the extensions and core packages that are actively developed in the [`remirror`](https://github.com/remirror/remirror) repository.

`@remirror/pm` is a peer dependency of `remirror` and all the remirror packages.

::: note

The `@remirror/pm` dependency provides access to all the core `prosemirror-*` libraries and is used by all the remirror packages to ensure that each package is using the exact same version of the `prosemirror-*` package. It ensures consistent library versions across the ecosystem and can also simplify your codebase.

If you plan on developing your own extension or framework package then please use `@remirror/pm/state` rather than the `prosemirror-state` packages. Both point to the exact same files but the scoped package means that the versions installed by end users will always be consistent.

:::

## Styling the editor

Remirror requires styles for the editor to function correctly across different browsers. These styles can be added in the following ways:

With plain css make sure to wrap your editor with the class `.remirror-theme`. This adds the css variables with their default values to the dom, for consumption by any editors within this area.

Then import the styles from the `remirror/styles` endpoint as shown below.

```ts
import 'remirror/styles/all.css';
```

The following options assume you have the peer dependencies already installed.

Or with `@emotion/styled`:

```tsx
import React from 'react';
import { ThemeProvider } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import { Editor } from './editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <ThemeProvider>
      <AllStyledComponent>
        <Editor />
      </AllStyledComponent>
    </ThemeProvider>
  );
};
```

Or with `styled-components`:

```tsx
import React from 'react';
import { ThemeProvider } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/styled-components';

import { Editor } from './editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <ThemeProvider>
      <AllStyledComponent>
        <Editor />
      </AllStyledComponent>
    </ThemeProvider>
  );
};
```

Or with `emotion` and the DOM.

```ts
// Or with `emotion` using the DOM
import { THEME } from 'remirror';
import { addStylesToElement, allStyles } from '@remirror/styles/dom';

const wrapperElement = document.createElement('div');
wrapperElement.classList.add(THEME); // Add the css variables to the dom.
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

The main reason for this configuration is to support class syntax properly. Projects like `next.js` automatically compile your code down to `es5` which causes problems when extending classes. If you don't plan on creating your own extensions or framework, you can ignore this requirement.
