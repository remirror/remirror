---
hide_title: true
title: Styling
---

## Styling the editor

Remirror requires styles for the editor to function correctly across different browsers. These styles can be added in the following ways:

With plain css make sure to wrap your editor with the class `.remirror-theme`. This adds the CSS variables with their default values to the dom, for consumption by any editors within this area.

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

import { MyEditor } from './my-editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <ThemeProvider>
      <AllStyledComponent>
        <MyEditor />
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

import { MyEditor } from './my-editor';

// Wrap your editor with the component.
const App = () => {
  return (
    <ThemeProvider>
      <AllStyledComponent>
        <MyEditor />
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
