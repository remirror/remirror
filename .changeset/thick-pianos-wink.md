---
'@remirror/core': minor
---

🎉 Brings support for adding extra attributes to the `RemirrorManager` via extension tags. Attributes can now be added to all nodes and marks with a specific tag like `ExtensionTag.Alignment` or `ExtensionTag.NodeBlock`. Every matching tag in the `Schema` receives the extra attributes defined.

With tags, you can select a specific sub selection of marks and nodes. This will be the basis for adding advanced formatting to `remirror`.

```ts
import { ExtensionTag } from 'remirror/core';
import { createCoreManager, CorePreset } from 'remirror/preset/core';
import { WysiwygPreset } from 'remirror/preset/wysiwyg';
const manager = createCoreManager(() => [new WysiwygPreset(), new CorePreset()], {
  extraAttributes: [
    {
      identifiers: {
        tags: [ExtensionTag.NodeBlock],

        // Can be limited by type to `node | mark`.
        type: 'node',
      },
      attributes: { role: 'presentation' },
    },
  ],
});
```

Each item in the tags array should be read as an `OR` so the following would match `Tag1` OR `Tag2` OR `Tag3`.

```json
{ "tags": ["Tag1", "Tag2", "Tag3"] }
```

The `type` property (`mark | node`) is exclusive and limits the type of matches that will be matched.
