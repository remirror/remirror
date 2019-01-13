# Remirror

An editor for your universal react code.

- Supports desktop and mobile,
- Support for SSR
- Support for React Native

The goal is to allow full control of your text editor in all environments.

First release goals:

- [ ] Working implementation of mentions with react ui built in

Further releases:

Examples:

- [ ] Github editor clone
- [ ] Slack chat clone
- [ ] Slack notes clone

Build tool for running within a React Native WebView - this would have no requirements for native dependencies. Instead it would just inject

One of the reasons for building this is that Slate doesn't have support for Android devices yet.

They're working on it, but it could be quite a while (February) before it's done.

https://github.com/ianstormtaylor/slate/issues/2062

Add a placeholder:

```css
.ProseMirror p.empty-placeholder-node:first-child::before {
  content: "${props => (props.placeholder ? props.placeholder : '')}";
}
```

## Credits

Remirror builds on top of prosemirror as the foundation for providing text input support reliably across all platforms. I

The extension architecture borrows heavily from [tiptap](https://github.com/heyscrumpy/tiptap) and editor also built on top of prosemirror but for the Vue environment.

I was also heavily inspired by @atlaskit which is a ui kit that makes use of prosemirror and react for their editor.
