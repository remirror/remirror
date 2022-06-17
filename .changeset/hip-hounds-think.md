---
'@remirror/extension-collaboration': minor
---

Fix `onSendableReceived` handler so it is actually debounced as intended.

Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality
