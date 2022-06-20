---
'@remirror/extension-collaboration': minor
'remirror': patch
'@remirror/react-editors': patch
---

Fix `onSendableReceived` handler so it is actually debounced as intended.

Add two new commands `cancelSendableSteps` and `flushSendableSteps` which more control over the debounced functionality
