---
'prosemirror-paste-rules': major
---

Update the API:

- for `type: "text"`: nothing change;
- for `type: "mark"`: removed the `transformMatch` parameter;
- for `type: "node"`: removed the `transformMatch` parameter and added a new `getContent` parameter, which can add custom content to the created node.
