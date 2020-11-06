---
'@remirror/extension-callout': major
'@remirror/styles': minor
'remirror': minor
---

🎉 New extension `@remirror/extension-callout`

This extension adds support for a new callout node.

These can be used to add `info`, `warning`, `error` or `success` banners to your document.

The default callout type is `info`, but this can be changed by using the `defaultType` option of `CalloutExtension`.

```ts
import { RemirrorManager } from 'remirror/core';
import { CalloutExtension } from 'remirror/extension/callout';
import { CorePreset } from 'remirror/preset/core';

// Create the callout extension
const calloutExtension = new CalloutExtension();
const corePreset = new CorePreset();

// Create the Editor Manager with the callout extension passed through.
const manager = RemirrorManager.create([calloutExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.append(element);

// Add the view to the editor manager.
manager.addView(element);

// Wrap with an error callout at the current selection
manager.store.commands.toggleCallout({ type: 'error' });
```
