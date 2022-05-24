---
id: 5-min-tutorial
hide_title: true
title: 5 Minute tutorial
---

# 5 Minute tutorial

This tutorial walks you through creating a simple React app with Remirror's WYSIWYG Editor.

## Prerequisites

You need to have a recent Node version installed.

## Setup

### Installation

First, let's set up a basic React app with [CRA](https://reactjs.org/docs/create-a-new-react-app.html):

```bash type=installation
npx create-react-app cra-remirror --template typescript
cd cra-remirror
```

Next, we're installing Remirror:

```bash
npm add --save remirror @remirror/react @remirror/pm @emotion/react @emotion/styled @remirror/react-editors
```

### Create an editor

Now, we can use Remirror in the app. For this, replace the `src/App.tsx` with the following:

```tsx
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const App: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...' />
    </div>
  );
};

export default App;
```

Let's run the app:

```bash
npm run start
```

:::tip Hooray!

You should see a Remirror WYSIWYG editor!

:::tip

## Working with data

:::tip

Using **JSON** is recommended, as it's generally simpler for 3rd party code to work with (i.e. data migrations/search etc).

:::tip

### Get the current state

Let's take a look at extracting state from the editor that could be stored in a database.

For simplicity Remirror provides two components that accept an `onChange` handler, these handlers will be called whenever the document state is modified.

- `OnChangeJSON` (Recommended)
  - Provides it's `onChange` handler with a **JSON object** of document state.
- `OnChangeHTML`
  - provides it's `onChange` handler with a **HTML string** representing document state.

Here we use the `OnChangeJSON` component to update a value in `localStorage` (for illustrative purposes only, a proper database would be more appropriate).

Replace the `src/App.tsx` with the following:

```tsx
import { useCallback } from 'react';
import type { RemirrorJSON } from 'remirror';
import { OnChangeJSON } from '@remirror/react';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const STORAGE_KEY = 'remirror-editor-content';

const App: React.FC = () => {
  const handleEditorChange = useCallback((json: RemirrorJSON) => {
    // Store the JSON in localstorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  }, []);

  return <MyEditor onChange={handleEditorChange} />;
};

interface MyEditorProps {
  onChange: (json: RemirrorJSON) => void;
}

const MyEditor: React.FC<MyEditorProps> = ({ onChange }) => {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...'>
        <OnChangeJSON onChange={onChange} />
      </WysiwygEditor>
    </div>
  );
};

export default App;
```

### Setting initial content

And finally, lets look at setting the initial content of an editor from our saved state.

Here we retrieve the value from `localStorage` and pass it to the `WysiwygEditor` component via it's `initialContent` prop.

Replace the `src/App.tsx` with the following:

```tsx
import { useCallback, useState } from 'react';
import type { RemirrorJSON } from 'remirror';
import { OnChangeJSON } from '@remirror/react';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const STORAGE_KEY = 'remirror-editor-content';

const App: React.FC = () => {
  const [initialContent] = useState<RemirrorJSON | undefined>(() => {
    // Retrieve the JSON from localStorage (or undefined if not found)
    const content = window.localStorage.getItem(STORAGE_KEY);
    return content ? JSON.parse(content) : undefined;
  });

  const handleEditorChange = useCallback((json: RemirrorJSON) => {
    // Store the JSON in localStorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  }, []);

  return <MyEditor onChange={handleEditorChange} initialContent={initialContent} />;
};

interface MyEditorProps {
  onChange: (json: RemirrorJSON) => void;
  initialContent?: RemirrorJSON;
}

const MyEditor: React.FC<MyEditorProps> = ({ onChange, initialContent }) => {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...' initialContent={initialContent}>
        <OnChangeJSON onChange={onChange} />
      </WysiwygEditor>
    </div>
  );
};

export default App;
```

Welcome to Remirror!
