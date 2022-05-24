---
hide_title: true
title: Browser support
---

# Browser support

Remirror aims to be compatible with all browsers released since **2017**.

If you are using remirror with a project like [`next.js`](https://nextjs.org/) or [`gatsby`](https://www.gatsbyjs.org/) you will also need to add the following browserlist configuration.

To use this configuration in your own project you can add the following to your `package.json` file. Tools like `babel` and `postcss` are aware of this configuration.

```json
{
  "browserslist": ["since 2017"]
}
```

You can also use a `.browserlistrc` file.

```markup
since 2017
```

The main reason for this configuration is to support class syntax properly. Projects like `next.js` automatically compile your code down to `es5` which causes problems when extending classes. If you don't plan on creating your own extensions or framework, you can ignore this requirement.
