---
'@remirror/extension-link': patch
---

Fix rendered HTML when selecting or applying marks to part of a link.

Behaviour before fix.

```html
<p>
  <a href="/">My partially</a>
  <a href="/"><span class="selection">selected</span></a>
  <a href="/">link</a>
</p>
```

Behaviour after fix.

```html
<p>
  <a href="/">
    My partially
    <span class="selection">selected</span>
    link
  </a>
</p>
```
