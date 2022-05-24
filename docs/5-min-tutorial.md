---
id: 5-min-tutorial
hide_title: true
title: 5 Minute tutorial
---

# 5 Minute tutorial

This tutorial walks you through creating a simple React app with Remirror's WYSIWYG Editor. You need to have a recent Node version installed.

First, let's set up a basic React app with [CRA](https://reactjs.org/docs/create-a-new-react-app.html):

```bash type=installation
npx create-react-app cra-remirror --template typescript
cd cra-remirror
npm install
```

Next, we're installing Remirror:

```bash
npm add --save remirror @remirror/react @remirror/pm @emotion/react @emotion/styled @remirror/react-editors
```

Now, we can use Remirror in the app. For this, replace the `srx/App.tsx` with the following:

```tsx
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

function App() {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...' />
    </div>
  );
}

export default App;
```

Let's run the app:

```bash
npm run start
```

:::tip Hooray!

You should see a Remirror WYSIWYG editor!

:::tip

## Restoring editor content from saved data

Let's take a look at extracting state from the editor that could be stored in a database.

For simplicity Remirror provides two components that accept an `onChange` handler, these will be called whenever the document state is modified.

- `OnChangeJSON` provides it's `onChange` handler with a JSON object of document state.
- `OnChangeHTML` provides it's `onChange` handler with a HTML string instead.

:::tip

JSON storage is recommended, as it is simpler for 3rd party code to parse JSON than to parse HTML (i.e. data migrations/search etc).

:::tip

Here we use the `OnChangeJSON` component to update a value in `localStorage` (for illustrative purposes only, a proper database would be more appropriate).

```tsx
import { useCallback } from 'react';
import { OnChangeJSON } from '@remirror/react';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const STORAGE_KEY = 'remirror-editor-content';

function App() {
  const handleEditorChange = useCallback((json) => {
    // localStorage used for illustrative purposes only
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  }, []);

  return <MyEditor onChange={handleEditorChange} />;
}

function MyEditor({ onChange }) {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...'>
        <OnChangeJSON onChange={onChange} />
      </WysiwygEditor>
    </div>
  );
}
```

And finally, lets look at setting the initial content of an editor from our saved state.

Here we retrieve the value from `localStorage` and pass it to the `WysiwygEditor` component via it's `initialContent` prop.

```tsx
import { useCallback, useState } from 'react';
import { OnChangeJSON } from '@remirror/react';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const STORAGE_KEY = 'remirror-editor-content';

function App() {
  const [initialContent] = useState(() => {
    const content = window.localStorage.getItem(STORAGE_KEY);
    return content ? JSON.parse(content) : undefined;
  });

  const handleEditorChange = useCallback((json) => {
    // localStorage used for illustrative purposes only
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  }, []);

  return <MyEditor onChange={handleEditorChange} initialContent={initialContent} />;
}

function MyEditor({ onChange, initialContent }) {
  return (
    <div style={{ padding: 16 }}>
      <WysiwygEditor placeholder='Enter text...' initialContent={initialContent}>
        <OnChangeJSON onChange={onChange} />
      </WysiwygEditor>
    </div>
  );
}
```

:::info

If you chose to use the `OnChangeHTML` component, you would also need to pass `stringHandler='html'` to `WysiwygEditor` to set `initialContent` from a HTML string.

:::info

Welcome to Remirror!
