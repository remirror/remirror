---
hide_title: true
title: Installation
---

# Installation

Rather than installing multiple scoped packages, the `remirror` package is a gateway to using all the goodness that remirror provides while minimising your bundle size.

Use the installation instruction outlined below, depending on the package manager used in your project.

```bash
yarn add remirror@next @remirror/pm@next
```

```bash
pnpm add remirror@next @remirror/pm@next
```

```bash
npm install remirror@next @remirror/pm@next
```

You will also notice that you are also installing `@remirror/pm`. This is a peer dependency to all the scoped `@remirror` packages which interact with `prosemirror-*`. It provides some assurances around the versions of prosemirror libraries being used and helps simplify the codebase.

## Required styles

Remirror requires styles for the editor to function correctly across different browsers. These styles can be added in the following ways:

```ts
// Plain CSS
import 'remirror/styles/all.css';
```

```ts
// Or with `@emotion/styled`
import { AllStyledComponent } from '@remirror/styles/emotion';
```

```ts
// Or with `styled-components`
import { AllStyledComponent } from '@remirror/styles/styled-components';
```

```ts
// Or with `emotion` using the DOM
import { addStylesToElement, allStyles } from 'remirror/styles/dom';

const wrapperElement = document.createElement('div');
addStylesToElement(wrapperElement, allStyles);
```

In order to use the `styled-components` or `emotion` variants you will need to also install `@remirror/styles@next`.

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
