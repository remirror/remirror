---
'@remirror/extension-events': minor
---

Add `click` and `clickMark` handlers to the `EventsExtension`. These new events are available to hooks created with `useExtension(EventsExtension)` and also exposed via the new `createEventHandlers` extension method. These methods provides utilities for determining whether the position clicked was within a specific node or mark.
