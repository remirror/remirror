---
hide_title: true
title: Error Handling
---

# Error Handling

Remirror relies on the ProseMirror `Schema` to identify the content the document will support and the rules around how it can be manipulated. For this reason, error handling is a key concern when implementing a Remirror editor.

## Introduction

Sometimes the content that is passed into the editor is invalid. It may have been valid at the time it was written but the end-user is opening the editor for the first time in months.

Perhaps you've removed a `NodeExtension` or `MarkExtension` from the manager since the content was created. If the content includes these invalid types ProseMirror throws `RangeError: There is no mark type italic in this schema`. Depending on how you're handling things this could lead to all the data being wiped away. This should never be allowed to happen. Imagine your editor is set up to automatically save content over the network, then your code might just have deleted a user's 10,000-word _magnum opus_.

**`remirror`** attempts to give you full control on how to respond when invalid content is encountered.

#### What is invalid

- A node type that is unsupported by the editor (ProseMirror will throw an error).
- A mark type that is unsupported by the editor (ProseMirror will throw an error).
- Attributes that aren't supported (these are automatically discarded or added by ProseMirror) but can change the expected behaviour of the editor. This is the case if `schema.nodeFromJSON(json)` has attrs that don't exist on the `json.attrs`.

### Handling errors

Whenever an error occurs due to invalid content you will have the chance to intercept and resolve it. This is a synchronous action. Fix the problem and return the updated content. Below is an example which uses the provided `transformers.remove` method to remove all invalid nodes and marks..

```tsx
import React from 'react';
import { InvalidContentHandler } from 'remirror';
import { wysiwygPreset } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const Editor = () => {
  const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
    // Automatically remove all invalid nodes and marks.
    return transformers.remove(json, invalidContent);
  }, []);

  const { manager, onChange, state } = useRemirror({
    extensions: () => [...wysiwygPreset()],
    onError,
  });

  return <Remirror manager={manager} state={state} onChange={onChange} />;
};
```

The above editor will call the `onError` handler if there is any content that doesn't belong to the `Schema`.

### Migration support

Work is currently being done on the ability to automatically migrate versions of the schema when the content is first loaded.
