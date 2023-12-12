---
'@remirror/preset-wysiwyg': major
'remirror': major
'@remirror/extension-positioner': minor
'@remirror/react-components': minor
'@remirror/react-ui': minor
'@remirror/icons': minor
'@remirror/extension-find': patch
---

## 💥 BREAKING CHANGES! 💥

## Removed deprecated `SearchExtension` in favour of `FindExtension`

TLDR: `SearchExtension` has been removed from Remirror v3 completely, please use `FindExtension` instead.

`SearchExtension` has been deprecated since we released `FindExtension`, as `FindExtension` offers more features and is more performant.

Furthermore, as `SearchExtension` was previously exposed directly via `remirror/extensions`, and configurable via `presetWysiwyg` - we have updated both of these access points to expose `FindExtension` instead.

If using `presetWysiwyg`, the config options for `SearchExtension` will need updating to their `FindExtension` equivalents.

#### Before: Remirror v2 example

```tsx
import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

const extensions = () =>
  wysiwygPreset({
    alwaysSearch: true,
  });

const UsingWysiwygPreset = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text to search</p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      />
    </ThemeProvider>
  );
};

export default UsingWysiwygPreset;
```

#### After: Diff for Remirror v3 example

```diff
import React from 'react';
import { wysiwygPreset } from "remirror/extensions";
import { Remirror, ThemeProvider, ToggleBoldButton, Toolbar, useRemirror } from '@remirror/react';

const extensions = () => wysiwygPreset({
-  alwaysSearch: true,
+  alwaysFind: true,
});

// Rest as above
```

## Features

To make the find functionality easy to use "out-of-the-box" we have added a new `<FindButton />` component to the _optional_ `@remirror/react-ui` package.

This button can be used within a `Toolbar` (also exposed via `@remirror/react-ui`) to present a find and replace popup in the top right of your editor.

![A screenshot of the find and replace popup from the FindButton](https://github.com/remirror/remirror/assets/2003804/eaada9b5-fc85-4705-876a-e994d82c5fa8)

### Example usage of `FindButton`

This following example is taken from our [Storybook](https://remirror.vercel.app/?path=/story/extensions-find--basic).

```tsx
import 'remirror/styles/all.css';

import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { FindButton, Toolbar } from '@remirror/react-ui';

const FindButtonExample: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: wysiwygPreset,
    content: '<p>Using the <code>&lt;FindButton /&gt;</code> from <code>@remirror/react-ui</code>.',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <Toolbar>
          <FindButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default FindButtonExample;
```
