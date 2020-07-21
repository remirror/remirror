---
'@remirror/react': patch
---

Fix a bug where the previous state was always equal to the updated state for controlled editors. This caused problems with functionality that relies on comparing state values e.g. `PositionerExtension`.
