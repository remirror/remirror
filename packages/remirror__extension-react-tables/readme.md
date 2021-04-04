# @remirror/extension-react-tables

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-react-tables.svg?)](https://bundlephobia.com/result?p=@remirror/extension-react-tables) [![npm](https://img.shields.io/npm/dm/@remirror/extension-react-tables.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/extension-react-tables)

This package includes two main features: table controllers and table cell menu.

Table controllers are some cells at the top and left side of the table. Table controllers can only be seen when the table is forced. With table controllers, a user can easily achieve the following functions:

1. select a row, a column or the whole table
2. delete a row or a column
3. insert a row or a column

![table controllers](https://user-images.githubusercontent.com/24715727/113511783-3877b600-9594-11eb-86a0-ea6365f953ce.gif)

Table cell menu is a menu component that can be opened by clicking the top-right corner of a table cell. A table menu provides a method for user to trigger some ProseMirror commands:

- insert a column
- delete a column
- insert a row
- delete a column
- delete the table
- change the background color of one or multiple cells

Table cell menu can be triggered when users select multiple cell, in which case the menu button will be placed in the cell where the mouse in.

![table cell menu](https://user-images.githubusercontent.com/24715727/113511776-344b9880-9594-11eb-8539-e5d68eabc28a.gif)

You can customize the looking and the behaviour of the menu button and menu popup by passing related paramters to `TableComponents`.

## Installation

```bash
yarn add @remirror/extension-react-tables # yarn
pnpm add @remirror/extension-react-tables # pnpm
npm install @remirror/extension-react-tables # npm
```

```tsx
import { ReactComponentExtension } from '@remirror/extension-react-component';
import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

const extensions = () => [new ReactComponentExtension(), new TableExtension()];

export const EditorWithTable = () => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state}>
          <EditorComponent />
          <TableComponents />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
```
