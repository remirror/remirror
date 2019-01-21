# Remirror

_**Note:** This project is currently purely conceptual and may never progress beyond this point._

An editor for universal react code.

- Supports desktop and mobile.
- Support for SSR.
- Support for React Native.

The goal is to allow full control of your text editor in all environments.

**First release goals:**

- [ ] Working implementation of suggested usernames with react ui built in.

**Examples:**

- [ ] Github editor clone
- [ ] Slack chat clone
- [ ] Slack notes clone

One of the reasons for building this is that neither Slate nor Draft.js have support for Android.

They're working on it, but it could be quite a while (March) before it's implemented.

https://github.com/ianstormtaylor/slate/issues/2062

## Credits

Remirror builds on top of prosemirror as the foundation for providing text input support reliably across all platforms. I

The extension architecture borrows heavily from [tiptap](https://github.com/heyscrumpy/tiptap) and editor also built on top of prosemirror but for the Vue environment.

The project is heavily inspired by @atlaskit which is a ui kit that makes use of prosemirror and react for their editor.
