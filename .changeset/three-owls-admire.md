---
'prosemirror-paste-rules': patch
---

Fix open depths in node paste rules.

When excuting a node paste rule, only reset open depths ([openStart](https://prosemirror.net/docs/ref/#model.Slice.openStart) and [openEnd](https://prosemirror.net/docs/ref/#model.Slice.openEnd)) when the node paste rule is actually applied and it's for a block node.

This patch will fix the extra paragraph after pasting text.
